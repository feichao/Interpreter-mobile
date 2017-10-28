var cacheStorageKey = 'version 5.0.1';

var cacheList = [
  '/',
  "index.html",
  "index.css",
  "index.js",
  "fav.ico"
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheStorageKey)
      .then(cache => cache.addAll(cacheList))
      .then(() => self.skipWaiting())
  )
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      if (response) {
        return response
      }
      return fetch(e.request.url)
    })
  )
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.map(name => {
        if (name !== cacheStorageKey) {
          return caches.delete(name)
        }
      })
    }).then(() => {
      return self.clients.claim()
    })
  )
});