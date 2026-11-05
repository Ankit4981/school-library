// Viraj International School Library Service Worker — Version 2
const CACHE_NAME = 'vis-library-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/logo.png',
  '/logo.webp',
  '/logo.svg',
  '/covers/deep-trouble.webp',
  '/covers/ghost-beach.webp',
  '/covers/go-eat-worms.webp',
  '/covers/monster-blood-2.webp',
  '/covers/one-day-at-horrorland.webp'
];

// Install: Cache core static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Cleanup old caches (e.g. vis-library-v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // 1. Bypass all API calls directly to network to maintain dynamic sessions & cookies
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // 2. HTML, JS, CSS: Network-first with cache fallback (ensures new code updates load immediately)
  if (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Images, Covers & Fonts: Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((networkRes) => {
          if (networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => cached);
    })
  );
});
