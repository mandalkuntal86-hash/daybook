const CACHE_NAME = 'cash-book-shell-v8';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for the app shell so new UI appears on normal startup.
// Use the cached shell only when the device is offline.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShellFile = APP_SHELL.some((f) => url.pathname.endsWith(f.replace('./', '/')) || url.pathname === '/' );
  const isNavigation = event.request.mode === 'navigate';

  if (event.request.method === 'GET' && url.origin === self.location.origin && (isShellFile || isNavigation)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
  }
});
