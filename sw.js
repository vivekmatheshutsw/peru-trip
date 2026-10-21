// Bump VERSION whenever the trip page changes so phones pick up the update.
const VERSION = 'peru-v4';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Pages: try network first (gets updates), fall back to the saved copy offline.
  if (req.mode === 'navigate') {
    // Only trust a real page. If the site is gone (404) or there's no signal, keep showing the saved copy.
    e.respondWith(fetch(req).then(r => {
      if (!r.ok) return caches.match('index.html').then(hit => hit || r);
      const c = r.clone(); caches.open(VERSION).then(x => x.put('index.html', c)); return r;
    }).catch(() => caches.match('index.html')));
    return;
  }
  // Everything else (icons, Google Fonts): saved copy first, then network and save it.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); }
    return r;
  }).catch(() => hit)));
});
