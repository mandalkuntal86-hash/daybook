const CACHE_NAME = 'cash-book-shell-v2';
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

// Cache-first for the app shell itself; everything else (Firestore, Google Fonts)
// goes straight to the network since this app needs a live connection to sync data.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShellFile = APP_SHELL.some((f) => url.pathname.endsWith(f.replace('./', '/')) || url.pathname === '/' );

  if (event.request.method === 'GET' && url.origin === self.location.origin && isShellFile) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
