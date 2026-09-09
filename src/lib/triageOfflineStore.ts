/**
 * Offline cache and pending-sync queue for Smart Triage results, following
 * the same localStorage-backed pattern src/lib/db.ts uses for repair
 * intake drafts. Lets a triage answer generated offline (via
 * synthesizeOfflineTriage) be replaced with a full AI-grounded answer once
 * connectivity returns, without losing the original query.
 */
import { useCallback, useEffect, useState } from 'react';
import type { SmartTriageResult } from '../components/SmartTriageChat.tsx';

export interface TriageCacheEntry {
  id: string;
  deviceModel: string;
  symptomDescription: string;
  result: SmartTriageResult;
  source: 'ai' | 'offline-local';
  createdAt: string;
}

const STORAGE_KEY = 'dcp_triage_offline_cache_v1';
const MAX_ENTRIES = 50;

function cacheKeyFor(deviceModel: string, symptomDescription: string): string {
  return `${deviceModel.trim().toLowerCase()}__${symptomDescription.trim().toLowerCase()}`;
}

function readAll(): TriageCacheEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: TriageCacheEntry[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const trimmed = entries.slice(-MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent('dcp_triage_cache_updated'));
  } catch (e) {
    console.warn('[triageOfflineStore] Failed to persist cache:', e);
  }
}

export function getCachedTriage(
  deviceModel: string,
  symptomDescription: string
): TriageCacheEntry | undefined {
  const key = cacheKeyFor(deviceModel, symptomDescription);
  return readAll().find((e) => cacheKeyFor(e.deviceModel, e.symptomDescription) === key);
}

export function saveTriageToCache(entry: Omit<TriageCacheEntry, 'id' | 'createdAt'>): TriageCacheEntry {
  const all = readAll();
  const key = cacheKeyFor(entry.deviceModel, entry.symptomDescription);
  const withoutExisting = all.filter(
    (e) => cacheKeyFor(e.deviceModel, e.symptomDescription) !== key
  );
  const saved: TriageCacheEntry = {
    ...entry,
    id: `triage_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  writeAll([...withoutExisting, saved]);
  return saved;
}

export function getOfflineTriageEntries(): TriageCacheEntry[] {
  return readAll()
    .filter((e) => e.source === 'offline-local')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export interface UseTriageOfflineCacheReturn {
  isOnline: boolean;
  offlineEntries: TriageCacheEntry[];
  getCached: (deviceModel: string, symptomDescription: string) => TriageCacheEntry | undefined;
  saveCached: (entry: Omit<TriageCacheEntry, 'id' | 'createdAt'>) => TriageCacheEntry;
  refresh: () => void;
}

/**
 * React hook exposing online status plus the local triage cache, so a
 * component can decide between calling the AI-grounded API and falling
 * back to a purely local result.
 */
export function useTriageOfflineCache(): UseTriageOfflineCacheReturn {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineEntries, setOfflineEntries] = useState<TriageCacheEntry[]>([]);

  const refresh = useCallback(() => {
    setOfflineEntries(getOfflineTriageEntries());
  }, []);

  useEffect(() => {
    refresh();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleUpdate = () => refresh();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('dcp_triage_cache_updated', handleUpdate);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('dcp_triage_cache_updated', handleUpdate);
      };
    }
  }, [refresh]);

  return {
    isOnline,
    offlineEntries,
    getCached: getCachedTriage,
    saveCached: saveTriageToCache,
    refresh,
  };
}
