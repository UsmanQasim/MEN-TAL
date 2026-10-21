const CACHE_NAME = 'men-tal-shell-v8';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './site-config.js',
  './manifest.webmanifest',
  './assets/logo-mark.png',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((name) => name.startsWith('men-tal-shell-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  if (new URL(event.request.url).pathname.endsWith('/site-config.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok || response.type !== 'basic') return response;
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, response.clone()))
            .then(() => response);
        })
        .catch(async (error) => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          throw error;
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    }),
  );
});
