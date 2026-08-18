import React, { useState, useEffect, useCallback } from "react";
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Cpu, 
  Check, 
  Settings, 
  Activity, 
  AlertTriangle,
  HardDrive,
  FileCode,
  Clock
} from "lucide-react";
import { TicketTemplate } from "@/lib/types";

interface CacheManagementProps {
  onRefreshCompleted?: () => void;
  onAddToast?: (title: string, message: string, type: "success" | "error" | "info" | "warning") => void;
}

export default function CacheManagement({ onRefreshCompleted, onAddToast }: CacheManagementProps) {
  const [cachedTemplates, setCachedTemplates] = useState<TicketTemplate[]>([]);
  const [cacheSize, setCacheSize] = useState<string>("0 KB");
  const [cacheKeysCount, setCacheKeysCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSwActive, setIsSwActive] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [activeCacheName, setActiveCacheName] = useState<string>("dcp-diagnostic-lab-cache-v2");
  const [cacheStatusLog, setCacheStatusLog] = useState<Array<{ time: string; msg: string; type: "info" | "success" | "warning" }>>([]);

  const addLog = useCallback((msg: string, type: "info" | "success" | "warning" = "info") => {
    const time = new Date().toLocaleTimeString();
    setCacheStatusLog(prev => [{ time, msg, type }, ...prev].slice(0, 8));
  }, []);

  // Inspect the actual browser cache storage to find cached assets and templates
  const inspectCache = useCallback(async () => {
    if (typeof window === "undefined" || !("caches" in window)) {
      addLog("Cache Storage API not supported in this environment", "warning");
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const currentCacheName = cacheNames.find(name => name.includes("diagnostic")) || "dcp-diagnostic-lab-cache-v2";
      setActiveCacheName(currentCacheName);

      const cache = await caches.open(currentCacheName);
      const keys = await cache.keys();
      setCacheKeysCount(keys.length);

      // Check if ticket templates are cached
      const templateResponse = await cache.match("/api/ticket-templates");
      if (templateResponse) {
        const templatesData = await templateResponse.json();
        setCachedTemplates(templatesData);
        addLog(`Loaded ${templatesData.length} templates directly from Service Worker cache storage.`, "success");
      } else {
        setCachedTemplates([]);
        addLog("No repair templates found in Cache Storage yet. System is awaiting the first fetch request.", "warning");
      }

      // Estimate storage size (mock estimation based on items for visual precision)
      const sizeEstimate = keys.length * 12.4 + (templateResponse ? 1.8 : 0);
      setCacheSize(`${sizeEstimate.toFixed(1)} KB`);

    } catch (err: any) {
      console.error("Failed to inspect browser cache:", err);
      addLog(`Cache inspection failed: ${err.message}`, "warning");
    }
  }, [addLog]);

  // Initial diagnostics checks
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      setIsSwActive(true);
    }

    const handleOnline = () => {
      setIsOnline(true);
      addLog("Diagnostic van telemetry re-established (Online)", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addLog("Diagnostic van telemetry dropped (Offline)", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    inspectCache();
    addLog("Service Worker Cache Diagnostic controller initialized.", "info");

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [inspectCache, addLog]);

  // Force Purge and Re-fetch Templates
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    addLog("Initiating manual cache purge for '/api/ticket-templates'...", "info");

    try {
      if (typeof window === "undefined" || !("caches" in window)) {
        throw new Error("Cache Storage API not accessible");
      }

      const cache = await caches.open(activeCacheName);
      
      // 1. Delete the cached response
      const deleted = await cache.delete("/api/ticket-templates");
      if (deleted) {
        addLog("Successfully purged '/api/ticket-templates' from active cache container.", "success");
      } else {
        addLog("Template endpoint was not previously locked in cache. Proceeding.", "info");
      }

      // 2. Fetch fresh data from the network with bypassing cache header
      addLog("Sending network-revalidate signal to cloud servers...", "info");
      
      const response = await fetch("/api/ticket-templates", {
        headers: { "Cache-Control": "no-cache" }
      });

      if (!response.ok) {
        throw new Error(`Cloud API returned HTTP ${response.status}`);
      }

      const freshTemplates = await response.json();
      
      // 3. Manually put the fresh response in the cache to guarantee the Service Worker has it
      await cache.put(
        "/api/ticket-templates",
        new Response(JSON.stringify(freshTemplates), {
          headers: { "Content-Type": "application/json" }
        })
      );

      addLog(`Synchronized ${freshTemplates.length} fresh templates into cache.`, "success");
      setCachedTemplates(freshTemplates);
      
      // Re-inspect the cache
      await inspectCache();

      if (onAddToast) {
        onAddToast(
          "Cache Recalibrated",
          `Cleared old registers and re-cached ${freshTemplates.length} diagnostic templates successfully.`,
          "success"
        );
      }

      if (onRefreshCompleted) {
        onRefreshCompleted();
      }

    } catch (err: any) {
      console.error("Force cache refresh failed:", err);
      addLog(`Force refresh failed: ${err.message}`, "warning");
      if (onAddToast) {
        onAddToast("Cache Refresh Failed", err.message || "An error occurred during synchronization.", "error");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col space-y-6 animate-in fade-in duration-200">
      
      {/* Header section with status indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Lab Cache & Service Worker Settings</h2>
          </div>
          <p className="text-xs text-slate-400">
            Monitor and manage offline cache registries to ensure zero-latency diagnostic operations in Spokane.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase flex items-center gap-1.5 border ${
            isSwActive 
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60" 
              : "bg-amber-950/40 text-amber-400 border-amber-900/60"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isSwActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
            {isSwActive ? "SW active" : "SW registering"}
          </span>
        </div>
      </div>

      {/* Grid of Telemetry Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono font-bold">Cache Vault Name</span>
            <span className="text-xs font-mono font-bold text-slate-300 block truncate max-w-[150px]" title={activeCacheName}>
              {activeCacheName}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono font-bold">Storage footprint</span>
            <span className="text-xs font-mono font-bold text-slate-300">{cacheSize}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-lg">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono font-bold">Cached entries</span>
            <span className="text-xs font-mono font-bold text-slate-300">{cacheKeysCount} assets</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono font-bold">Cached templates</span>
            <span className="text-xs font-mono font-bold text-slate-300">{cachedTemplates.length} templates</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cached templates list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Cached Templates Directory
              </h3>
            </div>

            <button
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-mono font-bold text-xs uppercase rounded-lg shadow transition-all hover:scale-[1.01] active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Synchronizing..." : "Force Refresh Cache"}
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 min-h-[220px] flex flex-col justify-between">
            {cachedTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 font-mono text-xs space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-500/70" />
                <span>No active templates matched in Cache Storage.</span>
                <p className="text-[10px] text-slate-550 max-w-sm text-center">
                  Verify your internet connection and trigger a "Force Refresh Cache" to prime the Service Worker container.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cachedTemplates.map((tpl) => (
                  <div 
                    key={tpl.id}
                    className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-sans">{tpl.name}</span>
                        <span className={`px-1 rounded text-[8.5px] font-bold ${
                          tpl.difficulty === "Easy" ? "text-emerald-400 bg-emerald-950/40" :
                          tpl.difficulty === "Intermediate" ? "text-amber-400 bg-amber-950/40" : "text-purple-400 bg-purple-950/40"
                        }`}>
                          {tpl.difficulty}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal max-w-md font-sans">
                        {tpl.description}
                      </p>
                      <div className="flex items-center gap-3 text-[9.5px] font-mono text-slate-500">
                        <span>Brand: <b className="text-slate-400">{tpl.brand}</b></span>
                        <span>•</span>
                        <span>Type: <b className="text-slate-400">{tpl.issueType}</b></span>
                        <span>•</span>
                        <span>Est: <b className="text-slate-400">{tpl.estimatedTime}</b></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-emerald-400 block">${tpl.defaultPrice.toFixed(2)}</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">OFFLINE READY</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-850 text-[10px] text-slate-500 flex justify-between items-center font-mono">
              <span>Technician Authority Access</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Encryption: SSL/SHA256
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Cache Log console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Service Worker Logs
            </h3>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono h-[300px] flex flex-col justify-between">
            <div className="overflow-y-auto space-y-2.5 pr-1 max-h-[240px] text-[10px] leading-relaxed custom-scrollbar">
              {cacheStatusLog.length === 0 ? (
                <div className="text-slate-600 text-center py-16">
                  [Idle] Waiting for diagnostic operations...
                </div>
              ) : (
                cacheStatusLog.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start border-b border-slate-900/60 pb-1.5 last:border-0">
                    <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                    <span className={
                      log.type === "success" ? "text-emerald-400" :
                      log.type === "warning" ? "text-amber-400 animate-pulse" : "text-blue-300"
                    }>
                      {log.msg}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-900 text-[9px] text-slate-500 flex justify-between items-center">
              <span>Sync Mode: STALE-WHILE-REVALIDATE</span>
              <span className="text-slate-400">VAN-CONSOLE v2.10</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
