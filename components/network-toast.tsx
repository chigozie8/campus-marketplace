'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

function playOfflineSound() {
  try {
    const ctx = new AudioContext()
    const gains = [0.35, 0.25, 0.15]
    const freqs = [520, 380, 260]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(gains[i], ctx.currentTime + 0.05 + i * 0.13)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18 + i * 0.13)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.13)
      osc.stop(ctx.currentTime + 0.22 + i * 0.13)
    })
    setTimeout(() => ctx.close(), 1000)
  } catch {}
}

function playOnlineSound() {
  try {
    const ctx = new AudioContext()
    const notes = [
      { freq: 440, t: 0.00 },
      { freq: 554, t: 0.12 },
      { freq: 659, t: 0.24 },
    ]
    notes.forEach(({ freq, t }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + t)
      gain.gain.setValueAtTime(0, ctx.currentTime + t)
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + t + 0.04)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + t + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.22)
    })
    setTimeout(() => ctx.close(), 1000)
  } catch {}
}

export function NetworkToast() {
  const wasOnline = useRef(true)

  useEffect(() => {
    wasOnline.current = navigator.onLine

    function handleOffline() {
      wasOnline.current = false
      playOfflineSound()
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
        playOnlineSound()
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
