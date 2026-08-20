"use client";

import React, { useState, useCallback } from 'react';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, X, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { startCheckoutSession } from '../../app/actions/stripe.ts';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productDescription?: string;
  amount?: number; // in dollars e.g. 129
}

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  productName = 'D&CP LLC Micro-Soldering Repair Service',
  productDescription = 'Tier 3/4 Board Level Diagnostic & Microsoldering Rework',
  amount = 129
}: StripeCheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const clientSecret = await startCheckoutSession({
        productName,
        productDescription,
        amount: Math.round(amount * 100),
        currency: 'usd'
      });
      setClientSecret(clientSecret);
      return clientSecret;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize Stripe Checkout.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [productName, productDescription, amount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-playfair font-bold text-white">Secure Stripe Checkout</h3>
              <p className="text-xs text-slate-400">Display & Cell Pros LLC • Embedded Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">{productName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{productDescription}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-amber-400">${amount}.00</div>
              <div className="text-[10px] text-emerald-400 font-mono">Live Stripe Secure</div>
            </div>
          </div>

          {!clientSecret && !isLoading && (
            <div className="text-center py-8 space-y-4">
              <p className="text-xs text-slate-400">Click below to initialize your secure Stripe Embedded Checkout session.</p>
              <button
                onClick={() => { fetchClientSecret().catch(() => {}); }}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Secure Checkout</span>
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-mono">Initializing Stripe session...</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {clientSecret && (
            <div id="checkout" className="bg-white rounded-2xl p-4 overflow-hidden min-h-[400px]">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted by Stripe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Money-Back Repair Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
