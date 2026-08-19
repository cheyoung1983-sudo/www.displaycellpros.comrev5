"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  Mic,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
  RotateCcw,
  Instagram,
  Linkedin,
  Sparkles,
} from 'lucide-react';
import FeaturedProducts from './FeaturedProducts.tsx';
import Reviews from './Reviews.tsx';
import VoiceIntakeModal, { VoiceIntakeTicket } from './VoiceIntakeModal.tsx';
import LabBenchParticles from './LabBenchParticles.tsx';
import { useFounderAnimationSpeed } from '../hooks/useFounderAnimationSpeed.ts';
import ryanYoungImageSrc from '../assets/images/regenerated_image_1786855135392.jpg';
import { staticImageSrc } from '../utils/staticImage.ts';

const ryanYoungImage = staticImageSrc(ryanYoungImageSrc);

export function HomePageContent() {
  const router = useRouter();
  const [isFounderBioExpanded, setIsFounderBioExpanded] = useState(false);
  const [isVoiceIntakeOpen, setIsVoiceIntakeOpen] = useState(false);
  const { speedPreset, setSpeedPreset, resetToDefault, duration, isOff, presets } = useFounderAnimationSpeed();

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-32"
    >
      <section className="max-w-7xl mx-auto px-6 text-center space-y-12">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            Now Accepting Tier 3 Board Repairs
          </div>
          <h1 className="text-7xl md:text-8xl font-playfair font-black text-slate-900 tracking-tight leading-[1.05]">
            The Laboratory for <br />
            <span className="text-slate-400">Mobile Recovery.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            D&CP LLC provides mission-critical hardware restoration and data extraction
            services backed by precision telemetry.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push('/intake')}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            Initiate Triage
            <ArrowUpRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/about')}
            className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
          >
            Laboratory Protocol
          </button>
        </div>
      </section>

      {/* Founder's Note Card */}
      <section className="max-w-5xl mx-auto px-6">
        <div
          id="home-founder-note"
          style={{
            '--animation-speed': duration,
            '--founder-glow-speed': duration,
            ...(isOff ? { animation: 'none' } : {})
          } as React.CSSProperties}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-[2.5rem] p-6 md:p-8 border border-slate-800/80 shadow-xl hover:shadow-[0_20px_50px_-10px_rgba(37,99,235,0.28)] hover:border-blue-500/40 transition-all duration-300 ease-out"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 group-hover:bg-blue-600/25 blur-[100px] rounded-full pointer-events-none transition-all duration-500" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 group-hover:bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none transition-all duration-500" />
          <LabBenchParticles paused={isOff} />

          <div className="relative z-10 space-y-6">
            {/* Top Header & Core Summary */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              <div className="relative shrink-0">
                <div
                  className="founder-img-wrapper w-24 sm:w-28 md:w-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-800 ring-1 ring-white/10 hover:border-blue-400/50 hover:ring-blue-500/30 transition-all duration-500"
                  style={{ aspectRatio: '4/5' }}
                >
                  <img
                    src={ryanYoungImage}
                    alt="Ryan Young - Founder & Lead Systems Engineer"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500 will-change-transform"
                    referrerPolicy="no-referrer"
                    loading="eager"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300";
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md border border-white/20">
                  Founder
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                    Founder's Note
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Ryan Young • Spokane, WA
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-white/10 text-emerald-300 rounded-full font-mono font-bold border border-white/15">
                    Combat Veteran
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug">
                  "At D&CP, we reject throwaway culture. Every circuit board that enters our Spokane laboratory receives precision diagnostics and military-grade integrity."
                </h2>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Founder & Lead Systems Engineer • Enrolled Tribal Member • Master Micro-Soldering Specialist
                </p>

                {/* Quick Action Buttons & Animation Speed Controls */}
                <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    id="home-founder-mic-trigger"
                    type="button"
                    onClick={() => setIsVoiceIntakeOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-950/40 border border-rose-400/40 hover:scale-105 active:scale-95 group"
                    title="Speak your device issue to instantly record and convert into an intake ticket via ElevenLabs"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-200"></span>
                    </span>
                    <Mic className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
                    <span>Voice Intake (ElevenLabs)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFounderBioExpanded(prev => !prev)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-blue-500/30 shadow-sm"
                    aria-expanded={isFounderBioExpanded}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isFounderBioExpanded ? 'Show Less' : 'Read Founder Bio & Story'}</span>
                    {isFounderBioExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-blue-300" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-blue-300" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      router.push('/about');
                      setTimeout(() => {
                        const el = document.getElementById('leadership');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 120);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10 shadow-sm"
                  >
                    <span>Leadership Section</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable Biographical Detail Section */}
            <AnimatePresence>
              {isFounderBioExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 border-t border-slate-800/80 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-8 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">
                            Background & Engineering Philosophy
                          </span>
                        </div>
                        <p>
                          Founded in Spokane, Washington, <strong className="text-white font-bold">Display & Cell Pros LLC</strong> was created to deliver an uncompromising level of electronic repair. Drawing from intensive military discipline as a combat veteran and rooted in tribal heritage, Ryan established an engineering-first facility that tackles catastrophic board-level failures other repair shops turn away.
                        </p>
                        <p>
                          From high-density BGA rework and microscope trace surgery to federal institutional hardware maintenance, every device is serviced under strict electrostatic discharge (ESD) safe protocols and IPC-A-610 soldering standards.
                        </p>
                      </div>

                      <div className="md:col-span-4 bg-slate-950/60 rounded-2xl p-4 border border-white/10 space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Verified Credentials
                        </div>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-500">SAM.gov UEI:</span>
                            <span className="text-emerald-400 font-bold">VAJXG5MNYQK8</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-500">Standard:</span>
                            <span className="text-blue-300">IPC-A-610 Class 3</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-500">Status:</span>
                            <span className="text-amber-300 font-bold">Combat Vet Owned</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span className="text-slate-500">Facility:</span>
                            <span className="text-slate-200">Spokane Lab Bench #1</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animation Speed Preferences & Socials Row */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Pulse Speed:
                  </span>
                </div>
                <div className="inline-flex bg-slate-950/80 p-1 rounded-xl border border-white/10 gap-1 shadow-inner items-center">
                  {presets.map((preset) => {
                    const isActive = speedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpeedPreset(preset.id);
                        }}
                        aria-pressed={isActive}
                        title={`Set pulse animation speed to ${preset.label} (persists across reloads)`}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400/40'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {preset.shortLabel}
                      </button>
                    );
                  })}

                  <button
                    id="home-founder-reset-settings"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetToDefault();
                    }}
                    title="Reset animation speed and founder card preferences to factory default"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all ml-1"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400 hover:text-amber-300" />
                    <span className="hidden sm:inline">Reset Settings</span>
                    <span className="sm:hidden">Reset</span>
                  </button>
                </div>
              </div>

              {/* Socials Link Row */}
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 text-xs hidden sm:inline-block mr-1">
                  Connect:
                </span>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with Ryan Young on LinkedIn (opens in new tab)"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-blue-600/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 hover:border-blue-500/40 transition-all shadow-sm group/link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="w-4 h-4 text-blue-400 group-hover/link:scale-110 transition-transform" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover/link:text-blue-300 transition-colors" />
                </a>

                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Display & Cell Pros on Instagram (opens in new tab)"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-pink-600/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 hover:border-pink-500/40 transition-all shadow-sm group/insta"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-4 h-4 text-pink-400 group-hover/insta:scale-110 transition-transform" />
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover/insta:text-pink-300 transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts />
      <Reviews />

      <VoiceIntakeModal
        isOpen={isVoiceIntakeOpen}
        onClose={() => setIsVoiceIntakeOpen(false)}
        onApplyToIntakeForm={(ticket: VoiceIntakeTicket) => {
          localStorage.setItem('dcp_pending_voice_intake', JSON.stringify(ticket));
          router.push('/intake');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </motion.div>
  );
}
