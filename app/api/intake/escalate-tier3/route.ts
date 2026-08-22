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

  const { customer_name, customer_phone, customer_email, device_model, failure_symptoms, intake_notes } = parseResult.data;
  const ticketId = `dcp_tier3_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const dbTicketNumber = `DCP-${Math.floor(1000 + Math.random() * 9000)}`;

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

  try {
    const { query } = await import('../../../../src/lib/serverDb.ts');
    await query(
      `INSERT INTO repair_tickets (ticket_number, customer_name, customer_email, customer_phone, device_model, service_tier, issue_description, technician_notes, status)
       VALUES ($1, $2, $3, $4, $5, 'TIER_3_MICRO_SOLDERING', $6, $7, 'escalated')`,
      [
        dbTicketNumber,
        customer_name,
        customer_email || null,
        customer_phone,
        device_model,
        failure_symptoms,
        intake_notes,
      ]
    );
  } catch (dbError) {
    // The Aurora record is a durability improvement over tier3EscalationLog,
    // not a requirement for the Slack alert itself to have gone out.
    console.error('Failed to persist repair_tickets row for Tier 3 escalation:', dbError);
  }

  return NextResponse.json({
    success: true,
    ticketId,
    escalated: true,
    notified: notifyResult.notified,
    notifyChannel: notifyResult.channel,
    message: 'Tier 3 case logged for lead technician callback. Do not provide a binding quote for this repair.',
  });
}
