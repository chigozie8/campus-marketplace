'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Save, Loader2, CheckCircle2, Plus, Trash2, MessageCircle } from 'lucide-react'
import { type SiteSettings, parseContactSubjects } from '@/lib/site-settings-defaults'

type Props = { initialSettings: SiteSettings }

async function saveSetting(key: string, value: string) {
  const res = await fetch('/api/admin/site-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
}

export function ContactEditor({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [subjects, setSubjects] = useState<string[]>(
    parseContactSubjects(initialSettings.contact_subjects)
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof SiteSettings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function setSubject(i: number, value: string) {
    setSubjects(prev => prev.map((s, idx) => idx === i ? value : s))
  }
  function addSubject() { setSubjects(prev => [...prev, '']) }
  function removeSubject(i: number) { setSubjects(prev => prev.filter((_, idx) => idx !== i)) }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const toSave: Record<string, string> = {
        support_phone:         settings.support_phone,
        support_whatsapp_url:  settings.support_whatsapp_url,
        contact_email:         settings.contact_email,
        contact_hero_subtitle: settings.contact_hero_subtitle,
        contact_response_time: settings.contact_response_time,
        contact_hours:         settings.contact_hours,
        contact_office_name:   settings.contact_office_name,
        contact_office_address: settings.contact_office_address,
        contact_subjects:      JSON.stringify(subjects.filter(s => s.trim())),
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

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all'
  const textareaCls = `${inputCls} resize-none`

  return (
    <div className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Hero */}
      <Section icon={Mail} title="Hero Text">
        <Field label="Subtitle / description shown under 'Contact Us'">
          <textarea
            className={textareaCls}
            rows={3}
            value={settings.contact_hero_subtitle}
            onChange={e => set('contact_hero_subtitle', e.target.value)}
            placeholder="Got a question, bug report, or partnership idea?..."
          />
        </Field>
        <Field label="Response time (shown in hero & success message)" className="mt-4">
          <input
            className={inputCls}
            value={settings.contact_response_time}
            onChange={e => set('contact_response_time', e.target.value)}
            placeholder="2 hours"
          />
        </Field>
      </Section>

      {/* Contact channels */}
      <Section icon={Phone} title="Contact Channels">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone number (Call Us card)">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                className={`${inputCls} pl-9`}
                type="tel"
                value={settings.support_phone}
                onChange={e => set('support_phone', e.target.value)}
                placeholder="07082039250"
              />
            </div>
          </Field>
          <Field label="Support email address">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                className={`${inputCls} pl-9`}
                type="email"
                value={settings.contact_email}
                onChange={e => set('contact_email', e.target.value)}
                placeholder="support@vendoorx.com"
              />
            </div>
          </Field>
        </div>
        <Field label="WhatsApp link (full URL with pre-filled message)" className="mt-4">
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              className={`${inputCls} pl-9`}
              value={settings.support_whatsapp_url}
              onChange={e => set('support_whatsapp_url', e.target.value)}
              placeholder="https://wa.me/2347082039250?text=Hi%20VendoorX..."
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Format: <span className="font-mono">https://wa.me/[country code + number]?text=[URL-encoded message]</span>
          </p>
        </Field>
      </Section>

      {/* Hours */}
      <Section icon={Clock} title="Business Hours">
        <Field label="Hours text (shown in the Hours card — supports line breaks)">
          <textarea
            className={textareaCls}
            rows={3}
            value={settings.contact_hours}
            onChange={e => set('contact_hours', e.target.value)}
            placeholder={'Mon – Sat: 8am – 10pm WAT\nSunday: 10am – 6pm WAT'}
          />
        </Field>
      </Section>

      {/* Office */}
      <Section icon={MapPin} title="Office Address">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company / office name">
            <input
              className={inputCls}
              value={settings.contact_office_name}
              onChange={e => set('contact_office_name', e.target.value)}
              placeholder="VendoorX Technologies Ltd"
            />
          </Field>
          <Field label="Address (supports line breaks)">
            <textarea
              className={textareaCls}
              rows={2}
              value={settings.contact_office_address}
              onChange={e => set('contact_office_address', e.target.value)}
              placeholder={'Victoria Island, Lagos\nLagos State, Nigeria'}
            />
          </Field>
        </div>
      </Section>

      {/* Subjects */}
      <Section
        icon={Mail}
        title="Contact Form — Subject Options"
        action={
          <button
            onClick={addSubject}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add subject
          </button>
        }
      >
        <p className="text-xs text-muted-foreground mb-4">
          These appear in the subject dropdown on the public contact form. Drag to reorder (coming soon). Empty items are ignored on save.
        </p>
        <div className="flex flex-col gap-2">
          {subjects.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs text-muted-foreground font-mono shrink-0">{i + 1}</span>
              <input
                className={`${inputCls} flex-1`}
                value={s}
                onChange={e => setSubject(i, e.target.value)}
                placeholder="Subject option..."
              />
              <button
                onClick={() => removeSubject(i)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {subjects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 rounded-xl border border-dashed border-border">
              No subjects yet. Click &ldquo;Add subject&rdquo; to add one.
            </p>
          )}
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-sm shadow-primary/20"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Contact Page</>
          )}
        </button>
        {saved && (
          <p className="text-sm text-primary font-semibold">
            Changes live at <span className="font-mono text-xs">/contact</span>
          </p>
        )}
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
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
      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  )
}
