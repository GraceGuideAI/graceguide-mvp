// Never cache API responses, account data, or daily verses. Only cache this
// app's shell and immutable assets; a failed fetch must not poison the cache.
const CACHE_NAME = 'graceguide-chat-v3';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(['/', '/index.html', '/manifest.json'])));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('graceguide-') && key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const shell = url.pathname === '/' || url.pathname === '/index.html';
  if (!shell && !url.pathname.startsWith('/assets/') && !url.pathname.startsWith('/icons/') && url.pathname !== '/manifest.json') return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      return await caches.match(event.request) || (shell ? await caches.match('/') : null) || new Response('Offline', { status: 503 });
    }
  })());
});
self.addEventListener('push', event => {
  event.waitUntil(self.registration.showNotification('GraceGuide', {
    body: event.data?.text() || 'A moment for today’s verse.',
    icon: '/icons/icon-192x192.svg', tag: 'daily-verse',
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/?view=daily'));
});
