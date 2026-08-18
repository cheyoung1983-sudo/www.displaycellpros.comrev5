import React from 'react';
import { Activity } from 'lucide-react';

export function AuthLoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-xs text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <Activity className="absolute inset-0 m-auto text-blue-400 w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-white font-mono font-bold uppercase tracking-widest text-sm mb-2">Authorizing Lab Session</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Verifying technician credentials and establishing secure telemetry bridge to Spokane mobile node...
        </p>
      </div>
    </div>
  );
}
