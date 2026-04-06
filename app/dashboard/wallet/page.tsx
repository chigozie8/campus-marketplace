'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wallet, ArrowDownCircle, ArrowUpCircle, Loader2, RefreshCw, Building2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface WalletData {
  id: string
  available: number
  pending: number
  currency: string
}

interface Transaction {
  id: string
  type: 'credit' | 'debit' | 'pending' | 'refund' | 'withdrawal' | 'release'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  description: string
  created_at: string
}

const TYPE_CONFIG: Record<string, { label: string; color: string; sign: string }> = {
  credit:     { label: 'Credit',     color: 'text-green-600',  sign: '+' },
  pending:    { label: 'Pending',    color: 'text-amber-600',  sign: '+' },
  release:    { label: 'Released',   color: 'text-green-600',  sign: '+' },
  debit:      { label: 'Debit',      color: 'text-red-500',    sign: '-' },
  withdrawal: { label: 'Withdrawal', color: 'text-red-500',    sign: '-' },
  refund:     { label: 'Refund',     color: 'text-red-500',    sign: '-' },
}

async function getToken() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [form, setForm] = useState({ amount: '', bank_code: '', account_number: '', account_name: '' })

  async function loadWallet() {
    setLoading(true)
    try {
      const token = await getToken()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const [wRes, tRes] = await Promise.all([
        fetch('/api/backend/wallets/me', { headers }),
        fetch('/api/backend/wallets/transactions?limit=30', { headers }),
      ])
      if (wRes.ok) {
        const wData = await wRes.json()
        setWallet(wData.data)
      }
      if (tRes.ok) {
        const tData = await tRes.json()
        setTransactions(tData.data || [])
      }
    } catch {
      toast.error('Could not load wallet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadWallet() }, [])

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || !form.bank_code || !form.account_number || !form.account_name) {
      toast.error('Fill in all withdrawal fields')
      return
    }
    setWithdrawing(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/backend/wallets/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: Number(form.amount),
          bank_code: form.bank_code,
          account_number: form.account_number,
          account_name: form.account_name,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Withdrawal failed')
      toast.success(`₦${Number(form.amount).toLocaleString()} withdrawal initiated!`)
      setShowWithdrawForm(false)
      setForm({ amount: '', bank_code: '', account_number: '', account_name: '' })
      loadWallet()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed')
    } finally {
      setWithdrawing(false)
    }
  }

  const total = (wallet?.available ?? 0) + (wallet?.pending ?? 0)

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black text-foreground">My Wallet</h1>
            <p className="text-xs text-muted-foreground">Earnings, withdrawals &amp; transactions</p>
          </div>
          <button onClick={loadWallet} className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">

            {/* Balance Card */}
            <div className="bg-gray-950 dark:bg-card text-white rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-4 h-4 text-white/60" />
                  <span className="text-xs text-white/60 font-semibold uppercase tracking-wider">VendoorX Wallet</span>
                </div>
                <p className="text-4xl font-black mb-1">₦{total.toLocaleString()}</p>
                <p className="text-xs text-white/50">Total balance</p>
                <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Available</p>
                    <p className="text-lg font-black text-green-400">₦{(wallet?.available ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-wide">Pending</p>
                    <p className="text-lg font-black text-amber-400">₦{(wallet?.pending ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Pending balance</strong> is held until your buyer confirms delivery. It becomes available after order completion.
                Minimum withdrawal is ₦1,000.
              </p>
            </div>

            {/* Withdraw Button */}
            {!showWithdrawForm ? (
              <button
                onClick={() => setShowWithdrawForm(true)}
                disabled={(wallet?.available ?? 0) < 1000}
                className="w-full h-12 rounded-xl bg-gray-950 dark:bg-primary text-white font-bold text-sm hover:bg-gray-800 dark:hover:bg-primary/90 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
              >
                <Building2 className="w-4 h-4" />
                Withdraw to Bank
              </button>
            ) : (
              <div className="bg-white dark:bg-card rounded-2xl border border-border p-5">
                <h3 className="font-black text-sm mb-4">Withdraw to Bank</h3>
                <form onSubmit={handleWithdraw} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Amount (₦)</label>
                    <input
                      type="number"
                      min="1000"
                      max={wallet?.available}
                      value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder={`Max ₦${(wallet?.available ?? 0).toLocaleString()}`}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Bank Code</label>
                      <input
                        type="text"
                        value={form.bank_code}
                        onChange={e => setForm(p => ({ ...p, bank_code: e.target.value }))}
                        placeholder="e.g. 044 (GT)"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Account No.</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={form.account_number}
                        onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))}
                        placeholder="0123456789"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Account Name</label>
                    <input
                      type="text"
                      value={form.account_name}
                      onChange={e => setForm(p => ({ ...p, account_name: e.target.value }))}
                      placeholder="As on your bank statement"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Bank codes: GTB = 058, Access = 044, Zenith = 057, UBA = 033, First Bank = 011, FCMB = 214, Sterling = 232, Wema = 035
                  </p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowWithdrawForm(false)} className="flex-1 h-10 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={withdrawing} className="flex-1 h-10 rounded-xl bg-gray-950 dark:bg-primary text-white text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                      {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {withdrawing ? 'Processing…' : 'Confirm Withdrawal'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Transactions */}
            <div className="bg-white dark:bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50">
                <h3 className="font-black text-sm">Transaction History</h3>
              </div>
              {transactions.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No transactions yet. Earnings will appear here once buyers pay.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {transactions.map(txn => {
                    const cfg = TYPE_CONFIG[txn.type] || { label: txn.type, color: 'text-foreground', sign: '' }
                    return (
                      <div key={txn.id} className="flex items-start gap-3 p-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          ['credit', 'pending', 'release'].includes(txn.type)
                            ? 'bg-green-100 dark:bg-green-950/30'
                            : 'bg-red-100 dark:bg-red-950/30'
                        }`}>
                          {['credit', 'pending', 'release'].includes(txn.type)
                            ? <ArrowDownCircle className="w-4 h-4 text-green-600" />
                            : <ArrowUpCircle className="w-4 h-4 text-red-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{txn.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(txn.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {txn.status !== 'completed' && (
                              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[9px] font-semibold uppercase">
                                {txn.status}
                              </span>
                            )}
                          </p>
                        </div>
                        <span className={`text-sm font-black flex-shrink-0 ${cfg.color}`}>
                          {cfg.sign}₦{txn.amount.toLocaleString()}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
