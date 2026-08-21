/**
 * Route Handler backing the Triage AI (ElevenLabs agent) escalate_tier3_ticket
 * tool. Tier 3 (motherboard/logic-board/liquid damage) issues never get a
 * binding quote from get_repair_quote - this is the only path for them,
 * flagging the case for manual lead-tech review via Slack when configured.
 */
import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';
import { EscalateTier3TicketSchema } from '../../../../src/lib/schemas.ts';
import { verifyTriageToolSecret, notifyTier3Escalation, recordTier3Escalation } from '../../../../src/lib/triageAiTools.ts';

export async function POST(req: NextRequest) {
  const unauthorized = verifyTriageToolSecret(req);
  if (unauthorized) return unauthorized;

  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parseResult = EscalateTier3TicketSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || 'Invalid escalation request' },
      { status: 400 }
    );
  }

  const { customer_name, customer_phone, device_model, failure_symptoms, intake_notes } = parseResult.data;
  const ticketId = `dcp_tier3_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const notifyResult = await notifyTier3Escalation({
    id: ticketId,
    receivedAt: new Date().toISOString(),
    customerName: customer_name,
    customerPhone: customer_phone,
    deviceModel: device_model,
    failureSymptoms: failure_symptoms,
    intakeNotes: intake_notes,
    notified: false,
    notifyChannel: 'not-configured',
  });

  recordTier3Escalation({
    id: ticketId,
    receivedAt: new Date().toISOString(),
    customerName: customer_name,
    customerPhone: customer_phone,
    deviceModel: device_model,
    failureSymptoms: failure_symptoms,
    intakeNotes: intake_notes,
    notified: notifyResult.notified,
    notifyChannel: notifyResult.channel,
  });

  return NextResponse.json({
    success: true,
    ticketId,
    escalated: true,
    notified: notifyResult.notified,
    notifyChannel: notifyResult.channel,
    message: 'Tier 3 case logged for lead technician callback. Do not provide a binding quote for this repair.',
  });
}
