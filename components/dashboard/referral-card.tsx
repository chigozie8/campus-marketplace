'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Users, Gift } from 'lucide-react'
import { toast } from 'sonner'

export function ReferralCard() {
  const [data, setData] = useState<{ referralCode: string; referralCount: number } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(d => { if (d.referralCode) setData(d) })
      .catch(() => {})
  }, [])

  async function handleCopy() {
    if (!data) return
    const url = `${window.location.origin}/auth/sign-up?ref=${data.referralCode}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  if (!data) return null

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/20 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Gift className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-black text-gray-900 dark:text-white">Invite & Earn</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-muted-foreground">
            Share your link and grow your campus network
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-card rounded-xl px-3 py-1.5 border border-primary/20 flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-black text-primary">{data.referralCount}</span>
          <span className="text-xs text-gray-500">{data.referralCount === 1 ? 'referral' : 'referrals'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 bg-white dark:bg-card rounded-xl px-3 py-2 border border-gray-200 dark:border-border">
          <p className="text-xs text-gray-400 mb-0.5">Your referral code</p>
          <p className="text-sm font-black text-gray-900 dark:text-white tracking-widest">{data.referralCode}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:scale-95"
          aria-label="Copy referral link"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
