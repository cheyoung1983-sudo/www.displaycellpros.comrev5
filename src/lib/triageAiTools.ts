/**
 * Shared state and side-effect helpers for the Triage AI (ElevenLabs
 * conversational agent) webhook tools: dispatch_booking_link and
 * escalate_tier3_ticket. Mirrors the in-memory FIFO event log pattern
 * used by githubSync.ts/stripeWebhook.ts - same per-instance/best-effort
 * caveat, same "log and no-op gracefully when unconfigured" pattern used
 * elsewhere in this app (e.g. /api/stripe/create-payment-intent).
 */
import { NextRequest, NextResponse } from 'next/server';

const TOOL_SECRET_HEADER = 'x-triage-tool-secret';

/**
 * Verifies the shared-secret header ElevenLabs sends on these tool calls.
 * Returns a ready-to-return 401 response if verification fails, or null
 * if the caller may proceed. When TRIAGE_TOOL_WEBHOOK_SECRET is unset,
 * behavior depends on environment: production fails closed (these tools
 * can send real SMS, post to Slack, and expose customer PII, so an
 * unconfigured secret in production is a misconfiguration, not a green
 * light) - non-production logs a warning and allows the request through
 * (dev/sandbox mode), matching the permissive-when-unconfigured pattern
 * used by the GitHub and Stripe webhook handlers.
 */
export function verifyTriageToolSecret(req: NextRequest): NextResponse | null {
  const expected = process.env.TRIAGE_TOOL_WEBHOOK_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Triage AI Tools] TRIAGE_TOOL_WEBHOOK_SECRET is not configured in production - rejecting tool call.');
      return NextResponse.json({ error: 'Tool endpoint misconfigured' }, { status: 503 });
    }
    console.warn('[Triage AI Tools] TRIAGE_TOOL_WEBHOOK_SECRET not configured - accepting request unverified (non-production).');
    return null;
  }
  const provided = req.headers.get(TOOL_SECRET_HEADER);
  if (provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized tool call' }, { status: 401 });
  }
  return null;
}

export interface BookingDispatchEvent {
  id: string;
  receivedAt: string;
  customerName: string;
  customerPhone: string;
  deviceSummary: string;
  quotedPrice: number;
  serviceTier: string;
  smsSent: boolean;
  smsProvider: 'twilio' | 'not-configured';
}

export const bookingDispatchLog: BookingDispatchEvent[] = [];

export interface Tier3EscalationEvent {
  id: string;
  receivedAt: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  failureSymptoms: string;
  intakeNotes: string;
  notified: boolean;
  notifyChannel: 'slack' | 'not-configured';
}

export const tier3EscalationLog: Tier3EscalationEvent[] = [];

function pushCapped<T>(log: T[], entry: T, cap = 100) {
  log.unshift(entry);
  if (log.length > cap) log.length = cap;
}

/**
 * Sends the booking/waiver link via Twilio SMS when TWILIO_* env vars are
 * configured; otherwise logs that it would have sent and returns false.
 * Uses a direct fetch to Twilio's REST API rather than the twilio SDK to
 * avoid adding a new dependency for a single endpoint call.
 */
export async function sendBookingSms(params: {
  toPhone: string;
  bookingUrl: string;
  quotedPrice: number;
  serviceTier: string;
}): Promise<{ sent: boolean; provider: 'twilio' | 'not-configured'; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[Triage AI Tools] Twilio not configured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER) - skipping real SMS send.');
    return { sent: false, provider: 'not-configured' };
  }

  const body = `Display & Cell Pros: Your ${params.serviceTier} repair estimate is $${params.quotedPrice.toFixed(2)}. Book your appointment and sign the waiver: ${params.bookingUrl}`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: params.toPhone, From: fromNumber, Body: body }),
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { sent: false, provider: 'twilio', error: `Twilio ${res.status}: ${text.slice(0, 200)}` };
    }
    return { sent: true, provider: 'twilio' };
  } catch (err: any) {
    return { sent: false, provider: 'twilio', error: err?.message || 'Twilio request failed' };
  }
}

/**
 * Posts a Tier 3 escalation alert to Slack when SLACK_ESCALATION_WEBHOOK_URL
 * is configured; otherwise logs that it would have notified and returns false.
 */
export async function notifyTier3Escalation(event: Tier3EscalationEvent): Promise<{ notified: boolean; channel: 'slack' | 'not-configured' }> {
  const webhookUrl = process.env.SLACK_ESCALATION_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[Triage AI Tools] SLACK_ESCALATION_WEBHOOK_URL not configured - skipping real Slack alert.');
    return { notified: false, channel: 'not-configured' };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:rotating_light: Tier 3 escalation - ${event.customerName} (${event.customerPhone})\nDevice: ${event.deviceModel}\nSymptoms: ${event.failureSymptoms}\nNotes: ${event.intakeNotes || 'none'}`,
      }),
    });
    return { notified: res.ok, channel: 'slack' };
  } catch (err) {
    console.error('[Triage AI Tools] Slack escalation notify failed:', err);
    return { notified: false, channel: 'slack' };
  }
}

export function recordBookingDispatch(entry: BookingDispatchEvent) {
  pushCapped(bookingDispatchLog, entry);
}

export function recordTier3Escalation(entry: Tier3EscalationEvent) {
  pushCapped(tier3EscalationLog, entry);
}
