"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider
} from '@stripe/react-stripe-js';
import { ShieldCheck, CreditCard, Lock, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CheckoutProps {
  productId?: string;
  name?: string;
  description?: string;
  amountInCents?: number;
  onComplete?: () => void;
}

let stripePromise: Promise<StripeJS | null> | null = null;

function getStripePromise() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51U0JtlGMZFe3OZW6ciQD5jP967DjUZlnpRWD8WvBfzu1bD2sCZxFlDufW9nySu7MJaHKP533fiDYXmBo87XX03EF00nODFh01E';
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

export default function Checkout({
  productId = 'repair_tier_std',
  name = 'Standard Laboratory Diagnostics & Repair Intake',
  description = 'Full board-level micro-soldering, NIST SP 800-88 sanitization verification, and OEM part replacement.',
  amountInCents = 14900,
  onComplete
}: CheckoutProps) {
  const [publishableKeyPresent, setPublishableKeyPresent] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51U0JtlGMZFe3OZW6ciQD5jP967DjUZlnpRWD8WvBfzu1bD2sCZxFlDufW9nySu7MJaHKP533fiDYXmBo87XX03EF00nODFh01E';
    setPublishableKeyPresent(Boolean(key));
  }, []);

  // Fetch client secret from server endpoint
  const fetchClientSecret = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name,
          description,
          amountInCents
        })
      });

      const data = await res.json();
      if (!res.ok || data.status === 'error' || !data.clientSecret) {
        throw new Error(data.message || 'Unable to initialize Stripe session');
      }

      return data.clientSecret as string;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to establish secure payment session');
      throw err;
    }
  }, [productId, name, description, amountInCents]);

  const stripe = getStripePromise();

  return (
    <div id="checkout" className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 font-mono font-bold text-[10px] uppercase tracking-wider rounded-md flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Stripe 256-Bit Encrypted
            </span>
            <span className="text-xs text-slate-400 font-medium">PCI-DSS Compliant</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>Secure Repair Payment Checkout</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {name} • ${(amountInCents / 100).toFixed(2)} USD
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">${(amountInCents / 100).toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 font-mono">Spokane Laboratory Bench Fee</div>
        </div>
      </div>

      {/* Embedded Stripe Checkout or Setup Guide */}
      {errorMsg ? (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-rose-800 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Stripe Checkout Initialization Error</span>
          </div>
          <p>{errorMsg}</p>
          <p className="text-[11px] text-rose-700">
            Ensure that <code className="font-mono bg-rose-100 px-1 py-0.5 rounded font-bold">STRIPE_SECRET_KEY</code> and <code className="font-mono bg-rose-100 px-1 py-0.5 rounded font-bold">VITE_STRIPE_PUBLISHABLE_KEY</code> are configured.
          </p>
        </div>
      ) : !publishableKeyPresent || !stripe ? (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Stripe Embedded Checkout Ready</h4>
            <p className="text-xs text-slate-500">
              The Stripe Embedded Checkout component is wired to <code className="font-mono text-indigo-600">/api/checkout/session</code>. Set your Stripe keys in the environment to enable live card entry:
            </p>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-left font-mono text-[11px] max-w-md mx-auto space-y-1">
            <div className="text-slate-400"># Required Environment Variables</div>
            <div>STRIPE_SECRET_KEY=sk_test_...</div>
            <div>VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...</div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-2 px-4 rounded-xl max-w-md mx-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Embedded Checkout Provider & Session Backend Fully Linked</span>
          </div>
        </div>
      ) : (
        <div className="min-h-[400px]">
          <EmbeddedCheckoutProvider
            stripe={stripe}
            options={{
              fetchClientSecret,
              onComplete
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </div>
  );
}
