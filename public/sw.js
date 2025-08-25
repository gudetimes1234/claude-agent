const CACHE_NAME = 'claude-agent-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching resources...');
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return Promise.resolve(); // Don't fail the entire installation
            })
          )
        );
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        self.skipWaiting(); // Activate immediately
      })
      .catch(err => {
        console.error('Service Worker installation failed:', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip caching for API requests - they should always be fresh
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request).catch(err => {
          console.warn('Network fetch failed:', err);
          // Return a basic offline page or error response
          if (event.request.destination === 'document') {
            return new Response('Offline - Please check your connection', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});