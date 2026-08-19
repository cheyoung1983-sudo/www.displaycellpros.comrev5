"use client";

import React, { useState } from 'react';
import { Volume2, Play, Square, Loader2, Sparkles, Mic, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from './Toast.tsx';

interface ElevenLabsVoiceGeneratorProps {
  initialText?: string;
}

export default function ElevenLabsVoiceGenerator({ initialText }: ElevenLabsVoiceGeneratorProps) {
  const { showToast } = useToast();
  const [text, setText] = useState(
    initialText || "Diagnostic scan complete. PP_VDD_MAIN short-to-ground detected on logic board ID A2337. VBUS voltage verified at 5.02 volts with 0.14A standby draw. Recommended micro-soldering thermal inspection."
  );
  const [voiceId, setVoiceId] = useState("JBFqnCBsd6RMkjVDRZzb"); // George
  const [modelId, setModelId] = useState("eleven_v3");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const voices = [
    { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (Deep & Professional)" },
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (Calm & Clear)" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Authoritative)" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Warm & Articulate)" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Narrator)" }
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      showToast('Please enter text to synthesize.', 'error');
      return;
    }

    setIsLoading(true);
    setIsPlaying(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, modelId })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      showToast('ElevenLabs speech generated successfully!', 'success');
      
      // Auto play
      const audio = new Audio(url);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play().catch(() => setIsPlaying(false));
    } catch (err: any) {
      showToast(err.message || 'Failed to synthesize speech', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto text-white shadow-2xl space-y-6"
    >
      <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-inner">
          <Volume2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-playfair font-black text-white">ElevenLabs Voice AI Studio</h3>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-md border border-amber-500/30 uppercase">
              ElevenLabs v3
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Generate ultra-realistic text-to-speech voice summaries for repair tickets and diagnostic logs
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Select AI Voice Profile
          </label>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-medium"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Script / Diagnostic Text to Synthesize
            </label>
            <span className="text-[10px] font-mono text-slate-500">{text.length} chars</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 leading-relaxed resize-y font-mono"
            placeholder="Enter repair notes or diagnostic telemetry..."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Model: <code className="text-amber-300 font-bold">eleven_v3</code></span>
          </div>

          <div className="flex items-center gap-3">
            {audioUrl && (
              <button
                type="button"
                onClick={handlePlayAudio}
                disabled={isPlaying || isLoading}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Replay Audio</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Generate Speech</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
