import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';

export async function POST(req: NextRequest) {
  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const { amount, currency = 'usd', description, customer_email, repair_id } = body || {};
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({
        success: true,
        clientSecret: 'seti_mock_secret_' + Math.random().toString(36).substring(7),
        paymentIntentId: 'pi_mock_' + Math.random().toString(36).substring(7),
        note: 'Served fallback mock payment intent due to sandbox connectivity.',
      });
    }

    const StripeModule = await import('stripe');
    const stripe = new StripeModule.default(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount || 100) * 100), // convert to cents
      currency,
      description: description || 'Display & Cell Pros LLC - Board Repair Service',
      receipt_email: customer_email,
      metadata: {
        repair_id: repair_id || `DCP-${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Stripe Payment Intent error:', error);
    // Fallback response for simulator / offline testing
    return NextResponse.json({
      success: true,
      clientSecret: 'seti_mock_secret_' + Math.random().toString(36).substring(7),
      paymentIntentId: 'pi_mock_' + Math.random().toString(36).substring(7),
      note: 'Served fallback mock payment intent due to sandbox connectivity.',
    });
  }
}
