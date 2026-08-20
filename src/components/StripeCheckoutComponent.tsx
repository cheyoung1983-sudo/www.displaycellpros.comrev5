"use client";

import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import StripeCheckoutModal from './StripeCheckoutModal';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <CreditCard className="w-4 h-4" /> {buttonText}
      </button>
      <StripeCheckoutModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productName="D&CP LLC Service Payment"
        productDescription={description}
        amount={amount}
      />
    </>
  );
};
