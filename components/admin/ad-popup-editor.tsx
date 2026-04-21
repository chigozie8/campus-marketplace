'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2 } from 'lucide-react'

interface Props {
  initialValues: {
    enabled: string
    title: string
    body: string
    image_url: string
    cta_label: string
    cta_href: string
    delay_ms: string
    auto_close_ms: string
    frequency: string
  }
}

const KEY_PREFIX = 'ad_popup_'

/**
 * Single-form editor for the site-wide promotional popup. Saves all 9
 * `ad_popup_*` settings in one click.
 */
export function AdPopupEditor({ initialValues }: Props) {
  const [v, setV]           = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function field<K extends keyof typeof v>(key: K, value: string) {
    setV(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true); setError(null)
    try {
      // Persist every key in parallel.
      const results = await Promise.all(
        Object.entries(v).map(([k, val]) =>
          fetch('/api/admin/site-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: `${KEY_PREFIX}${k}`, value: val }),
          }),
        ),
      )
      const failed = results.find(r => !r.ok)
      if (failed) throw new Error('One or more settings failed to save.')
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-sm text-foreground">Site-wide Ad Popup</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            A one-time promotional popup shown to visitors on the homepage.
            Has a close (X) button, auto-dismiss timer, and frequency control
            so users aren&apos;t annoyed.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-xs font-bold"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
            : <><Save className="w-3.5 h-3.5" /> Save popup</>}
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

        <Toggle
          label="Show popup on the site"
          description="Master switch — disable to hide the popup completely."
          value={v.enabled}
          onChange={(val) => field('enabled', val)}
        />

        <Select
          label="Frequency"
          description="How often the same visitor sees it."
          value={v.frequency}
          onChange={(val) => field('frequency', val)}
          options={[
            { value: 'session', label: 'Once per browser session' },
            { value: 'once',    label: 'Once forever (per device)' },
            { value: 'always',  label: 'Every page load (use sparingly)' },
          ]}
        />

        <div className="md:col-span-2">
          <Field label="Title" placeholder="🎉 Welcome to VendoorX!" value={v.title} onChange={(val) => field('title', val)} />
        </div>

        <div className="md:col-span-2">
          <Field
            label="Body"
            placeholder="Sign up today and get your first listing boosted free!"
            value={v.body}
            onChange={(val) => field('body', val)}
            type="textarea"
            rows={3}
          />
        </div>

        <Field
          label="Image URL (optional)"
          placeholder="https://..."
          value={v.image_url}
          onChange={(val) => field('image_url', val)}
          help="A 16:9 banner shown above the title. Leave blank for no image."
        />

        <Field
          label="Call-to-action label (optional)"
          placeholder="Get started free →"
          value={v.cta_label}
          onChange={(val) => field('cta_label', val)}
        />

        <Field
          label="Call-to-action link (optional)"
          placeholder="/auth/signup"
          value={v.cta_href}
          onChange={(val) => field('cta_href', val)}
          help="Both Label and Link must be set for the button to appear."
        />

        <Field
          label="Show after (ms)"
          type="number"
          placeholder="3000"
          value={v.delay_ms}
          onChange={(val) => field('delay_ms', val)}
          help="Delay (in milliseconds) before the popup appears."
        />

        <Field
          label="Auto-close after (ms)"
          type="number"
          placeholder="0"
          value={v.auto_close_ms}
          onChange={(val) => field('auto_close_ms', val)}
          help="Set to 0 to disable auto-close. The user can always close with X or Esc."
        />
      </div>
    </div>
  )
}

/* — small primitives — */
function Field({ label, value, onChange, placeholder, type = 'text', help, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; help?: string; rows?: number
}) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground block mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary resize-y" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary" />
      )}
      {help && <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{help}</p>}
    </div>
  )
}
function Toggle({ label, description, value, onChange }: {
  label: string; description?: string; value: string; onChange: (v: string) => void
}) {
  const on = value === '1'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-foreground">{label}</label>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
      <button
        type="button"
        onClick={() => onChange(on ? '0' : '1')}
        className={`w-fit px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
          on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'
        }`}
      >
        {on ? '✓ Enabled' : 'Disabled — click to enable'}
      </button>
    </div>
  )
}
function Select({ label, description, value, onChange, options }: {
  label: string; description?: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-foreground">{label}</label>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
