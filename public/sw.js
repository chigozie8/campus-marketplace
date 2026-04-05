// VendoorX Service Worker — Network-first, offline fallback only
const CACHE_VERSION = 'v5'
const OFFLINE_CACHE = `vendoorx-offline-${CACHE_VERSION}`

// Pages to pre-cache for offline fallback only
const OFFLINE_PAGES = ['/offline']

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

// ── Activate: delete all old caches ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== OFFLINE_CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: always network-first, cache only as offline fallback ───────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip cross-origin requests (Supabase, CDN, etc.)
  if (url.origin !== self.location.origin) return

  // Skip API routes — always network only
  if (url.pathname.startsWith('/api/')) return

  // Skip Next.js internal routes
  if (url.pathname.startsWith('/_next/') && !request.mode === 'navigate') return

  // Navigation requests: network-first, offline page as fallback
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

// ── Messages ──────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
