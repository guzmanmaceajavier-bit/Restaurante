const CACHE_NAME = 'sabor-y-origen-v2'
const STATIC_CACHE = 'sabor-static-v2'
const DYNAMIC_CACHE = 'sabor-dynamic-v2'

const STATIC_ASSETS = [
  '/',
  '/menu',
  '/reservas',
  '/contacto',
  '/galeria',
  '/eventos',
  '/promociones',
  '/nosotros',
  '/login',
  '/mi-cuenta',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => cached)

      return cached || fetchPromise
    })
  )
})
