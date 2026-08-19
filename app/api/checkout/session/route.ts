import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { getStripe } = await import('../../../../src/lib/stripe.ts');
    const body = await req.json().catch(() => ({}));
    const { productId, name, description, amountInCents } = body || {};

    const stripe = getStripe();

    const productName = name || `Spokane Lab Repair Tier - ${productId || 'Standard Service'}`;
    const productDescription = description || 'Certified laboratory bench diagnostics and micro-soldering rework.';
    const unitAmount = Number(amountInCents) > 0 ? Number(amountInCents) : 14900; // $149.00 USD default

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });

    return NextResponse.json({
      status: 'ok',
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create Stripe Checkout session' },
      { status: 500 }
    );
  }
}
