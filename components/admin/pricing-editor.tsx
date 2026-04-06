'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Check, X, Loader2, Zap, Sparkles, Crown, GripVertical, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

interface Feature { text: string; included: boolean }

interface Plan {
  id: string
  name: string
  tagline: string
  monthly_price: number
  annual_price: number
  cta_text: string
  cta_href: string
  is_highlighted: boolean
  badge: string | null
  color: string
  sort_order: number
  is_active: boolean
  features: Feature[]
}

const PLAN_ICONS: Record<string, React.ElementType> = { starter: Zap, growth: Sparkles, pro: Crown }

function planIcon(id: string) {
  const Icon = PLAN_ICONS[id] ?? Zap
  return Icon
}

function PlanCard({ plan, onEdit }: { plan: Plan; onEdit: (p: Plan) => void }) {
  const Icon = planIcon(plan.id)
  return (
    <div className={`rounded-2xl border ${plan.is_highlighted ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'} p-5 flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-foreground">{plan.name}</p>
              {plan.badge && (
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary text-white">
                  {plan.badge}
                </span>
              )}
              {!plan.is_active && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Hidden
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
          </div>
        </div>
        <button
          onClick={() => onEdit(plan)}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all flex-shrink-0"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-muted p-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Monthly</p>
          <p className="font-black text-foreground">{plan.monthly_price === 0 ? 'Free' : `₦${plan.monthly_price.toLocaleString()}`}</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Annual / mo</p>
          <p className="font-black text-foreground">{plan.annual_price === 0 ? 'Free' : `₦${plan.annual_price.toLocaleString()}`}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {plan.features.slice(0, 5).map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {f.included
              ? <Check className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={3} />
              : <X className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" strokeWidth={3} />}
            <span className={f.included ? 'text-foreground/80' : 'text-muted-foreground/40 line-through'}>{f.text}</span>
          </div>
        ))}
        {plan.features.length > 5 && (
          <p className="text-[10px] text-muted-foreground pl-5">+{plan.features.length - 5} more features</p>
        )}
      </div>
    </div>
  )
}

function EditModal({ plan, onClose, onSaved }: { plan: Plan; onClose: () => void; onSaved: (p: Plan) => void }) {
  const [form, setForm] = useState<Plan>({ ...plan })
  const [saving, setSaving] = useState(false)
  const [newFeature, setNewFeature] = useState('')

  function set<K extends keyof Plan>(key: K, value: Plan[K]) {
    setForm(p => ({ ...p, [key]: value }))
  }

  function toggleFeature(idx: number) {
    setForm(p => ({
      ...p,
      features: p.features.map((f, i) => i === idx ? { ...f, included: !f.included } : f),
    }))
  }

  function updateFeatureText(idx: number, text: string) {
    setForm(p => ({
      ...p,
      features: p.features.map((f, i) => i === idx ? { ...f, text } : f),
    }))
  }

  function deleteFeature(idx: number) {
    setForm(p => ({ ...p, features: p.features.filter((_, i) => i !== idx) }))
  }

  function addFeature() {
    if (!newFeature.trim()) return
    setForm(p => ({ ...p, features: [...p.features, { text: newFeature.trim(), included: true }] }))
    setNewFeature('')
  }

  function moveFeature(idx: number, dir: 'up' | 'down') {
    const arr = [...form.features]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    setForm(p => ({ ...p, features: arr }))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      toast.success(`${form.name} plan saved`)
      onSaved(form)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-black text-foreground">Edit {plan.name} Plan</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Plan Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Badge Text</label>
              <input value={form.badge ?? ''} onChange={e => set('badge', e.target.value || null)} placeholder="e.g. Most Popular" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Tagline</label>
            <input value={form.tagline} onChange={e => set('tagline', e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Monthly Price (₦)</label>
              <input type="number" min="0" value={form.monthly_price} onChange={e => set('monthly_price', Number(e.target.value))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Annual Price / mo (₦)</label>
              <input type="number" min="0" value={form.annual_price} onChange={e => set('annual_price', Number(e.target.value))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Button Text</label>
              <input value={form.cta_text} onChange={e => set('cta_text', e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Button Link</label>
              <input value={form.cta_href} onChange={e => set('cta_href', e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <button onClick={() => set('is_highlighted', !form.is_highlighted)} className="flex items-center gap-2 text-sm font-semibold">
              {form.is_highlighted
                ? <ToggleRight className="w-6 h-6 text-primary" />
                : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
              <span className={form.is_highlighted ? 'text-primary' : 'text-muted-foreground'}>Featured / Highlighted</span>
            </button>
            <button onClick={() => set('is_active', !form.is_active)} className="flex items-center gap-2 text-sm font-semibold">
              {form.is_active
                ? <ToggleRight className="w-6 h-6 text-primary" />
                : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
              <span className={form.is_active ? 'text-primary' : 'text-muted-foreground'}>Visible on site</span>
            </button>
          </div>

          {/* Features */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-3">Features</label>
            <div className="space-y-2">
              {form.features.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => moveFeature(idx, 'up')} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors" disabled={idx === 0}>
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveFeature(idx, 'down')} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors" disabled={idx === form.features.length - 1}>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleFeature(idx)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${f.included ? 'bg-primary text-white' : 'bg-muted text-muted-foreground/30 border border-border'}`}
                  >
                    {f.included ? <Check className="w-2.5 h-2.5" strokeWidth={3} /> : <X className="w-2.5 h-2.5" strokeWidth={3} />}
                  </button>
                  <input
                    value={f.text}
                    onChange={e => updateFeatureText(idx, e.target.value)}
                    className={`flex-1 rounded-lg border border-transparent bg-muted px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary/30 focus:bg-background transition-all ${!f.included ? 'text-muted-foreground/50 line-through' : 'text-foreground'}`}
                  />
                  <button
                    onClick={() => deleteFeature(idx)}
                    className="text-muted-foreground/30 hover:text-destructive transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add feature */}
            <div className="flex gap-2 mt-3">
              <input
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addFeature()}
                placeholder="Add a feature…"
                className="flex-1 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-all"
              />
              <button onClick={addFeature} className="px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 rounded-b-2xl">
          <button
            onClick={save}
            disabled={saving}
            className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PricingEditor() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Plan | null>(null)

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then(r => r.json())
      .then(d => setPlans(d.plans ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(updated: Plan) {
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditing(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} onEdit={setEditing} />
        ))}
      </div>

      {plans.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl">
          <GripVertical className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-bold text-muted-foreground">No pricing plans found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">scripts/011_pricing.sql</code> in Supabase to seed pricing plans
          </p>
        </div>
      )}

      {editing && (
        <EditModal
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
