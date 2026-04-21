'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { type SectionVisibility, DEFAULT_SECTION_VISIBILITY } from '@/lib/site-settings-defaults'

const TOGGLES: { key: keyof SectionVisibility; label: string; hint: string }[] = [
  { key: 'trending',        label: 'Trending Products',     hint: 'Live grid of best-performing listings' },
  { key: 'trustedBy',       label: 'Trusted By Logos',      hint: 'Logo strip of partner schools / partners' },
  { key: 'problemSolution', label: 'Problem / Solution',    hint: 'Pain points and how VendoorX solves them' },
  { key: 'whatsappMockup',  label: 'WhatsApp Mockup',       hint: 'Animated phone-screen mockup' },
  { key: 'howItWorks',      label: 'How It Works',          hint: '4 steps from sign-up to first sale' },
  { key: 'features',        label: 'Features Grid',         hint: '8-tile feature breakdown' },
  { key: 'integrations',    label: 'Integrations Section',  hint: 'WhatsApp / Paystack / Instagram badges' },
  { key: 'trust',           label: 'Trust Pillars',         hint: 'Buyer-protection trust messaging' },
  { key: 'escrow',          label: 'Escrow Flow Diagram',   hint: '4-step escrow explanation' },
  { key: 'faq',             label: 'FAQ Section',           hint: 'Frequently asked questions' },
  { key: 'cta',             label: 'Final CTA Section',     hint: 'The closing call-to-action banner' },
]

export function SectionVisibilityEditor({ initialValue }: { initialValue: SectionVisibility }) {
  const [visible, setVisible] = useState<SectionVisibility>({ ...DEFAULT_SECTION_VISIBILITY, ...initialValue })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(key: keyof SectionVisibility) {
    setVisible(v => ({ ...v, [key]: !v[key] }))
  }

  async function save() {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'homepage_sections_visible', value: JSON.stringify(visible) }),
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
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-sm text-foreground">Homepage Section Visibility</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Toggle off any section you don&apos;t want shown on the homepage.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-xs font-bold transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
            : <><Save className="w-3.5 h-3.5" /> Save</>}
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="p-3">
        <ul className="space-y-1">
          {TOGGLES.map(t => {
            const on = visible[t.key]
            return (
              <li key={t.key}>
                <button
                  onClick={() => toggle(t.key)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <span
                    role="switch"
                    aria-checked={on}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-foreground">{t.label}</span>
                    <span className="block text-xs text-muted-foreground">{t.hint}</span>
                  </span>
                  {on
                    ? <Eye className="w-4 h-4 text-primary shrink-0" />
                    : <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
