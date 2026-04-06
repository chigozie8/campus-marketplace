'use client'

import { useState, useEffect } from 'react'
import { Banknote, CheckCircle2, Loader2, ChevronDown, Search, ExternalLink, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface Bank {
  name: string
  code: string
  slug: string
}

interface PayoutSetupCardProps {
  hasSubaccount: boolean
  accountName?: string
  savedBankCode?: string
  savedBankName?: string
  savedAccountNumber?: string
}

export function PayoutSetupCard({
  hasSubaccount: initialHasSubaccount,
  accountName,
  savedBankCode,
  savedBankName,
  savedAccountNumber,
}: PayoutSetupCardProps) {
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankSearch, setBankSearch] = useState('')
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [showBankList, setShowBankList] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(initialHasSubaccount)
  const [doneAccountName, setDoneAccountName] = useState(accountName || '')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetch('/api/payouts/banks')
      .then(r => r.json())
      .then(j => { if (j.success) setBanks(j.data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      setResolving(true)
      setResolvedName('')
      fetch(`/api/payouts/verify-account?account_number=${accountNumber}&bank_code=${selectedBank.code}`)
        .then(r => r.json())
        .then(j => {
          if (j.success) setResolvedName(j.data.account_name)
          else toast.error('Could not verify account number. Please check and try again.')
        })
        .catch(() => toast.error('Could not verify account number.'))
        .finally(() => setResolving(false))
    } else {
      setResolvedName('')
    }
  }, [accountNumber, selectedBank])

  function startEditing() {
    setEditing(true)
    setAccountNumber(savedAccountNumber || '')
    if (savedBankCode && savedBankName) {
      setSelectedBank({ name: savedBankName, code: savedBankCode, slug: '' })
    }
  }

  async function handleSave() {
    if (!selectedBank || !resolvedName) {
      toast.error('Please select a bank and verify your account number first.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/payouts/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          accountNumber,
          businessName: resolvedName,
        }),
      })
      const j = await res.json()
      if (!res.ok || !j.success) throw new Error(j.message || 'Setup failed')
      setDone(true)
      setEditing(false)
      setDoneAccountName(resolvedName)
      toast.success(editing ? 'Payout account updated!' : 'Payout account linked! You\'ll receive payments directly.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Setup failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const filteredBanks = banks.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  )

  if (done && !editing) {
    return (
      <div className="rounded-2xl border border-green-100 bg-green-50 dark:bg-green-950/20 dark:border-green-900/30 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-green-800 dark:text-green-400 text-sm">Payouts Enabled</p>
            <p className="text-xs text-green-700 dark:text-green-500 mt-0.5 truncate">
              {doneAccountName
                ? `${doneAccountName}${savedBankName ? ` · ${savedBankName}` : ''}${savedAccountNumber ? ` · ****${savedAccountNumber.slice(-4)}` : ''}`
                : 'Your bank account is linked.'}
            </p>
            <p className="text-xs text-green-600 dark:text-green-500/70 mt-1">
              You receive the full sale price minus a ₦100 platform fee per transaction.
            </p>
          </div>
          <button
            onClick={startEditing}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors shrink-0 ml-2"
          >
            <Pencil className="w-3.5 h-3.5" />
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Banknote className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">{editing ? 'Update Payout Account' : 'Set Up Payouts'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {editing
              ? 'Enter your new bank details below. Your account will be re-verified.'
              : 'Link your bank account to receive payments directly when a buyer checks out. We deduct a flat ₦100 platform fee per sale.'}
          </p>
        </div>
        {editing && (
          <button
            onClick={() => { setEditing(false); setAccountNumber(''); setResolvedName(''); setSelectedBank(null) }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Bank selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bank</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBankList(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-background text-sm hover:border-primary/50 transition-colors"
          >
            <span className={selectedBank ? 'text-foreground' : 'text-muted-foreground'}>
              {selectedBank ? selectedBank.name : 'Select your bank…'}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {showBankList && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    autoFocus
                    placeholder="Search bank…"
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted rounded-lg focus:outline-none"
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredBanks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No banks found</p>
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
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account Number</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit NUBAN"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Resolved account name */}
      {resolving && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Verifying account…
        </div>
      )}
      {resolvedName && !resolving && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-green-800 dark:text-green-400">{resolvedName}</span>
        </div>
      )}

      {/* Fee note */}
      <p className="text-[11px] text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
        Each sale: buyer pays full price → ₦100 goes to VendoorX → rest goes directly to your account via Paystack.
      </p>

      <button
        onClick={handleSave}
        disabled={saving || !resolvedName || !selectedBank}
        className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving
          ? <><Loader2 className="w-4 h-4 animate-spin" /> {editing ? 'Updating…' : 'Setting up…'}</>
          : editing ? 'Update Account' : 'Enable Payouts'}
      </button>

      <a
        href="https://paystack.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Powered by Paystack — bank-grade security
      </a>
    </div>
  )
}
