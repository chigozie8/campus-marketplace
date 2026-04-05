// VendoorX Service Worker — Full offline support
// Strategy: Cache-first for assets, stale-while-revalidate for pages, offline fallback for everything
const CACHE_VERSION = 'v4'
const STATIC_CACHE  = `vendoorx-static-${CACHE_VERSION}`
const PAGE_CACHE    = `vendoorx-pages-${CACHE_VERSION}`
const IMAGE_CACHE   = `vendoorx-images-${CACHE_VERSION}`

// App shell — these are always pre-cached on install
const APP_SHELL = [
  '/',
  '/marketplace',
  '/offline',
  '/manifest.webmanifest',
  '/favicon.ico',
]

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // addAll fails if any URL fails — use individual puts so one 404 doesn't break everything
      return Promise.allSettled(
        APP_SHELL.map((url) =>
          fetch(url, { credentials: 'same-origin' })
            .then((res) => { if (res.ok) cache.put(url, res) })
            .catch(() => {/* skip URLs that fail at install time */})
        )
      )
    })
  )
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const keepCaches = [STATIC_CACHE, PAGE_CACHE, IMAGE_CACHE]
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !keepCaches.includes(k))
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?|css)$/)
  )
}

function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg)$/)
}

function isApiRoute(url) {
  return url.pathname.startsWith('/api/') || url.pathname.includes('supabase.co')
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept GET — let POST/PUT/DELETE through
  if (request.method !== 'GET') return

  // Don't intercept cross-origin API calls (Supabase, external) that aren't images
  if (url.origin !== self.location.origin && !isImage(url)) return

  // ── 1. Static assets ──
  if (isStaticAsset(url)) {
    // JS/CSS chunks: network-first so code updates reach the browser immediately.
    // Falls back to cache if offline.
    if (url.pathname.startsWith('/_next/static/chunks/') || url.pathname.startsWith('/_next/static/css/')) {
      event.respondWith(
        fetch(request)
          .then((res) => {
            if (res.ok) {
              const clone = res.clone()
              caches.open(STATIC_CACHE).then((c) => c.put(request, clone))
            }
            return res
          })
          .catch(() => caches.match(request))
      )
      return
    }
    // Images and other static files: cache-first (safe, changes rarely)
    const cacheName = isImage(url) ? IMAGE_CACHE : STATIC_CACHE
    event.respondWith(
      caches.open(cacheName).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request)
            .then((res) => {
              if (res.ok) cache.put(request, res.clone())
              return res
            })
            .catch(() => new Response('', { status: 408 }))
        })
      )
    )
    return
  }

  // ── 2. API routes: network-only, no caching ──
  if (isApiRoute(url)) return

  // ── 3. Next.js RSC / data requests ──
  if (url.searchParams.has('_rsc') || url.pathname.startsWith('/_next/data/')) return

  // ── 4. HTML navigation: stale-while-revalidate with offline fallback ──
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(PAGE_CACHE).then((pageCache) =>
        fetch(request)
          .then((networkRes) => {
            // Cache a fresh copy for next time
            if (networkRes.ok) {
              pageCache.put(request, networkRes.clone())
            }
            return networkRes
          })
          .catch(async () => {
            // Offline — try the exact cached page first
            const cachedPage = await pageCache.match(request)
            if (cachedPage) return cachedPage

            // Try the static shell cache (pre-cached routes)
            const shellPage = await caches.match(request, { cacheName: STATIC_CACHE })
            if (shellPage) return shellPage

            // Last resort — serve the offline page
            const offlinePage =
              (await caches.match('/offline', { cacheName: STATIC_CACHE })) ||
              (await caches.match('/offline'))
            if (offlinePage) return offlinePage

            // Absolute fallback
            return new Response(
              '<html><body><h1>You are offline</h1><p>Please check your connection and try again.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' }, status: 503 }
            )
          })
      )
    )
    return
  }
})

// ── Background sync: retry failed requests when back online ──────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || []
    caches.open(PAGE_CACHE).then((cache) =>
      Promise.allSettled(urls.map((url) => cache.add(url).catch(() => {})))
    )
  }
})
