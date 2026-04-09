'use client'

import { useEffect, useState } from 'react'
import { Gift, Star, ArrowDownRight, ArrowUpRight, Loader2, Trophy, Zap } from 'lucide-react'

type Transaction = {
  id: string
  points: number
  type: 'earn' | 'redeem' | 'expire' | 'admin_adjust'
  description: string | null
  order_id: string | null
  created_at: string
}

const TIERS = [
  { name: 'Bronze',   minPoints: 0,    color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400', icon: '🥉' },
  { name: 'Silver',   minPoints: 500,  color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300', icon: '🥈' },
  { name: 'Gold',     minPoints: 2000, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400', icon: '🥇' },
  { name: 'Platinum', minPoints: 5000, color: 'text-violet-700 bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400', icon: '💎' },
]

function getTier(points: number) {
  return [...TIERS].reverse().find(t => points >= t.minPoints) ?? TIERS[0]
}

function getNextTier(points: number) {
  return TIERS.find(t => t.minPoints > points) ?? null
}

export default function LoyaltyPage() {
  const [points, setPoints] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/loyalty')
      .then(r => r.json())
      .then(d => {
        setPoints(d.points ?? 0)
        setTransactions(d.transactions ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const tier = getTier(points)
  const nextTier = getNextTier(points)
  const progress = nextTier
    ? Math.min(100, Math.round(((points - getTier(points).minPoints) / (nextTier.minPoints - getTier(points).minPoints)) * 100))
    : 100

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Gift className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-lg font-black text-foreground">Loyalty Points</h1>
          <p className="text-sm text-muted-foreground">Earn 1 point for every ₦100 spent</p>
        </div>
      </div>

      {/* Points card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-80">Total Points</p>
            <p className="text-4xl font-black mt-1">{points.toLocaleString()}</p>
          </div>
          <span className="text-3xl">{tier.icon}</span>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tier.color}`}>
          <Trophy className="w-3 h-3" />
          {tier.name} Member
        </div>
        {nextTier && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs opacity-70">
              <span>{points.toLocaleString()} pts</span>
              <span>{nextTier.minPoints.toLocaleString()} pts for {nextTier.name}</span>
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs opacity-70">{(nextTier.minPoints - points).toLocaleString()} more points to reach {nextTier.name}</p>
          </div>
        )}
        {!nextTier && (
          <p className="text-sm font-bold opacity-90">🎉 You&apos;ve reached the highest tier!</p>
        )}
      </div>

      {/* How to earn */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-black text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          How to Earn Points
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Complete an order</span>
            <span className="font-bold text-foreground">1pt / ₦100 spent</span>
          </div>
          <div className="flex justify-between">
            <span>Bronze → Silver (500pts)</span>
            <span className="font-bold text-foreground">Unlock soon</span>
          </div>
          <div className="flex justify-between">
            <span>Gold tier (2,000pts)</span>
            <span className="font-bold text-foreground">Priority support</span>
          </div>
          <div className="flex justify-between">
            <span>Platinum tier (5,000pts)</span>
            <span className="font-bold text-foreground">Exclusive deals</span>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="space-y-2">
        <p className="text-sm font-black text-foreground">Transaction History</p>
        {transactions.length === 0 && (
          <div className="py-10 text-center">
            <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete an order to earn your first points!</p>
          </div>
        )}
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                tx.type === 'earn' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                tx.type === 'redeem' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' :
                'bg-muted text-muted-foreground'
              }`}>
                {tx.type === 'earn' || tx.type === 'admin_adjust' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{tx.description ?? tx.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <p className={`text-sm font-black flex-shrink-0 ${
                tx.type === 'earn' || tx.type === 'admin_adjust' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {tx.type === 'earn' || tx.type === 'admin_adjust' ? '+' : '-'}{Math.abs(tx.points).toLocaleString()} pts
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
