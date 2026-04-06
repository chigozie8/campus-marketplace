'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  BadgeCheck, Clock, XCircle, CheckCircle, Eye,
  User, Building2, FileImage, Loader2,
} from 'lucide-react'
import Image from 'next/image'

interface Verification {
  id: string
  vendor_id: string
  full_name: string
  business_name: string
  phone_number: string
  location_city: string
  location_state: string
  bank_name: string
  account_number: string
  id_type: string
  id_number: string
  id_image_url: string
  selfie_image_url: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  created_at: string
  profiles?: { full_name: string | null; avatar_url: string | null; phone: string | null } | null
}

const STATUS = {
  pending:  { label: 'Pending',  dot: 'bg-amber-400',  color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  approved: { label: 'Approved', dot: 'bg-emerald-400', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  rejected: { label: 'Rejected', dot: 'bg-red-400',    color: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
}

const ID_LABELS: Record<string, string> = {
  nin: 'NIN', bvn: 'BVN', drivers_license: "Driver's Licence",
  international_passport: 'Int\'l Passport', voters_card: "Voter's Card",
}

export default function VerificationsPage() {
  const [items, setItems]         = useState<Verification[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Verification | null>(null)
  const [filter, setFilter]       = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [acting, setActing]       = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)

  useEffect(() => {
    fetch('/api/admin/verifications')
      .then(r => r.json())
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load verifications')
        else setItems((data as Verification[]) || [])
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load verifications'); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  async function handleAction(action: 'approved' | 'rejected') {
    if (!selected) return
    if (action === 'rejected' && !rejectReason.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }
    setActing(true)
    try {
      const res = await fetch(`/api/admin/verifications/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          ...(action === 'rejected' ? { rejection_reason: rejectReason.trim() } : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Action failed')

      setItems(prev => prev.map(v =>
        v.id === selected.id
          ? { ...v, status: action, rejection_reason: action === 'rejected' ? rejectReason.trim() : null }
          : v
      ))
      setSelected(prev => prev ? { ...prev, status: action } : null)
      toast.success(action === 'approved' ? 'Vendor verified!' : 'Verification rejected')
      setShowRejectBox(false)
      setRejectReason('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActing(false)
    }
  }

  const counts = {
    all: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    approved: items.filter(i => i.status === 'approved').length,
    rejected: items.filter(i => i.status === 'rejected').length,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">Seller Verifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and approve seller identity documents</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{counts.pending} pending</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all capitalize ${
              filter === f ? 'bg-foreground text-background shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* List */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <BadgeCheck className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-foreground">No verifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filter === 'pending' ? 'No pending requests' : `No ${filter} verifications`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(v => {
                const s = STATUS[v.status]
                return (
                  <button
                    key={v.id}
                    onClick={() => { setSelected(v); setShowRejectBox(false); setRejectReason('') }}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 ${selected?.id === v.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {v.profiles?.avatar_url
                        ? <Image src={v.profiles.avatar_url} alt={v.full_name} width={36} height={36} className="w-full h-full object-cover" />
                        : <User className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{v.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{v.business_name}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${s.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-card border border-border rounded-2xl flex items-center justify-center h-64">
              <div className="text-center">
                <Eye className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Select a verification</p>
                <p className="text-xs text-muted-foreground mt-1">Click any request on the left to review it</p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden space-y-0">

              {/* Status bar */}
              <div className={`flex items-center gap-2 px-5 py-3 ${
                selected.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-800' :
                selected.status === 'rejected' ? 'bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800' :
                'bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800'
              }`}>
                {selected.status === 'approved' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                 selected.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> :
                 <Clock className="w-4 h-4 text-amber-600" />}
                <span className={`text-xs font-bold ${
                  selected.status === 'approved' ? 'text-emerald-700 dark:text-emerald-400' :
                  selected.status === 'rejected' ? 'text-red-600 dark:text-red-400' :
                  'text-amber-700 dark:text-amber-400'
                }`}>
                  {selected.status === 'approved' ? 'Approved — Vendor is verified' :
                   selected.status === 'rejected' ? `Rejected${selected.rejection_reason ? `: ${selected.rejection_reason}` : ''}` :
                   'Pending review'}
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* Personal info */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Personal Info
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Full Name',    value: selected.full_name },
                      { label: 'Phone',        value: selected.phone_number },
                      { label: 'City',         value: selected.location_city },
                      { label: 'State',        value: selected.location_state },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/40 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> Business & Bank
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Business Name',   value: selected.business_name },
                      { label: 'Bank',            value: selected.bank_name },
                      { label: 'Account Number',  value: selected.account_number },
                      { label: 'ID Type',         value: ID_LABELS[selected.id_type] || selected.id_type },
                      { label: 'ID Number',       value: selected.id_number },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/40 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <FileImage className="w-3 h-3" /> Documents
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">ID Photo</p>
                      <a href={selected.id_image_url} target="_blank" rel="noopener noreferrer">
                        <img src={selected.id_image_url} alt="ID" className="w-full h-36 object-cover rounded-xl border border-border hover:opacity-80 transition-opacity" />
                      </a>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Selfie with ID</p>
                      <a href={selected.selfie_image_url} target="_blank" rel="noopener noreferrer">
                        <img src={selected.selfie_image_url} alt="Selfie" className="w-full h-36 object-cover rounded-xl border border-border hover:opacity-80 transition-opacity" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions — only for pending */}
                {selected.status === 'pending' && (
                  <div className="pt-2 border-t border-border space-y-3">
                    {showRejectBox ? (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-foreground">Rejection reason</p>
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Explain why this verification was rejected…"
                          rows={3}
                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setShowRejectBox(false)} className="flex-1 py-2.5 text-sm font-bold text-muted-foreground bg-muted rounded-xl hover:bg-muted/60 transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAction('rejected')}
                            disabled={acting || !rejectReason.trim()}
                            className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowRejectBox(true)}
                          className="flex-1 py-2.5 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors border border-red-200 dark:border-red-800"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction('approved')}
                          disabled={acting}
                          className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                          {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
                          Approve &amp; Verify
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
