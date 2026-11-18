/* 3D로 보는 성경 · 오프라인 캐시
   apps.js 는 항상 새로 받아 오므로(네트워크 우선) 목록을 고치면 바로 반영됩니다. */
const CACHE = 'bible3d-v1';
const SHELL = ['./', 'index.html', 'apps.js', 'teasers.js', 'manifest.webmanifest',
  'icons/favicon.svg', 'icons/icon-192.png', 'thumbs/jerusalem.jpg', 'thumbs/temple.jpg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !url.hostname.endsWith('cdnjs.cloudflare.com') && !url.hostname.includes('fonts.g')) return;
  // 같은 사이트의 다른 앱(예: /temple/)은 건드리지 않음
  if (url.origin === location.origin && !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  const networkFirst = req.mode === 'navigate' || url.pathname.endsWith('apps.js') || url.pathname.endsWith('index.html');
  if (networkFirst) {
    e.respondWith(fetch(req).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return res; }).catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return res; })));
  }
});
