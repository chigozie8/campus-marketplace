'use client'

import { Truck } from 'lucide-react'
import { CopyButton } from '@/components/ui/copy-button'

type Props = {
  trackingNumber?: string | null
  trackingCourier?: string | null
}

export function TrackingDisplay({ trackingNumber, trackingCourier }: Props) {
  if (!trackingNumber && !trackingCourier) return null

  return (
    <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
        <Truck className="h-4 w-4" />
        In transit
      </div>
      <div className="space-y-1 text-sm">
        {trackingCourier && (
          <p className="text-zinc-700 dark:text-zinc-300">
            <span className="text-zinc-500 dark:text-zinc-400">Courier:</span> {trackingCourier}
          </p>
        )}
        {trackingNumber && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 dark:text-zinc-400 text-sm">Tracking #:</span>
            <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100">{trackingNumber}</code>
            <CopyButton value={trackingNumber} label="tracking number" />
          </div>
        )}
      </div>
    </div>
  )
}
