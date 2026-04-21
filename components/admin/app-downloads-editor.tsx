'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2, Download, Smartphone, Apple } from 'lucide-react'

interface Props {
  initialValues: {
    apk_download_url: string
    apk_version: string
    ios_download_url: string
    ios_version: string
  }
}

/**
 * Editor for the public APK / iOS download links exposed in the admin
 * panel and (later) the public download page. The actual builds are
 * produced by Capacitor outside Replit; the admin pastes the resulting
 * artifact URLs here.
 */
export function AppDownloadsEditor({ initialValues }: Props) {
  const [v, setV]           = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function field<K extends keyof typeof v>(k: K, val: string) {
    setV(prev => ({ ...prev, [k]: val }))
  }

  async function save() {
    setSaving(true); setError(null)
    try {
      const results = await Promise.all(
        Object.entries(v).map(([k, val]) =>
          fetch('/api/admin/site-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: k, value: val }),
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
        <div className="flex-1">
          <h3 className="font-black text-sm text-foreground">App download links</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paste the URL for the latest signed Android APK and iOS build
            (both produced by Capacitor). Leave a field blank to hide that
            download button.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-xs font-bold"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
            : <><Save className="w-3.5 h-3.5" /> Save links</>}
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="p-5 space-y-5">
        <Card icon={<Smartphone className="w-4 h-4" />} title="Android APK" colour="text-emerald-600">
          <Field label="Download URL" placeholder="https://downloads.vendoorx.ng/vendoorx-v1.0.0.apk"
            value={v.apk_download_url} onChange={val => field('apk_download_url', val)} />
          <Field label="Version label" placeholder="1.0.0"
            value={v.apk_version} onChange={val => field('apk_version', val)} />
          {v.apk_download_url && (
            <a href={v.apk_download_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary hover:underline">
              <Download className="w-3.5 h-3.5" /> Test download link
            </a>
          )}
        </Card>

        <Card icon={<Apple className="w-4 h-4" />} title="iOS build" colour="text-foreground">
          <Field label="Download URL (TestFlight invite, IPA, or App Store)" placeholder="https://testflight.apple.com/join/XXXXXXXX"
            value={v.ios_download_url} onChange={val => field('ios_download_url', val)} />
          <Field label="Version label" placeholder="1.0.0"
            value={v.ios_version} onChange={val => field('ios_version', val)} />
          {v.ios_download_url && (
            <a href={v.ios_download_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary hover:underline">
              <Download className="w-3.5 h-3.5" /> Test download link
            </a>
          )}
        </Card>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <strong>Note:</strong> Replit can&apos;t build a signed APK or iOS bundle for you —
          run <code className="text-foreground bg-muted px-1 rounded">npx cap build android</code> /
          <code className="text-foreground bg-muted px-1 rounded ml-1">npx cap open ios</code> locally,
          upload the resulting artifact to your file host, and paste the URL here.
        </p>
      </div>
    </div>
  )
}

function Card({ icon, title, colour, children }: {
  icon: React.ReactNode; title: string; colour: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <div className={`flex items-center gap-2 font-black text-sm ${colour}`}>
        {icon} {title}
      </div>
      {children}
    </div>
  )
}
function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary" />
    </div>
  )
}
