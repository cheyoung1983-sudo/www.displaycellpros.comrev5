"use client";

import React, { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import StripeCheckoutModal from './StripeCheckoutModal';

export const PaymentCheckout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number>(150);
  const [description, setDescription] = useState('D&CP Tier 3 Diagnostics & Reflow');

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Secure Payment Portal</h3>
          <p className="text-xs text-slate-400">Powered by Stripe • End-to-End Encrypted</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Service Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="e.g. iPad Pro Logic Board Micro-Soldering"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          disabled={amount <= 0}
          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShieldCheck className="w-5 h-5" />
          Pay ${amount.toFixed(2)} Securely
        </button>
      </div>

      <StripeCheckoutModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productName="D&CP LLC Service Payment"
        productDescription={description}
        amount={amount}
      />
    </div>
  );
};
