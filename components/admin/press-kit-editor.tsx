'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Plus, Trash2, Save, Loader2, CheckCircle2,
  User, Users, Mail, Globe, Twitter, Linkedin,
} from 'lucide-react'
import {
  type SiteSettings,
  type PressAsset,
  type CoFounder,
  parsePressAssets,
  parseCoFounders,
} from '@/lib/site-settings-defaults'
import { ImageUploadField } from '@/components/admin/image-upload-field'

type Props = { initialSettings: SiteSettings }

const EMPTY_COFOUNDER: CoFounder = {
  name: '',
  title: '',
  initials: '',
  photo: '',
  bio: '',
  quote: '',
  linkedinUrl: '',
  twitterUrl: '',
}

async function saveSetting(key: string, value: string) {
  const res = await fetch('/api/admin/site-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
}

export function PressKitEditor({ initialSettings }: Props) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [assets, setAssets] = useState<PressAsset[]>(parsePressAssets(initialSettings.press_assets))
  const [cofounders, setCofounders] = useState<CoFounder[]>(parseCoFounders(initialSettings.press_cofounders))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof SiteSettings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // ── Assets ──
  function setAsset(index: number, field: keyof PressAsset, value: string) {
    setAssets(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }
  function addAsset() {
    setAssets(prev => [...prev, { name: '', desc: '', size: '', url: '' }])
  }
  function removeAsset(index: number) {
    setAssets(prev => prev.filter((_, i) => i !== index))
  }

  // ── Co-founders ──
  function setCofounder(index: number, field: keyof CoFounder, value: string) {
    setCofounders(prev => prev.map((cf, i) => i === index ? { ...cf, [field]: value } : cf))
  }
  function addCofounder() {
    setCofounders(prev => [...prev, { ...EMPTY_COFOUNDER }])
  }
  function removeCofounder(index: number) {
    setCofounders(prev => prev.filter((_, i) => i !== index))
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
        press_founder_photo: settings.press_founder_photo,
        press_founder_bio: settings.press_founder_bio,
        press_founder_bio2: settings.press_founder_bio2,
        press_founder_quote: settings.press_founder_quote,
        press_contact_email: settings.press_contact_email,
        press_founded: settings.press_founded,
        press_headquarters: settings.press_headquarters,
        press_model: settings.press_model,
        press_stage: settings.press_stage,
        press_assets: JSON.stringify(assets),
        press_cofounders: JSON.stringify(cofounders),
      }

      await Promise.all(
        Object.entries(toSave).map(([key, value]) => saveSetting(key, value))
      )

      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors'
  const textareaCls = `${inputCls} resize-none`

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Company Description ── */}
      <Section icon={<Globe className="w-4 h-4" />} title="Company Description">
        <Field label="Company overview (shown on /press page)">
          <textarea
            className={textareaCls}
            rows={4}
            value={settings.press_company_description}
            onChange={e => set('press_company_description', e.target.value)}
          />
        </Field>
      </Section>

      {/* ── Company Snapshot ── */}
      <Section icon={<FileText className="w-4 h-4" />} title="Company Snapshot">
        <p className="text-xs text-muted-foreground mb-4">
          These appear as the four quick-fact chips on the Newsroom page (Founded, Headquarters, Model, Stage).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Founded">
            <input
              className={inputCls}
              placeholder="e.g. 2022"
              value={settings.press_founded}
              onChange={e => set('press_founded', e.target.value)}
            />
          </Field>
          <Field label="Headquarters">
            <input
              className={inputCls}
              placeholder="e.g. Victoria Island, Lagos"
              value={settings.press_headquarters}
              onChange={e => set('press_headquarters', e.target.value)}
            />
          </Field>
          <Field label="Business Model">
            <input
              className={inputCls}
              placeholder="e.g. WhatsApp Commerce SaaS"
              value={settings.press_model}
              onChange={e => set('press_model', e.target.value)}
            />
          </Field>
          <Field label="Stage">
            <input
              className={inputCls}
              placeholder="e.g. Growth — Series A Ready"
              value={settings.press_stage}
              onChange={e => set('press_stage', e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* ── Primary Founder ── */}
      <Section icon={<User className="w-4 h-4" />} title="Primary Founder / CEO">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field label="Full Name">
            <input className={inputCls} value={settings.press_founder_name} onChange={e => set('press_founder_name', e.target.value)} />
          </Field>
          <Field label="Title">
            <input className={inputCls} value={settings.press_founder_title} onChange={e => set('press_founder_title', e.target.value)} />
          </Field>
          <Field label="Initials (fallback avatar)">
            <input className={inputCls} maxLength={3} value={settings.press_founder_initials} onChange={e => set('press_founder_initials', e.target.value)} />
          </Field>
        </div>

        <ImageUploadField
          label="Founder Photo"
          value={settings.press_founder_photo}
          onChange={url => set('press_founder_photo', url)}
          shape="square"
          previewSize={64}
          className="mb-4 p-4 rounded-xl border border-border bg-muted/30"
        />

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

      {/* ── Co-Founders ── */}
      <Section
        icon={<Users className="w-4 h-4" />}
        title="Co-Founders"
        action={
          <button
            onClick={addCofounder}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Co-Founder
          </button>
        }
      >
        <p className="text-xs text-muted-foreground mb-5">
          Add co-founders or key leadership members. They will appear as additional cards on the public Newsroom page.
        </p>

        {cofounders.length === 0 && (
          <button
            onClick={addCofounder}
            className="w-full flex flex-col items-center gap-3 py-10 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold">Add a co-founder</span>
          </button>
        )}

        <div className="flex flex-col gap-5">
          {cofounders.map((cf, i) => (
            <div key={i} className="rounded-2xl border border-border bg-muted/20 overflow-hidden">
              {/* Header bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-black text-primary">{i + 2}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {cf.name || 'New Co-Founder'}
                  </span>
                  {cf.title && (
                    <span className="text-xs text-muted-foreground">— {cf.title}</span>
                  )}
                </div>
                <button
                  onClick={() => removeCofounder(i)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Remove co-founder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Full Name">
                    <input className={inputCls} value={cf.name} onChange={e => setCofounder(i, 'name', e.target.value)} placeholder="Jane Okafor" />
                  </Field>
                  <Field label="Title">
                    <input className={inputCls} value={cf.title} onChange={e => setCofounder(i, 'title', e.target.value)} placeholder="Co-Founder & CTO" />
                  </Field>
                  <Field label="Initials">
                    <input className={inputCls} maxLength={3} value={cf.initials} onChange={e => setCofounder(i, 'initials', e.target.value)} placeholder="JO" />
                  </Field>
                </div>

                {/* Photo */}
                <ImageUploadField
                  label="Photo"
                  value={cf.photo}
                  onChange={url => setCofounder(i, 'photo', url)}
                  shape="square"
                  previewSize={56}
                  className="p-4 rounded-xl border border-border bg-card"
                />

                {/* Bio */}
                <Field label="Bio">
                  <textarea
                    className={textareaCls}
                    rows={3}
                    value={cf.bio}
                    onChange={e => setCofounder(i, 'bio', e.target.value)}
                    placeholder="A brief bio about this co-founder…"
                  />
                </Field>

                {/* Quote */}
                <Field label="Pull Quote">
                  <textarea
                    className={textareaCls}
                    rows={2}
                    value={cf.quote}
                    onChange={e => setCofounder(i, 'quote', e.target.value)}
                    placeholder="An inspiring quote from this co-founder…"
                  />
                </Field>

                {/* Social links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="LinkedIn URL">
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        className={`${inputCls} pl-9`}
                        type="url"
                        value={cf.linkedinUrl}
                        onChange={e => setCofounder(i, 'linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/…"
                      />
                    </div>
                  </Field>
                  <Field label="X / Twitter URL">
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        className={`${inputCls} pl-9`}
                        type="url"
                        value={cf.twitterUrl}
                        onChange={e => setCofounder(i, 'twitterUrl', e.target.value)}
                        placeholder="https://x.com/…"
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cofounders.length > 0 && (
          <button
            onClick={addCofounder}
            className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add another co-founder
          </button>
        )}
      </Section>

      {/* ── Media Contact ── */}
      <Section icon={<Mail className="w-4 h-4" />} title="Media Contact">
        <Field label="Press email">
          <input type="email" className={inputCls} value={settings.press_contact_email} onChange={e => set('press_contact_email', e.target.value)} />
        </Field>
      </Section>

      {/* ── Brand Assets ── */}
      <Section
        icon={<FileText className="w-4 h-4" />}
        title="Brand Assets"
        action={
          <button onClick={addAsset} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add asset
          </button>
        }
      >
        <p className="text-xs text-muted-foreground mb-4">
          Add download URLs for brand assets (logos, PDFs, etc.). Leave URL blank to show a greyed-out download button.
        </p>
        <div className="flex flex-col gap-3">
          {assets.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6 rounded-xl border border-dashed border-border">
              No assets yet. Click &ldquo;Add asset&rdquo; to add one.
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
                <ImageUploadField
                  label="Download URL (or upload file)"
                  value={asset.url}
                  onChange={url => setAsset(i, 'url', url)}
                  shape="square"
                  previewSize={40}
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
                  className="flex-1"
                />
                <button
                  onClick={() => removeAsset(i)}
                  className="mb-0.5 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Save Button ── */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Press Kit</>
          )}
        </button>
        {saved && (
          <span className="text-sm font-medium text-primary">Changes published to /press</span>
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  children,
  action,
  icon,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
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
      <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}
