'use client'

import { useEffect, useState } from 'react'
import {
  Zap, Plus, Loader2, AlertCircle, ToggleLeft, ToggleRight,
  Trash2, X, Check, RefreshCw, Package, Clock,
} from 'lucide-react'

type FlashSale = {
  id: string
  product_id: string
  sale_price: number
  start_at: string
  end_at: string
  is_active: boolean
  created_at: string
  products: {
    id: string
    title: string
    price: number
    images: string[]
  } | null
}

const EMPTY_FORM = {
  product_id: '',
  sale_price: '',
  start_at: '',
  end_at: '',
}

function countdown(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now()
  if (diff <= 0) return 'Ended'
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h left`
  return `${h}h ${m}m left`
}

function isLive(sale: FlashSale) {
  const now = new Date()
  return sale.is_active && new Date(sale.start_at) <= now && new Date(sale.end_at) > now
}

export default function FlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [setupNeeded, setSetupNeeded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  async function load() {
    setLoading(true)
    setError('')
    setSetupNeeded(false)
    const res = await fetch('/api/admin/flash-sales')
    if (!res.ok) { setError('Failed to load flash sales'); setLoading(false); return }
    const json = await res.json()
    if (json.setup_needed) setSetupNeeded(true)
    setSales(json.sales ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.product_id || !form.sale_price || !form.start_at || !form.end_at) {
      setFormError('All fields are required')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/admin/flash-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        sale_price: Number(form.sale_price),
        start_at: new Date(form.start_at).toISOString(),
        end_at: new Date(form.end_at).toISOString(),
      }),
    })
    const json = await res.json()
    if (!res.ok) { setFormError(json.error ?? 'Failed to create'); setSubmitting(false); return }
    setSales(prev => [json.sale, ...prev])
    setShowForm(false)
    setForm(EMPTY_FORM)
    setSubmitting(false)
  }

  async function toggleActive(sale: FlashSale) {
    setTogglingId(sale.id)
    const res = await fetch(`/api/admin/flash-sales/${sale.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !sale.is_active }),
    })
    if (res.ok) {
      const { sale: updated } = await res.json()
      setSales(prev => prev.map(s => s.id === sale.id ? updated : s))
    }
    setTogglingId(null)
  }

  async function deleteSale(id: string) {
    if (!confirm('Remove this flash sale?')) return
    setDeletingId(id)
    await fetch(`/api/admin/flash-sales/${id}`, { method: 'DELETE' })
    setSales(prev => prev.filter(s => s.id !== id))
    setDeletingId(null)
  }

  const liveSales = sales.filter(isLive).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Flash Sales
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{sales.length} total · {liveSales} live right now</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl hover:bg-muted transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Flash Sale
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-foreground text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Schedule Flash Sale
            </p>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">Wishlist users will be notified automatically when a flash sale is created.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Product ID *</label>
              <input
                value={form.product_id}
                onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                placeholder="Paste product UUID"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-[10px] text-muted-foreground">Find the product ID from the admin listings page</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Sale Price (₦) *</label>
              <input
                type="number"
                min={1}
                value={form.sale_price}
                onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))}
                placeholder="Must be less than original price"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Start Date &amp; Time *</label>
              <input
                type="datetime-local"
                value={form.start_at}
                onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">End Date &amp; Time *</label>
              <input
                type="datetime-local"
                value={form.end_at}
                onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{formError}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {submitting ? 'Creating…' : 'Launch Flash Sale'}
            </button>
          </div>
        </form>
      )}

      {setupNeeded && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-2">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> One-time database setup required
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-500">
            The <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">flash_sales</code> table doesn&apos;t exist in your Supabase database yet.
            Go to your <strong>Supabase dashboard → SQL Editor</strong> and run the following:
          </p>
          <pre className="text-[11px] bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 overflow-x-auto text-amber-900 dark:text-amber-300 select-all whitespace-pre-wrap">{`CREATE TABLE IF NOT EXISTS flash_sales (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE,
  sale_price NUMERIC(12,2) NOT NULL,
  start_at   TIMESTAMPTZ NOT NULL,
  end_at     TIMESTAMPTZ NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS flash_sales_product_idx ON flash_sales (product_id);
CREATE INDEX IF NOT EXISTS flash_sales_active_idx  ON flash_sales (is_active, end_at);`}</pre>
          <p className="text-xs text-amber-700 dark:text-amber-500">After running it, refresh this page.</p>
        </div>
      )}

      {loading && <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {sales.length === 0 && (
            <div className="py-16 text-center">
              <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-bold text-muted-foreground">No flash sales yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create one to drive urgency on any product</p>
            </div>
          )}
          {sales.map(sale => {
            const live = isLive(sale)
            const upcoming = sale.is_active && new Date(sale.start_at) > new Date()
            const p = sale.products
            const image = p?.images?.[0]
            const discount = p ? Math.round(((Number(p.price) - Number(sale.sale_price)) / Number(p.price)) * 100) : 0

            return (
              <div key={sale.id} className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                live ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/10 dark:border-yellow-800' :
                upcoming ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-800' :
                'border-border bg-card'
              }`}>
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  {image ? (
                    <img src={image} alt={p?.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground text-sm">{p?.title ?? sale.product_id}</p>
                    {live && (
                      <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 border border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                    {upcoming && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 px-1.5 py-0.5 rounded-full">
                        Upcoming
                      </span>
                    )}
                    {!sale.is_active && (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-full">Paused</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-black text-foreground">₦{Number(sale.sale_price).toLocaleString()}</span>
                    {p && <span className="text-muted-foreground line-through text-xs">₦{Number(p.price).toLocaleString()}</span>}
                    {discount > 0 && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 px-1.5 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {live ? countdown(sale.end_at) : `${new Date(sale.start_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} → ${new Date(sale.end_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(sale)}
                    disabled={togglingId === sale.id}
                    title={sale.is_active ? 'Pause' : 'Activate'}
                  >
                    {togglingId === sale.id ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : sale.is_active ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                  </button>
                  <button
                    onClick={() => deleteSale(sale.id)}
                    disabled={deletingId === sale.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    {deletingId === sale.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
