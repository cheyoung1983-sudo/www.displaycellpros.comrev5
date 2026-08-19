"use client";

import React from 'react';
import { X, Wrench, ShieldCheck, DollarSign, CheckCircle2, Award, FileText, Cpu, Package } from 'lucide-react';
import { PHASE_1_INVESTMENT_LOADOUT, FEDERAL_CREDENTIALS } from '../data/companyData';

interface Phase1LoadoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Phase1LoadoutModal: React.FC<Phase1LoadoutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Phase 1 $5,000 Operational Payload Breakdown
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Capital Efficiency Loadout & Federal Procurement Architecture
            </p>
          </div>
        </div>

        {/* Federal Credentials Banner */}
        <div className="mb-8 p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-500 uppercase">SAM.gov UEI</div>
            <div className="text-cyan-400 font-bold text-sm">{FEDERAL_CREDENTIALS.uei}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase">Federal EIN</div>
            <div className="text-slate-200 font-bold text-sm">{FEDERAL_CREDENTIALS.ein}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase">WA State UBI</div>
            <div className="text-slate-200 font-bold text-sm">{FEDERAL_CREDENTIALS.ubi}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase">Primary NAICS</div>
            <div className="text-amber-400 font-bold text-sm">{FEDERAL_CREDENTIALS.naicsCode}</div>
          </div>
        </div>

        {/* Loadout Cards */}
        <div className="space-y-6">
          {PHASE_1_INVESTMENT_LOADOUT.map((item, index) => (
            <div 
              key={index} 
              className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
                  {item.category}
                </span>
                <span className="text-lg font-mono font-extrabold text-emerald-400">
                  ${item.allocation.toLocaleString()} Allocation
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-300 mb-4">{item.purpose}</p>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Capital Assets & Tools:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {item.keyAssets.map((asset, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900 p-2 rounded border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{asset}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* OBBBA Tax & Unit Economics Footer */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900 border border-cyan-800/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-cyan-400 shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">OBBBA Section 179 Eligible:</span> 100% first-year tax write-off for equipment investments.
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close & Return to Portal
          </button>
        </div>

      </div>
    </div>
  );
};
