'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2, Phone, Share2, BarChart3, ImageIcon, Type, Layers } from 'lucide-react'
import type { SiteSettings } from '@/lib/site-settings-defaults'
import { ImageUploadField } from '@/components/admin/image-upload-field'

type SettingRow = { key: keyof SiteSettings; label: string; placeholder?: string; type?: 'url' | 'text' | 'image-url' | 'textarea' | 'toggle' }

const SECTIONS: { title: string; desc: string; icon: React.ReactNode; settings: SettingRow[] }[] = [
  {
    title: 'Hero Headline & CTAs',
    desc: 'The big text and buttons at the very top of the homepage.',
    icon: <Type className="w-4 h-4" />,
    settings: [
      { key: 'hero_badge',         label: 'Badge / Trust Pill',     placeholder: 'Built for Nigerian university campuses', type: 'text' },
      { key: 'hero_line1',         label: 'Headline Line 1',         placeholder: 'Your campus', type: 'text' },
      { key: 'hero_accent',        label: 'Headline Accent Word',    placeholder: 'marketplace.', type: 'text' },
      { key: 'hero_subtitle',      label: 'Subtitle',                placeholder: 'Buy and sell with classmates...', type: 'textarea' },
      { key: 'hero_cta_primary',   label: 'Primary CTA Label',       placeholder: 'Get Started Free', type: 'text' },
      { key: 'hero_cta_secondary', label: 'Secondary CTA Label',     placeholder: 'See How It Works', type: 'text' },
    ],
  },
  {
    title: 'How It Works — Header',
    desc: 'Title and subtitle above the 4-step diagram. Use the JSON editor below to manage the steps themselves.',
    icon: <Layers className="w-4 h-4" />,
    settings: [
      { key: 'hiw_title',    label: 'Title',    placeholder: 'Selling made ridiculously simple', type: 'text' },
      { key: 'hiw_subtitle', label: 'Subtitle', placeholder: 'From sign-up to first sale...',     type: 'text' },
    ],
  },
  {
    title: 'Trending Products Strip',
    desc: 'The "What students are buying today" grid right after the stats bar.',
    icon: <BarChart3 className="w-4 h-4" />,
    settings: [
      { key: 'homepage_trending_enabled', label: 'Show on homepage', type: 'toggle' },
    ],
  },
  {
    title: 'Contact & Support',
    desc: 'Shown on the floating support button on the dashboard.',
    icon: <Phone className="w-4 h-4" />,
    settings: [
      { key: 'support_phone', label: 'Support Phone Number', placeholder: '07082039250', type: 'text' },
      { key: 'support_whatsapp_url', label: 'Support WhatsApp Chat URL', placeholder: 'https://wa.me/234...', type: 'url' },
    ],
  },
  {
    title: 'Social Media URLs',
    desc: 'Links shown in the footer social icons.',
    icon: <Share2 className="w-4 h-4" />,
    settings: [
      { key: 'social_whatsapp_url', label: 'WhatsApp URL', placeholder: 'https://wa.me/...', type: 'url' },
      { key: 'social_instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...', type: 'url' },
      { key: 'social_facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/...', type: 'url' },
      { key: 'social_twitter_url', label: 'Twitter / X URL', placeholder: 'https://twitter.com/...', type: 'url' },
      { key: 'social_tiktok_url', label: 'TikTok URL', placeholder: 'https://tiktok.com/@...', type: 'url' },
    ],
  },
  {
    title: 'Platform Stats',
    desc: 'Shown on the homepage hero, press kit page, and other sections.',
    icon: <BarChart3 className="w-4 h-4" />,
    settings: [
      { key: 'stat_active_vendors', label: 'Active Vendors', placeholder: '50,000+', type: 'text' },
      { key: 'stat_campuses', label: 'Nigerian Campuses', placeholder: '120+', type: 'text' },
      { key: 'stat_transactions', label: 'Transactions Processed', placeholder: '₦2B+', type: 'text' },
      { key: 'stat_rating', label: 'Average Rating', placeholder: '4.9/5', type: 'text' },
    ],
  },
  {
    title: 'Hero Section Avatars',
    desc: 'The 5 circular profile photos shown in the social proof row below the homepage headline.',
    icon: <ImageIcon className="w-4 h-4" />,
    settings: [
      { key: 'hero_avatar_1', label: 'Avatar 1', type: 'image-url' },
      { key: 'hero_avatar_2', label: 'Avatar 2', type: 'image-url' },
      { key: 'hero_avatar_3', label: 'Avatar 3', type: 'image-url' },
      { key: 'hero_avatar_4', label: 'Avatar 4', type: 'image-url' },
      { key: 'hero_avatar_5', label: 'Avatar 5', type: 'image-url' },
    ],
  },
]

