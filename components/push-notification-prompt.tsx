'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { isNative } from '@/lib/capacitor'

const DISMISSED_KEY = 'push-prompt-dismissed'

export function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isNative()) return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (localStorage.getItem(DISMISSED_KEY)) return
    if (Notification.permission === 'granted') { setGranted(true); return }
    if (Notification.permission === 'denied') return

    const timer = setTimeout(() => setVisible(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  async function handleEnable() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setVisible(false)
        localStorage.setItem(DISMISSED_KEY, '1')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
            auth: arrayBufferToBase64(sub.getKey('auth')!),
          },
        }),
      })

      setGranted(true)
      setVisible(false)
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch (err) {
      console.error('[push prompt]', err)
    } finally {
      setLoading(false)
    }
  }

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  if (!visible || granted) return null

  return (
    <div className="fixed bottom-[88px] left-4 right-4 sm:left-auto sm:right-6 sm:w-[340px] z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#16a34a]/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-[#16a34a]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Enable notifications</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get alerts for new messages, order updates & deals.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 text-xs font-bold bg-[#0a0a0a] text-white rounded-lg py-2 hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {loading ? 'Enabling…' : 'Enable'}
            </button>
            <button
              onClick={dismiss}
              className="flex-1 text-xs font-semibold bg-muted text-muted-foreground rounded-lg py-2 hover:bg-muted/80 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}
