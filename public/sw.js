const VLP_SW_VERSION =
  'VLP_PWA_BASE_SERVICE_WORKER_20260716_001'

const VLP_CACHE_NAME =
  `vesalaporra-pwa-${VLP_SW_VERSION}`

const VLP_APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]

const cacheAppShellSafely = async () => {
  const cache = await caches.open(VLP_CACHE_NAME)

  await Promise.allSettled(
    VLP_APP_SHELL.map(async (url) => {
      try {
        await cache.add(
          new Request(url, {
            cache: 'reload',
          }),
        )
      } catch (error) {
        console.warn(
          '[VESALAPORRA_SW] No s’ha pogut precarregar:',
          url,
          error,
        )
      }
    }),
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await cacheAppShellSafely()
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()

      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith('vesalaporra-pwa-') &&
              cacheName !== VLP_CACHE_NAME,
          )
          .map((cacheName) =>
            caches.delete(cacheName),
          ),
      )

      await self.clients.claim()
    })(),
  )
})

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request)

    if (response?.ok) {
      const cache = await caches.open(
        VLP_CACHE_NAME,
      )

      await cache.put(
        '/index.html',
        response.clone(),
      )
    }

    return response
  } catch (error) {
    const cachedIndex =
      await caches.match('/index.html')

    if (cachedIndex) {
      return cachedIndex
    }

    const cachedRoot = await caches.match('/')

    if (cachedRoot) {
      return cachedRoot
    }

    throw error
  }
}

const cacheFirstStaticAsset = async (request) => {
  const cachedResponse =
    await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  const networkResponse = await fetch(request)

  if (networkResponse?.ok) {
    const cache = await caches.open(
      VLP_CACHE_NAME,
    )

    await cache.put(
      request,
      networkResponse.clone(),
    )
  }

  return networkResponse
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(request.url)

  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstNavigation(request),
    )

    return
  }

  const staticDestinations = new Set([
    'script',
    'style',
    'image',
    'font',
    'manifest',
  ])

  if (
    staticDestinations.has(request.destination)
  ) {
    event.respondWith(
      cacheFirstStaticAsset(request),
    )
  }
})