'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertOctagon, Loader2, ShieldAlert, CheckCircle2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

type DisputeStatus = 'open' | 'resolved_buyer' | 'resolved_seller' | 'cancelled'
type Existing = {
  id: string
  status: DisputeStatus
  reason: string
  admin_note: string | null
  created_at: string
  resolved_at: string | null
}

interface Props {
  orderId: string
  orderStatus: string
}

const REASONS = [
  { value: 'refund_requested', label: 'I want a refund' },
  { value: 'item_not_received', label: 'Item never arrived' },
  { value: 'item_not_as_described', label: 'Item not as described' },
  { value: 'item_damaged', label: 'Item arrived damaged' },
  { value: 'wrong_item', label: 'I received the wrong item' },
  { value: 'other', label: 'Other' },
]

const STATUS_BADGE: Record<DisputeStatus, { label: string; className: string }> = {
  open: { label: 'Under review', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  resolved_buyer: { label: 'Resolved — refunded', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  resolved_seller: { label: 'Resolved — released to seller', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground' },
}

export function BuyerProblemPanel({ orderId, orderStatus }: Props) {
  const [existing, setExisting] = useState<Existing | null>(null)
  const [checking, setChecking] = useState(true)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0].value)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Eligibility — buyer can only dispute paid/shipped/delivered orders.
  const eligible = ['paid', 'shipped', 'delivered'].includes(orderStatus)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/orders/${orderId}/dispute`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setExisting(d.dispute ?? null) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setChecking(false) })
    return () => { cancelled = true }
  }, [orderId])

  async function submit() {
    if (submitting) return
    if (!details.trim() || details.trim().length < 10) {
      toast.error('Please describe what happened (at least 10 characters).')
      return
    }
    setSubmitting(true)
    try {
      const reasonLabel = REASONS.find(r => r.value === reason)?.label || reason
      const reasonText = `[${reason}] ${reasonLabel}`
      const res = await fetch(`/api/orders/${orderId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reasonText, evidence: details.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not submit')
      setExisting(data.dispute)
      setOpen(false)
      setDetails('')
      toast.success('Submitted. Our team will review within 24 hours.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) return null

  // Already filed — show status card
  if (existing) {
    const badge = STATUS_BADGE[existing.status]
    const isResolved = existing.status !== 'open'
    return (
      <div className="rounded-2xl border border-border bg-card p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isResolved ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
          }`}>
            {isResolved
              ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              : <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm text-foreground">Dispute filed</p>
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {existing.reason.replace(/^\[[^\]]+\]\s*/, '')}
            </p>
            {existing.admin_note && (
              <div className="mt-2 p-2 rounded-lg bg-muted text-[11px] text-foreground">
                <span className="font-bold">Admin note:</span> {existing.admin_note}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-2">
              Filed {new Date(existing.created_at).toLocaleString('en-NG')}
              {existing.resolved_at && ` · Resolved ${new Date(existing.resolved_at).toLocaleString('en-NG')}`}
            </p>
            <Link href="/dashboard/disputes" className="inline-block mt-2 text-[11px] font-bold text-primary hover:underline">
              View all my disputes →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!eligible) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
            <AlertOctagon className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">Something wrong with this order?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Request a refund or open a dispute. Our team reviews within 24h.</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">What's the problem?</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary"
            >
              {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">
              Tell us what happened <span className="text-muted-foreground font-normal">(min 10 chars)</span>
            </label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={4}
              placeholder="Describe the issue. Mention dates, condition, photos you've taken, etc. The more detail, the faster we can resolve."
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground outline-none focus:border-primary resize-none"
              maxLength={1500}
            />
            <p className="text-[10px] text-muted-foreground text-right mt-0.5">{details.length}/1500</p>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-bold">Heads up:</span> Filing a dispute pauses the escrow release. Our team will contact both you and the seller. False claims can affect your buyer trust score.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setOpen(false); setDetails('') }}
              disabled={submitting}
              className="flex-1 h-10 rounded-xl bg-muted text-xs font-bold text-foreground hover:bg-muted/80 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting || !details.trim()}
              className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit dispute
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
