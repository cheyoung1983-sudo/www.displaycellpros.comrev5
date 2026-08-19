"use client";

import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Award,
  CheckCircle2,
  Lock,
  Calculator,
  Wrench,
  Activity,
  Flame,
  Building,
  UserCheck,
  Scale
} from 'lucide-react';
import { COMPANY_INFO, FEDERAL_CREDENTIALS } from '../data/companyData';

interface HeroProps {
  onOpenEstimator: () => void;
  onOpenContact: () => void;
  onOpenClientPortal: () => void;
  onOpenLoadoutModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenEstimator,
  onOpenContact,
  onOpenClientPortal,
  onOpenLoadoutModal
}) => {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background Subtle Mesh / Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-600/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Announcement Pill - Federal Identifiers */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-300">
              SAM.gov Registered: <span className="font-mono text-cyan-400 font-bold">UEI {FEDERAL_CREDENTIALS.uei}</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-xs font-semibold text-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Combat Veteran & Tribal Member-Owned
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-xs font-semibold text-blue-300">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            NAICS {FEDERAL_CREDENTIALS.naicsCode}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-xs font-semibold text-emerald-300">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            Washington Right to Repair Compliant
          </div>
        </div>

        {/* Hero Main Headline & Subhead */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Master Tier 3 Precision <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-amber-300 to-indigo-400">
                Micro-Soldering & Mobile Lab
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              {COMPANY_INFO.description}
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "87% Gross Margin Board Restorations ($800/job)",
                "On-Site Zero-Data-Exposure Mobile Repair Lab",
                "Phase 1 $5,000 Precision Equipment Loadout",
                "FAR-Compliant SAM.gov Federal Procurement"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm font-medium text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenContact}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
              >
                Dispatch Mobile Repair Lab
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLoadoutModal}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-amber-300 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-800/80 transition-all"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                View $5k Phase 1 Loadout
              </button>

              <button
                onClick={onOpenEstimator}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 transition-all hover:text-white"
              >
                <Calculator className="w-4 h-4 text-cyan-400" />
                Unit Economics Calculator
              </button>
            </div>
          </div>

          {/* Right Interactive Laboratory Live Telemetry Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 flex items-center justify-center">
                    <Cpu className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                  <span className="text-xs font-mono text-slate-300 font-bold">D&CP MOBILE LAB TELEMETRY</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  JBC STATION ACTIVE
                </span>
              </div>

              {/* Console / Telemetry Metrics */}
              <div className="py-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> JBC Micro Station:
                  </span>
                  <span className="text-amber-400 font-bold">380°C Reflow Active</span>
                </div>

                <div className="flex justify-between items-center text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> FLIR Thermal Camera:
                  </span>
                  <span className="text-cyan-400 font-bold">Short Circuit Traced (Rail 1.8V)</span>
                </div>

                <div className="flex justify-between items-center text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> On-Site Data Privacy:
                  </span>
                  <span className="text-emerald-400 font-bold">100% Zero Access Leak</span>
                </div>

                <div className="flex justify-between items-center text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" /> SAM.gov Status:
                  </span>
                  <span className="text-blue-400 font-bold">Active / UEI VAJXG5MNYQK8</span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="mt-2 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Target Major Repair</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">$800 / job</div>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] text-slate-400">Break-Even Volume</div>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">17 Repairs/mo</div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> FAR-Compliant QuickBooks Feed
                </span>
                <button
                  onClick={onOpenClientPortal}
                  className="text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                >
                  Track Device Status &rarr;
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Core Financial & Technical Key Metrics */}
        <div className="mt-16 pt-12 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {COMPANY_INFO.stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
