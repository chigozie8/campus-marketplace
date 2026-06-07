'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const CACHE_TOAST_ID = 'cache-served'
const NETWORK_TOAST_ID = 'network-status'

/**
 * Probes whether the page was served from the SW cache (poor/no connectivity)
 * by attempting a short-timeout HEAD request to /api/health (or favicon as fallback).
 * If the probe fails while navigator.onLine is true, the browser is online but
 * the actual network is unreachable — meaning the SW served cached content.
 */
async function probeConnection(): Promise<'online' | 'cached' | 'offline'> {
  if (!navigator.onLine) return 'offline'
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const probe = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return probe.ok ? 'online' : 'cached'
  } catch {
    return 'cached'
  }
}

export function NetworkToast() {
  const wasOnline = useRef(true)
  const cacheToastShown = useRef(false)

  useEffect(() => {
    wasOnline.current = navigator.onLine

    // On mount, probe connectivity — show cache toast if page was served stale
    probeConnection().then((status) => {
      if (status === 'cached' && !cacheToastShown.current) {
        cacheToastShown.current = true
        toast.warning('Showing cached content', {
          id: CACHE_TOAST_ID,
          description: 'Your connection is unstable. Some content may be out of date.',
          duration: 6000,
        })
      }
    })

    function handleOffline() {
      wasOnline.current = false
      toast.dismiss(CACHE_TOAST_ID)
      toast.error("You're offline", {
        id: NETWORK_TOAST_ID,
        description: 'Check your internet connection.',
        duration: Infinity,
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
        ),
      })
    }

    function handleOnline() {
      if (!wasOnline.current) {
        toast.dismiss(CACHE_TOAST_ID)
        toast.success('Back online!', {
          id: NETWORK_TOAST_ID,
          description: 'Your connection has been restored.',
          duration: 3000,
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
          ),
        })
        cacheToastShown.current = false
      }
      wasOnline.current = true
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return null
}
