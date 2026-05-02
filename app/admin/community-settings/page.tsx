'use client'

import { useEffect, useState } from 'react'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import {
  Save, Loader2, CheckCircle2, AlertCircle, Users,
  CalendarDays, Type, Image as ImageIcon, Bell, ListChecks,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CommunityConfig {
  launch_date:       string
  hero_badge:        string
  hero_title_line1:  string
  hero_title_accent: string
  hero_subtitle:     string
  waitlist_count:    string
  hero_image_url:    string
  launch_date_label: string
}

const DEFAULTS: CommunityConfig = {
  launch_date:       '2027-01-01T00:00:00Z',
  hero_badge:        'Something exciting is coming',
  hero_title_line1:  'Your Campus',
  hero_title_accent: 'Community',
  hero_subtitle:     "We're building a vibrant space where campus buyers, vendors, and deal-hunters come together — forums, leaderboards, exclusive drops, all in one place.",
  waitlist_count:    '2,400+',
  hero_image_url:    '',
  launch_date_label: 'Expected Launch',
}

// ── Field components ──────────────────────────────────────────────────────────

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, className = '',
}: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ${className}`}
    />
  )
}

function TextArea({
  value, onChange, placeholder, rows = 3,
}: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
    />
  )
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, children,
}: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border bg-muted/40">
        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  )
}

// ── Waitlist stats widget ─────────────────────────────────────────────────────

function WaitlistStats() {
  const [count, setCount]     = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/waitlist')
      .then(r => r.ok ? r.json() : null)
      .then(d => setCount(d?.data?.length ?? 0))
      .catch(() => setCount(0))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <ListChecks className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground">
          {loading ? <span className="inline-block w-12 h-6 rounded-lg bg-muted animate-pulse" /> : count}
        </p>
        <p className="text-xs font-semibold text-muted-foreground mt-0.5">Waitlist Signups</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminCommunitySettingsPage() {
  const [config,  setConfig]  = useState<CommunityConfig>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [status,  setStatus]  = useState<'idle' | 'success' | 'error'>('idle')
  const [errMsg,  setErrMsg]  = useState('')

  // Load current settings
  useEffect(() => {
    fetch('/api/admin/community-settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.config) setConfig(c => ({ ...c, ...d.config }))
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false))
  }, [])

  function set<K extends keyof CommunityConfig>(key: K) {
    return (value: string) => setConfig(c => ({ ...c, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setStatus('idle')
    setErrMsg('')
    try {
      const res  = await fetch('/api/admin/community-settings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setStatus('success')
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Community Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit all content shown on the Community coming soon page.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 disabled:opacity-60 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/20 cursor-pointer whitespace-nowrap"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            : <><Save className="w-4 h-4" /> Save Changes</>
          }
        </button>
      </div>

      {/* Status toast */}
      {status === 'success' && (
        <div className="flex items-center gap-2.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-semibold px-4 py-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Settings saved successfully. The community page will reflect changes immediately.
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errMsg || 'Could not save. Please try again.'}
        </div>
      )}

      {/* Waitlist count widget */}
      <WaitlistStats />

      {/* Countdown section */}
      <Section icon={CalendarDays} title="Countdown Timer">
        <FieldGroup label="Launch Date & Time" hint="Set the future date the countdown will count down to. Use ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ">
          <TextInput
            value={config.launch_date}
            onChange={set('launch_date')}
            placeholder="2027-01-01T00:00:00Z"
          />
        </FieldGroup>
        <FieldGroup label="Launch Date Label" hint='Shown above the countdown (e.g. "Expected Launch")'>
          <TextInput
            value={config.launch_date_label}
            onChange={set('launch_date_label')}
            placeholder="Expected Launch"
          />
        </FieldGroup>
      </Section>

      {/* Hero text section */}
      <Section icon={Type} title="Hero Copy">
        <FieldGroup label="Badge Text" hint="Small badge shown at the top of the page">
          <TextInput
            value={config.hero_badge}
            onChange={set('hero_badge')}
            placeholder="Something exciting is coming"
          />
        </FieldGroup>
        <FieldGroup label="Headline Line 1" hint="First line of the large headline (black text)">
          <TextInput
            value={config.hero_title_line1}
            onChange={set('hero_title_line1')}
            placeholder="Your Campus"
          />
        </FieldGroup>
        <FieldGroup label="Headline Accent Word" hint="Second line — shown in green with underline">
          <TextInput
            value={config.hero_title_accent}
            onChange={set('hero_title_accent')}
            placeholder="Community"
          />
        </FieldGroup>
        <FieldGroup label="Subtitle / Description">
          <TextArea
            value={config.hero_subtitle}
            onChange={set('hero_subtitle')}
            placeholder="Describe what the community will be…"
            rows={4}
          />
        </FieldGroup>
      </Section>

      {/* Waitlist section */}
      <Section icon={Bell} title="Waitlist Display">
        <FieldGroup label="Waitlist Count Text" hint='Shown inside the email capture card, e.g. "2,400+"'>
          <TextInput
            value={config.waitlist_count}
            onChange={set('waitlist_count')}
            placeholder="2,400+"
          />
        </FieldGroup>
      </Section>

      {/* Hero image section */}
      <Section icon={ImageIcon} title="Hero Image">
        <FieldGroup
          label="Hero Image"
          hint="Upload or paste a URL for the image shown below the badge. Leave empty to hide."
        >
          <ImageUploadField
            value={config.hero_image_url}
            onChange={set('hero_image_url')}
            shape="square"
            previewSize={72}
            label=""
          />
        </FieldGroup>
      </Section>

      {/* Live preview link */}
      <div className="rounded-2xl border border-border bg-muted/30 p-5 flex items-center gap-3">
        <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          View the live page at{' '}
          <a
            href="/community"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary underline underline-offset-2"
          >
            /community
          </a>
        </p>
      </div>

    </div>
  )
}
