const CACHE_NAME = 'the-hatch-cache-v1'
const URLS_TO_CACHE = [
  '/',
  '/offline',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // Always try network first for navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response
        })
        .catch(() => caches.match('/offline'))
    )
    return
  }
  // For other requests, try network then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const respClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone))
        return response
      })
      .catch(() => caches.match(request))
  )
})