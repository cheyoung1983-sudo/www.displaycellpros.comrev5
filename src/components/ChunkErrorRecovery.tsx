"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '../registerServiceWorker.ts';

export function ChunkErrorRecovery() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const isStaleChunkError = (message: string) =>
      /Failed to fetch dynamically imported module/i.test(message) ||
      /Loading chunk .* failed/i.test(message) ||
      /error loading dynamically imported module/i.test(message);

    const reloadOnce = () => {
      const lastReload = sessionStorage.getItem('dcp_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('dcp_chunk_reload', String(now));
        console.info('[DCP Runtime] Reloading to fetch latest application build chunks...');
        window.location.reload();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMsg = String((event.reason as any)?.message || event.reason || '');
      if (
        errorMsg.includes('Could not establish connection') ||
        errorMsg.includes('Receiving end does not exist')
      ) {
        event.preventDefault();
        console.debug('[Browser Extension / Channel] Connection ignored:', event.reason);
        return;
      }

      if (isStaleChunkError(errorMsg)) {
        event.preventDefault();
        reloadOnce();
      }
    };

    const onError = (event: ErrorEvent) => {
      const errorMsg = String(event.message || event.error?.message || '');
      if (isStaleChunkError(errorMsg)) {
        event.preventDefault();
        reloadOnce();
      }
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  return null;
}
