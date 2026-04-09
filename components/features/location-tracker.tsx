'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, MapPinOff, Loader2, ShieldAlert, Navigation } from 'lucide-react'

type TrackingStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error'

interface Props {
  /** Interval in ms between location pushes (default 30000 = 30s) */
  intervalMs?: number
  /** Show a small inline status badge */
  showBadge?: boolean
  /**
   * Renders a full-screen fixed overlay that blocks the page until the user
   * grants location access. Does NOT need to wrap children — the fixed overlay
   * covers the entire viewport automatically.
   */
  mandatory?: boolean
  /** Friendly page name used in the gate copy, e.g. "Seller Orders" */
  pageLabel?: string
}

async function pushLocation(lat: number, lng: number, accuracy?: number, heading?: number | null) {
  await fetch('/api/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, accuracy, heading }),
  }).catch(() => null)
}

async function markOffline() {
  fetch('/api/location', { method: 'PATCH' }).catch(() => null)
}

export function LocationTracker({ intervalMs = 30_000, showBadge = true, mandatory = false, pageLabel = 'this page' }: Props) {
  const [status, setStatus] = useState<TrackingStatus>('idle')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchRef = useRef<number | null>(null)
  const lastSentRef = useRef<{ lat: number; lng: number } | null>(null)

  const tryPush = useCallback((lat: number, lng: number, accuracy?: number, heading?: number | null) => {
    if (lastSentRef.current) {
      const d = Math.abs(lastSentRef.current.lat - lat) + Math.abs(lastSentRef.current.lng - lng)
      if (d < 0.0001) return // skip if moved < ~10m
    }
    lastSentRef.current = { lat, lng }
    pushLocation(lat, lng, accuracy, heading)
  }, [])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }
    setStatus('requesting')

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setStatus('active')
        tryPush(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, pos.coords.heading)
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, maximumAge: 10_000 },
    )

    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        pos => tryPush(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
        () => null,
        { maximumAge: 15_000 },
      )
    }, intervalMs)
  }, [intervalMs, tryPush])

  const stopTracking = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
    if (intervalRef.current !== null) clearInterval(intervalRef.current)
    watchRef.current = null
    intervalRef.current = null
    markOffline()
  }, [])

  function retryTracking() {
    stopTracking()
    setStatus('idle')
    setTimeout(startTracking, 200)
  }

  useEffect(() => {
    startTracking()
    return () => stopTracking()
  }, [startTracking, stopTracking])

  // ── Inline badge ──────────────────────────────────────────────────────────
  const badgeMap: Record<TrackingStatus, { icon: typeof MapPin; color: string; label: string }> = {
    idle:       { icon: MapPin,    color: 'text-muted-foreground', label: 'Location off' },
    requesting: { icon: MapPin,    color: 'text-amber-500',        label: 'Getting location…' },
    active:     { icon: MapPin,    color: 'text-emerald-500',      label: 'Live location on' },
    denied:     { icon: MapPinOff, color: 'text-red-500',          label: 'Location denied' },
    error:      { icon: MapPinOff, color: 'text-red-500',          label: 'Unavailable' },
  }

  const b = badgeMap[status]
  const BadgeIcon = b.icon

  const badge = showBadge ? (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${b.color}`}>
      {status === 'requesting'
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <BadgeIcon className={`w-3.5 h-3.5 ${status === 'active' ? 'animate-pulse' : ''}`} />
      }
      {b.label}
    </div>
  ) : null

  // ── Non-mandatory — just badge ────────────────────────────────────────────
  if (!mandatory) return badge

  // ── Mandatory — badge + fixed full-screen gate ────────────────────────────
  const isBlocked = status !== 'active'

  return (
    <>
      {/* Inline badge (always shown when active, so the header indicator works) */}
      {badge}

      {/* Full-screen gate — covers the ENTIRE viewport when blocked */}
      {isBlocked && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-lg p-5">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">

            {/* Icon + heading */}
            <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${
                status === 'requesting'
                  ? 'bg-amber-100 dark:bg-amber-950/40'
                  : 'bg-red-100 dark:bg-red-950/40'
              }`}>
                {status === 'requesting'
                  ? <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
                  : <ShieldAlert className="w-9 h-9 text-red-500" />
                }
              </div>

              <h2 className="text-xl font-black text-foreground leading-tight">
                {status === 'requesting'
                  ? 'Requesting Location'
                  : status === 'error'
                  ? 'Location Unavailable'
                  : 'Location Required'}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {status === 'requesting'
                  ? 'Please tap Allow when your browser asks for location permission.'
                  : status === 'error'
                  ? 'Your device does not support GPS. Please use a mobile device with location services enabled.'
                  : `VendoorX requires your real-time location to access ${pageLabel}. This is mandatory for fraud prevention and transaction security.`}
              </p>
            </div>

            {/* Why list */}
            {status !== 'error' && (
              <div className="mx-5 mb-4 rounded-2xl bg-muted/60 border border-border p-4 space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Why is this required?</p>
                {[
                  'Confirms your physical presence at the transaction',
                  'Detects and blocks fraudulent or duplicate orders',
                  'Enables live delivery monitoring by our support team',
                  'Builds verified trust between buyer and seller',
                ].map(r => (
                  <div key={r} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-foreground leading-snug">{r}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="px-5 pb-7 space-y-3">
              {status === 'denied' && (
                <>
                  <button
                    onClick={retryTracking}
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20"
                  >
                    <Navigation className="w-4 h-4" />
                    Enable Location & Try Again
                  </button>
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-3">
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium text-center leading-relaxed">
                      If the prompt doesn&apos;t appear: open your browser&nbsp;&rarr; Site settings&nbsp;&rarr; Location&nbsp;&rarr; Allow, then tap the button above.
                    </p>
                  </div>
                </>
              )}
              {status === 'requesting' && (
                <div className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Waiting for permission…</span>
                </div>
              )}
              {status === 'error' && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 p-3 text-center">
                  <p className="text-xs text-red-700 dark:text-red-400 font-semibold">
                    Please switch to a mobile browser with GPS support to continue.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
