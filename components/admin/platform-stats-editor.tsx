'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2, TrendingUp, Users, Building2, Star } from 'lucide-react'
import type { SiteSettings } from '@/lib/site-settings-defaults'

type Props = { initialSettings: SiteSettings }

const STAT_FIELDS = [
  {
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    title: 'Active Vendors',
    valueKey: 'stat_active_vendors' as keyof SiteSettings,
    subKey: 'stat_active_vendors_sub' as keyof SiteSettings,
    valuePlaceholder: '50,000+',
    subPlaceholder: 'Selling right now',
  },
  {
    icon: Building2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    title: 'Nigerian Campuses',
    valueKey: 'stat_campuses' as keyof SiteSettings,
    subKey: 'stat_campuses_sub' as keyof SiteSettings,
    valuePlaceholder: '120+',
    subPlaceholder: 'From UNILAG to BUK',
  },
  {
    icon: TrendingUp,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    title: 'Sales Processed',
    valueKey: 'stat_transactions' as keyof SiteSettings,
    subKey: 'stat_transactions_sub' as keyof SiteSettings,
    valuePlaceholder: '₦2.4B+',
    subPlaceholder: 'And growing daily',
  },
  {
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    title: 'Average Rating',
    valueKey: 'stat_rating' as keyof SiteSettings,
    subKey: 'stat_rating_sub' as keyof SiteSettings,
    valuePlaceholder: '4.9/5',
    subPlaceholder: 'From 12,500+ reviews',
  },
]

async function saveSetting(key: string, value: string) {
  const res = await fetch('/api/admin/site-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
}

export function PlatformStatsEditor({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof SiteSettings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const keys: Array<keyof SiteSettings> = [
        'stat_active_vendors', 'stat_active_vendors_sub',
        'stat_campuses', 'stat_campuses_sub',
        'stat_transactions', 'stat_transactions_sub',
        'stat_rating', 'stat_rating_sub',
      ]
      await Promise.all(keys.map(k => saveSetting(k, settings[k])))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all'

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="rounded-2xl border border-border bg-muted/30 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Live Preview</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_FIELDS.map(({ icon: Icon, color, bg, title, valueKey, subKey }) => (
            <div key={title} className="flex flex-col items-center gap-1.5 text-center p-4 rounded-xl bg-card border border-border">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-1`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-xl font-black text-foreground">{settings[valueKey] || '—'}</p>
              <p className="text-xs font-semibold text-foreground">{title}</p>
              <p className="text-[11px] text-muted-foreground">{settings[subKey] || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {STAT_FIELDS.map(({ icon: Icon, color, bg, title, valueKey, subKey, valuePlaceholder, subPlaceholder }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <p className="text-sm font-black text-foreground">{title}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Display Value</label>
              <input
                type="text"
                className={inputCls}
                value={settings[valueKey]}
                onChange={e => set(valueKey, e.target.value)}
                placeholder={valuePlaceholder}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">Sub-label</label>
              <input
                type="text"
                className={inputCls}
                value={settings[subKey]}
                onChange={e => set(subKey, e.target.value)}
                placeholder={subPlaceholder}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">Changes appear instantly.</span>{' '}
          These stats display on the homepage, About page, and Newsroom — no cache, no delay.
        </p>
      </div>

      {/* Save */}
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-sm shadow-primary/20"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle2 className="w-4 h-4" /> Saved!</>
        ) : (
          <><Save className="w-4 h-4" /> Save Stats</>
        )}
      </button>
    </div>
  )
}
