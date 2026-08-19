"use client";

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard } from 'lucide-react';

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || 'pk_live_51U0JtlGMZFe3OZW6ciQD5jP967DjUZlnpRWD8WvBfzu1bD2sCZxFlDufW9nySu7MJaHKP533fiDYXmBo87XX03EF00nODFh01E';
const stripePromise = loadStripe(stripePublicKey);

interface StripeCheckoutComponentProps {
  amount: number;
  description: string;
  buttonText?: string;
  className?: string;
}

export const StripeCheckoutComponent: React.FC<StripeCheckoutComponentProps> = ({
  amount,
  description,
  buttonText = 'Pay Securely',
  className = "w-full py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
}) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  const handlePayDeposit = async () => {
    if (!stripePromise) {
      alert("Stripe is not configured. Please set VITE_STRIPE_PUBLIC_KEY in your environment.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
        }),
      });

      const session = await response.json();
      
      if (session.error) {
        throw new Error(session.error);
      }

      // Redirect to Stripe checkout
      const result = await (stripe as any).redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error.message || 'Unknown error'}. Please ensure STRIPE_SECRET_KEY is set on the server.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <button
      onClick={handlePayDeposit}
      disabled={isProcessingPayment || !stripePromise}
      className={className}
    >
      {isProcessingPayment ? (
        'Processing...'
      ) : (
        <>
          <CreditCard className="w-4 h-4" /> {buttonText}
        </>
      )}
    </button>
  );
};
