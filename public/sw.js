// VendoorX Service Worker — Offline caching + Web Push
// Capacitor native app uses @capacitor/push-notifications — web push is skipped there.
// v17: Full offline support — asset caching, page caching, image caching, app-shell fallback.
//      Per-entry TTL expiration + periodic re-cache schedule to prevent stale conflicts.

const CACHE_VERSION = 'v17'
const OFFLINE_CACHE = `vendoorx-offline-${CACHE_VERSION}`
const PAGES_CACHE   = `vendoorx-pages-${CACHE_VERSION}`
const ASSETS_CACHE  = `vendoorx-assets-${CACHE_VERSION}`
const IMAGES_CACHE  = `vendoorx-images-${CACHE_VERSION}`
const FLAGS_CACHE   = 'vendoorx-flags'
// META_CACHE is unversioned so timestamps survive a version bump and expire
// naturally rather than being wiped along with content caches.
const META_CACHE    = 'vendoorx-cache-meta'

const NATIVE_FLAG_KEY = '/native-mode'

// Maximum number of images to keep before evicting oldest.
const MAX_IMAGES = 60

// ─── TTLs (milliseconds) ─────────────────────────────────────────────────────
const TTL = {
  // Immutable hashed bundles (e.g. _next/static/) never expire via TTL —
  // they are always served cache-first. Only non-hashed public assets use this.
  assets:  30 * 24 * 60 * 60 * 1000,  // 30 days
  // Page HTML: short TTL so users get fresh content quickly when online.
  pages:    1 * 60 * 60 * 1000,        //  1 hour
  // Remote images (Supabase CDN, etc.): week-long TTL, SWR pattern.
  images:   7 * 24 * 60 * 60 * 1000,  //  7 days
}

// ─── Re-cache schedule ────────────────────────────────────────────────────────
// Offline shell pages are pre-cached on install. They are refreshed in the
// background every RECACHE_INTERVAL so the fallback stays up-to-date.
const RECACHE_INTERVAL = 6 * 60 * 60 * 1000  // 6 hours
const RECACHE_URLS     = ['/offline.html', '/offline-shell.html']

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

// ── Helpers ───────────────────────────────────────────────────────────────────

// Normalise a cache key to a plain URL string so both Request objects and
// plain strings use the same key format in META_CACHE.
function cacheKey(requestOrUrl) {
  return typeof requestOrUrl === 'string'
    ? requestOrUrl
    : requestOrUrl.url
}

// Persist a timestamp for a cached entry so we can check expiry later.
async function writeMeta(requestOrUrl) {
  try {
    const key   = cacheKey(requestOrUrl)
    const cache = await caches.open(META_CACHE)
    await cache.put(key, new Response(String(Date.now()), {
      status:  200,
      headers: { 'Content-Type': 'text/plain' },
    }))
  } catch {}
}

// Return true when the cached entry is older than ttlMs or has no timestamp.
async function isExpired(requestOrUrl, ttlMs) {
  try {
    const key   = cacheKey(requestOrUrl)
    const cache = await caches.open(META_CACHE)
    const res   = await cache.match(key)
    if (!res) return true
    const ts = parseInt(await res.text(), 10)
    return isNaN(ts) || (Date.now() - ts) > ttlMs
  } catch {
    return true
  }
}

// Cache a response clone and record its timestamp, then return the original.
async function cacheAndReturn(cacheName, requestOrUrl, response, ttlMs) {
  try {
    const cache = await caches.open(cacheName)
    await cache.put(requestOrUrl, response.clone())
    if (ttlMs != null) await writeMeta(requestOrUrl)
  } catch {}
  return response
}

// Evict the oldest entries once the cache exceeds maxEntries.
async function evictOldest(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName)
    const keys  = await cache.keys()
    if (keys.length > maxEntries) {
      const toDelete = keys.slice(0, keys.length - maxEntries)
      await Promise.all(toDelete.map(k => cache.delete(k)))
    }
  } catch {}
}

// Re-cache the offline fallback pages in the background if their timestamp is
// older than RECACHE_INTERVAL. Called from activate and on a periodic schedule.
async function recacheOfflinePages() {
  await Promise.all(
    RECACHE_URLS.map(async (url) => {
      try {
        const stale = await isExpired(url, RECACHE_INTERVAL)
        if (!stale) return
        const res = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' })
        if (res.ok) {
          await cacheAndReturn(OFFLINE_CACHE, url, res, RECACHE_INTERVAL)
        }
      } catch { /* best-effort */ }
    })
  )
}

// ── Install: precache offline fallback pages ──────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then(async (cache) => {
      await Promise.all(
        RECACHE_URLS.map((url) =>
          fetch(url, { credentials: 'same-origin' })
            .then(async (res) => {
              if (res.ok) {
                await cache.put(url, res)
                await writeMeta(url)
              }
            })
            .catch(() => {})
        )
      )
    })
  )
  self.skipWaiting()
})

