'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapPin, RefreshCw, Loader2, Users, Wifi, WifiOff } from 'lucide-react'
import lazyLoad from 'next/dynamic'

const LeafletMap = lazyLoad(() => import('@/components/admin/location-map'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-muted rounded-2xl">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
)})

interface VendorLocation {
  vendor_id: string
  lat: number
  lng: number
  accuracy: number | null
  heading: number | null
  is_active: boolean
  updated_at: string
  profiles?: { full_name: string; avatar_url: string | null }
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<VendorLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/location')
      const data = await res.json()
      if (res.ok) {
        setLocations(data.locations ?? [])
        setLastRefresh(new Date())
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLocations()
    const interval = setInterval(fetchLocations, 30_000)
    return () => clearInterval(interval)
  }, [fetchLocations])

  const activeCount = locations.filter(l => l.is_active).length

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Live Location Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Active vendors in the last 10 minutes · auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <p className="text-xs text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
          <button
            onClick={fetchLocations}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-muted-foreground">Active Vendors</p>
          </div>
          <p className="text-2xl font-black text-foreground">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-semibold text-muted-foreground">Total Tracked</p>
          </div>
          <p className="text-2xl font-black text-foreground">{locations.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            {activeCount > 0
              ? <Wifi className="w-4 h-4 text-emerald-500" />
              : <WifiOff className="w-4 h-4 text-muted-foreground" />
            }
            <p className="text-xs font-semibold text-muted-foreground">Status</p>
          </div>
          <p className={`text-sm font-bold ${activeCount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            {activeCount > 0 ? 'Live tracking active' : 'No active vendors'}
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-2xl border border-border overflow-hidden" style={{ height: '450px' }}>
        {loading && locations.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading vendor locations…</p>
            </div>
          </div>
        ) : (
          <LeafletMap locations={locations} />
        )}
      </div>

      {/* Vendor list */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-foreground">Active Vendors</h2>
        {locations.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No vendors are sharing their location right now.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Location sharing activates automatically when vendors open their Seller Orders page.
            </p>
          </div>
        ) : (
          locations.map(loc => (
            <div key={loc.vendor_id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-black text-primary flex-shrink-0">
                {(loc.profiles?.full_name ?? 'V').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {loc.profiles?.full_name ?? 'Vendor'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                  {loc.accuracy != null && ` · ±${Math.round(loc.accuracy)}m`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  loc.is_active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${loc.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  {loc.is_active ? 'Live' : 'Offline'}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(loc.updated_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
