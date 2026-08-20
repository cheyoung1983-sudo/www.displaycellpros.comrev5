/**
 * Stripe webhook receiver. Mirrors the GitHub webhook pattern in
 * githubSync.ts/githubWebhookHandler.ts: in-memory FIFO event log,
 * same per-instance/best-effort caveat, same permissive-when-unconfigured
 * signature check.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from './stripe.ts';

export interface StripePaymentEvent {
  id: string;
  type: string;
  receivedAt: string;
  verified: boolean;
  summary: string;
  amountTotal: number | null;
  currency: string | null;
  customerEmail: string | null;
  paymentStatus: string | null;
  metadata: Record<string, string> | null;
}

// In-memory store for recent webhook events (kept in FIFO buffer) -
// same non-durable-across-serverless-invocations caveat as webhookEventsLog.
export const stripeWebhookEventsLog: StripePaymentEvent[] = [];

function summarizeEvent(event: any): string {
  const session = event.data?.object;
  switch (event.type) {
    case 'checkout.session.completed': {
      const amount = ((session?.amount_total ?? 0) / 100).toFixed(2);
      return `Checkout session completed: $${amount} ${(session?.currency || 'usd').toUpperCase()} (${session?.payment_status || 'unknown'})`;
    }
    case 'checkout.session.async_payment_failed':
      return `Checkout session async payment failed for session ${session?.id || 'unknown'}`;
    case 'payment_intent.payment_failed':
      return `Payment intent failed: ${session?.last_payment_error?.message || 'unknown error'}`;
    default:
      return `Stripe event "${event.type}" received`;
  }
}

export async function handleIncomingStripeWebhook(req: NextRequest): Promise<Response> {
  const signature = req.headers.get('stripe-signature') || undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Read the raw body first (needed for signature verification) then parse it -
  // order matters, must verify before trusting the parsed JSON.
  const rawBody = await req.text();

  let event: any;
  let verified = false;

  if (webhookSecret) {
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      verified = true;
    } catch (err: any) {
      console.warn(`[Stripe Webhook] Signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
    }
  } else {
    console.warn('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured - accepting event unverified.');
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  const session = event?.data?.object || {};
  const eventRecord: StripePaymentEvent = {
    id: event?.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: event?.type || 'unknown',
    receivedAt: new Date().toISOString(),
    verified,
    summary: summarizeEvent(event || {}),
    amountTotal: typeof session.amount_total === 'number' ? session.amount_total / 100 : null,
    currency: session.currency || null,
    customerEmail: session.customer_details?.email || session.customer_email || null,
    paymentStatus: session.payment_status || null,
    metadata: session.metadata || null,
  };

  stripeWebhookEventsLog.unshift(eventRecord);
  if (stripeWebhookEventsLog.length > 100) {
    stripeWebhookEventsLog.length = 100;
  }

  if (event?.type === 'checkout.session.completed') {
    console.log(`[Stripe Webhook] ${eventRecord.summary} — ${eventRecord.customerEmail || 'no email'}`);
  }

  return NextResponse.json({ received: true });
}
