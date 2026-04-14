// VendoorX Service Worker — Network-first, offline fallback + Web Push
// Note: When running inside Capacitor native app, native push is handled
// by the @capacitor/push-notifications plugin — web push is skipped.
const CACHE_VERSION = 'v10'
const OFFLINE_CACHE = `vendoorx-offline-${CACHE_VERSION}`
const FLAGS_CACHE = 'vendoorx-flags'
const NATIVE_FLAG_KEY = '/native-mode'

const OFFLINE_PAGES = ['/offline.html']

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
        const cached = await caches.match('/offline.html', { cacheName: OFFLINE_CACHE })
        return cached || new Response(
          '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — VendoorX</title><style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa;color:#0a0a0a;text-align:center;padding:24px}.logo{font-size:1.5rem;font-weight:900;margin-bottom:32px}.logo span{color:#16a34a}h1{font-size:1.75rem;font-weight:900;margin-bottom:12px}p{color:#6b7280;margin-bottom:28px;max-width:280px;line-height:1.6}button,a{display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:14px;font-size:.9rem;font-weight:700;text-decoration:none;cursor:pointer;border:none;transition:.12s}button{background:#0a0a0a;color:#fff;margin-right:10px}a{background:#fff;color:#0a0a0a;border:1.5px solid #e5e7eb}</style></head><body><div class="logo">Vendoor<span>X</span></div><h1>You\'re offline</h1><p>Check your internet connection and try again.</p><button onclick="location.reload()">Try Again</button><a href="/">Go Home</a></body></html>',
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
