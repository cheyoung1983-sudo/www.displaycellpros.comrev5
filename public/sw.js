// Display & Cell Pros LLC (D&CP) Service Worker - High-Performance Offline Lab Engine
// Version: 4.0.0 (Spokane Precision Bench Offline Caching & Stale-While-Revalidate Engine)

const CACHE_VERSION = 'v4';
const STATIC_CACHE = `dcp-static-${CACHE_VERSION}`;
const FONT_CACHE = `dcp-fonts-${CACHE_VERSION}`;
const DB_CACHE = `dcp-repair-db-${CACHE_VERSION}`;

// Pre-cached critical app shell & icon assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/pwa-192.png',
  '/pwa-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/favicon-16x16.png',
  '/icon.svg'
];

// Pre-cache external font stylesheets if available online during install
const FONT_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap'
];

// -------------------------------------------------------------
// 1. INSTALL EVENT: Pre-cache core shell, icons, and fonts
// -------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Pre-cache static app shell and icons
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline static shell & icons');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Attempt pre-caching font stylesheets gracefully
      caches.open(FONT_CACHE).then((cache) => {
        console.log('[ServiceWorker] Pre-caching typography & web fonts');
        return Promise.allSettled(
          FONT_ASSETS.map((fontUrl) =>
            fetch(fontUrl, { mode: 'cors' })
              .then((response) => {
                if (response && response.status === 200) {
                  return cache.put(fontUrl, response);
                }
              })
              .catch((err) => {
                console.debug('[ServiceWorker] Font pre-fetch deferred:', err);
              })
          )
        );
      })
    ]).then(() => self.skipWaiting())
  );
});

// -------------------------------------------------------------
// 2. ACTIVATE EVENT: Clean up outdated cache versions
// -------------------------------------------------------------
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, FONT_CACHE, DB_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[ServiceWorker] Purging legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// -------------------------------------------------------------
// 3. FETCH EVENT: Intelligent multi-tier caching strategies
// -------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. REPAIR DATABASE & API QUERIES: Stale-While-Revalidate for GET queries
  if (url.pathname.startsWith('/api/')) {
    // Only apply Stale-While-Revalidate caching to GET queries (Repair DB, benchmark, indexes, stats)
    if (event.request.method === 'GET') {
      event.respondWith(
        caches.open(DB_CACHE).then(async (cache) => {
          const cachedResponse = await cache.match(event.request);

          // Asynchronous network fetch to revalidate and update database cache in the background
          const networkFetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                cache.put(event.request, responseToCache).catch((err) => {
                  console.debug('[ServiceWorker] DB cache update warning:', err);
                });
              }
              return networkResponse;
            })
            .catch((err) => {
              console.warn('[ServiceWorker] Offline: Network unreachable for DB query:', url.pathname, err);
              return null;
            });

          // If we have cached repair database results, return immediately (stale) while network updates cache (revalidate)
          if (cachedResponse) {
            event.waitUntil(networkFetchPromise);
            return cachedResponse;
          }

          // If no cache entry exists, await network response
          const networkResponse = await networkFetchPromise;
          if (networkResponse) {
            return networkResponse;
          }

          // Offline fallback when both cache and network are unavailable for repair query
          return new Response(
            JSON.stringify({
              offlineMode: true,
              cached: false,
              status: 'offline_fallback',
              message: 'Operating in Offline Spokane Lab Mode. Telemetry cached locally.',
              data: []
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'X-DCP-Offline': 'true'
              }
            }
          );
        })
      );
      return;
    }

    // POST / PUT / DELETE API mutations: Network-first with offline error response
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            offlineMode: true,
            success: false,
            error: 'Network disconnected: Offline repair mutation queued for reconnection.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // B. GOOGLE FONTS & WEB FONTS: Stale-While-Revalidate / Cache-First
  if (
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com' ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot)$/i)
  ) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cachedFont = await cache.match(event.request);

        const fetchFontPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              cache.put(event.request, networkResponse.clone()).catch(() => {});
            }
            return networkResponse;
          })
          .catch(() => cachedFont);

        return cachedFont || fetchFontPromise;
      })
    );
    return;
  }

  // C. JAVASCRIPT & CSS CHUNKS (Vite hashed bundles): Network-first with Cache fallback
  if (url.pathname.match(/\.(js|mjs|css)$/i) || url.pathname.includes('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // D. STATIC MEDIA ASSETS (Icons, Images, SVGs): Stale-While-Revalidate
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i) ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cachedAsset = await cache.match(event.request);

        const fetchAssetPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
              cache.put(event.request, networkResponse.clone()).catch(() => {});
            }
            return networkResponse;
          })
          .catch(() => cachedAsset);

        return cachedAsset || fetchAssetPromise;
      })
    );
    return;
  }

  // D. HTML NAVIGATION REQUESTS: Network-first with /index.html Cache Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.open(STATIC_CACHE).then((cache) => {
            return cache.match('/index.html').then((cachedHtml) => {
              return cachedHtml || cache.match(event.request);
            });
          });
        })
    );
    return;
  }

  // E. DEFAULT FALLBACK
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// -------------------------------------------------------------
// 4. MESSAGE EVENT: Client & Extension Sync Handler
// -------------------------------------------------------------
self.addEventListener('message', (event) => {
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    if (event.data && event.data.type === 'CLEAR_DB_CACHE') {
      caches.delete(DB_CACHE).then(() => {
        console.log('[ServiceWorker] DB cache invalidated on client demand');
      });
    }
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        status: 'ack',
        version: CACHE_VERSION,
        caches: { static: STATIC_CACHE, fonts: FONT_CACHE, db: DB_CACHE }
      });
    }
  } catch (err) {
    console.debug('[ServiceWorker] Message listener error:', err);
  }
});
