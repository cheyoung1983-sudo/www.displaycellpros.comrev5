"use client";

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Menu, 
  X, 
  Lock, 
  Calculator, 
  ChevronRight,
  PhoneCall,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { COMPANY_INFO, FEDERAL_CREDENTIALS } from '../data/companyData';

interface NavbarProps {
  onOpenClientPortal: () => void;
  onOpenEstimator: () => void;
  onOpenContact: () => void;
  onOpenLoadoutModal: () => void;
}

export const ClassyNavbar: React.FC<NavbarProps> = ({
  onOpenClientPortal,
  onOpenEstimator,
  onOpenContact,
  onOpenLoadoutModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Services", href: "#services" },
    { name: "Phase 1 Loadout", href: "#loadout" },
    { name: "Federal Credentials", href: "#federal" },
    { name: "Trust & Metrics", href: "#trust-impact" },
    { name: "Case Studies", href: "#portfolio" },
    { name: "Leadership", href: "#team" },
    { name: "Technical Insights", href: "#insights" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-xl' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wide text-white">
                  {COMPANY_INFO.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  UEI: {FEDERAL_CREDENTIALS.uei}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold leading-none">
                Micro-Soldering & Mobile Data-Secure Lab
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={onOpenLoadoutModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/50 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Phase 1 $5k Loadout
            </button>

            <button
              onClick={onOpenEstimator}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              Repair Calculator
            </button>

            <button
              onClick={onOpenClientPortal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-700/50 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Client Portal
            </button>

            <button
              onClick={onOpenContact}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Dispatch Lab
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={onOpenClientPortal}
              className="p-2 rounded-lg bg-slate-800 text-cyan-400"
              title="Client Portal"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-4 pb-6 mt-3 space-y-4">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-cyan-400 py-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenLoadoutModal(); }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold text-amber-300 bg-amber-950/50 border border-amber-800/60"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" /> $5,000 Phase 1 Loadout
              </span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenEstimator(); }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800 border border-slate-700"
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" /> Repair Revenue Calculator
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenContact(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              <PhoneCall className="w-4 h-4" /> Dispatch Mobile Lab
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
