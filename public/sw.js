// VendoorX Service Worker — Offline caching + Web Push
// Capacitor native app uses @capacitor/push-notifications — web push is skipped there.
// v15: Full offline support — asset caching, page caching, image caching, app-shell fallback.

const CACHE_VERSION   = 'v15'
const OFFLINE_CACHE   = `vendoorx-offline-${CACHE_VERSION}`
const PAGES_CACHE     = `vendoorx-pages-${CACHE_VERSION}`
const ASSETS_CACHE    = `vendoorx-assets-${CACHE_VERSION}`
const IMAGES_CACHE    = `vendoorx-images-${CACHE_VERSION}`
const FLAGS_CACHE     = 'vendoorx-flags'
const NATIVE_FLAG_KEY = '/native-mode'

// Maximum number of images to keep in the images cache before evicting oldest.
const MAX_IMAGES = 60

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

// ── Install: precache offline pages ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then(async (cache) => {
      const urls = ['/offline.html', '/offline-shell.html']
      await Promise.all(
        urls.map((url) =>
          fetch(url, { credentials: 'same-origin' })
            .then((res) => { if (res.ok) return cache.put(url, res) })
            .catch(() => {})
        )
      )
    })
  )
  self.skipWaiting()
})

// ── Activate: delete all old caches (keep flags + current version caches) ────
self.addEventListener('activate', (event) => {
  const currentCaches = new Set([
    OFFLINE_CACHE,
    PAGES_CACHE,
    ASSETS_CACHE,
    IMAGES_CACHE,
    FLAGS_CACHE,
  ])
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => !currentCaches.has(k))
          .map((k)   => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ── Helpers ───────────────────────────────────────────────────────────────────

// Store a clone of the response and return the original.
async function cacheAndReturn(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName)
    await cache.put(request, response.clone())
  } catch {}
  return response
}

// Evict oldest entries when a cache exceeds a size limit.
async function evictOldest(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName)
    const keys  = await cache.keys()
    if (keys.length > maxEntries) {
      await Promise.all(keys.slice(0, keys.length - maxEntries).map((k) => cache.delete(k)))
    }
  } catch {}
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept GET requests
  if (request.method !== 'GET') return

  // ── 1. Cross-origin images (e.g. Supabase CDN) — stale-while-revalidate ──
  if (url.origin !== self.location.origin && request.destination === 'image') {
    event.respondWith(handleRemoteImage(request))
    return
  }

  // Everything else must be same-origin
  if (url.origin !== self.location.origin) return

  // ── 2. RSC / prefetch internal Next.js requests — pass through untouched ──
  if (request.headers.get('RSC') === '1') return
  if (request.headers.get('Next-Router-Prefetch') === '1') return
  if (request.headers.get('Next-Router-State-Tree')) return

  // ── 3. API routes — network-only, let error boundaries handle failures ─────
  if (url.pathname.startsWith('/api/')) return

  // ── 4. Next.js static assets — cache-first ───────────────────────────────
  //    _next/static/ contains immutable hashed JS/CSS chunks.
  //    _next/image/ contains on-demand optimised images.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/image/')) {
    event.respondWith(handleAsset(request))
    return
  }

  // ── 5. Same-origin static public assets (icons, manifests, fonts) ─────────
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|json)$/)
  ) {
    event.respondWith(handlePublicAsset(request))
    return
  }

  // ── 6. Page navigations — network-first with page cache fallback ──────────
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request, url))
    return
  }
})

// Cache-first: serve from ASSETS_CACHE, fall back to network and store result.
async function handleAsset(request) {
  const cached = await caches.match(request, { cacheName: ASSETS_CACHE })
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) await cacheAndReturn(ASSETS_CACHE, request, response.clone())
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

// Cache-first: serve from ASSETS_CACHE for public static files.
async function handlePublicAsset(request) {
  const cached = await caches.match(request, { cacheName: ASSETS_CACHE })
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) await cacheAndReturn(ASSETS_CACHE, request, response.clone())
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

// Stale-while-revalidate for cross-origin images (Supabase CDN, etc.)
async function handleRemoteImage(request) {
  const cached = await caches.match(request, { cacheName: IMAGES_CACHE })
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cacheAndReturn(IMAGES_CACHE, request, response.clone())
        await evictOldest(IMAGES_CACHE, MAX_IMAGES)
      }
      return response
    })
    .catch(() => null)

  return cached ?? await fetchPromise ?? new Response('', { status: 503 })
}

// Network-first with page cache fallback and app-shell last resort.
async function handleNavigation(request, url) {
  try {
    const response = await fetch(request)
    // Only cache successful HTML responses (not redirects, not errors).
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
      await cacheAndReturn(PAGES_CACHE, request, response.clone())
    }
    return response
  } catch {
    // Try the exact cached page for this URL first.
    const cachedPage = await caches.match(request, { cacheName: PAGES_CACHE })
    if (cachedPage) return cachedPage

    // Fall back to the app shell (skeleton UI with offline banner).
    const shell = await caches.match('/offline-shell.html', { cacheName: OFFLINE_CACHE })
    if (shell) return shell

    // Last resort: full offline page.
    const offline = await caches.match('/offline.html', { cacheName: OFFLINE_CACHE })
    return offline ?? new Response(
      '<html><body style="font-family:system-ui;padding:24px;text-align:center"><h1>You\'re offline</h1><p>Check your connection and <button onclick="location.reload()">try again</button>.</p></body></html>',
      { headers: { 'Content-Type': 'text/html;charset=utf-8' }, status: 503 }
    )
  }
}

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
