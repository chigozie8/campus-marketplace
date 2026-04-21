'use client'

import { ShieldCheck, ShieldAlert, Shield, ShieldOff, Medal } from 'lucide-react'
import { levelFor, labelFor, getSellerTier, getMilestoneBadge } from '@/lib/trust'
import type { TrustLevel, SellerTier } from '@/lib/trust'

export type { TrustLevel, SellerTier }
export { getSellerTier, getMilestoneBadge }

/* ─────────────────────────────────────────────────────────────────────────
 * Admin-awarded badges (manually assigned by admin from /admin/trust-scores)
 * Includes paid promotion tiers (Gold/Silver/Bronze) and recognition badges
 * (Excellent/Rising). These are the ONLY badges shown publicly — automatic
 * trust-score badges are hidden from buyers/sellers.
 * ────────────────────────────────────────────────────────────────────── */
export type AdminBadgeGroup = 'promo' | 'rank' | 'other'

export interface AdminBadgeDef {
  id: string
  label: string
  emoji: string
  color: string
  group: AdminBadgeGroup
}

export const ADMIN_BADGE_DEFS: AdminBadgeDef[] = [
  // Paid promotion tiers (mutually exclusive)
  { id: 'gold_seller',         label: 'Gold Seller',         emoji: '🥇', group: 'promo', color: 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700' },
  { id: 'silver_seller',       label: 'Silver Seller',       emoji: '🥈', group: 'promo', color: 'text-slate-700 bg-slate-50 border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-600' },
  { id: 'bronze_seller',       label: 'Bronze Seller',       emoji: '🥉', group: 'promo', color: 'text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-700' },
  // Recognition tiers (mutually exclusive)
  { id: 'excellent_seller',    label: 'Excellent Seller',    emoji: '🏅', group: 'rank',  color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' },
  { id: 'rising_seller',       label: 'Rising Seller',       emoji: '🌱', group: 'rank',  color: 'text-lime-700 bg-lime-50 border-lime-200 dark:bg-lime-950/30 dark:text-lime-400 dark:border-lime-800' },
  // Other badges (any combination)
  { id: 'top_seller',          label: 'Top Seller',          emoji: '🏆', group: 'other', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' },
  { id: 'trusted_buyer',       label: 'Trusted Buyer',       emoji: '⭐', group: 'other', color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800' },
  { id: 'vip',                 label: 'VIP Member',          emoji: '👑', group: 'other', color: 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800' },
  { id: 'verified_business',   label: 'Verified Business',   emoji: '✅', group: 'other', color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' },
  { id: 'student_ambassador',  label: 'Student Ambassador',  emoji: '🎓', group: 'other', color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800' },
  { id: 'rising_star',         label: 'Rising Star',         emoji: '🌟', group: 'other', color: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800' },
  { id: 'campus_vendor',       label: 'Campus Vendor',       emoji: '🏫', group: 'other', color: 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800' },
]

export const VALID_ADMIN_BADGE_IDS = new Set(ADMIN_BADGE_DEFS.map(b => b.id))

/**
 * Normalize a badge array — strips unknown ids, dedupes, and enforces mutual
 * exclusion within the `promo` and `rank` groups (last write wins). Used by
 * both the admin UI and the server-side PATCH route to keep the model honest.
 */
export function normalizeAdminBadges(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const id of raw) {
    if (typeof id !== 'string') continue
    if (!VALID_ADMIN_BADGE_IDS.has(id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    ordered.push(id)
  }
  // Mutual-exclusion: keep only the LAST badge added in each exclusive group
  const exclusiveGroups: AdminBadgeGroup[] = ['promo', 'rank']
  for (const g of exclusiveGroups) {
    const inGroup = ordered.filter(id => ADMIN_BADGE_DEFS.find(b => b.id === id)?.group === g)
    if (inGroup.length <= 1) continue
    const keep = inGroup[inGroup.length - 1]
    for (let i = ordered.length - 1; i >= 0; i--) {
      const def = ADMIN_BADGE_DEFS.find(b => b.id === ordered[i])
      if (def?.group === g && ordered[i] !== keep) ordered.splice(i, 1)
    }
  }
  return ordered
}

interface AdminBadgesProps {
  badges: string[] | null | undefined
  size?: 'xs' | 'sm' | 'md'
  iconOnly?: boolean
  max?: number
  className?: string
}

/**
 * Renders the admin-awarded badges from a profile's `admin_badges` array.
 * Hidden entirely if the array is empty.
 */
export function AdminBadgesList({ badges, size = 'sm', iconOnly = false, max, className = '' }: AdminBadgesProps) {
  const list = (badges ?? []).filter(Boolean)
  if (list.length === 0) return null
  const visible = max ? list.slice(0, max) : list
  const sizeClass = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size]

  return (
    <div className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {visible.map(id => {
        const def = ADMIN_BADGE_DEFS.find(b => b.id === id)
        if (!def) return null
        if (iconOnly) {
          return (
            <span key={id} title={def.label} className="text-base leading-none" aria-label={def.label}>
              {def.emoji}
            </span>
          )
        }
        return (
          <span
            key={id}
            title={def.label}
            className={`inline-flex items-center border rounded-full font-bold ${sizeClass} ${def.color}`}
          >
            <span className="leading-none">{def.emoji}</span>
            <span>{def.label}</span>
          </span>
        )
      })}
      {max && list.length > max && (
        <span className="text-[10px] font-bold text-muted-foreground">+{list.length - max}</span>
      )}
    </div>
  )
}

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
