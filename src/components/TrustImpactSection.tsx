"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Award, Users, CheckCircle2, Timer, Sparkles, ArrowRight } from 'lucide-react';

interface MetricItem {
  label: string;
  value: number;
  suffix: string;
  description: string;
  icon: React.ReactNode;
}

const METRICS: MetricItem[] = [
  {
    label: 'Devices Repaired',
    value: 14250,
    suffix: '+',
    description: 'Precision board & micro-soldering restorations',
    icon: <Cpu className="w-6 h-6 text-cyan-400" />
  },
  {
    label: 'Years in Business',
    value: 12,
    suffix: '+',
    description: 'Advanced electronics laboratory excellence',
    icon: <Award className="w-6 h-6 text-emerald-400" />
  },
  {
    label: 'Projects Completed',
    value: 1850,
    suffix: '+',
    description: 'Enterprise, municipal & government contracts',
    icon: <ShieldCheck className="w-6 h-6 text-blue-400" />
  },
  {
    label: 'Success Rate',
    value: 99.4,
    suffix: '%',
    description: 'Trace-level precision & rigorous testing',
    icon: <Sparkles className="w-6 h-6 text-amber-400" />
  }
];

export const TrustImpactSection: React.FC<{ onOpenContact?: () => void }> = ({ onOpenContact }) => {
  // Animated Counter hook simulation
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const intervalTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCounts(METRICS.map(m => {
        const val = m.value * easeProgress;
        return m.suffix === '%' ? parseFloat(val.toFixed(1)) : Math.floor(val);
      }));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Countdown to October 1, 2026
  const targetDate = new Date('2026-10-01T00:00:00');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="trust-impact" className="py-24 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Soft Operations Subtle Notification Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 shadow-lg shadow-cyan-950/20 text-slate-300 text-xs sm:text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span><strong className="text-white font-semibold">Soft Operations Active:</strong> Accepting select commercial & municipal intakes prior to full launch.</span>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Award className="w-3.5 h-3.5" /> Proven Operational Heritage
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trust & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Impact Metrics</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineered for high-reliability medical, legal, and government electronics restoration with audited quality and zero data compromise guarantees.
          </p>
        </div>

        {/* Animated Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((metric, index) => (
            <div 
              key={metric.label}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 shadow-xl group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                  {metric.icon}
                </div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                  Verified
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight mb-1">
                {counts[index].toLocaleString()}{metric.suffix}
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">
                {metric.label}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        {/* Countdown Banner to October 1st, 2026 */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-2 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 text-xs font-mono font-bold uppercase">
                <Timer className="w-3.5 h-3.5" /> Full Deployment Countdown
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Countdown to October 1st, 2026 Full Launch
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Marking the formal activation of our regional Pacific Northwest Mobile Laboratory Fleet and expanded government depot services.
              </p>
            </div>

            {/* Countdown Clock Display */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 min-w-[70px]">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">{timeLeft.days}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">Days</div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 min-w-[70px]">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">{timeLeft.hours}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">Hours</div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 min-w-[70px]">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">{timeLeft.minutes}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">Mins</div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 min-w-[70px]">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">{timeLeft.seconds}</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-1">Secs</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Priority scheduling available during soft operations window.</span>
            </div>
            <button
              onClick={onOpenContact}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs tracking-wide uppercase transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              Secure Priority Slot <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
