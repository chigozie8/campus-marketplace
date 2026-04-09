'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Wallet, ArrowDownCircle, ArrowUpCircle,
  Loader2, RefreshCw, Building2, AlertCircle, CheckCircle2, Search
} from 'lucide-react'
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

interface Bank { name: string; code: string; slug: string }

const TYPE_CONFIG: Record<string, { label: string; color: string; sign: string }> = {
  credit:     { label: 'Sale credited',   color: 'text-green-600',  sign: '+' },
  pending:    { label: 'Pending',         color: 'text-amber-600',  sign: '+' },
  release:    { label: 'Released',        color: 'text-green-600',  sign: '+' },
  debit:      { label: 'Debit',           color: 'text-red-500',    sign: '-' },
  withdrawal: { label: 'Withdrawal',      color: 'text-red-500',    sign: '-' },
  refund:     { label: 'Refund received', color: 'text-blue-500',   sign: '+' },
}

async function getSessionData() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  const session = await supabase.auth.getSession()
  return {
    token: session.data.session?.access_token ?? null,
    metadata: data.user?.user_metadata ?? {},
  }
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [walletMissing, setWalletMissing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [resolvedName, setResolvedName] = useState('')
  const [showBankList, setShowBankList] = useState(false)
  const [bankSearch, setBankSearch] = useState('')
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [form, setForm] = useState({ amount: '', account_number: '' })

  async function loadAll() {
    setLoading(true)
    try {
      const { token, metadata } = await getSessionData()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

      const [wRes, tRes, bRes] = await Promise.all([
        fetch('/api/backend/wallets/me', { headers }),
        fetch('/api/backend/wallets/transactions?limit=50', { headers }),
        fetch('/api/payouts/banks'),
      ])

      if (wRes.ok) {
        const d = await wRes.json()
        setWallet(d.data)
        setWalletMissing(false)
      } else {
        setWalletMissing(true)
      }

      if (tRes.ok) {
        const d = await tRes.json()
        setTransactions(d.data || [])
      }

      if (bRes.ok) {
        const d = await bRes.json()
        if (d.success) setBanks(d.data)
      }

      if (metadata?.payout_bank_code && metadata?.payout_bank_name) {
        setSelectedBank({ code: metadata.payout_bank_code, name: metadata.payout_bank_name, slug: '' })
      }
      if (metadata?.payout_account_number) {
        setForm(f => ({ ...f, account_number: metadata.payout_account_number }))
      }
    } catch {
      toast.error('Could not load wallet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    if (form.account_number.length === 10 && selectedBank) {
      setResolving(true)
      setResolvedName('')
      fetch(`/api/payouts/verify-account?account_number=${form.account_number}&bank_code=${selectedBank.code}`)
        .then(r => r.json())
        .then(j => { if (j.success) setResolvedName(j.data.account_name) })
        .catch(() => {})
        .finally(() => setResolving(false))
    } else {
      setResolvedName('')
    }
  }, [form.account_number, selectedBank])

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || !selectedBank || !form.account_number || !resolvedName) {
      toast.error('Please select a bank and verify your account number')
      return
    }
    setWithdrawing(true)
    try {
      const { token } = await getSessionData()
      const res = await fetch('/api/backend/wallets/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: Number(form.amount),
          bank_code: selectedBank.code,
          account_number: form.account_number,
          account_name: resolvedName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Withdrawal failed')
      toast.success(`₦${Number(form.amount).toLocaleString()} withdrawal initiated!`)
      setShowWithdrawForm(false)
      setForm(f => ({ ...f, amount: '' }))
      loadAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed')
    } finally {
      setWithdrawing(false)
    }
  }

  const total = (wallet?.available ?? 0) + (wallet?.pending ?? 0)
  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))

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
            <p className="text-xs text-muted-foreground">Earnings, refunds &amp; withdrawals</p>
          </div>
          <Link
            href="/dashboard/wallet/payouts"
            className="px-3 py-1.5 rounded-xl border border-border/60 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            Payout History
          </Link>
          <button onClick={loadAll} className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center hover:bg-muted transition-colors">
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

            {walletMissing && (
              <div className="flex gap-2.5 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  Your wallet will activate automatically when you make your first sale or receive a refund. Nothing to do right now!
                </p>
              </div>
            )}

            {!walletMissing && (
              <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <strong>Pending balance</strong> is held until your buyer confirms delivery. Minimum withdrawal is ₦1,000.
                </p>
              </div>
            )}

            {/* Withdraw Button / Form */}
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
              <div className="bg-white dark:bg-card rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm">Withdraw to Bank</h3>
                  <button onClick={() => setShowWithdrawForm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-3">
                  {/* Amount */}
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

                  {/* Bank selector */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Bank</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowBankList(v => !v)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-background text-sm hover:border-primary/50 transition-colors text-left"
                      >
                        <span className={selectedBank ? 'text-foreground' : 'text-muted-foreground'}>
                          {selectedBank ? selectedBank.name : 'Select your bank…'}
                        </span>
                        <Search className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {showBankList && (
                        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-border">
                            <input
                              autoFocus
                              placeholder="Search bank…"
                              value={bankSearch}
                              onChange={e => setBankSearch(e.target.value)}
                              className="w-full px-3 py-1.5 text-sm bg-muted rounded-lg focus:outline-none"
                            />
                          </div>
                          <div className="max-h-44 overflow-y-auto">
                            {filteredBanks.length === 0 ? (
                              <p className="text-xs text-center text-muted-foreground py-4">No banks found</p>
                            ) : filteredBanks.map((b, i) => (
                              <button
                                key={`${b.code}-${i}`}
                                type="button"
                                onClick={() => { setSelectedBank(b); setShowBankList(false); setBankSearch('') }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                              >
                                {b.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account number */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Account Number</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.account_number}
                      onChange={e => setForm(p => ({ ...p, account_number: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="10-digit NUBAN"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  {/* Resolved name */}
                  {resolving && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying account…
                    </div>
                  )}
                  {resolvedName && !resolving && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-green-800 dark:text-green-400">{resolvedName}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={withdrawing || !resolvedName || !selectedBank || !form.amount}
                      className="flex-1 h-10 rounded-xl bg-gray-950 dark:bg-primary text-white text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {withdrawing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : 'Confirm Withdrawal'}
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
                <div className="py-10 text-center">
                  <Wallet className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Sales, refunds and withdrawals will show here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {transactions.map(txn => {
                    const cfg = TYPE_CONFIG[txn.type] || { label: txn.type, color: 'text-foreground', sign: '' }
                    const isIncoming = ['credit', 'pending', 'release', 'refund'].includes(txn.type)
                    return (
                      <div key={txn.id} className="flex items-start gap-3 p-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isIncoming ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30'
                        }`}>
                          {isIncoming
                            ? <ArrowDownCircle className="w-4 h-4 text-green-600" />
                            : <ArrowUpCircle className="w-4 h-4 text-red-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{txn.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(txn.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
