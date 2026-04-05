'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Unregister every existing service worker first, then register the fresh one.
    // This guarantees stale cached workers from previous versions are always removed.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      return Promise.all(registrations.map((r) => r.unregister()))
    }).then(() => {
      return navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }).catch(() => {
      // SW registration failed silently — app works fine without it
    })
  }, [])

  return null
}