export function SiteSettingsEditor({ initialSettings }: { initialSettings: SiteSettings }) {
  const [values, setValues] = useState<SiteSettings>(initialSettings)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function saveSetting(key: keyof SiteSettings) {
    setSaving(key)
    setError(null)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key] }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      setSaved(key)
      setTimeout(() => setSaved(null), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  async function autoSaveUpload(key: keyof SiteSettings, url: string) {
    setSaving(key)
    setError(null)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: url }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      setSaved(key)
      setTimeout(() => setSaved(null), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Auto-save failed')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {SECTIONS.map(section => (
        <div key={section.title} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {section.icon}
            </div>
            <div>
              <h3 className="font-black text-sm text-foreground">{section.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {section.settings.map(({ key, label, placeholder, type }) => (
              <div key={key}>
                {type === 'image-url' ? (
                  <div className="flex items-end gap-3">
                    <ImageUploadField
                      value={values[key]}
                      label={label}
                      shape="circle"
                      previewSize={44}
                      className="flex-1"
                      onChange={url => setValues(v => ({ ...v, [key]: url }))}
                      onUpload={url => autoSaveUpload(key, url)}
                    />
                    <button
                      onClick={() => saveSetting(key)}
                      disabled={saving === key}
                      title="Save manually-typed URL"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground text-xs font-bold shrink-0 transition-all mb-0.5"
                    >
                      {saving === key ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : saved === key ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
                      ) : (
                        <><Save className="w-3.5 h-3.5" /> Save</>
                      )}
                    </button>
                  </div>
                ) : type === 'toggle' ? (
                  <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm font-bold text-foreground">{label}</p>
                      {placeholder && <p className="text-xs text-muted-foreground mt-0.5">{placeholder}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = values[key] === '1' ? '0' : '1'
                        setValues(v => ({ ...v, [key]: next }))
                        // auto-save toggles
                        ;(async () => {
                          setSaving(key)
                          try {
                            const res = await fetch('/api/admin/site-settings', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ key, value: next }),
                            })
                            if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
                            setSaved(key)
                            setTimeout(() => setSaved(null), 2000)
                          } catch (e: unknown) {
                            setError(e instanceof Error ? e.message : 'Save failed')
                          } finally { setSaving(null) }
                        })()
                      }}
                      role="switch"
                      aria-checked={values[key] === '1'}
                      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${values[key] === '1' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${values[key] === '1' ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>
                ) : type === 'textarea' ? (
                  <>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">
                      {label}
                    </label>
                    <div className="flex gap-2 items-start">
                      <textarea
                        value={values[key]}
                        onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                        placeholder={placeholder}
                        rows={3}
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-primary transition-colors resize-y"
                      />
                      <button
                        onClick={() => saveSetting(key)}
                        disabled={saving === key}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground text-xs font-bold shrink-0 transition-all"
                      >
                        {saving === key ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : saved === key ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
                          : <><Save className="w-3.5 h-3.5" /> Save</>}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">
                      {label}
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type={type === 'url' ? 'url' : 'text'}
                        value={values[key]}
                        onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        onClick={() => saveSetting(key)}
                        disabled={saving === key}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground text-xs font-bold shrink-0 transition-all"
                      >
                        {saving === key ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : saved === key ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
                        ) : (
                          <><Save className="w-3.5 h-3.5" /> Save</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground text-center pb-4">
        Each field saves independently. Uploaded images auto-save; for pasted URLs, click Save.
      </p>
    </div>
  )
}
