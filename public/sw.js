// VendoorX Service Worker — Network-first, offline fallback + Web Push
// Note: When running inside Capacitor native app, native push is handled
// by the @capacitor/push-notifications plugin — web push is skipped.
const CACHE_VERSION = 'v8'
const OFFLINE_CACHE = `vendoorx-offline-${CACHE_VERSION}`
const FLAGS_CACHE = 'vendoorx-flags'
const NATIVE_FLAG_KEY = '/native-mode'

const OFFLINE_PAGES = ['/offline']

// In-memory native mode flag — set by SET_NATIVE_MODE message or restored from cache
let nativeModeActive = false

// Restore native mode flag from cache on SW startup
async function restoreNativeFlag() {
  try {
    const cache = await caches.open(FLAGS_CACHE)
    const flagRes = await cache.match(NATIVE_FLAG_KEY)
    if (flagRes) {
      nativeModeActive = true
    }
  } catch {}
}

// Persist native mode flag to cache so it survives SW restarts
async function persistNativeFlag() {
  try {
    const cache = await caches.open(FLAGS_CACHE)
    await cache.put(NATIVE_FLAG_KEY, new Response('1', { status: 200 }))
  } catch {}
}

// Bootstrap: restore flag before handling any events
const nativeFlagRestored = restoreNativeFlag()

// ── Install: only cache the offline fallback page ─────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) =>
      Promise.allSettled(
        OFFLINE_PAGES.map((url) =>
          fetch(url, { credentials: 'same-origin' })
            .then((res) => { if (res.ok) cache.put(url, res) })
            .catch(() => {})
        )
      )
    )
  )
  self.skipWaiting()
})

// ── Activate: delete all old caches except flags and current offline ───────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== OFFLINE_CACHE && k !== FLAGS_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url))
      })
  )
})

// ── Fetch: always network-first, cache only as offline fallback ───────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/') && !request.mode === 'navigate') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/offline', { cacheName: OFFLINE_CACHE })
        return cached || new Response(
          '<html><body><h1>You are offline</h1><p>Please check your connection.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' }, status: 503 }
        )
      })
    )
    return
  }
})

// ── Web Push Notifications ────────────────────────────────────────────────────
// Skip entirely when inside Capacitor — native push plugin handles delivery.
// Native mode is set deterministically via SET_NATIVE_MODE postMessage,
// persisted in cache, and restored on SW restart.
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

  // Sent by capacitor-init.tsx on native app startup to suppress web push
  if (event.data.type === 'SET_NATIVE_MODE') {
    nativeModeActive = true
    persistNativeFlag()
  }
})
