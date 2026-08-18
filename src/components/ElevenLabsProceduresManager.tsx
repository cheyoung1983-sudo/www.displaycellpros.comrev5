import React, { useState } from 'react';
import { 
  Workflow, 
  FileText, 
  ListOrdered, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  BookOpen, 
  ExternalLink,
  Layers,
  Settings2,
  Terminal,
  Shield,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast.tsx';

interface Procedure {
  id: string;
  name: string;
  type: 'free-form' | 'structured';
  trigger: string;
  content: string;
  steps?: string[];
}

const INITIAL_PROCEDURES: Procedure[] = [
  {
    id: 'proc-01',
    name: 'Device Intake & Triage Assessment',
    type: 'free-form',
    trigger: 'User mentions a broken device, screen damage, or power failure requiring repair intake.',
    content: 'Greet the customer warmly, ask for the exact device model (e.g. iPhone 13 Pro, MacBook Air M1), request the serial number or IMEI, and inquire about the primary symptom (water damage, no power, battery drain). Guide them through the WebUSB hardware diagnostic checklist.'
  },
  {
    id: 'proc-02',
    name: 'Short-Circuit Micro-Soldering Triage',
    type: 'structured',
    trigger: 'Diagnostic tool detects PP_VDD_MAIN or PP_VCC_MAIN short-to-ground (< 0.1V).',
    steps: [
      'Confirm VBUS voltage and standby current draw on bench power supply.',
      'Inject 1.2V thermal freeze spray or use thermal camera to locate capacitor hot-spot.',
      'Isolate shorted MLCC capacitor on the main power rail.',
      'Perform micro-soldering replacement and verify resistance to ground > 50kΩ.'
    ],
    content: 'Structured procedure for high-priority board level short circuits.'
  },
  {
    id: 'proc-03',
    name: 'Auth0 RBAC Permission Verification',
    type: 'free-form',
    trigger: 'Technician asks about root permissions, SuperAdmin access, or dcp authorization.',
    content: 'Verify the user subject ID matches google-oauth2|102574138357203183279 or the SuperAdmin group in the Auth0 Authorization Extension. Confirm dcp permission for micro-soldering console access.'
  }
];

export default function ElevenLabsProceduresManager() {
  const { showToast } = useToast();
  const [procedures, setProcedures] = useState<Procedure[]>(INITIAL_PROCEDURES);
  const [selectedProc, setSelectedProc] = useState<Procedure | null>(INITIAL_PROCEDURES[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'free-form' | 'structured'>('free-form');
  const [newTrigger, setNewTrigger] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSteps, setNewSteps] = useState<string[]>(['Step 1: ', 'Step 2: ']);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTrigger.trim()) {
      showToast('Please provide a procedure name and trigger condition.', 'error');
      return;
    }

    const created: Procedure = {
      id: `proc-${Date.now()}`,
      name: newName,
      type: newType,
      trigger: newTrigger,
      content: newContent || 'Custom procedure instructions...',
      steps: newType === 'structured' ? newSteps.filter(s => s.trim().length > 0) : undefined
    };

    setProcedures(prev => [created, ...prev]);
    setSelectedProc(created);
    setIsCreating(false);
    setNewName('');
    setNewTrigger('');
    setNewContent('');
    showToast('Procedure created successfully in draft branch.', 'success');
  };

  const handleDelete = (id: string) => {
    setProcedures(prev => prev.filter(p => p.id !== id));
    if (selectedProc?.id === id) {
      setSelectedProc(procedures[0] || null);
    }
    showToast('Procedure draft removed.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center shadow-inner">
            <Workflow className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-playfair font-black text-white">ElevenLabs Agent Procedures</h2>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-md border border-amber-500/30 uppercase">
                Conversational AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Task-specific instructions loaded by your Conversational AI agent when conversation matches triggers
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Procedure</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Active Procedures</span>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded-md font-bold">
              {procedures.length}
            </span>
          </div>

          <div className="space-y-2">
            {procedures.map((proc) => {
              const isSelected = selectedProc?.id === proc.id;
              return (
                <div
                  key={proc.id}
                  onClick={() => {
                    setSelectedProc(proc);
                    setIsCreating(false);
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border space-y-1.5 ${
                    isSelected 
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md' 
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate max-w-[180px]">{proc.name}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded ${
                      proc.type === 'free-form' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {proc.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">{proc.trigger}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 h-[600px] overflow-y-auto">
          {isCreating ? (
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-playfair font-bold text-lg text-white">Create New Agent Procedure</h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Procedure Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Battery Replacement Protocol"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Procedure Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewType('free-form')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      newType === 'free-form' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-white font-bold mb-1">Free-form</div>
                    <div className="text-[10px] font-normal text-slate-400">Natural language instructions adapted by the agent.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType('structured')}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      newType === 'structured' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-white font-bold mb-1">Structured</div>
                    <div className="text-[10px] font-normal text-slate-400">Ordered list of typed steps executed sequentially.</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Trigger Condition
                </label>
                <input
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="When does the agent load this procedure?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {newType === 'free-form' ? (
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Free-form Content (Max 50,000 chars)
                  </label>
                  <textarea
                    rows={5}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Enter detailed natural language instructions..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono leading-relaxed"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Structured Steps
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewSteps(prev => [...prev, `Step ${prev.length + 1}: `])}
                      className="text-[11px] text-amber-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Step
                    </button>
                  </div>
                  {newSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 w-6">{idx + 1}.</span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewSteps(prev => prev.map((s, i) => i === idx ? val : s));
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-500/20"
                >
                  Save Procedure Draft
                </button>
              </div>
            </form>
          ) : selectedProc ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-playfair font-black text-white">{selectedProc.name}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold rounded-md ${
                      selectedProc.type === 'free-form' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {selectedProc.type}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 mt-1 block">ID: {selectedProc.id}</span>
                </div>

                <button
                  onClick={() => handleDelete(selectedProc.id)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                  title="Delete Procedure"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Trigger Condition</span>
                <p className="text-xs text-amber-300 font-mono font-medium leading-relaxed">
                  "{selectedProc.trigger}"
                </p>
              </div>

              {selectedProc.type === 'free-form' ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Free-Form Content</span>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {selectedProc.content}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Structured Execution Steps</span>
                  <div className="space-y-2">
                    {selectedProc.steps?.map((step, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-300 font-mono pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-950/20 rounded-2xl border border-blue-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-300 font-medium">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Synced with ElevenLabs Conversational AI branch draft lifecycle.</span>
                </div>
                <a
                  href="https://elevenlabs.io/app/agents"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 font-bold shrink-0"
                >
                  <span>Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <BookOpen className="w-10 h-10 stroke-1" />
              <p className="text-xs font-mono">Select a procedure to inspect its configuration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
