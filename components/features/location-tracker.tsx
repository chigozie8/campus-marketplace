'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, MapPinOff } from 'lucide-react'

interface Props {
  /** Interval in ms between location pushes (default 30000 = 30s) */
  intervalMs?: number
  /** Show a small status badge */
  showBadge?: boolean
}

export function LocationTracker({ intervalMs = 30_000, showBadge = true }: Props) {
  const [status, setStatus] = useState<'idle' | 'active' | 'denied' | 'error'>('idle')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchRef = useRef<number | null>(null)
  const lastSentRef = useRef<{ lat: number; lng: number } | null>(null)

  async function pushLocation(lat: number, lng: number, accuracy?: number, heading?: number | null) {
    // Only push if position changed by >10 metres
    if (lastSentRef.current) {
      const d = Math.abs(lastSentRef.current.lat - lat) + Math.abs(lastSentRef.current.lng - lng)
      if (d < 0.0001) return // ~10m
    }
    lastSentRef.current = { lat, lng }

    await fetch('/api/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, accuracy, heading }),
    }).catch(() => null)
  }

  function startTracking() {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setStatus('active')
        pushLocation(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy,
          pos.coords.heading,
        )
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, maximumAge: 10000 },
    )

    // Heartbeat — re-send every intervalMs even if position didn't change
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        pos => pushLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        () => null,
        { maximumAge: 15000 },
      )
    }, intervalMs)
  }

  function stopTracking() {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
    if (intervalRef.current !== null) clearInterval(intervalRef.current)
    watchRef.current = null
    intervalRef.current = null
    // Mark as offline
    fetch('/api/location', { method: 'PATCH' }).catch(() => null)
    setStatus('idle')
  }

  // Auto-start on mount, stop on unmount
  useEffect(() => {
    startTracking()
    return () => { stopTracking() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!showBadge) return null

  const badges = {
    idle:   { icon: MapPin,    color: 'text-muted-foreground', label: 'Location off' },
    active: { icon: MapPin,    color: 'text-emerald-500',      label: 'Live location on' },
    denied: { icon: MapPinOff, color: 'text-amber-500',        label: 'Location denied' },
    error:  { icon: MapPinOff, color: 'text-red-500',          label: 'Location unavailable' },
  }

  const b = badges[status]
  const Icon = b.icon

  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${b.color}`}>
      <Icon className={`w-3.5 h-3.5 ${status === 'active' ? 'animate-pulse' : ''}`} />
      {b.label}
    </div>
  )
}
