"use client";

import React, { useState } from 'react';
import { 
  Sliders, 
  Clock, 
  Timer, 
  Hourglass, 
  Hand, 
  ArrowRightLeft, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Settings 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from './Toast.tsx';

export default function ElevenLabsConversationFlow() {
  const { showToast } = useToast();
  
  // Configuration State
  const [maxDuration, setMaxDuration] = useState(600);
  const [turnTimeout, setTurnTimeout] = useState(7);
  const [softTimeoutSec, setSoftTimeoutSec] = useState(3.0);
  const [softTimeoutMsg, setSoftTimeoutMsg] = useState('Hhmmmm...yeah.');
  const [useLlmFiller, setUseLlmFiller] = useState(false);
  const [allowInterruptions, setAllowInterruptions] = useState(true);
  const [turnEagerness, setTurnEagerness] = useState<'eager' | 'normal' | 'patient'>('normal');
  const [presetProfile, setPresetProfile] = useState<'customer_service' | 'info_collection' | 'legal' | 'custom'>('customer_service');

  const handlePresetChange = (profile: 'customer_service' | 'info_collection' | 'legal' | 'custom') => {
    setPresetProfile(profile);
    if (profile === 'customer_service') {
      setMaxDuration(600);
      setTurnTimeout(7);
      setSoftTimeoutSec(2.5);
      setAllowInterruptions(true);
      setTurnEagerness('eager');
    } else if (profile === 'info_collection') {
      setMaxDuration(900);
      setTurnTimeout(15);
      setSoftTimeoutSec(3.5);
      setAllowInterruptions(true);
      setTurnEagerness('patient');
    } else if (profile === 'legal') {
      setMaxDuration(1200);
      setTurnTimeout(20);
      setSoftTimeoutSec(4.0);
      setAllowInterruptions(false);
      setTurnEagerness('normal');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('ElevenLabs Conversation Flow configuration updated successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-inner">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-playfair font-black text-white">Agent Conversation Flow</h2>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-md border border-amber-500/30 uppercase">
                Timeouts & Turn-Taking
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Configure silence timeouts, soft thinking fillers, interruptions, and turn eagerness for Conversational AI agents
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'customer_service', label: 'Customer Service' },
            { id: 'info_collection', label: 'Info Collection' },
            { id: 'legal', label: 'Legal / Disclaimer' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                presetProfile === p.id 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Duration */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Max Conversation Duration</h4>
                  <p className="text-[11px] text-slate-400">Total active call limit (60 - 7,200s)</p>
                </div>
              </div>
              <span className="font-mono text-xs text-blue-400 font-bold bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-800">
                {maxDuration}s ({Math.floor(maxDuration / 60)}m)
              </span>
            </div>

            <input
              type="range"
              min={60}
              max={7200}
              step={60}
              value={maxDuration}
              onChange={(e) => {
                setMaxDuration(Number(e.target.value));
                setPresetProfile('custom');
              }}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Turn Timeout */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Take Turn After Silence</h4>
                  <p className="text-[11px] text-slate-400">Wait time during user silence (1 - 30s)</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800">
                {turnTimeout}s
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={turnTimeout}
              onChange={(e) => {
                setTurnTimeout(Number(e.target.value));
                setPresetProfile('custom');
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Soft Timeout Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-amber-600/20 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/30">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Soft Timeout (Thinking Fillers)</h4>
              <p className="text-xs text-slate-400">Spoken audio feedback when the LLM response takes longer than expected</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Timeout Threshold
                </label>
                <span className="font-mono text-xs text-amber-400 font-bold">{softTimeoutSec}s</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8.0}
                step={0.5}
                value={softTimeoutSec}
                onChange={(e) => {
                  setSoftTimeoutSec(Number(e.target.value));
                  setPresetProfile('custom');
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Recommended: 3.0s to avoid unnecessary fillers on fast responses.</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Static Filler Message
              </label>
              <input
                type="text"
                value={softTimeoutMsg}
                onChange={(e) => {
                  setSoftTimeoutMsg(e.target.value);
                  setPresetProfile('custom');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">LLM-Generated Dynamic Fillers</span>
              <p className="text-[11px] text-slate-400">Generate contextually appropriate filler phrases dynamically using a lightweight LLM.</p>
            </div>
            <button
              type="button"
              onClick={() => setUseLlmFiller(!useLlmFiller)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${useLlmFiller ? 'bg-amber-500' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${useLlmFiller ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Interruptions & Turn Eagerness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600/20 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Hand className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">User Interruptions</h4>
                  <p className="text-[11px] text-slate-400">Allow users to interject while agent speaks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAllowInterruptions(!allowInterruptions)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${allowInterruptions ? 'bg-purple-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allowInterruptions ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {allowInterruptions ? 'Enabled for natural conversational back-and-forth.' : 'Disabled for critical disclaimers or legal instructions.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600/20 text-rose-400 rounded-xl flex items-center justify-center border border-rose-500/30">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Turn Eagerness</h4>
                <p className="text-[11px] text-slate-400">How quickly assistant responds to pauses</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'eager', label: 'Eager', desc: 'Fast response' },
                { id: 'normal', label: 'Normal', desc: 'Balanced' },
                { id: 'patient', label: 'Patient', desc: 'Wait for detail' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setTurnEagerness(mode.id as any);
                    setPresetProfile('custom');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    turnEagerness === mode.id 
                      ? 'bg-rose-500/20 border-rose-500 text-white font-bold shadow-sm' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs capitalize">{mode.label}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Conversation Flow Config</span>
          </button>
        </div>
      </form>
    </div>
  );
}
