'use client'

import { useState } from 'react'
import { FileText, Plus, Trash2, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { type SiteSettings, type PressAsset, parsePressAssets } from '@/lib/site-settings-defaults'

type Props = { initialSettings: SiteSettings }

const PRESS_KEYS: Array<keyof SiteSettings> = [
  'press_company_description',
  'press_founder_name',
  'press_founder_title',
  'press_founder_initials',
  'press_founder_bio',
  'press_founder_bio2',
  'press_founder_quote',
  'press_contact_email',
  'press_assets',
]

async function saveSetting(key: string, value: string) {
  const res = await fetch('/api/admin/site-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
}

export function PressKitEditor({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [assets, setAssets] = useState<PressAsset[]>(parsePressAssets(initialSettings.press_assets))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof SiteSettings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function setAsset(index: number, field: keyof PressAsset, value: string) {
    setAssets(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  function addAsset() {
    setAssets(prev => [...prev, { name: '', desc: '', size: '', url: '' }])
  }

  function removeAsset(index: number) {
    setAssets(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const toSave: Record<string, string> = {
        press_company_description: settings.press_company_description,
        press_founder_name: settings.press_founder_name,
        press_founder_title: settings.press_founder_title,
        press_founder_initials: settings.press_founder_initials,
        press_founder_bio: settings.press_founder_bio,
        press_founder_bio2: settings.press_founder_bio2,
        press_founder_quote: settings.press_founder_quote,
        press_contact_email: settings.press_contact_email,
        press_assets: JSON.stringify(assets),
      }

      await Promise.all(
        Object.entries(toSave).map(([key, value]) => saveSetting(key, value))
      )

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
  const textareaCls = `${inputCls} resize-none`

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Company */}
      <Section title="Company Description">
        <Field label="Company overview (shown on /press page)">
          <textarea
            className={textareaCls}
            rows={4}
            value={settings.press_company_description}
            onChange={e => set('press_company_description', e.target.value)}
          />
        </Field>
      </Section>

      {/* Founder */}
      <Section title="Founder & Leadership">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field label="Full Name">
            <input className={inputCls} value={settings.press_founder_name} onChange={e => set('press_founder_name', e.target.value)} />
          </Field>
          <Field label="Title">
            <input className={inputCls} value={settings.press_founder_title} onChange={e => set('press_founder_title', e.target.value)} />
          </Field>
          <Field label="Initials (avatar)">
            <input className={inputCls} maxLength={3} value={settings.press_founder_initials} onChange={e => set('press_founder_initials', e.target.value)} />
          </Field>
        </div>
        <Field label="Bio paragraph 1">
          <textarea className={textareaCls} rows={3} value={settings.press_founder_bio} onChange={e => set('press_founder_bio', e.target.value)} />
        </Field>
        <Field label="Bio paragraph 2" className="mt-4">
          <textarea className={textareaCls} rows={3} value={settings.press_founder_bio2} onChange={e => set('press_founder_bio2', e.target.value)} />
        </Field>
        <Field label="Pull quote" className="mt-4">
          <textarea className={textareaCls} rows={2} value={settings.press_founder_quote} onChange={e => set('press_founder_quote', e.target.value)} />
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Media Contact">
        <Field label="Press email">
          <input type="email" className={inputCls} value={settings.press_contact_email} onChange={e => set('press_contact_email', e.target.value)} />
        </Field>
      </Section>

      {/* Brand Assets */}
      <Section
        title="Brand Assets"
        action={
          <button onClick={addAsset} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add asset
          </button>
        }
      >
        <p className="text-xs text-muted-foreground mb-4">
          Add download URLs for brand assets. Leave URL blank to show a greyed-out download button.
        </p>
        <div className="flex flex-col gap-3">
          {assets.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6 rounded-xl border border-dashed border-border">
              No assets yet. Click "Add asset" to add one.
            </p>
          )}
          {assets.map((asset, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Asset name">
                  <input className={inputCls} value={asset.name} onChange={e => setAsset(i, 'name', e.target.value)} placeholder="VendoorX Logo (SVG)" />
                </Field>
                <Field label="Description">
                  <input className={inputCls} value={asset.desc} onChange={e => setAsset(i, 'desc', e.target.value)} placeholder="Full colour variants" />
                </Field>
                <Field label="Size label">
                  <input className={inputCls} value={asset.size} onChange={e => setAsset(i, 'size', e.target.value)} placeholder="SVG / 2.4 MB / PDF" />
                </Field>
              </div>
              <div className="flex items-end gap-3">
                <Field label="Download URL" className="flex-1">
                  <input className={inputCls} type="url" value={asset.url} onChange={e => setAsset(i, 'url', e.target.value)} placeholder="https://…" />
                </Field>
                <button
                  onClick={() => removeAsset(i)}
                  className="mb-0.5 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Press Kit</>
          )}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-black text-foreground">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  )
}
