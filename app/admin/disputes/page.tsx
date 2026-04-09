'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Shield, RefreshCw, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

interface Dispute {
  id: string
  order_id: string
  reason: string
  evidence: string | null
  amount: number
  status: 'open' | 'resolved_buyer' | 'resolved_seller' | 'cancelled'
  admin_note: string | null
  created_at: string
  resolved_at: string | null
  buyer?: { id: string; full_name: string }
  seller?: { id: string; full_name: string }
  orders?: { total_amount: number; status: string; delivery_address: string }
}

const STATUS_META = {
  open:             { label: 'Open',              color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  resolved_buyer:   { label: 'Resolved → Buyer',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
  resolved_seller:  { label: 'Resolved → Seller', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  cancelled:        { label: 'Cancelled',          color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
}

function DisputeCard({ dispute, onResolved }: { dispute: Dispute; onResolved: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  const [resolving, setResolving] = useState<'resolved_buyer' | 'resolved_seller' | null>(null)

  async function resolve(resolution: 'resolved_buyer' | 'resolved_seller') {
    setResolving(resolution)
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dispute.id, resolution, admin_note: note.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Resolution failed')
      toast.success(resolution === 'resolved_seller' ? 'Funds released to seller.' : 'Refund processed for buyer.')
      onResolved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve')
    } finally {
      setResolving(null)
    }
  }

  const meta = STATUS_META[dispute.status]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-4 flex items-start gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
            <span className="text-xs text-muted-foreground font-mono">#{dispute.order_id.split('-')[0]}</span>
            <span className="text-xs text-muted-foreground">{new Date(dispute.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <p className="text-sm font-semibold text-foreground line-clamp-1">{dispute.reason}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Buyer: <strong>{dispute.buyer?.full_name ?? '—'}</strong>
            {' · '}Seller: <strong>{dispute.seller?.full_name ?? '—'}</strong>
            {' · '}₦{dispute.amount?.toLocaleString()}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-muted-foreground mb-0.5 font-medium">Buyer</p>
              <p className="font-semibold">{dispute.buyer?.full_name ?? '—'}</p>
              <p className="text-muted-foreground font-mono text-[10px]">{dispute.buyer?.id?.slice(0, 8)}…</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-muted-foreground mb-0.5 font-medium">Seller</p>
              <p className="font-semibold">{dispute.seller?.full_name ?? '—'}</p>
              <p className="text-muted-foreground font-mono text-[10px]">{dispute.seller?.id?.slice(0, 8)}…</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 sm:col-span-2">
              <p className="text-muted-foreground mb-1 font-medium">Dispute Reason</p>
              <p className="text-foreground leading-relaxed">{dispute.reason}</p>
            </div>
            {dispute.evidence && (
              <div className="p-3 rounded-xl bg-muted/50 sm:col-span-2">
                <p className="text-muted-foreground mb-1 font-medium">Buyer Evidence</p>
                <p className="text-foreground leading-relaxed">{dispute.evidence}</p>
              </div>
            )}
            {dispute.orders?.delivery_address && (
              <div className="p-3 rounded-xl bg-muted/50 sm:col-span-2">
                <p className="text-muted-foreground mb-0.5 font-medium">Delivery Address</p>
                <p className="text-foreground">{dispute.orders.delivery_address}</p>
              </div>
            )}
          </div>

          {dispute.status === 'open' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Admin Note (optional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  placeholder="Add a note explaining the resolution…"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => resolve('resolved_seller')}
                  disabled={!!resolving}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                >
                  {resolving === 'resolved_seller' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Release to Seller
                </button>
                <button
                  onClick={() => resolve('resolved_buyer')}
                  disabled={!!resolving}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                >
                  {resolving === 'resolved_buyer' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Refund Buyer
                </button>
              </div>
            </div>
          )}

          {dispute.status !== 'open' && (
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-0.5">Resolution Note</p>
              <p className="text-xs text-foreground">{dispute.admin_note || '(No note added)'}</p>
              {dispute.resolved_at && (
                <p className="text-[11px] text-muted-foreground mt-1">Resolved: {new Date(dispute.resolved_at).toLocaleString('en-NG')}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const FILTERS = ['open', 'resolved_buyer', 'resolved_seller', 'cancelled', 'all'] as const
type Filter = typeof FILTERS[number]
const FILTER_LABELS: Record<Filter, string> = {
  open: 'Open',
  resolved_buyer: 'Buyer Won',
  resolved_seller: 'Seller Won',
  cancelled: 'Cancelled',
  all: 'All',
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [filter, setFilter] = useState<Filter>('open')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/disputes?status=${filter}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setDisputes(data.disputes ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">Dispute Management</h1>
              <p className="text-xs text-muted-foreground">Mediate buyer–seller escrow disputes</p>
            </div>
          </div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-3">{error}</p>
            <button onClick={load} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">Retry</button>
          </div>
        )}

        {!loading && !error && disputes.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">No {filter !== 'all' ? filter.replace('_', ' ') : ''} disputes</p>
            <p className="text-xs text-muted-foreground">Disputes opened by buyers will appear here.</p>
          </div>
        )}

        <div className="space-y-3">
          {disputes.map(d => (
            <DisputeCard key={d.id} dispute={d} onResolved={load} />
          ))}
        </div>
      </div>
    </div>
  )
}
