// Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[SW] Registered successfully:', registration.scope);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[SW] New version found');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('[SW] New version available - refresh to update');
                // Could show a "Update available" notification here
              }
            });
          });
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });
    });
  } else {
    console.log('[SW] Service workers not supported');
  }
}

// Unregister service worker (useful for development)
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