// ── Activate: delete stale versioned caches; refresh offline pages ────────────
self.addEventListener('activate', (event) => {
  const currentCaches = new Set([
    OFFLINE_CACHE,
    PAGES_CACHE,
    ASSETS_CACHE,
    IMAGES_CACHE,
    FLAGS_CACHE,
    META_CACHE,   // unversioned — kept across bumps
  ])

  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !currentCaches.has(k))
            .map((k)   => caches.delete(k))
        )
      )
      .then(() => recacheOfflinePages())
      .then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept GET requests.
  if (request.method !== 'GET') return

  // ── 1. Cross-origin images (Supabase CDN, etc.) — stale-while-revalidate ──
  if (url.origin !== self.location.origin && request.destination === 'image') {
    event.respondWith(handleRemoteImage(request))
    return
  }

  // Everything else must be same-origin.
  if (url.origin !== self.location.origin) return

  // ── 2. RSC / Next.js internal prefetch requests — pass through untouched ──
  if (request.headers.get('RSC') === '1') return
  if (request.headers.get('Next-Router-Prefetch') === '1') return
  if (request.headers.get('Next-Router-State-Tree')) return

  // ── 3. API routes — network-only ─────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) return

  // ── 4. Immutable hashed _next/static/ and on-demand _next/image/ ─────────
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image/')
  ) {
    event.respondWith(handleImmutableAsset(request))
    return
  }

  // ── 5. Same-origin public static assets with TTL ──────────────────────────
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|avif|gif|svg|ico|woff2?|ttf|otf|eot|json)$/)) {
    event.respondWith(handlePublicAsset(request))
    return
  }

  // ── 6. Page navigations — network-first with cache fallback ──────────────
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
})

// ── Cache handlers ────────────────────────────────────────────────────────────

// Immutable assets: cache-forever on first hit (filename hash guarantees
// uniqueness so there is no need for a TTL or expiry check).
async function handleImmutableAsset(request) {
  const cached = await caches.match(request, { cacheName: ASSETS_CACHE })
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) await cacheAndReturn(ASSETS_CACHE, request, response.clone(), null)
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

// Public static assets (non-hashed): cache-first but honour TTL.
// On expiry, fetch fresh copy; on network failure, fall back to stale cache.
async function handlePublicAsset(request) {
  const cached  = await caches.match(request, { cacheName: ASSETS_CACHE })
  const expired = cached ? await isExpired(request, TTL.assets) : true
  if (cached && !expired) return cached
  try {
    const response = await fetch(request)
    if (response.ok) await cacheAndReturn(ASSETS_CACHE, request, response.clone(), TTL.assets)
    return response
  } catch {
    return cached ?? new Response('', { status: 503 })
  }
}

// Remote images: stale-while-revalidate.
// Serve the stale cached image immediately while re-fetching in the background,
// UNLESS it has expired — in that case block until a fresh response arrives.
async function handleRemoteImage(request) {
  const cached  = await caches.match(request, { cacheName: IMAGES_CACHE })
  const expired = cached ? await isExpired(request, TTL.images) : true

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cacheAndReturn(IMAGES_CACHE, request, response.clone(), TTL.images)
        await evictOldest(IMAGES_CACHE, MAX_IMAGES)
      }
      return response
    })
    .catch(() => null)

  if (cached && !expired) {
    // Serve stale immediately; background revalidation happens via fetchPromise.
    return cached
  }
  // Expired or never cached — must wait for a fresh response.
  return (await fetchPromise) ?? cached ?? new Response('', { status: 503 })
}

// Page navigations: network-first, short TTL for offline fallback.
async function handleNavigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
      await cacheAndReturn(PAGES_CACHE, request, response.clone(), TTL.pages)
    }
    return response
  } catch {
    // Serve the cached page (even if expired — better than nothing offline).
    const cachedPage = await caches.match(request, { cacheName: PAGES_CACHE })
    if (cachedPage) return cachedPage

    // App shell skeleton.
    const shell = await caches.match('/offline-shell.html', { cacheName: OFFLINE_CACHE })
    if (shell) return shell

    // Last resort: full offline page.
    const offline = await caches.match('/offline.html', { cacheName: OFFLINE_CACHE })
    return offline ?? new Response(
      '<html><body style="font-family:system-ui;padding:24px;text-align:center">' +
      '<h1>You\'re offline</h1>' +
      '<p>Check your connection and <button onclick="location.reload()">try again</button>.</p>' +
      '</body></html>',
      { headers: { 'Content-Type': 'text/html;charset=utf-8' }, status: 503 },
    )
  }
}

// ── Periodic re-cache via BroadcastChannel / message ─────────────────────────
// Every page load sends a PING; use it to opportunistically refresh offline
// pages in the background without a dedicated sync event.
let lastRecache = 0
self.addEventListener('message', (event) => {
  if (!event.data) return

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  if (event.data.type === 'SET_NATIVE_MODE') {
    nativeModeActive = true
    persistNativeFlag()
    return
  }

  // Any ping from a page triggers a background re-cache check (rate-limited).
  if (event.data.type === 'PING') {
    const now = Date.now()
    if (now - lastRecache > RECACHE_INTERVAL) {
      lastRecache = now
      // Fire-and-forget — never block the message handler.
      recacheOfflinePages().catch(() => {})
    }
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
        data:               { url },
        vibrate:            [100, 50, 100],
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
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url === url && 'focus' in c)
        if (existing) return existing.focus()
        return self.clients.openWindow(url)
      })
  )
})
