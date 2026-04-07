'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Save, Loader2, CheckCircle2, Phone, Share2, BarChart3, ImageIcon } from 'lucide-react'
import type { SiteSettings } from '@/lib/site-settings-defaults'

type SettingRow = { key: keyof SiteSettings; label: string; placeholder?: string; type?: 'url' | 'text' | 'image-url' }

const SECTIONS: { title: string; desc: string; icon: React.ReactNode; settings: SettingRow[] }[] = [
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
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">
                  {label}
                </label>
                <div className="flex gap-2 items-center">
                  {type === 'image-url' ? (
                    <>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                        {values[key] && (
                          <Image
                            src={values[key]}
                            alt={label}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <input
                        type="url"
                        value={values[key]}
                        onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                        placeholder="https://..."
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-primary transition-colors font-mono text-xs"
                      />
                    </>
                  ) : (
                    <input
                      type={type === 'url' ? 'url' : 'text'}
                      value={values[key]}
                      onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  )}
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
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground text-center pb-4">
        Each field saves independently. Changes go live immediately on the next page load.
      </p>
    </div>
  )
}
