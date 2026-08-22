import { NextRequest, NextResponse } from 'next/server';
import { bookingDispatchLog, tier3EscalationLog, verifyTriageToolSecret } from '../../../../src/lib/triageAiTools.ts';

export async function GET(req: NextRequest) {
  const unauthorized = verifyTriageToolSecret(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    status: 'ok',
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER),
    slackEscalationConfigured: Boolean(process.env.SLACK_ESCALATION_WEBHOOK_URL),
    toolSecretConfigured: Boolean(process.env.TRIAGE_TOOL_WEBHOOK_SECRET),
    bookingDispatches: bookingDispatchLog,
    tier3Escalations: tier3EscalationLog,
  });
}

export async function DELETE(req: NextRequest) {
  const unauthorized = verifyTriageToolSecret(req);
  if (unauthorized) return unauthorized;

  bookingDispatchLog.length = 0;
  tier3EscalationLog.length = 0;
  return NextResponse.json({ status: 'ok', message: 'Triage AI tool event logs cleared' });
}
