import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/**
 * Returns a lazily-initialized Stripe server client.
 * Guards against missing STRIPE_SECRET_KEY so the app server boots safely without crashing.
 */
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2024-06-20' as any,
    });
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
