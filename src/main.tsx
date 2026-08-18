import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Auth0ProviderWithConfig } from './components/Auth0ProviderWithConfig.tsx';

// Prevent uncaught browser extension disconnects and automatically recover from stale chunk loading errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = String(event.reason?.message || event.reason || '');
    if (
      errorMsg.includes('Could not establish connection') ||
      errorMsg.includes('Receiving end does not exist')
    ) {
      event.preventDefault();
      console.debug('[Browser Extension / Channel] Connection ignored:', event.reason);
      return;
    }

    // Auto-recover from stale dynamic module chunk errors during live navigation/deployment
    if (
      /Failed to fetch dynamically imported module/i.test(errorMsg) ||
      /Loading chunk .* failed/i.test(errorMsg) ||
      /error loading dynamically imported module/i.test(errorMsg)
    ) {
      event.preventDefault();
      const lastReload = sessionStorage.getItem('dcp_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('dcp_chunk_reload', String(now));
        console.info('[DCP Runtime] Reloading to fetch latest application build chunks...');
        window.location.reload();
      }
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = String(event.message || event.error?.message || '');
    if (
      /Failed to fetch dynamically imported module/i.test(errorMsg) ||
      /Loading chunk .* failed/i.test(errorMsg)
    ) {
      event.preventDefault();
      const lastReload = sessionStorage.getItem('dcp_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('dcp_chunk_reload', String(now));
        console.info('[DCP Runtime] Reloading to fetch latest application build chunks...');
        window.location.reload();
      }
    }
  });
}

registerServiceWorker();

const rootElement = document.getElementById('root')!;
rootElement.dataset.mounted = 'true';

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Auth0ProviderWithConfig>
        <App />
      </Auth0ProviderWithConfig>
    </ErrorBoundary>
  </StrictMode>,
);
