'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wallet, Loader2, RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle, Banknote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PayoutRequest {
  id: string
  amount: number
  bank_name: string
  account_number: string
  account_name: string
  status: 'pending' | 'paid' | 'failed' | 'rejected'
  reference?: string
  note?: string
  created_at: string
  updated_at: string
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: 'Pending',   icon: Clock,          color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40' },
  paid:    { label: 'Paid',      icon: CheckCircle2,   color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40' },
  failed:  { label: 'Failed',    icon: XCircle,        color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40' },
  rejected:{ label: 'Rejected',  icon: AlertCircle,    color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/40' },
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n)
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    const session = await supabase.auth.getSession()
    const t = session.data.session?.access_token ?? null
    setToken(t)
    if (!t) { setLoading(false); return }

    try {
      const res = await fetch('/api/payouts', {
        headers: { Authorization: `Bearer ${t}` },
      })
      const data = await res.json()
      if (res.ok) {
        setPayouts(data.data ?? data.payouts ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/wallet" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-black text-foreground">Payout History</h1>
            <p className="text-xs text-muted-foreground">All your withdrawal requests</p>
          </div>
          <button onClick={load} disabled={loading} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Paid Out</p>
            <p className="text-lg font-black text-emerald-600">{fmt(totalPaid)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-lg font-black text-amber-600">{fmt(totalPending)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-16">
            <Banknote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-foreground">No payout requests yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your withdrawal history will appear here.
            </p>
            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-primary hover:underline"
            >
              <Wallet className="w-3.5 h-3.5" />
              Go to Wallet
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map(payout => {
              const cfg = STATUS_CONFIG[payout.status] ?? STATUS_CONFIG.pending
              const Icon = cfg.icon
              return (
                <div key={payout.id} className={`rounded-2xl border p-4 ${cfg.bg}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">{fmt(payout.amount)}</p>
                        <p className={`text-[11px] font-bold ${cfg.color}`}>{cfg.label}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(payout.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Bank</p>
                      <p className="text-xs font-medium text-foreground">{payout.bank_name ?? '—'}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Account</p>
                      <p className="text-xs font-medium text-foreground">
                        {payout.account_number ? `****${payout.account_number.slice(-4)}` : '—'}
                      </p>
                    </div>
                    {payout.account_name && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-xs font-medium text-foreground">{payout.account_name}</p>
                      </div>
                    )}
                    {payout.reference && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Reference</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{payout.reference}</p>
                      </div>
                    )}
                    {payout.note && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{payout.note}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
