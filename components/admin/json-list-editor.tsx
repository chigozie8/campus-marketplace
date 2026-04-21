'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2, CheckCircle2 } from 'lucide-react'

export type FieldDef = {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'select'
  placeholder?: string
  options?: string[] // for select
}

interface Props<T extends Record<string, string>> {
  /** Settings key in site_settings (e.g. 'homepage_faqs'). */
  settingKey: string
  /** Friendly label shown in the section header. */
  title: string
  /** Optional one-line description shown under the title. */
  description?: string
  /** Per-row field schema. */
  fields: FieldDef[]
  /** Initial parsed list. */
  initialItems: T[]
  /** Default empty row template (keys must match `fields`). */
  blankItem: T
  /** Maximum number of items allowed (omit for unlimited). */
  maxItems?: number
}

/**
 * Generic admin editor for list-shaped settings stored as JSON strings in
 * site_settings. Used for FAQs, How-It-Works steps, escrow steps, hero
 * feature pills — anything that's an array of structured rows the admin
 * needs to add, remove, reorder and edit.
 *
 * Saves the entire list as one JSON string PUT to /api/admin/site-settings.
 */
export function JsonListEditor<T extends Record<string, string>>({
  settingKey, title, description, fields, initialItems, blankItem, maxItems,
}: Props<T>) {
  const [items, setItems] = useState<T[]>(initialItems.length ? initialItems : [blankItem])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function update(i: number, key: keyof T, value: string) {
    setItems(prev => prev.map((row, idx) => idx === i ? { ...row, [key]: value } : row))
  }
  function add() {
    if (maxItems && items.length >= maxItems) return
    setItems(prev => [...prev, { ...blankItem }])
  }
  function remove(i: number) {
    setItems(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev)
  }
  function move(i: number, dir: -1 | 1) {
    setItems(prev => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  async function save() {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingKey, value: JSON.stringify(items) }),
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
          <h3 className="font-black text-sm text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          <p className="text-[11px] text-muted-foreground mt-1">{items.length}{maxItems ? ` / ${maxItems}` : ''} item{items.length === 1 ? '' : 's'}</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-xs font-bold transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
            : <><Save className="w-3.5 h-3.5" /> Save all</>}
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      <div className="p-5 space-y-3">
        {items.map((row, i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Item #{i + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-lg hover:bg-muted disabled:opacity-30 flex items-center justify-center" aria-label="Move up">
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="w-7 h-7 rounded-lg hover:bg-muted disabled:opacity-30 flex items-center justify-center" aria-label="Move down">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(i)} disabled={items.length <= 1} className="w-7 h-7 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 disabled:opacity-30 flex items-center justify-center" aria-label="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={(row[f.key as keyof T] as string) ?? ''}
                    onChange={e => update(i, f.key as keyof T, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors resize-y"
                  />
                ) : f.type === 'select' && f.options ? (
                  <select
                    value={(row[f.key as keyof T] as string) ?? ''}
                    onChange={e => update(i, f.key as keyof T, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={(row[f.key as keyof T] as string) ?? ''}
                    onChange={e => update(i, f.key as keyof T, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={add}
          disabled={!!maxItems && items.length >= maxItems}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm font-bold text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-4 h-4" /> Add item{maxItems ? ` (max ${maxItems})` : ''}
        </button>
      </div>
    </div>
  )
}
