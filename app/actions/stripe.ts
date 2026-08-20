'use server';

import { headers } from 'next/headers';
import { formRateLimiterNext } from '../../src/lib/serverSecurity.ts';
import { getStripe } from '../../src/lib/stripe.ts';

export async function startCheckoutSession(params: {
  productName?: string;
  productDescription?: string;
  amount?: number; // cents
  currency?: string;
}): Promise<string> {
  const limited = formRateLimiterNext.check({ headers: await headers() } as any);
  if (limited) {
    const { error } = await limited.json();
    throw new Error(error || 'Submission limit reached. Please wait a moment before resubmitting.');
  }

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: params.currency || 'usd',
          product_data: {
            name: params.productName || 'D&CP LLC Micro-Soldering Repair Service',
            description: params.productDescription || 'Tier 3/4 Board Level Diagnostic & Microsoldering Rework',
          },
          unit_amount: Math.round(params.amount || 12900),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  if (!session.client_secret) {
    throw new Error('Stripe did not return a client secret.');
  }

  return session.client_secret;
}
