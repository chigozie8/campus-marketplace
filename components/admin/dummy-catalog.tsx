'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus, Minus, Loader2, Trash2, CheckCircle2, AlertCircle, Zap } from 'lucide-react'

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
}

type CatalogState = {
  items: CatalogItem[]
  addedCount: number
  totalCount: number
}

const fmtNaira = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 })

export function DummyCatalog() {
  const [state, setState] = useState<CatalogState | null>(null)
  const [loading, setLoading] = useState(true)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState<'add' | 'remove' | null>(null)
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
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

  useEffect(() => {
    void refresh()
  }, [])

  // Auto-dismiss the toast after a few seconds.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  async function add(slug: string) {
    setBusySlug(slug)
    // Optimistic update for snappy feel.
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
      await refresh() // revert on failure
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
          toast.kind === 'ok'
            ? 'bg-emerald-600 text-white'
            : 'bg-red-600 text-white'
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
                {/* Using a plain img keeps Next/Image domain config out of the way for now. */}
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
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-semibold uppercase tracking-wide">
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

              <div className="p-3 pt-0">
                {item.added ? (
                  <button
                    onClick={() => remove(item.slug)}
                    disabled={isBusy || bulkBusy !== null}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 text-xs font-bold disabled:opacity-60"
                  >
                    {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5" />}
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => add(item.slug)}
                    disabled={isBusy || bulkBusy !== null}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold disabled:opacity-60"
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
    </div>
  )
}
