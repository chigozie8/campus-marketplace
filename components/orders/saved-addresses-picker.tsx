'use client'

import { useEffect, useState } from 'react'
import { MapPin, Loader2, Star } from 'lucide-react'

type SavedAddress = {
  id: string
  label: string
  address: string
  is_default: boolean
}

type Props = {
  onPick: (address: string) => void
  currentValue?: string
}

export function SavedAddressesPicker({ onPick, currentValue }: Props) {
  const [items, setItems] = useState<SavedAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [autofilled, setAutofilled] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/saved-addresses')
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json?.success && Array.isArray(json.data)) setItems(json.data)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Auto-fill the default address ONCE per mount when items first load.
  // Never re-fill — if the user clears the field on purpose, leave it empty.
  useEffect(() => {
    if (loading || autofilled) return
    setAutofilled(true)
    if (currentValue && currentValue.trim().length > 0) return
    const defaultAddr = items.find(a => a.is_default) ?? items[0]
    if (defaultAddr) onPick(defaultAddr.address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, items.length])

  if (loading) {
    return (
      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading saved addresses...
      </p>
    )
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
        <MapPin className="h-3 w-3" /> Saved addresses
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(addr => (
          <button
            key={addr.id}
            type="button"
            onClick={() => onPick(addr.address)}
            className={`text-xs rounded-full border px-2.5 py-1 transition flex items-center gap-1 ${
              currentValue?.trim() === addr.address
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-emerald-400'
            }`}
            title={addr.address}
          >
            {addr.is_default && <Star className="h-3 w-3 fill-current" />}
            {addr.label}
          </button>
        ))}
      </div>
    </div>
  )
}
