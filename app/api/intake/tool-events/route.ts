import { NextResponse } from 'next/server';
import { bookingDispatchLog, tier3EscalationLog } from '../../../../src/lib/triageAiTools.ts';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER),
    slackEscalationConfigured: Boolean(process.env.SLACK_ESCALATION_WEBHOOK_URL),
    toolSecretConfigured: Boolean(process.env.TRIAGE_TOOL_WEBHOOK_SECRET),
    bookingDispatches: bookingDispatchLog,
    tier3Escalations: tier3EscalationLog,
  });
}

export async function DELETE() {
  bookingDispatchLog.length = 0;
  tier3EscalationLog.length = 0;
  return NextResponse.json({ status: 'ok', message: 'Triage AI tool event logs cleared' });
}
