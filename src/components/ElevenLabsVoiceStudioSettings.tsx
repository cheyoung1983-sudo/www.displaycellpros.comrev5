"use client";

import React, { useState } from 'react';
import { 
  BookA, 
  Smile, 
  Sparkles, 
  Volume2, 
  FileCode, 
  CheckCircle2, 
  Sliders, 
  Save, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from './Toast.tsx';

export default function ElevenLabsVoiceStudioSettings() {
  const { showToast } = useToast();

  // Pronunciation Dictionary State
  const [dictId, setDictId] = useState('dict_a2337x9');
  const [versionId, setVersionId] = useState('v_1_0');
  const [plsContent, setPlsContent] = useState(`<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0"
      xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
      alphabet="ipa" xml:lang="en-GB">
  <lexeme>
    <grapheme>Micro-soldering</grapheme>
    <phoneme>ˈmaɪkroʊ ˈsɒldərɪŋ</phoneme>
  </lexeme>
  <lexeme>
    <grapheme>VBUS</grapheme>
    <alias>V B U S power rail</alias>
  </lexeme>
</lexicon>`);

  // Expressive Mode State
  const [ttsModel, setTtsModel] = useState('eleven_v3_conversational');
  const [systemPromptTone, setSystemPromptTone] = useState(
    'You are a precision electronics repair assistant. When a user sounds worried about device data loss, adopt a calm and reassuring tone. When explaining technical board repair steps, use a clear, measured pace.'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Pronunciation dictionary and Expressive mode configuration saved successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-inner">
            <Smile className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-playfair font-black text-white">Voice & Dictionaries Studio</h2>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-md border border-amber-500/30 uppercase">
                Eleven v3 Conversational
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Configure pronunciation dictionaries (.PLS / IPA / CMU) and Expressive mode emotional delivery
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Expressive Mode Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-amber-600/20 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Expressive Mode & Eleven v3 Conversational</h4>
              <p className="text-xs text-slate-400">Context-aware emotional delivery, prosody analysis, and expressive tags ([laughs], [whispers], [sighs])</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Text-to-Speech Model Selection
              </label>
              <select
                value={ttsModel}
                onChange={(e) => setTtsModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-medium"
              >
                <option value="eleven_v3_conversational">V3 Conversational (Recommended - Expressive Mode enabled)</option>
                <option value="eleven_flash_v2">Flash v2 (Ultra-low latency, phoneme support)</option>
                <option value="eleven_multilingual_v2">Multilingual v2 (Standard stability)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Emotional Delivery System Prompt Guidance
              </label>
              <textarea
                rows={4}
                value={systemPromptTone}
                onChange={(e) => setSystemPromptTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono leading-relaxed"
                placeholder="Guide emotional tone and expressive responses..."
              />
              <p className="text-[11px] text-slate-500 font-mono">
                Supports expressive tags like <code className="text-amber-300">[laughs]</code>, <code className="text-amber-300">[whispers]</code>, and <code className="text-amber-300">[sighs]</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Pronunciation Dictionaries */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
              <BookA className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Pronunciation Dictionaries (.PLS Lexicon)</h4>
              <p className="text-xs text-slate-400">Ensure precise pronunciation of technical terms, acronyms, and names using IPA or CMU notations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Pronunciation Dictionary ID
              </label>
              <input
                type="text"
                value={dictId}
                onChange={(e) => setDictId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Version ID
              </label>
              <input
                type="text"
                value={versionId}
                onChange={(e) => setVersionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Lexicon XML (.PLS Format)
              </label>
              <span className="text-[10px] font-mono text-slate-500">IPA / CMU Supported</span>
            </div>
            <textarea
              rows={8}
              value={plsContent}
              onChange={(e) => setPlsContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-blue-500 font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Voice & Dictionary Config</span>
          </button>
        </div>
      </form>
    </div>
  );
}
