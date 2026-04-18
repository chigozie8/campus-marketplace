'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus, Minus, Loader2, Trash2, CheckCircle2, AlertCircle, Zap, Pencil, X, RotateCcw } from 'lucide-react'

type CatalogItem = {
  slug: string
  title: string
  description: string
  price: number
  originalPrice?: number
  condition: string
  categorySlug: string
  campus: string
  image: string
  added: boolean
  edited?: boolean
}

type CatalogState = {
  items: CatalogItem[]
  addedCount: number
  totalCount: number
}

const fmtNaira = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 })

const CONDITIONS: Array<{ value: CatalogItem['condition']; label: string }> = [
  { value: 'new',      label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good',     label: 'Good' },
  { value: 'fair',     label: 'Fair' },
]

const CAMPUSES = [
  'UNILAG','UI','OAU','ABU','BUK','FUTA','COVENANT','UNILORIN','UNIBEN','UNN',
  'UNIPORT','LASU','OOU','FUTO','UNIZIK','UNIJOS','UNIUYO','BABCOCK','LANDMARK',
]

export function DummyCatalog() {
  const [state, setState] = useState<CatalogState | null>(null)
  const [loading, setLoading] = useState(true)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState<'add' | 'remove' | null>(null)
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [editing, setEditing] = useState<CatalogItem | null>(null)
  const [, startTransition] = useTransition()

  async function refresh() {
    try {
      const res = await fetch('/api/admin/dummy', { cache: 'no-store' })
      const json = (await res.json()) as CatalogState | { error: string }
      if ('error' in json) throw new Error(json.error)
      setState(json)
    } catch (e) {
      setToast({ kind: 'err', text: (e as Error).message || 'Could not load catalogue.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  async function add(slug: string) {
    setBusySlug(slug)
    startTransition(() => {
      setState((s) => s && { ...s, items: s.items.map((i) => i.slug === slug ? { ...i, added: true } : i), addedCount: s.addedCount + 1 })
    })
    try {
      const res = await fetch('/api/admin/dummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add.')
      setToast({ kind: 'ok', text: 'Added to marketplace.' })
      await refresh()
    } catch (e) {
      setToast({ kind: 'err', text: (e as Error).message })
      await refresh()
    } finally {
      setBusySlug(null)
    }
  }

  async function remove(slug: string) {
    setBusySlug(slug)
    startTransition(() => {
      setState((s) => s && { ...s, items: s.items.map((i) => i.slug === slug ? { ...i, added: false } : i), addedCount: Math.max(0, s.addedCount - 1) })
    })
    try {
      const res = await fetch(`/api/admin/dummy?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to remove.')
      setToast({ kind: 'ok', text: 'Removed from marketplace.' })
      await refresh()
    } catch (e) {
      setToast({ kind: 'err', text: (e as Error).message })
      await refresh()
    } finally {
      setBusySlug(null)
    }
  }

  async function addAll() {
    if (!confirm(`Add all ${state?.totalCount ?? 0} demo listings to the marketplace?`)) return
    setBulkBusy('add')
    try {
      const res = await fetch('/api/admin/dummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add all.')
      setToast({ kind: 'ok', text: `Added ${json.added} listing${json.added === 1 ? '' : 's'} (${json.skipped} already there).` })
      await refresh()
    } catch (e) {
      setToast({ kind: 'err', text: (e as Error).message })
    } finally {
      setBulkBusy(null)
    }
  }

  async function removeAll() {
    if (!confirm('Wipe ALL dummy listings from the marketplace? Real listings are not affected.')) return
    setBulkBusy('remove')
    try {
      const res = await fetch('/api/admin/dummy?all=1', { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to remove all.')
      setToast({ kind: 'ok', text: `Removed ${json.removed} dummy listing${json.removed === 1 ? '' : 's'}.` })
      await refresh()
    } catch (e) {
      setToast({ kind: 'err', text: (e as Error).message })
    } finally {
      setBulkBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading catalogue…
      </div>
    )
  }

  if (!state) return null

  return (
    <div className="space-y-5">
      {/* Bulk action bar */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="text-sm">
          <span className="font-bold text-foreground">{state.addedCount}</span>
          <span className="text-muted-foreground"> of {state.totalCount} demo listings live in the marketplace</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={addAll}
            disabled={bulkBusy !== null || state.addedCount === state.totalCount}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold disabled:opacity-60"
          >
            {bulkBusy === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Add all
          </button>
          <button
            onClick={removeAll}
            disabled={bulkBusy !== null || state.addedCount === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 text-sm font-bold disabled:opacity-60"
          >
            {bulkBusy === 'remove' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Remove all
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 max-w-sm flex items-start gap-2 px-4 py-3 rounded-xl shadow-xl text-sm ${
          toast.kind === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.kind === 'ok' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Catalogue grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {state.items.map((item) => {
          const isBusy = busySlug === item.slug
          return (
            <div
              key={item.slug}
              className={`rounded-2xl border bg-card overflow-hidden flex flex-col transition-all ${
                item.added ? 'border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-100 dark:ring-emerald-950' : 'border-border'
              }`}
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {item.added && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                )}
                {item.edited && (
                  <span className="absolute top-2 left-2 mt-7 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow">
                    <Pencil className="w-2.5 h-2.5" /> Edited
                  </span>
                )}
                <button
                  onClick={() => setEditing(item)}
                  className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white shadow transition"
                  title="Edit this listing"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-semibold uppercase tracking-wide">
                  {item.condition.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 flex flex-col gap-1.5 flex-1">
                <h3 className="text-sm font-bold text-foreground line-clamp-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div>
                    <p className="text-base font-black text-foreground">{fmtNaira(item.price)}</p>
                    {item.originalPrice && (
                      <p className="text-[11px] text-muted-foreground line-through">{fmtNaira(item.originalPrice)}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.campus}</span>
                </div>
              </div>

              <div className="p-3 pt-0 flex gap-2">
                {item.added ? (
                  <button
                    onClick={() => remove(item.slug)}
                    disabled={isBusy || bulkBusy !== null}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 text-xs font-bold disabled:opacity-60"
                  >
                    {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5" />}
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => add(item.slug)}
                    disabled={isBusy || bulkBusy !== null}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold disabled:opacity-60"
                  >
                    {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Add
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setToast({ kind: 'ok', text: msg }); void refresh(); setEditing(null) }}
          onError={(msg) => setToast({ kind: 'err', text: msg })}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Edit modal
// ─────────────────────────────────────────────────────────────────────────

function EditModal({
  item,
  onClose,
  onSaved,
  onError,
}: {
  item: CatalogItem
  onClose: () => void
  onSaved: (msg: string) => void
  onError: (msg: string) => void
}) {
  const [form, setForm] = useState({
    title: item.title,
    description: item.description,
    price: String(item.price),
    originalPrice: item.originalPrice ? String(item.originalPrice) : '',
    image: item.image,
    campus: item.campus,
    condition: item.condition,
  })
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [imagePreview, setImagePreview] = useState(item.image)

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function save() {
    const price = Number(form.price)
    if (!form.title.trim())            return onError('Title cannot be empty.')
    if (!form.description.trim())      return onError('Description cannot be empty.')
    if (!form.image.trim())            return onError('Image URL cannot be empty.')
    if (!Number.isFinite(price) || price < 0) return onError('Price must be a positive number.')
    let originalPrice: number | null | undefined = undefined
    if (form.originalPrice.trim() === '') originalPrice = null
    else {
      const op = Number(form.originalPrice)
      if (!Number.isFinite(op) || op < 0) return onError('Original price must be a positive number.')
      originalPrice = op
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/dummy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: item.slug,
          title: form.title.trim(),
          description: form.description.trim(),
          price,
          originalPrice,
          image: form.image.trim(),
          campus: form.campus,
          condition: form.condition,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed.')
      onSaved('Changes saved.')
    } catch (e) {
      onError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function resetToDefault() {
    if (!confirm('Reset this item back to the original catalogue values? Your edits will be lost.')) return
    setResetting(true)
    try {
      const res = await fetch('/api/admin/dummy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: item.slug, reset: true }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Reset failed.')
      onSaved('Reverted to original.')
    } catch (e) {
      onError((e as Error).message)
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl my-0 sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h3 className="text-base font-bold text-foreground">Edit dummy listing</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Slug: <span className="font-mono">{item.slug}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Image preview + URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Image</label>
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-muted border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
            </div>
            <input
              type="url"
              value={form.image}
              onChange={(e) => { set('image', e.target.value); setImagePreview(e.target.value) }}
              placeholder="https://images.unsplash.com/…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Paste any direct image URL. Tip: from Unsplash, right-click the image → "Copy image address".
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Title</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Price (₦)</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Original price (₦)</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={form.originalPrice}
                onChange={(e) => set('originalPrice', e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
          </div>

          {/* Location & condition */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Location / Campus</label>
              <input
                list="campus-list"
                value={form.campus}
                onChange={(e) => set('campus', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <datalist id="campus-list">
                {CAMPUSES.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => set('condition', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-2 px-5 py-4 border-t border-border bg-muted/30 rounded-b-3xl sm:rounded-b-2xl">
          <button
            onClick={resetToDefault}
            disabled={saving || resetting}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground text-xs font-bold disabled:opacity-60"
          >
            {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            Reset to default
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={saving || resetting}
            className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-bold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || resetting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
