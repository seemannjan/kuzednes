const CACHE_NAME = 'kuze-dnes-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './favicon.ico',
  './apple-touch-icon.png',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Pokud soubor máme v mezipaměti, vrátíme ho. Jinak ho stáhneme z internetu.
      return response || fetch(event.request);
    })
  );
});