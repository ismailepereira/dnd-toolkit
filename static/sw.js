// =====================================================================
// Service Worker — D&D Toolkit (Fase 17.3: PWA)
// ---------------------------------------------------------------------
// Estratégia NETWORK-FIRST (com fallback ao cache): sempre tenta a rede
// primeiro — assim código, estado e tempo real ficam SEMPRE frescos quando
// online (evita o clássico "PWA servindo JS velho após deploy"). Offline,
// cai no cache das páginas/estáticos já visitados; navegações sem cache
// mostram uma página "sem conexão".
//
// NÃO intercepta métodos de escrita (POST/PUT) nem chamadas /api/ (dinâmicas):
// deixa passar direto pra rede, sem cache — o app já lida com falha de rede.
//
// Para invalidar tudo após uma mudança grande no SW, suba o CACHE.
// =====================================================================
const CACHE = 'dnd-toolkit-v1';
const PRECACHE = ['/static/css/style.css', '/static/offline.html'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // escrita (POST/PUT) sempre na rede
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;        // só same-origin
  if (url.pathname.startsWith('/api/')) return;      // API dinâmica: sem cache

  const cacheavel = url.pathname.startsWith('/static/') || req.mode === 'navigate';
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && cacheavel) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((m) => {
        if (m) return m;
        if (req.mode === 'navigate') return caches.match('/static/offline.html');
        return Response.error();
      }))
  );
});
