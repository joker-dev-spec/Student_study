/* Science BrainBox — Service Worker (offline-first) */
const CACHE = 'brainbox-v1';

const CORE = [
  './',
  './index.html',
  './dashboard.html',
  './quiz.html',
  './profile.html',
  './css/style.css',
  './js/app.js',
  './js/auth.js',
  './js/dashboard.js',
  './js/quiz.js',
  './js/tools.js',
  './js/notes.js',
  './js/profile.js',
  './js/data.js',
  './js/search.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first with cache fallback (keeps content fresh, works offline)
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./dashboard.html')))
  );
});
