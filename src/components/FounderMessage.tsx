"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles, ShieldCheck, Terminal, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import ryanYoungImageSrc from '../assets/images/regenerated_image_1786855135392.jpg';
import { staticImageSrc } from '../utils/staticImage.ts';

const ryanYoungImage = staticImageSrc(ryanYoungImageSrc);

interface FounderMessageProps {
  onLearnMoreProtocol?: () => void;
  className?: string;
}

export default function FounderMessage({ onLearnMoreProtocol, className = '' }: FounderMessageProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-[3rem] p-8 md:p-14 border border-slate-800 shadow-2xl ${className}`}>
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Founder Portrait Column */}
        <div className="lg:col-span-4 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
            <div 
              className="founder-img-wrapper relative w-56 sm:w-64 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800"
              style={{ aspectRatio: '4/5' }}
            >
              <img 
                src={ryanYoungImage} 
                alt="Ryan Young - Founder & Lead Systems Engineer"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-emerald-300">SPOKANE LAB BENCH #1</span>
                </div>
                <p className="text-xs font-bold text-white leading-tight">Ryan Young</p>
                <p className="text-[10px] text-slate-300 font-mono">Founder & Lead Engineer</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-white/10 text-emerald-300 text-[11px] font-bold rounded-full border border-white/15">
              Combat Veteran
            </span>
            <span className="px-3 py-1 bg-white/10 text-blue-300 text-[11px] font-bold rounded-full border border-white/15">
              Enrolled Tribal Member
            </span>
            <span className="px-3 py-1 bg-white/10 text-amber-300 text-[11px] font-bold rounded-full border border-white/15">
              IPC-A-610 Master
            </span>
          </div>
        </div>

        {/* Message Content Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">
                Message from the Founder
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-playfair font-black text-white leading-tight">
              "Precision Engineering, Absolute Transparency, and Hardware That Outlasts."
            </h3>
          </div>

          <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed font-normal">
            <p>
              When I founded <strong className="text-white font-bold">Display & Cell Pros LLC</strong> in Spokane, Washington, my mission was straightforward: build a true laboratory-grade electronics restoration bench rooted in military discipline, rigorous IPC-A-610 standards, and genuine customer respect.
            </p>
            <p>
              Too often in today's electronics industry, devices are written off as unfixable or subjected to quick, temporary fixes that fail within weeks. At D&CP, we reject throwaway culture. We diagnose at the circuit board level—isolating shorted power rails, rebuilding damaged microscopic traces, and recovering vital data when others say it is lost.
            </p>
            <p>
              Whether you are an individual customer trusting us with personal data and memories, or an institutional partner requiring defense-grade federal compliance (UEI: <span className="font-mono text-emerald-400 font-bold">VAJXG5MNYQK8</span>), you have my personal promise: every job on our bench is treated with exacting craftsmanship and unwavering integrity.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-lg font-black text-white">Ryan Young</div>
              <div className="text-xs text-slate-400 font-mono">
                Founder & Lead Systems Engineer | Master Micro-Soldering Specialist
              </div>
            </div>
            {onLearnMoreProtocol && (
              <button
                onClick={onLearnMoreProtocol}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-600/20 self-start sm:self-auto"
              >
                <span>View Engineering Protocols</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
