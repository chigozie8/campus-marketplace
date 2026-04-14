// VendoorX Service Worker — Web Push only
// Note: When running inside Capacitor native app, native push is handled
// by the @capacitor/push-notifications plugin — web push is skipped.
const CACHE_PURGE_VERSION = 'v13'
const FLAGS_CACHE = 'vendoorx-flags'
const NATIVE_FLAG_KEY = '/native-mode'

// In-memory native mode flag — set by SET_NATIVE_MODE message or restored from cache
let nativeModeActive = false

async function restoreNativeFlag() {
  try {
    const cache = await caches.open(FLAGS_CACHE)
    const flagRes = await cache.match(NATIVE_FLAG_KEY)
    if (flagRes) nativeModeActive = true
  } catch {}
}

async function persistNativeFlag() {
  try {
    const cache = await caches.open(FLAGS_CACHE)
    await cache.put(NATIVE_FLAG_KEY, new Response('1', { status: 200 }))
  } catch {}
}

const nativeFlagRestored = restoreNativeFlag()

// ── Install: nothing to cache ─────────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting()
})

// ── Activate: purge all old caches (offline pages, assets, etc.) ──────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== FLAGS_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ── No fetch handler — browser handles all requests natively ─────────────────

// ── Web Push Notifications ────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  event.waitUntil(
    nativeFlagRestored.then(() => {
      if (nativeModeActive) return
      if (!event.data) return

      let data = {}
      try {
        data = event.data.json()
      } catch {
        data = { title: 'VendoorX', body: event.data.text() }
      }

      const {
        title = 'VendoorX',
        body = 'You have a new notification',
        icon = '/icon-192.png',
        badge = '/icon-192.png',
        url = '/',
      } = data

      return self.registration.showNotification(title, {
        body,
        icon,
        badge,
        data: { url },
        vibrate: [100, 50, 100],
        requireInteraction: false,
      })
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (nativeModeActive) return
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url === url && 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})

// ── Messages ──────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data.type === 'SET_NATIVE_MODE') {
    nativeModeActive = true
    persistNativeFlag()
  }
})
