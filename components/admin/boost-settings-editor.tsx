'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Info } from 'lucide-react'

interface Props {
  initialSettings: Record<string, string>
}

const FIELDS = [
  {
    key: 'boost_listing_price_kobo',
    label: 'Listing Boost Price (₦)',
    type: 'naira',
    hint: 'What sellers pay to feature a single listing in search results.',
    placeholder: '1500',
  },
  {
    key: 'boost_store_price_kobo',
    label: 'Store Boost Price (₦)',
    type: 'naira',
    hint: 'What sellers pay to feature their entire store.',
    placeholder: '2500',
  },
  {
    key: 'boost_duration_days',
    label: 'Boost Duration (days)',
    type: 'number',
    hint: 'How many days a boost stays active after purchase.',
    placeholder: '7',
  },
]

function koboToNaira(kobo: string | undefined): string {
  if (!kobo) return ''
  const n = parseInt(kobo, 10)
  return isNaN(n) ? '' : String(n / 100)
}

function nairaToKobo(naira: string): string {
  const n = parseFloat(naira)
  if (isNaN(n)) return ''
  return String(Math.round(n * 100))
}

export function BoostSettingsEditor({ initialSettings }: Props) {
  const [saving, setSaving] = useState(false)

  const [nairaValues, setNairaValues] = useState<Record<string, string>>({
    boost_listing_price_kobo: koboToNaira(initialSettings['boost_listing_price_kobo']),
    boost_store_price_kobo:   koboToNaira(initialSettings['boost_store_price_kobo']),
    boost_duration_days:      initialSettings['boost_duration_days'] ?? '7',
  })

  async function handleSave() {
    setSaving(true)
    try {
      const payload: Record<string, string> = {}

      for (const f of FIELDS) {
        const raw = nairaValues[f.key] ?? ''
        if (f.type === 'naira') {
          const kobo = nairaToKobo(raw)
          if (!kobo) { toast.error(`Invalid value for "${f.label}"`); setSaving(false); return }
          payload[f.key] = kobo
        } else {
          if (!raw) { toast.error(`Invalid value for "${f.label}"`); setSaving(false); return }
          payload[f.key] = raw
        }
      }

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success('Boost settings saved!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {FIELDS.map(f => (
        <div key={f.key} className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">{f.label}</label>
          <div className="relative">
            {f.type === 'naira' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">₦</span>
            )}
            <input
              type="number"
              min={f.type === 'naira' ? 0 : 1}
              step={f.type === 'naira' ? 100 : 1}
              value={nairaValues[f.key] ?? ''}
              onChange={e => setNairaValues(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className={`w-full rounded-xl border bg-background text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${f.type === 'naira' ? 'pl-7' : ''}`}
            />
          </div>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {f.hint}
          </p>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : 'Save Boost Settings'}
      </button>
    </div>
  )
}
