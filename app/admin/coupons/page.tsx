'use client'

import { useEffect, useState } from 'react'
import {
  Tag, Plus, Loader2, AlertCircle, ToggleLeft, ToggleRight,
  Trash2, X, Check, RefreshCw, Percent, Banknote,
} from 'lucide-react'

type Coupon = {
  id: string
  code: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order: number
  max_uses: number | null
  uses_count: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  created_at: string
}

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'percent' as 'percent' | 'fixed',
  discount_value: '',
  min_order: '',
  max_uses: '',
  valid_from: '',
  valid_until: '',
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/coupons')
    if (!res.ok) { setError('Failed to load coupons'); setLoading(false); return }
    const { coupons: data } = await res.json()
    setCoupons(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.code || !form.discount_value) { setFormError('Code and discount value are required'); return }
    setSubmitting(true)
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        discount_value: Number(form.discount_value),
        min_order: form.min_order ? Number(form.min_order) : 0,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setFormError(json.error ?? 'Failed to create'); setSubmitting(false); return }
    setCoupons(prev => [json.coupon, ...prev])
    setShowForm(false)
    setForm(EMPTY_FORM)
    setSubmitting(false)
  }

  async function toggleActive(coupon: Coupon) {
    setTogglingId(coupon.id)
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    })
    if (res.ok) {
      const { coupon: updated } = await res.json()
      setCoupons(prev => prev.map(c => c.id === coupon.id ? updated : c))
    }
    setTogglingId(null)
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Delete this coupon?')) return
    setDeletingId(id)
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    setCoupons(prev => prev.filter(c => c.id !== id))
    setDeletingId(null)
  }

  const activeCoupons = coupons.filter(c => c.is_active).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">Coupon Codes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{coupons.length} total · {activeCoupons} active</p>
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
            New Coupon
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-foreground text-sm">Create Coupon Code</p>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Code *</label>
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. WELCOME20"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Welcome discount for new buyers"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Discount Type *</label>
              <select
                value={form.discount_type}
                onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none"
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₦)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Discount Value * {form.discount_type === 'percent' ? '(%)' : '(₦)'}
              </label>
              <input
                type="number"
                min={1}
                max={form.discount_type === 'percent' ? 100 : undefined}
                value={form.discount_value}
                onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                placeholder={form.discount_type === 'percent' ? '20' : '500'}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Min. Order (₦)</label>
              <input
                type="number"
                min={0}
                value={form.min_order}
                onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                placeholder="0 = no minimum"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Max Uses</label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                placeholder="Leave blank = unlimited"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Valid From</label>
              <input
                type="datetime-local"
                value={form.valid_from}
                onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Valid Until</label>
              <input
                type="datetime-local"
                value={form.valid_until}
                onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
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
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? 'Creating…' : 'Create Coupon'}
            </button>
          </div>
        </form>
      )}

      {loading && <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Code</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Discount</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Min Order</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Uses</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Expires</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">No coupon codes yet.</td></tr>
                )}
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono font-black text-foreground text-sm">{c.code}</p>
                        {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${
                        c.discount_type === 'percent'
                          ? 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                      }`}>
                        {c.discount_type === 'percent' ? <Percent className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                        {c.discount_type === 'percent' ? `${c.discount_value}%` : `₦${Number(c.discount_value).toLocaleString()}`} off
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {Number(c.min_order) > 0 ? `₦${Number(c.min_order).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-bold text-foreground">{c.uses_count}</span>
                      {c.max_uses && <span className="text-muted-foreground"> / {c.max_uses}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(c)}
                        disabled={togglingId === c.id}
                        className="flex items-center gap-1.5 text-xs font-bold transition-colors"
                      >
                        {togglingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : c.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                        <span className={c.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
        <p className="text-sm font-bold text-foreground flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> How Coupons Work</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Buyers enter the code at checkout to apply the discount</li>
          <li>Percentage coupons deduct a % from the order total</li>
          <li>Fixed coupons deduct a flat ₦ amount from the order total</li>
          <li>Set a minimum order to control which orders qualify</li>
          <li>Max uses prevents over-redemption — leave blank for unlimited</li>
        </ul>
      </div>
    </div>
  )
}
