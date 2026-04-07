'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Users, Gift, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface Badge {
  id: string
  label: string
  emoji: string
  threshold: number
}

interface ReferralData {
  referralCode: string
  referralCount: number
  currentBadge: Badge | null
  nextBadge: Badge | null
  badges: Badge[]
  referrals: { id: string; full_name: string | null; created_at: string }[]
}

export function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null)
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

  const { referralCount, currentBadge, nextBadge, badges } = data
  const progressToNext = nextBadge
    ? Math.min((referralCount / nextBadge.threshold) * 100, 100)
    : 100

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/20 rounded-2xl p-4 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Gift className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-black text-gray-900 dark:text-white">Invite & Earn</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-muted-foreground">
            Invite friends and unlock recognition badges
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-card rounded-xl px-3 py-1.5 border border-primary/20 flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-black text-primary">{referralCount}</span>
          <span className="text-xs text-gray-500 dark:text-muted-foreground">
            {referralCount === 1 ? 'referral' : 'referrals'}
          </span>
        </div>
      </div>

      {/* Badge row */}
      <div className="flex items-center gap-2">
        {badges.map(badge => {
          const earned = referralCount >= badge.threshold
          const isCurrent = currentBadge?.id === badge.id
          return (
            <div
              key={badge.id}
              title={`${badge.label} — ${badge.threshold}+ referrals`}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border transition-all ${
                earned
                  ? isCurrent
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white dark:bg-card border-primary/30 text-primary/70'
                  : 'bg-white/50 dark:bg-card/50 border-gray-100 dark:border-border text-gray-300 dark:text-muted'
              }`}
            >
              <span className={`text-lg ${!earned ? 'grayscale opacity-40' : ''}`}>{badge.emoji}</span>
              <span className="text-[10px] font-bold leading-none">{badge.label}</span>
              <span className="text-[9px] leading-none text-gray-400">{badge.threshold}+</span>
            </div>
          )
        })}
      </div>

      {/* Progress to next badge */}
      {nextBadge && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-gray-500 dark:text-muted-foreground">
              {referralCount}/{nextBadge.threshold} to unlock {nextBadge.emoji} {nextBadge.label}
            </span>
            <span className="text-[11px] font-bold text-primary">{Math.round(progressToNext)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}
      {!nextBadge && currentBadge && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
          <span className="text-xl">{currentBadge.emoji}</span>
          <div>
            <p className="text-xs font-black text-primary">{currentBadge.label} Referrer</p>
            <p className="text-[11px] text-gray-500 dark:text-muted-foreground">Max badge unlocked!</p>
          </div>
        </div>
      )}

      {/* Copy link */}
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

      {/* Recent referrals preview */}
      {data.referrals.length > 0 && (
        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border divide-y divide-gray-50 dark:divide-border overflow-hidden">
          {data.referrals.slice(0, 3).map(r => (
            <div key={r.id} className="flex items-center gap-2 px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-black text-primary">
                  {(r.full_name || '?')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {r.full_name || 'New user'}
                </p>
                <p className="text-[10px] text-gray-400">
                  Joined {new Date(r.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
            </div>
          ))}
          {data.referrals.length > 3 && (
            <div className="px-3 py-2 text-center">
              <span className="text-[11px] text-gray-400">+{data.referrals.length - 3} more referrals</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
