const CACHE_NAME = 'japon2026-v1';
const APP_SHELL = [
  'index.html',
  'manifest.json',
  'assets/leaflet/leaflet.css',
  'assets/leaflet/leaflet.js',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map(url => cache.add(url)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);
  if(url.origin !== location.origin) return; // tuiles OSM, météo, polices : direct au réseau

  const isFreshData = url.pathname.endsWith('points.json') || url.pathname.includes('/photos/');

  if(isFreshData){
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
        return res;
      } catch(e) {
        const cached = await caches.match(req);
        if(cached) return cached;
        throw e;
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if(cached) return cached;
    const res = await fetch(req);
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, res.clone());
    return res;
  })());
});
