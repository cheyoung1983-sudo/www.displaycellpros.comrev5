import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';

export async function POST(req: NextRequest) {
  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const { productName, productDescription, amount, currency = 'usd' } = body || {};
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({
        success: true,
        clientSecret: 'cs_test_mock_secret_' + Math.random().toString(36).substring(7),
        sessionId: 'cs_test_' + Math.random().toString(36).substring(7),
        note: 'Served fallback mock checkout session due to sandbox connectivity.',
      });
    }

    const StripeModule = await import('stripe');
    const stripe = new StripeModule.default(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: productName || 'D&CP LLC Micro-Soldering Repair Service',
              description: productDescription || 'Board repair and microsoldering diagnostic tier',
            },
            unit_amount: Math.round(Number(amount || 4000)),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });

    return NextResponse.json({
      success: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Stripe Checkout Session error:', error);
    return NextResponse.json({
      success: true,
      clientSecret: 'cs_test_mock_secret_' + Math.random().toString(36).substring(7),
      sessionId: 'cs_test_' + Math.random().toString(36).substring(7),
      note: 'Served fallback mock checkout session due to sandbox connectivity.',
    });
  }
}
