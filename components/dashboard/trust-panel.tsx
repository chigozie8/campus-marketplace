'use client'

import { useState, useEffect } from 'react'
import {
  ShieldCheck, ChevronDown, ChevronUp, Loader2, TrendingUp,
} from 'lucide-react'
import {
  TrustBadge, TrustScoreBar, SellerTierBadge,
  getMilestoneBadge, getSellerTier,
} from '@/components/TrustBadge'

type Breakdown = {
  base?: number
  ordersBonus?: number
  noDisputeBonus?: number
  disputeLossPenalty?: number
  disputeWinPenalty?: number
  ageBonus?: number
  ratingBonus?: number
  salesBonus?: number
  verifiedBonus?: number
  sellerDisputePenalty?: number
}

type ScoreData = {
  score: number
  level: string
  breakdown: Breakdown
  totalDisputes?: number
  completedOrders?: number
  totalSales?: number
  rating?: number
}

type TrustData = {
  buyer: ScoreData
  seller: ScoreData | null
}

type Tip = { tip: string; icon: string; key: string }

const BUYER_TIPS: Tip[] = [
  { key: 'orders',     tip: 'Complete more orders without cancelling to earn +2 pts each (up to +20)', icon: '📦' },
  { key: 'noDispute',  tip: 'Never open a false dispute — each lost dispute costs −20 pts', icon: '⚠️' },
  { key: 'age',        tip: 'Keep your account active for 3+ months to earn age bonus (+5 pts)', icon: '📅' },
  { key: 'delivery',   tip: 'Always confirm delivery promptly instead of letting auto-release trigger', icon: '✅' },
  { key: 'milestone',  tip: 'Reach 70 pts to earn the Trusted Buyer badge', icon: '🏅' },
]

const SELLER_TIPS: Tip[] = [
  { key: 'verified',   tip: 'Complete seller verification to earn the verified bonus (+10 pts)', icon: '✅' },
  { key: 'rating',     tip: 'Get reviewed by buyers to boost your rating score (up to +25 pts)', icon: '⭐' },
  { key: 'sales',      tip: 'Make more sales — every 20 confirmed sales adds up to +15 pts', icon: '💰' },
  { key: 'age',        tip: 'Keep your account active for 6+ months for maximum age bonus (+10 pts)', icon: '📅' },
  { key: 'noDispute',  tip: 'Avoid disputes being resolved against you — each costs −10 pts', icon: '⚠️' },
]

/**
 * Reorder tips so the ones the user can act on right now (zero-value
 * breakdown items) appear first. Tips for already-earned bonuses sink to
 * the bottom but stay visible as reminders.
 */
function rankTips(tips: Tip[], breakdown: Breakdown, mode: 'buyer' | 'seller'): Tip[] {
  const earned = (k: string): boolean => {
    if (mode === 'seller') {
      if (k === 'verified') return (breakdown.verifiedBonus ?? 0) > 0
      if (k === 'rating')   return (breakdown.ratingBonus ?? 0) >= 15
      if (k === 'sales')    return (breakdown.salesBonus ?? 0) >= 10
      if (k === 'age')      return (breakdown.ageBonus ?? 0) >= 5
      if (k === 'noDispute')return (breakdown.sellerDisputePenalty ?? 0) === 0
    } else {
      if (k === 'orders')    return (breakdown.ordersBonus ?? 0) >= 10
      if (k === 'noDispute') return (breakdown.disputeLossPenalty ?? 0) === 0 && (breakdown.disputeWinPenalty ?? 0) === 0
      if (k === 'age')       return (breakdown.ageBonus ?? 0) >= 5
    }
    return false
  }
  return [...tips].sort((a, b) => Number(earned(a.key)) - Number(earned(b.key)))
}

const MILESTONES = [
  { score: 70, label: 'Trusted Buyer', emoji: '✅', desc: 'Unlock the Trusted Buyer badge' },
  { score: 85, label: 'Verified Member', emoji: '⭐', desc: 'Earn the Verified Member status' },
  { score: 100, label: 'VendoorX Champion', emoji: '🏆', desc: 'Reach the highest trust level' },
]

interface Props {
  userId: string
  isSeller?: boolean
}

