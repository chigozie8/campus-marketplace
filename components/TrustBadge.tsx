'use client'

import { ShieldCheck, ShieldAlert, Shield, ShieldOff, Medal } from 'lucide-react'
import { levelFor, labelFor, getSellerTier, getMilestoneBadge } from '@/lib/trust'
import type { TrustLevel, SellerTier } from '@/lib/trust'

export type { TrustLevel, SellerTier }
export { getSellerTier, getMilestoneBadge }

export interface TrustScore {
  score: number
  level: TrustLevel
  label: string
}

export function getTrustLevel(score: number): TrustLevel {
  return levelFor(score)
}

export function getTrustLabel(level: TrustLevel) {
  return labelFor(level)
}

const LEVEL_STYLES: Record<TrustLevel, { badge: string; text: string; icon: React.ReactNode }> = {
  excellent: {
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
  good: {
    badge: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400',
    text: 'text-blue-700 dark:text-blue-400',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  fair: {
    badge: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
  },
  low: {
    badge: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400',
    text: 'text-red-700 dark:text-red-400',
    icon: <ShieldOff className="w-3.5 h-3.5" />,
  },
}

const TIER_STYLES: Record<SellerTier, { badge: string; label: string; next: number | null }> = {
  gold:   { badge: 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-400', label: 'Gold Seller',   next: null },
  silver: { badge: 'bg-slate-50 border-slate-300 text-slate-600 dark:bg-slate-900/40 dark:border-slate-600 dark:text-slate-300',  label: 'Silver Seller', next: 85 },
  bronze: { badge: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-400', label: 'Bronze Seller', next: 70 },
}

interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
  className?: string
}

export function TrustBadge({ score, size = 'md', showScore = true, className = '' }: Props) {
  const level = getTrustLevel(score)
  const label = getTrustLabel(level)
  const styles = LEVEL_STYLES[level]

  const sizeClass = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size]

  return (
    <span
      className={`inline-flex items-center border rounded-full font-bold ${sizeClass} ${styles.badge} ${className}`}
      title={`Trust Score: ${score}/100`}
    >
      {styles.icon}
      {label}
      {showScore && <span className="opacity-70">· {score}</span>}
    </span>
  )
}

interface TierBadgeProps {
  score: number
  size?: 'sm' | 'md'
  className?: string
}

export function SellerTierBadge({ score, size = 'md', className = '' }: TierBadgeProps) {
  const tier = getSellerTier(score)
  if (!tier) return null
  const style = TIER_STYLES[tier]

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5'

  const tierEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉' }[tier]

  return (
    <span className={`inline-flex items-center border rounded-full font-bold ${sizeClass} ${style.badge} ${className}`}>
      <Medal className="w-3 h-3" />
      {tierEmoji} {style.label}
    </span>
  )
}

interface BarProps {
  score: number
  showLabel?: boolean
}

export function TrustScoreBar({ score, showLabel = true }: BarProps) {
  const level = getTrustLevel(score)
  const label = getTrustLabel(level)
  const styles = LEVEL_STYLES[level]

  const barColor = {
    excellent: 'bg-emerald-500',
    good: 'bg-blue-500',
    fair: 'bg-amber-500',
    low: 'bg-red-500',
  }[level]

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className={`font-bold ${styles.text}`}>{label} Trust</span>
          <span className="font-mono font-bold text-foreground">{score}/100</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

interface MiniTrustProps {
  score: number
  className?: string
}

export function MiniTrustDot({ score, className = '' }: MiniTrustProps) {
  const level = getTrustLevel(score)
  const dotColor = {
    excellent: 'bg-emerald-500',
    good: 'bg-blue-500',
    fair: 'bg-amber-500',
    low: 'bg-red-500',
  }[level]
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground ${className}`}
      title={`Trust: ${score}/100`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
      {score}
    </span>
  )
}
