"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TicketTemplate } from "@/lib/types";
import { 
  FileText, 
  Wifi, 
  WifiOff, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Zap, 
  RefreshCw,
  Layers
} from "lucide-react";

interface TicketTemplatesPanelProps {
  onApplyTemplate: (template: TicketTemplate) => void;
}

export default function TicketTemplatesPanel({ onApplyTemplate }: TicketTemplatesPanelProps) {
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isServiceWorkerControlled, setIsServiceWorkerControlled] = useState<boolean>(false);
  const [source, setSource] = useState<"network" | "cache" | "unknown">("unknown");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Track browser online status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check if the page is currently controlled by a service worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      setIsServiceWorkerControlled(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      // If we are simulating offline via local toggle, we will force catch
      const res = await fetch("/api/ticket-templates");
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Failed to fetch templates`);
      }
      const data = await res.json();
      setTemplates(data);
      
      const duration = performance.now() - startTime;
      if (duration < 12 && isServiceWorkerControlled) {
        setSource("cache");
      } else {
        setSource(isOnline ? "network" : "cache");
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error("Templates fetch failed:", err);
      setError(err.message || "Unable to retrieve templates.");
      setSource("unknown");
    } finally {
      setLoading(false);
    }
  }, [isOnline, isServiceWorkerControlled]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col space-y-4 shadow-xl">
      {/* Header section with telemetry */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
            Diagnostic Ticket Templates
          </h3>
        </div>
        
        {/* Dynamic connection and source badge */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={fetchTemplates}
            disabled={loading}
            className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
            title="Force reload templates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase flex items-center gap-1 border ${
            isOnline 
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60" 
              : "bg-amber-950/40 text-amber-400 border-amber-900/60"
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                Van Online
              </>
            ) : (
              <>
                <WifiOff className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                Van Offline
              </>
            )}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
        Pre-configured ticket molds. Cached locally on the diagnostic van's local device for instantaneous offline loading when cells and satellite connections drop.
      </p>

      {/* Connection telemetry and stats */}
      <div className="grid grid-cols-2 gap-2.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-850/60 text-[9.5px] font-mono text-slate-400">
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Template Source:</span>
          {loading ? (
            <span className="text-slate-400">Determining...</span>
          ) : source === "cache" ? (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3" /> SW Cache (Offline Ready)
            </span>
          ) : (
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-400" /> Cloud API Endpoint
            </span>
          )}
        </div>
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Last Valid Check:</span>
          <span className="text-slate-300 font-semibold">{lastUpdated || "N/A"}</span>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-2.5">
        {loading && templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 font-mono text-xs space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
            <span>Retrieving cached registers...</span>
          </div>
        ) : error && templates.length === 0 ? (
          <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-lg text-center text-red-400 font-mono text-[10px]">
            {error}
          </div>
        ) : (
          templates.map((template) => (
            <div 
              key={template.id}
              className="group bg-slate-950 hover:bg-slate-850/75 border border-slate-850 hover:border-slate-700/80 rounded-xl p-3.5 transition-all flex flex-col space-y-2.5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-150 group-hover:text-white transition-colors">
                    {template.name}
                  </h4>
                  <span className="text-[9.5px] font-mono font-semibold text-slate-500 uppercase tracking-wide">
                    {template.brand} • {template.issueType}
                  </span>
                </div>
                <span className="text-[11px] font-black text-emerald-400 font-mono">
                  ${template.defaultPrice.toFixed(2)}
                </span>
              </div>

              <p className="text-[10px] text-slate-450 leading-relaxed font-sans">
                {template.description}
              </p>

              <div className="flex items-center justify-between border-t border-slate-900/60 pt-2.5 text-[9.5px] font-mono">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {template.estimatedTime}
                  </span>
                  <span>•</span>
                  <span className={`px-1 rounded text-[8.5px] font-bold ${
                    template.difficulty === "Easy" ? "text-emerald-400 bg-emerald-950/50" :
                    template.difficulty === "Intermediate" ? "text-amber-400 bg-amber-950/50" : "text-purple-400 bg-purple-950/50"
                  }`}>
                    {template.difficulty}
                  </span>
                </div>

                <button
                  onClick={() => onApplyTemplate(template)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] uppercase rounded-md tracking-wider flex items-center gap-1 shadow-md active:scale-97 transition-all"
                >
                  <Zap className="w-2.5 h-2.5" />
                  Apply Template
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Service Worker Status details */}
      <div className="text-[9px] font-mono text-slate-500 border-t border-slate-850/80 pt-2.5 flex items-center justify-between">
        <span>SW Service Status:</span>
        {isServiceWorkerControlled ? (
          <span className="text-emerald-500 font-bold">● REGISTERED & RUNNING</span>
        ) : (
          <span className="text-slate-500 font-semibold animate-pulse">○ REGISTERING BACKGROUND WORKER</span>
        )}
      </div>
    </div>
  );
}
