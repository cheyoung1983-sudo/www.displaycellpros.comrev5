"use client";

import React from 'react';
import { Cpu, ArrowUp, ShieldCheck, Award, Building, Lock } from 'lucide-react';
import { COMPANY_INFO, FEDERAL_CREDENTIALS } from '../data/companyData';

interface FooterProps {
  onOpenEstimator: () => void;
  onOpenClientPortal: () => void;
  onOpenContact: () => void;
  onOpenLoadoutModal: () => void;
}

export const ClassyFooter: React.FC<FooterProps> = ({
  onOpenEstimator,
  onOpenClientPortal,
  onOpenContact,
  onOpenLoadoutModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Federal Credentials Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-wide text-white">
                {COMPANY_INFO.name}
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              {COMPANY_INFO.description}
            </p>

            {/* Federal Badges */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">SAM.gov UEI:</span>
                <span className="text-cyan-400 font-bold">{FEDERAL_CREDENTIALS.uei}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">Primary NAICS:</span>
                <span className="text-amber-400 font-bold">{FEDERAL_CREDENTIALS.naicsCode} ({FEDERAL_CREDENTIALS.naicsDescription})</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">Tax Identifiers:</span>
                <span className="text-slate-200">EIN {FEDERAL_CREDENTIALS.ein} • UBI {FEDERAL_CREDENTIALS.ubi}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-amber-300 font-bold">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Combat Veteran & Enrolled Tribal Member-Owned</span>
              </div>
            </div>
          </div>

          {/* Precision Services */}
          <div className="space-y-3">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Precision Services</div>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-cyan-400 transition-colors">Tier 3 Micro-Soldering</a></li>
              <li><a href="#services" className="hover:text-cyan-400 transition-colors">High-Velocity Screen & Battery</a></li>
              <li><a href="#services" className="hover:text-cyan-400 transition-colors">On-Site Mobile Secure Lab</a></li>
              <li><a href="#services" className="hover:text-cyan-400 transition-colors">Federal GSA Contracting</a></li>
              <li><a href="#services" className="hover:text-cyan-400 transition-colors">Emergency Board Data Recovery</a></li>
            </ul>
          </div>

          {/* Company & Loadouts */}
          <div className="space-y-3">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Operations & Payload</div>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenLoadoutModal} className="text-amber-400 hover:underline transition-colors text-left font-bold">
                  Phase 1 $5,000 Loadout
                </button>
              </li>
              <li><a href="#portfolio" className="hover:text-cyan-400 transition-colors">Case Studies & Field Proof</a></li>
              <li><a href="#team" className="hover:text-cyan-400 transition-colors">Founder (Ryan Young)</a></li>
              <li><a href="#insights" className="hover:text-cyan-400 transition-colors">Technical Insights</a></li>
              <li><a href="#offices" className="hover:text-cyan-400 transition-colors">Mobile Command Dispatch</a></li>
            </ul>
          </div>

          {/* Client Portal & Economics */}
          <div className="space-y-3">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Client Tools & Portal</div>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenClientPortal} className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-cyan-400" /> Client Service Portal
                </button>
              </li>
              <li>
                <button onClick={onOpenEstimator} className="hover:text-cyan-400 transition-colors text-left">
                  Unit Economics Calculator
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-cyan-400 transition-colors text-left">
                  Dispatch On-Site Mobile Lab
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved. Registered SAM.gov Federal Contractor (UEI {FEDERAL_CREDENTIALS.uei}).
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-semibold"
          >
            Back to top <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
