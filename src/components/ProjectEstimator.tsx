import React, { useState } from 'react';
import { Calculator, Check, ArrowRight, X, DollarSign, Wrench, ShieldCheck, TrendingUp, Award, Cpu, CreditCard } from 'lucide-react';
import { SERVICES_DATA, PHASE_1_INVESTMENT_LOADOUT } from '../data/companyData';
import { StripeCheckoutComponent } from './StripeCheckoutComponent';
import confetti from 'canvas-confetti';

interface ProjectEstimatorProps {
  initialServiceId?: string;
  onClose?: () => void;
  onOpenContactWithScope: (summary: string) => void;
}

export const ProjectEstimator: React.FC<ProjectEstimatorProps> = ({
  onClose,
  onOpenContactWithScope,
}) => {
  // Volume state sliders
  const [expressRepairs, setExpressRepairs] = useState<number>(25); // $139 express screen/battery
  const [microSolderingJobs, setMicroSolderingJobs] = useState<number>(8); // $800 board reflow
  const [mobileLabDispatches, setMobileLabDispatches] = useState<number>(5); // $350 on-site corporate lab
  const [includeSection179, setIncludeSection179] = useState<boolean>(true);

  // Financial Calculations
  const expressRevenue = expressRepairs * 139;
  const expressCost = expressRepairs * 40; // avg component cost

  const boardRevenue = microSolderingJobs * 800;
  const boardCost = microSolderingJobs * 25; // cents to few dollars IC chips + consumables

  const mobileRevenue = mobileLabDispatches * 350;
  const mobileCost = mobileLabDispatches * 30; // fuel/van ops

  const totalMonthlyRevenue = expressRevenue + boardRevenue + mobileRevenue;
  const totalMonthlyCosts = expressCost + boardCost + mobileCost;
  const monthlyGrossProfit = totalMonthlyRevenue - totalMonthlyCosts;
  const grossMarginPercent = totalMonthlyRevenue > 0 ? Math.round((monthlyGrossProfit / totalMonthlyRevenue) * 100) : 0;

  const totalMonthlyRepairs = expressRepairs + microSolderingJobs + mobileLabDispatches;
  const breakEvenMet = totalMonthlyRepairs >= 17;

  // Section 179 tax deduction writeoff estimation on $5,000 loadout
  const taxSavings = includeSection179 ? Math.round(5000 * 0.25) : 0; // estimated 25% tax rate savings

  const generateScopeSummary = () => {
    return `Modeled Repair Volume: ${expressRepairs} Express ($139), ${microSolderingJobs} Micro-Soldering Board Jobs ($800), ${mobileLabDispatches} Mobile Dispatches ($350). Projected Monthly Revenue: $${totalMonthlyRevenue.toLocaleString()} | Gross Profit: $${monthlyGrossProfit.toLocaleString()} (${grossMarginPercent}% Margin). Break-Even: ${breakEvenMet ? 'PASSED (>=17 jobs)' : 'Below MVP floor'}.`;
  };

  const handleDispatchSubmit = () => {
    confetti({
      particleCount: 70,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#06b6d4', '#3b82f6', '#10b981']
    });
    onOpenContactWithScope(generateScopeSummary());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Repair Unit Economics & Margin Calculator</h3>
            <p className="text-xs text-slate-400">Model monthly repair volume, board-level gross margins, and OBBBA tax savings.</p>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Sliders */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Express Screen & Battery Repairs */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-white block">1. Express Display & Battery Swaps ($139 avg)</span>
                <span className="text-[11px] text-slate-400">$30–$60 OEM parts cost | ~80% Markup</span>
              </div>
              <span className="text-sm font-mono font-bold text-cyan-400">{expressRepairs} Jobs / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={expressRepairs}
              onChange={(e) => setExpressRepairs(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 jobs</span>
              <span>Sub-total: ${expressRevenue.toLocaleString()}</span>
              <span>100 jobs</span>
            </div>
          </div>

          {/* 2. Tier 3 Micro-Soldering Board Jobs */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/40 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  2. Tier 3 Micro-Soldering Logic Board Restorations ($800 avg)
                </span>
                <span className="text-[11px] text-slate-400">JBC station, thermal tracing, pennies IC chips | 87% Gross Margin</span>
              </div>
              <span className="text-sm font-mono font-bold text-amber-400">{microSolderingJobs} Board Jobs / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={microSolderingJobs}
              onChange={(e) => setMicroSolderingJobs(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 jobs</span>
              <span>Sub-total: ${boardRevenue.toLocaleString()}</span>
              <span>30 board jobs</span>
            </div>
          </div>

          {/* 3. On-Site Mobile Lab Deployments */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-white block">3. On-Site Data-Secure Mobile Lab Dispatches ($350 avg)</span>
                <span className="text-[11px] text-slate-400">Legal/medical corporate fleets | 100% On-Site Data Privacy</span>
              </div>
              <span className="text-sm font-mono font-bold text-emerald-400">{mobileLabDispatches} Dispatches / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={mobileLabDispatches}
              onChange={(e) => setMobileLabDispatches(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 dispatches</span>
              <span>Sub-total: ${mobileRevenue.toLocaleString()}</span>
              <span>20 dispatches</span>
            </div>
          </div>

          {/* 4. Section 179 OBBBA Toggle */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">Include OBBBA Sec. 179 Tax Depreciation ($5,000 Loadout)</div>
              <div className="text-[11px] text-slate-400">100% First-Year Equipment Write-Off under restored federal code.</div>
            </div>
            <button
              onClick={() => setIncludeSection179(!includeSection179)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                includeSection179 
                  ? 'bg-amber-500 text-slate-950' 
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {includeSection179 ? 'Active (~$1,250 Tax Saved)' : 'Disabled'}
            </button>
          </div>

        </div>

        {/* Right Financial & Economics Summary */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-cyan-400">Pro-Forma Monthly Revenue</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                breakEvenMet ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400'
              }`}>
                {breakEvenMet ? 'BREAK-EVEN MET (>=17)' : 'BELOW MVP FLOOR'}
              </span>
            </div>

            <div>
              <div className="text-xs text-slate-400">Gross Profit Projection (Monthly)</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1 tracking-tight font-mono">
                ${monthlyGrossProfit.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                <span>Gross Margin: <strong className="text-cyan-400">{grossMarginPercent}%</strong></span>
                <span>•</span>
                <span>Total Revenue: <strong>${totalMonthlyRevenue.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Financial Detail Breakdown */}
            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Express Part Swaps:</span>
                <span className="text-slate-200">${expressRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tier 3 Micro-Soldering:</span>
                <span className="text-amber-300 font-bold">${boardRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Mobile Lab Dispatches:</span>
                <span className="text-emerald-300">${mobileRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800/60">
                <span>Est. Component/Ops Expense:</span>
                <span className="text-red-400">-${totalMonthlyCosts.toLocaleString()}</span>
              </div>
              {includeSection179 && (
                <div className="flex justify-between text-amber-400 font-bold pt-1">
                  <span>Sec 179 Tax Shield:</span>
                  <span>+${taxSavings.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={handleDispatchSubmit}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              Submit Detailed Dispatch Request
            </button>
            <StripeCheckoutComponent 
              amount={500} 
              description={`Commercial Services Deposit (Total Projection: $${totalMonthlyRevenue.toLocaleString()})`} 
              buttonText="Secure $500 Priority Deposit"
            />
            <p className="text-[10px] text-center text-slate-500">
              SAM.gov Registered (UEI VAJXG5MNYQK8) • NAICS 811210 • Combat Veteran & Tribal Member
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
