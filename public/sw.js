const VLP_SW_VERSION =
  'VLP_PWA_PUSH_SERVICE_WORKER_20260716_002'

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

const VLP_DEFAULT_NOTIFICATION = {
  title: 'Vesalaporra',
  body: 'Tens un nou avís.',
  icon: '/icon-192.png',
  badge: '/icon-192.png',
  url: '/',
}

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

const parsePushPayload = (event) => {
  if (!event.data) {
    return {}
  }

  const rawPayload = event.data.text()

  if (!rawPayload) {
    return {}
  }

  try {
    const parsedPayload = JSON.parse(rawPayload)

    return parsedPayload &&
      typeof parsedPayload === 'object'
      ? parsedPayload
      : {
          body: String(parsedPayload),
        }
  } catch (error) {
    return {
      body: rawPayload,
    }
  }
}

const normalizeSafeNotificationUrl = (value) => {
  try {
    const resolvedUrl = new URL(
      String(value || '/'),
      self.location.origin,
    )

    if (resolvedUrl.origin !== self.location.origin) {
      return '/'
    }

    return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`
  } catch (error) {
    return '/'
  }
}

const normalizeNotificationActions = (actions) => {
  if (!Array.isArray(actions)) {
    return []
  }

  return actions
    .filter(
      (action) =>
        action &&
        typeof action === 'object' &&
        String(action.action || '').trim() &&
        String(action.title || '').trim(),
    )
    .slice(0, 2)
    .map((action) => ({
      action: String(action.action).trim(),
      title: String(action.title).trim(),
      ...(action.icon
        ? {
            icon: String(action.icon),
          }
        : {}),
    }))
}

const buildActionUrls = (actions) => {
  if (!Array.isArray(actions)) {
    return {}
  }

  return Object.fromEntries(
    actions
      .filter(
        (action) =>
          action &&
          String(action.action || '').trim(),
      )
      .map((action) => [
        String(action.action).trim(),
        normalizeSafeNotificationUrl(
          action.url ||
            action.click_url ||
            '/',
        ),
      ]),
  )
}

const buildNotification = (rawPayload) => {
  const rootPayload =
    rawPayload &&
    typeof rawPayload === 'object'
      ? rawPayload
      : {}

  const nestedNotification =
    rootPayload.notification &&
    typeof rootPayload.notification === 'object'
      ? rootPayload.notification
      : {}

  const payload = {
    ...rootPayload,
    ...nestedNotification,
    data: {
      ...(rootPayload.data || {}),
      ...(nestedNotification.data || {}),
    },
  }

  const notificationType = String(
    payload.notification_type ||
      payload.type ||
      payload.data?.notification_type ||
      'SYSTEM',
  )
    .trim()
    .toUpperCase()

  const outboxId = String(
    payload.outbox_id ||
      payload.data?.outbox_id ||
      '',
  ).trim()

  const destinationUrl =
    normalizeSafeNotificationUrl(
      payload.url ||
        payload.click_url ||
        payload.data?.url ||
        payload.data?.click_url ||
        VLP_DEFAULT_NOTIFICATION.url,
    )

  const actions =
    normalizeNotificationActions(
      payload.actions,
    )

  const actionUrls =
    buildActionUrls(payload.actions)

  const title = String(
    payload.title ||
      VLP_DEFAULT_NOTIFICATION.title,
  ).trim()

  const body = String(
    payload.body ||
      payload.message ||
      VLP_DEFAULT_NOTIFICATION.body,
  ).trim()

  const avatarUrl = String(
    payload.avatar_url ||
      payload.data?.avatar_url ||
      '',
  ).trim()

  const categoryIconUrl = String(
    payload.category_icon_url ||
      payload.data?.category_icon_url ||
      payload.icon ||
      VLP_DEFAULT_NOTIFICATION.icon,
  ).trim()

  const imageUrl = String(
    payload.image_url ||
      payload.data?.image_url ||
      '',
  ).trim()

  const notificationTag = String(
    payload.tag ||
      [
        'vesalaporra',
        notificationType,
        outboxId || Date.now(),
      ].join(':'),
  ).trim()

  return {
    title:
      title ||
      VLP_DEFAULT_NOTIFICATION.title,

    options: {
      body:
        body ||
        VLP_DEFAULT_NOTIFICATION.body,

      icon:
        avatarUrl ||
        categoryIconUrl ||
        VLP_DEFAULT_NOTIFICATION.icon,

      badge:
        categoryIconUrl ||
        VLP_DEFAULT_NOTIFICATION.badge,

      ...(imageUrl
        ? {
            image: imageUrl,
          }
        : {}),

      tag: notificationTag,

      renotify:
        Boolean(payload.renotify),

      requireInteraction:
        Boolean(payload.require_interaction),

      silent:
        Boolean(payload.silent),

      timestamp:
        Number(payload.timestamp) ||
        Date.now(),

      vibrate: [180, 80, 180],

      actions,

      data: {
        ...payload.data,
        url: destinationUrl,
        clickUrl: destinationUrl,
        actionUrls,
        notificationType,
        outboxId: outboxId || null,
        matchId:
          payload.match_id ||
          payload.data?.match_id ||
          null,
      },
    },
  }
}

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const rawPayload =
          parsePushPayload(event)

        const notification =
          buildNotification(rawPayload)

        await self.registration.showNotification(
          notification.title,
          notification.options,
        )
      } catch (error) {
        console.error(
          '[VESALAPORRA_SW] Error mostrant la notificació Push:',
          error,
        )

        await self.registration.showNotification(
          VLP_DEFAULT_NOTIFICATION.title,
          {
            body:
              VLP_DEFAULT_NOTIFICATION.body,

            icon:
              VLP_DEFAULT_NOTIFICATION.icon,

            badge:
              VLP_DEFAULT_NOTIFICATION.badge,

            tag:
              `vesalaporra:fallback:${Date.now()}`,

            data: {
              url:
                VLP_DEFAULT_NOTIFICATION.url,
            },
          },
        )
      }
    })(),
  )
})

self.addEventListener(
  'notificationclick',
  (event) => {
    event.notification.close()

    event.waitUntil(
      (async () => {
        const notificationData =
          event.notification?.data || {}

        const actionUrl =
          event.action &&
          notificationData.actionUrls?.[
            event.action
          ]

        const destinationUrl =
          normalizeSafeNotificationUrl(
            actionUrl ||
              notificationData.clickUrl ||
              notificationData.url ||
              '/',
          )

        const absoluteDestinationUrl =
          new URL(
            destinationUrl,
            self.location.origin,
          ).href

        const windowClients =
          await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
          })

        const exactClient =
          windowClients.find(
            (client) =>
              client.url ===
              absoluteDestinationUrl,
          )

        if (exactClient) {
          await exactClient.focus()
          return
        }

        const vesalaporraClient =
          windowClients.find((client) => {
            try {
              return (
                new URL(client.url).origin ===
                self.location.origin
              )
            } catch (error) {
              return false
            }
          })

        if (vesalaporraClient) {
          if (
            typeof vesalaporraClient.navigate ===
            'function'
          ) {
            await vesalaporraClient.navigate(
              absoluteDestinationUrl,
            )
          }

          await vesalaporraClient.focus()
          return
        }

        await self.clients.openWindow(
          absoluteDestinationUrl,
        )
      })(),
    )
  },
)