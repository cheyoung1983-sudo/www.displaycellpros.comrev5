import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../src/lib/serverSecurity.ts';

export async function POST(req: NextRequest) {
  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const { amount, description } = body || {};
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const origin = req.nextUrl.origin;

    if (!stripeSecretKey) {
      return NextResponse.json({
        id: 'cs_test_' + Math.random().toString(36).substring(7),
        url: `${origin}/?success=true`,
      });
    }

    const StripeModule = await import('stripe');
    const stripe = new StripeModule.default(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'DCP Repair Service Deposit',
            },
            unit_amount: Math.round(Number(amount || 100) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Hosted Stripe checkout error:', error);
    const origin = req.nextUrl.origin;
    return NextResponse.json({
      id: 'cs_test_' + Math.random().toString(36).substring(7),
      url: `${origin}/?success=true`,
    });
  }
}
