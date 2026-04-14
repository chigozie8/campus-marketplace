'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function NetworkToast() {
  const wasOnline = useRef(true)

  useEffect(() => {
    wasOnline.current = navigator.onLine

    function handleOffline() {
      wasOnline.current = false
      toast.error('You\'re offline', {
        id: 'network-status',
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
        toast.success('Back online!', {
          id: 'network-status',
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
