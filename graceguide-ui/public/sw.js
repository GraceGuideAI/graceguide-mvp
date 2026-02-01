const CACHE_NAME = 'graceguide-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/index.html',
  '/static/app.js',
  '/static/app.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls
  if (event.request.url.includes('/qa') || 
      event.request.url.includes('/auth') ||
      event.request.url.includes('/subscribe')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Daily verse is ready!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'daily-verse',
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification('GraceGuide', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
