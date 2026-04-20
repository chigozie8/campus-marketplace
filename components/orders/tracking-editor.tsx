'use client'

import { useState } from 'react'
import { Truck, Loader2, Check } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Props = {
  orderId: string
  initialNumber?: string | null
  initialCourier?: string | null
  onSaved?: (data: { tracking_number: string | null; tracking_courier: string | null }) => void
}

export function TrackingEditor({ orderId, initialNumber, initialCourier, onSaved }: Props) {
  const [number, setNumber] = useState(initialNumber ?? '')
  const [courier, setCourier] = useState(initialCourier ?? '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await ordersApi.setTracking(
        orderId,
        number.trim() || null,
        courier.trim() || null,
      )
      if (!res.success) throw new Error(res.message || 'Failed to save tracking')
      setSavedAt(Date.now())
      onSaved?.({ tracking_number: number.trim() || null, tracking_courier: courier.trim() || null })
      setTimeout(() => setSavedAt(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tracking')
    } finally {
      setSaving(false)
    }
  }

  const dirty = (number.trim() !== (initialNumber ?? '')) || (courier.trim() !== (initialCourier ?? ''))

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <Truck className="h-4 w-4 text-emerald-600" />
        Shipment tracking
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={courier}
          onChange={e => setCourier(e.target.value)}
          placeholder="Courier (e.g. GIG Logistics)"
          maxLength={80}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
        />
        <input
          type="text"
          value={number}
          onChange={e => setNumber(e.target.value)}
          placeholder="Tracking number"
          maxLength={120}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Buyers see this on their order page so they can track the delivery.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={saving || !dirty}
          className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : savedAt ? (
            <><Check className="h-3 w-3 mr-1" /> Saved</>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </div>
  )
}
