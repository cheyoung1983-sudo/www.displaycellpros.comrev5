import React from 'react';
import { SERVICES } from '../lib/ui-constants';

interface ServicesViewProps {
  onBookClick: () => void;
}

export function ServicesView({ onBookClick }: ServicesViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-white mb-4">Our Service Architecture</h1>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto">Transparent, formula-based pricing. No hidden fees. We calculate costs based on wholesale part prices plus professional mobile labor overhead.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SERVICES.map((srv, idx) => (
          <div key={idx} className="bg-slate-800/80 rounded-2xl border border-slate-705 p-8 hover:border-blue-500/50 transition-all flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

            <div className="mb-6">{srv.icon}</div>
            <div className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-2 font-mono">{srv.tier}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{srv.title}</h3>
            <p className="text-slate-300 mb-6 flex-grow">{srv.desc}</p>

            <div className="bg-slate-900/80 rounded-lg p-4 mb-8 border border-slate-800">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-mono">Estimated Baseline</div>
              <div className="text-2xl font-bold text-white">{srv.price}</div>
              <div className="mt-3 text-xs text-slate-400 border-t border-slate-800 pt-3">
                <span className="font-semibold text-slate-350">Includes:</span> {srv.examples}
              </div>
            </div>

            <button
              onClick={onBookClick}
              className="w-full py-3 bg-slate-700 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Start Diagnostic Triage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
