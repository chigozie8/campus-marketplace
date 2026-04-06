'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  BadgeCheck, Clock, XCircle, CheckCircle, Eye,
  User, Building2, FileImage, Loader2, ScanFace,
  ShieldCheck, ShieldAlert, ShieldX, AlertCircle, ZoomIn,
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

interface FaceMatchResult {
  confidence: number
  label: 'strong_match' | 'likely_match' | 'low_confidence' | 'no_match'
  error?: string
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

const FACE_LABEL: Record<FaceMatchResult['label'], { text: string; sub: string; icon: typeof ShieldCheck; bar: string; badge: string }> = {
  strong_match:   { text: 'Strong Match',    sub: 'Face highly likely the same person',    icon: ShieldCheck, bar: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  likely_match:   { text: 'Likely Match',    sub: 'Face probably the same person',         icon: ShieldAlert, bar: 'bg-amber-400',   badge: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  low_confidence: { text: 'Low Confidence',  sub: 'Uncertain — review manually',           icon: ShieldAlert, bar: 'bg-orange-400',  badge: 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  no_match:       { text: 'No Match',        sub: 'Faces appear to be different people',   icon: ShieldX,     bar: 'bg-red-500',    badge: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
}

export default function VerificationsPage() {
  const [items, setItems]         = useState<Verification[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Verification | null>(null)
  const [filter, setFilter]       = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [acting, setActing]       = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)

  const [faceResult, setFaceResult]   = useState<FaceMatchResult | null>(null)
  const [faceLoading, setFaceLoading] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

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

  function selectVerification(v: Verification) {
    setSelected(v)
    setShowRejectBox(false)
    setRejectReason('')
    setFaceResult(null)
  }

  async function runFaceMatch() {
    if (!selected) return
    setFaceLoading(true)
    setFaceResult(null)
    try {
      const res = await fetch(`/api/admin/verifications/${selected.id}/face-match`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Face match failed')
      } else {
        setFaceResult(json)
      }
    } catch {
      toast.error('Face match request failed')
    } finally {
      setFaceLoading(false)
    }
  }

  async function handleAction(action: 'approved' | 'rejected') {
    if (!selected) return
    setActing(true)
    try {
      const res = await fetch(`/api/admin/verifications/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          rejection_reason: action === 'rejected' ? rejectReason : null,
          vendor_id: selected.vendor_id,
          full_name: selected.full_name,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(action === 'approved' ? 'Vendor approved!' : 'Verification rejected')
      setItems(prev => prev.map(v => v.id === selected.id ? { ...v, status: action, rejection_reason: rejectReason || null } : v))
      setSelected(prev => prev ? { ...prev, status: action, rejection_reason: rejectReason || null } : null)
      setShowRejectBox(false)
    } catch {
      toast.error('Action failed — please try again')
    } finally {
      setActing(false)
    }
  }

  const filtered = filter === 'all' ? items : items.filter(v => v.status === filter)
  const counts = {
    all: items.length,
    pending: items.filter(v => v.status === 'pending').length,
    approved: items.filter(v => v.status === 'approved').length,
    rejected: items.filter(v => v.status === 'rejected').length,
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Seller Verifications</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and action ID verification requests from sellers
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === f
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {f !== 'all' && (
              <span className={`w-1.5 h-1.5 rounded-full ${
                f === 'pending' ? 'bg-amber-400' : f === 'approved' ? 'bg-emerald-400' : 'bg-red-400'
              }`} />
            )}
            {f} <span className="opacity-60">({counts[f]})</span>
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
                    onClick={() => selectVerification(v)}
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
            <div className="bg-card border border-border rounded-2xl overflow-hidden">

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
                      { label: 'Full Name', value: selected.full_name },
                      { label: 'Phone',     value: selected.phone_number },
                      { label: 'City',      value: selected.location_city },
                      { label: 'State',     value: selected.location_state },
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
                      { label: 'Business Name',  value: selected.business_name },
                      { label: 'Bank',           value: selected.bank_name },
                      { label: 'Account Number', value: selected.account_number },
                      { label: 'ID Type',        value: ID_LABELS[selected.id_type] || selected.id_type },
                      { label: 'ID Number',      value: selected.id_number },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/40 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents + Face Match */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <FileImage className="w-3 h-3" /> Documents
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* ID Photo */}
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">ID Photo (Front)</p>
                      {selected.id_image_url ? (
                        <div className="relative group cursor-pointer" onClick={() => setLightboxUrl(selected.id_image_url)}>
                          <img src={selected.id_image_url} alt="ID" className="w-full h-36 object-cover rounded-xl border border-border" />
                          <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-36 rounded-xl border border-dashed border-border bg-muted/40 flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">No ID photo</p>
                        </div>
                      )}
                    </div>

                    {/* Selfie */}
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Selfie</p>
                      {selected.selfie_image_url ? (
                        <div className="relative group cursor-pointer" onClick={() => setLightboxUrl(selected.selfie_image_url)}>
                          <img src={selected.selfie_image_url} alt="Selfie" className="w-full h-36 object-cover rounded-xl border border-border" />
                          <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-36 rounded-xl border border-dashed border-border bg-muted/40 flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">No selfie</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Face Match Card */}
                  <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <ScanFace className="w-4 h-4 text-primary" />
                        <p className="text-xs font-black text-foreground uppercase tracking-wide">AI Face Match</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">Powered by Face++</span>
                      </div>
                      {(!selected.id_image_url || !selected.selfie_image_url) && (
                        <span className="text-[10px] text-muted-foreground">Need both images</span>
                      )}
                    </div>

                    <div className="p-4">
                      {faceResult ? (
                        <FaceMatchDisplay result={faceResult} onRerun={runFaceMatch} loading={faceLoading} />
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-2">
                          <p className="text-xs text-muted-foreground text-center">
                            Automatically compare the selfie against the ID photo using AI face recognition.
                          </p>
                          <button
                            onClick={runFaceMatch}
                            disabled={faceLoading || !selected.id_image_url || !selected.selfie_image_url}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {faceLoading
                              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
                              : <><ScanFace className="w-4 h-4" /> Run Face Match</>
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
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

      {/* Image lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Document"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function FaceMatchDisplay({
  result, onRerun, loading,
}: {
  result: FaceMatchResult
  onRerun: () => void
  loading: boolean
}) {
  if (result.error) {
    return (
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Could not analyse</p>
          <p className="text-xs text-muted-foreground mt-0.5">{result.error}</p>
        </div>
        <button
          onClick={onRerun}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-background border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScanFace className="w-3 h-3" />}
          Retry
        </button>
      </div>
    )
  }

  const info   = FACE_LABEL[result.label]
  const Icon   = info.icon
  const pct    = Math.round(result.confidence)
  const width  = `${Math.min(100, pct)}%`

  return (
    <div className="space-y-3">
      {/* Score row */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${info.badge}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-black text-foreground">{info.text}</p>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${info.badge}`}>
              {pct}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${info.bar}`}
              style={{ width }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{info.sub}</p>
        </div>
      </div>

      {/* Guidance */}
      <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs ${info.badge}`}>
        <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p className="font-medium leading-relaxed">
          {result.label === 'strong_match'
            ? 'Face recognition is highly confident this is the same person. Safe to approve if other details check out.'
            : result.label === 'likely_match'
            ? 'Face recognition suggests this is likely the same person. Double-check the ID photo quality before approving.'
            : result.label === 'low_confidence'
            ? 'Result is inconclusive. The image quality may be poor or the face is partially visible. Review carefully.'
            : 'The faces appear to be different people. This verification should be rejected unless there is a clear explanation.'
          }
        </p>
      </div>

      <button
        onClick={onRerun}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScanFace className="w-3 h-3" />}
        Run again
      </button>
    </div>
  )
}
