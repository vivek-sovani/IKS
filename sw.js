/* IKS Service Worker — PWA offline support */
'use strict';

const CACHE_NAME = 'iks-v1';

/* Core assets pre-cached on install */
const PRECACHE = [
  '/IKS/',
  '/IKS/404.html',
  '/IKS/assets/css/fonts.css',
  '/IKS/assets/css/main.css',
  '/IKS/assets/css/article.css',
  '/IKS/assets/js/nav.js',
  '/IKS/assets/js/slides.js',
  '/IKS/assets/images/icon-192.png',
  '/IKS/assets/images/icon-512.png',
  '/IKS/shared/sidebar.html',
  '/IKS/manifest.json',
];

/* Install: pre-cache core assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* Activate: delete old cache versions */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch strategy:
   - HTML pages     → Network first, fall back to cache, then offline page
   - CSS / JS / images / fonts → Cache first, fall back to network
   - PDFs           → Network first (large files, skip cache)
   - External (CDN) → Network only
*/
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Only handle same-origin requests under /IKS/ */
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/IKS/')) return;

  /* PDFs — network only (too large to cache) */
  if (url.pathname.endsWith('.pdf')) return;

  const isHTML = request.destination === 'document' ||
                 request.headers.get('Accept')?.includes('text/html');

  if (isHTML) {
    /* Network first for HTML */
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/IKS/404.html'))
        )
    );
  } else {
    /* Cache first for static assets */
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          /* Cache successfully fetched assets */
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        });
      })
    );
  }
});
