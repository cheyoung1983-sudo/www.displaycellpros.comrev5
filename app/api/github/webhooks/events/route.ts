import { NextResponse } from 'next/server';
import { webhookEventsLog } from '../../../../../src/lib/githubSync.ts';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    totalEvents: webhookEventsLog.length,
    webhookSecretConfigured: Boolean(process.env.GITHUB_WEBHOOK_SECRET),
    webhookListenerUrl: '/api/github/webhooks',
    events: webhookEventsLog,
  });
}

export async function DELETE() {
  webhookEventsLog.length = 0;
  return NextResponse.json({ status: 'ok', message: 'Webhook event logs cleared' });
}
