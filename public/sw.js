// VendoorX Service Worker — Offline fallback + Web Push
// Capacitor native app uses @capacitor/push-notifications — web push is skipped there.
const CACHE_VERSION = 'v13'
const OFFLINE_CACHE = `vendoorx-offline-${CACHE_VERSION}`
const FLAGS_CACHE   = 'vendoorx-flags'
const NATIVE_FLAG_KEY = '/native-mode'

let nativeModeActive = false

async function restoreNativeFlag() {
  try {
    const cache = await caches.open(FLAGS_CACHE)
    const res = await cache.match(NATIVE_FLAG_KEY)
    if (res) nativeModeActive = true
  } catch {}
}

async function persistNativeFlag() {
  try {
    const cache = await caches.open(FLAGS_CACHE)
    await cache.put(NATIVE_FLAG_KEY, new Response('1', { status: 200 }))
  } catch {}
}

const nativeFlagRestored = restoreNativeFlag()

// ── Install: cache the offline page ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) =>
      fetch('/offline.html', { credentials: 'same-origin' })
        .then((res) => { if (res.ok) cache.put('/offline.html', res) })
        .catch(() => {})
    )
  )
  self.skipWaiting()
})

// ── Activate: delete all old caches ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== OFFLINE_CACHE && k !== FLAGS_CACHE)
          .map((k)   => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ── Fetch: network-first for page navigations; serve offline.html on failure ─
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GETs
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Let Next.js internals, API routes and RSC fetches pass through untouched
  if (url.pathname.startsWith('/_next/')) return
  if (url.pathname.startsWith('/api/')) return
  if (request.headers.get('RSC') === '1') return
  if (request.headers.get('Next-Router-Prefetch') === '1') return
  if (request.headers.get('Next-Router-State-Tree')) return

  // For page navigations only: fall back to offline.html when network fails
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/offline.html', { cacheName: OFFLINE_CACHE })
        return cached ?? new Response(
          '<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff;text-align:center"><div><h1 style="font-weight:900;font-size:1.5rem;margin-bottom:8px">You\'re offline</h1><p style="color:#64748b">Check your connection and try again.</p><button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#16a34a;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer">Try Again</button></div></body></html>',
          { headers: { 'Content-Type': 'text/html;charset=utf-8' }, status: 503 }
        )
      })
    )
  }
})

// ── Web Push ──────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  event.waitUntil(
    nativeFlagRestored.then(() => {
      if (nativeModeActive) return
      if (!event.data) return

      let data = {}
      try { data = event.data.json() }
      catch { data = { title: 'VendoorX', body: event.data.text() } }

      const {
        title = 'VendoorX',
        body  = 'You have a new notification',
        icon  = '/icon-192.png',
        badge = '/icon-192.png',
        url   = '/',
      } = data

      return self.registration.showNotification(title, {
        body, icon, badge,
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
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data.type === 'SET_NATIVE_MODE') {
    nativeModeActive = true
    persistNativeFlag()
  }
})
