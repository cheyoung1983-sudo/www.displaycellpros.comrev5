"use client";

import { useState, useEffect } from 'react';
import { WifiOff, HardDrive, Download } from 'lucide-react';
import { downloadDatabaseBackup } from '../lib/db.ts';

export default function OfflineStatusBanner() {
  // Always assume online for the first render so server and client markup
  // match; the real status is applied immediately after mount below.
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  const handleQuickBackup = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      await downloadDatabaseBackup(format);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-amber-600 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-md relative z-50">
      <div className="flex items-center gap-3 max-w-7xl mx-auto w-full justify-between flex-wrap">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 text-slate-950 animate-pulse" />
          <span>
            <strong>Lab Connection Offline:</strong> Operating in PWA Offline Lab Cache Mode. Local SQLite drafts & telemetry remain active.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-slate-950/90 text-amber-300 rounded-md px-1.5 py-0.5 text-[10px] font-mono gap-1">
            <button
              onClick={() => handleQuickBackup('json')}
              disabled={isExporting}
              className="hover:text-white transition-colors flex items-center gap-1 px-1 py-0.5"
              title="Export local SQLite records as JSON"
            >
              <Download className="w-2.5 h-2.5" /> JSON
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => handleQuickBackup('csv')}
              disabled={isExporting}
              className="hover:text-white transition-colors flex items-center gap-1 px-1 py-0.5"
              title="Export local SQLite records as CSV"
            >
              <Download className="w-2.5 h-2.5" /> CSV
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] uppercase bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full">
            <HardDrive className="w-3 h-3" /> SW Cache Active
          </span>
        </div>
      </div>
    </div>
  );
}
