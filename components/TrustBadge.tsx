'use client'

import { ShieldCheck, ShieldAlert, Shield, ShieldOff } from 'lucide-react'

export type TrustLevel = 'excellent' | 'good' | 'fair' | 'low'

export interface TrustScore {
  score: number
  level: TrustLevel
  label: string
}

export function getTrustLevel(score: number): TrustLevel {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'low'
}

export function getTrustLabel(level: TrustLevel) {
  return { excellent: 'Excellent', good: 'Good', fair: 'Fair', low: 'Low' }[level]
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
