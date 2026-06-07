'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        // When a new SW version is waiting, activate it immediately.
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })

        // Notify the active SW on every page load so it can run its
        // background re-cache check (rate-limited inside the SW).
        navigator.serviceWorker.ready.then((reg) => {
          reg.active?.postMessage({ type: 'PING' })
        })
      })
      .catch(() => {
        // SW registration failed silently — app works fine without it.
      })

    // When a new SW takes control (after SKIP_WAITING), reload so the page
    // uses the freshest assets and page cache from the updated service worker.
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  }, [])

  return null
}