export function DashboardTrustPanel({ userId, isSeller = false }: Props) {
  const [data, setData] = useState<TrustData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTips, setShowTips] = useState(false)
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>(isSeller ? 'seller' : 'buyer')

  useEffect(() => {
    fetch(`/api/trust-score/${userId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading your trust score…</span>
      </div>
    )
  }

  if (!data?.buyer) return null

  const score = activeTab === 'seller' && data.seller ? data.seller : data.buyer
  const breakdown = score.breakdown ?? {}
  const milestone = getMilestoneBadge(score.score)
  const tier = activeTab === 'seller' ? getSellerTier(score.score) : null

  const nextMilestone = MILESTONES.find(m => m.score > score.score)
  const ptsToNext = nextMilestone ? nextMilestone.score - score.score : 0

  const breakdownItems: { label: string; value: number; positive: boolean }[] = activeTab === 'buyer'
    ? [
        { label: 'Base score', value: breakdown.base ?? 60, positive: true },
        { label: 'Completed orders bonus', value: breakdown.ordersBonus ?? 0, positive: true },
        { label: 'No disputes bonus', value: breakdown.noDisputeBonus ?? 0, positive: true },
        { label: 'Account age bonus', value: breakdown.ageBonus ?? 0, positive: true },
        { label: 'Dispute lost penalty', value: breakdown.disputeLossPenalty ?? 0, positive: false },
        { label: 'Dispute opened penalty', value: breakdown.disputeWinPenalty ?? 0, positive: false },
      ].filter(i => i.value !== 0)
    : [
        { label: 'Base score', value: breakdown.base ?? 50, positive: true },
        { label: 'Star rating bonus', value: breakdown.ratingBonus ?? 0, positive: true },
        { label: 'Sales milestone bonus', value: breakdown.salesBonus ?? 0, positive: true },
        { label: 'Verified seller bonus', value: breakdown.verifiedBonus ?? 0, positive: true },
        { label: 'Account age bonus', value: breakdown.ageBonus ?? 0, positive: true },
        { label: 'Dispute lost penalty', value: breakdown.sellerDisputePenalty ?? 0, positive: false },
      ].filter(i => i.value !== 0)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-black text-sm text-foreground">Your Trust Score</span>
          </div>
          {data.seller && (
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {(['buyer', 'seller'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    activeTab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {t === 'buyer' ? 'As Buyer' : 'As Seller'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Score display */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                className={score.score >= 85 ? 'text-emerald-500' : score.score >= 70 ? 'text-blue-500' : score.score >= 50 ? 'text-amber-500' : 'text-red-500'}
                strokeDasharray={`${score.score} 100`}
                strokeLinecap="round"
                stroke="currentColor"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-black text-foreground">{score.score}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <TrustBadge score={score.score} size="sm" showScore={false} />
              {tier && <SellerTierBadge score={score.score} size="sm" />}
            </div>
            {milestone && (
              <p className="text-xs text-foreground font-semibold mb-0.5">
                {milestone.emoji} {milestone.label}
              </p>
            )}
            {nextMilestone && (
              <p className="text-[11px] text-muted-foreground">
                {ptsToNext} pts to <strong>{nextMilestone.label}</strong> {nextMilestone.emoji}
              </p>
            )}
            {!nextMilestone && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                🏆 Maximum level achieved!
              </p>
            )}
          </div>
        </div>

        {/* Score bar */}
        <TrustScoreBar score={score.score} showLabel={false} />

        {/* Milestone track */}
        <div className="flex items-center gap-1 mt-3">
          {MILESTONES.map((m, i) => {
            const reached = score.score >= m.score
            return (
              <div key={m.score} className="flex items-center gap-1 flex-1">
                <div className={`flex flex-col items-center gap-0.5 flex-1`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                    reached
                      ? 'border-primary bg-primary text-white'
                      : 'border-muted bg-muted text-muted-foreground'
                  }`}>
                    {reached ? '✓' : m.score}
                  </div>
                  <span className={`text-[9px] font-semibold ${reached ? 'text-primary' : 'text-muted-foreground'}`}>
                    {m.emoji}
                  </span>
                </div>
                {i < MILESTONES.length - 1 && (
                  <div className={`h-0.5 flex-1 rounded ${score.score >= MILESTONES[i + 1].score ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="border-t border-border px-5 py-4 space-y-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Score breakdown</p>
        <div className="space-y-1.5">
          {breakdownItems.map(item => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={`font-bold font-mono ${
                item.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {item.value > 0 ? '+' : ''}{item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips toggle */}
      <div className="border-t border-border">
        <button
          onClick={() => setShowTips(t => !t)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            How to improve your score
          </span>
          {showTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTips && (
          <div className="px-5 pb-4 space-y-2">
            {rankTips(activeTab === 'seller' ? SELLER_TIPS : BUYER_TIPS, breakdown, activeTab).map((t, i) => (
              <div key={t.key} className={`flex items-start gap-2 text-xs leading-relaxed ${i === 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                <span className="flex-shrink-0 mt-0.5">{t.icon}</span>
                <span>{t.tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
