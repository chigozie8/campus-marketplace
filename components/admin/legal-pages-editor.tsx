'use client'

import { useState } from 'react'
import { Save, Loader2, CheckCircle2, RotateCcw, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { LEGAL_DOCS, type LegalDoc } from '@/lib/site-settings-defaults'

interface Props {
  /** Map of settingKey → current markdown value (may be empty/undefined). */
  initialValues: Record<string, string | undefined>
  /** Current value of `legal_last_updated`. */
  initialLastUpdated?: string
}

/**
 * Admin editor for the 6 legal pages (Privacy, Terms, Cookies, Refund,
 * Dispute, Trust & Safety). Each is a markdown document stored in a single
 * site_settings key. The "Reset to default" button reverts to the built-in
 * markdown shipped with the codebase.
 */
export function LegalPagesEditor({ initialValues, initialLastUpdated }: Props) {
  const [active, setActive] = useState<LegalDoc['id']>('privacy')

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-black text-sm text-foreground">Legal pages content</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Each page renders the markdown saved here. Use standard Markdown
          (headings <code className="text-foreground">##</code>, lists, links, bold,
          italics). Leave empty to use the built-in default.
        </p>
      </div>

      {/* Last updated date */}
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <LastUpdatedField initialValue={initialLastUpdated || ''} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/20">
        {LEGAL_DOCS.map(d => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              active === d.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* Active editor */}
      <div className="p-5">
        {LEGAL_DOCS.filter(d => d.id === active).map(d => (
          <DocEditor key={d.id} doc={d} initialValue={initialValues[d.settingKey] ?? ''} />
        ))}
      </div>
    </div>
  )
}

function LastUpdatedField({ initialValue }: { initialValue: string }) {
  const [value, setValue]   = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'legal_last_updated', value }),
      })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <label className="text-xs font-bold text-foreground">Last updated label</label>
        <p className="text-[11px] text-muted-foreground mb-1.5">Shown at the top of every legal page (e.g. &quot;15 March 2026&quot;).</p>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="15 March 2026"
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-xs font-bold"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
          : <><Save className="w-3.5 h-3.5" /> Save</>}
      </button>
    </div>
  )
}

function DocEditor({ doc, initialValue }: { doc: LegalDoc; initialValue: string }) {
  const [value, setValue]   = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function save() {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: doc.settingKey, value }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function resetToDefault() {
    if (confirm(`Reset "${doc.title}" to the built-in default content? Your current edits will be lost (you can still undo by hitting Cancel — the change is only saved when you click "Save".)`)) {
      setValue(doc.defaultMarkdown)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-sm text-foreground">{doc.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
        </div>
        <Link
          href={`/${doc.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl border border-border hover:border-primary hover:text-primary text-xs font-bold transition-colors"
        >
          View page <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={22}
        spellCheck
        className="w-full px-3.5 py-3 rounded-lg bg-background border border-border text-[13px] leading-[1.65] focus:outline-none focus:border-primary transition-colors resize-y font-mono"
        placeholder={doc.defaultMarkdown.slice(0, 200) + '...'}
      />

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-xs font-bold transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
            : <><Save className="w-3.5 h-3.5" /> Save {doc.title}</>}
        </button>
        <button
          onClick={resetToDefault}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border hover:border-primary hover:text-primary text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Load default
        </button>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {value.length.toLocaleString()} chars · markdown
        </span>
      </div>
    </div>
  )
}
