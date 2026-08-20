import type { NextRequest } from 'next/server';
import { handleIncomingStripeWebhook } from '../../../../src/lib/stripeWebhook.ts';

export async function POST(req: NextRequest) {
  return handleIncomingStripeWebhook(req);
}
