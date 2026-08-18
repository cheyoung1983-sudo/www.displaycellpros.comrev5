import React from 'react';
import { Briefcase, CheckCircle2 } from 'lucide-react';

interface B2BViewProps {
  onBookClick: () => void;
}

export function B2BView({ onBookClick }: B2BViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-705 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-10 lg:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6 w-max font-mono">
              <Briefcase size={14} /> Corporate Fleet Partners
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">Corporate IT Fleet Maintenance</h2>
            <p className="text-slate-300 mb-8 leading-relaxed text-base">
              When a device breaks, standard retail repair shops require your employees to leave their deployment area, resulting in significant administrative downtime. D&CP brings the lab to your job site.
            </p>

            <ul className="space-y-5 mb-10 text-slate-300 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">15% Preferred Corporate Discount</strong>
                  <span className="text-xs text-slate-400">Applied automatically to all Tier 1 and Tier 2 repairs for registered partners (HVAC, Real Estate, Delivery fleets).</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Prioritized Dispatch</strong>
                  <span className="text-xs text-slate-400">Skip the standard queue. Business critical devices get priority routing.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">Net-30 Invoicing</strong>
                  <span className="text-xs text-slate-400">Eliminate employee out-of-pocket expenses with consolidated monthly billing.</span>
                </div>
              </li>
            </ul>

            <button
              onClick={onBookClick}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold transition-colors"
            >
              Apply for Fleet Account
            </button>
          </div>

          <div className="relative min-h-[300px] lg:min-h-full hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80"
              alt="Corporate IT"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
