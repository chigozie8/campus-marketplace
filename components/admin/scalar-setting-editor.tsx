'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'

interface Props {
  settingKey: string
  label: string
  description?: string
  initialValue: string
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'number' | 'textarea' | 'select'
  options?: { value: string; label: string }[]
  rows?: number
  helpText?: string
}

/**
 * Inline single-value editor for a scalar setting in `site_settings`.
 * Used for short strings (footer copyright, contact recipient email,
 * APK download URL, etc).
 */
export function ScalarSettingEditor({
  settingKey, label, description, initialValue, placeholder,
  type = 'text', options, rows = 4, helpText,
}: Props) {
  const [value, setValue]   = useState(initialValue || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function save() {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingKey, value }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <label className="font-bold text-sm text-foreground block">{label}</label>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-xs font-bold transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
            : <><Save className="w-3.5 h-3.5" /> Save</>}
        </button>
      </div>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors resize-y font-mono"
        />
      ) : type === 'select' && options ? (
        <select
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
        />
      )}

      {helpText && <p className="text-[11px] text-muted-foreground leading-relaxed">{helpText}</p>}

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
