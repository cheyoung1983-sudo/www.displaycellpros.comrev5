import { NextResponse } from 'next/server';
import { stripeWebhookEventsLog } from '../../../../../src/lib/stripeWebhook.ts';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    totalEvents: stripeWebhookEventsLog.length,
    webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    webhookListenerUrl: '/api/stripe/webhook',
    events: stripeWebhookEventsLog,
  });
}

export async function DELETE() {
  stripeWebhookEventsLog.length = 0;
  return NextResponse.json({ status: 'ok', message: 'Stripe webhook event logs cleared' });
}
