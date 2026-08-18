import React, { ComponentType, lazy } from 'react';

/**
 * Wraps React.lazy with automatic retry logic to handle chunk load failures
 * caused by deployments, stale browser caches, or transient network blips.
 */
function retryPromise<T>(
  fn: () => Promise<T>,
  retriesLeft = 2,
  interval = 1000
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        const isChunkError =
          error?.name === 'ChunkLoadError' ||
          /Failed to fetch dynamically imported module/i.test(error?.message || '') ||
          /Loading chunk .* failed/i.test(error?.message || '') ||
          /error loading dynamically imported module/i.test(error?.message || '');

        if (retriesLeft <= 0) {
          const hasReloaded = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('chunk_reload_attempted') : null;
          if (isChunkError && !hasReloaded && typeof window !== 'undefined') {
            sessionStorage.setItem('chunk_reload_attempted', 'true');
            window.location.reload();
            return;
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('chunk_reload_attempted');
          }
          reject(error);
          return;
        }

        setTimeout(() => {
          retryPromise(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retriesLeft = 2,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(() => retryPromise(factory, retriesLeft, interval));
}

export default lazyWithRetry;
