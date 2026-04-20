import type { LucideIcon } from 'lucide-react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  /** Numeric delta vs prior period — positive/negative drives colour. */
  delta?: { value: number; label: string } | null
  color: string
  bg: string
  border: string
  /** Optional inline visualisation rendered under the value (sparkline). */
  visual?: React.ReactNode
}

/**
 * Single stat tile used across the dashboard. Optional `delta` shows a tiny
 * "▲ +N this week" pill in green/red/grey. `visual` slot lets the earnings
 * card embed a sparkline without bloating this component.
 */
export function StatCard({ icon: Icon, label, value, sub, delta, color, bg, border, visual }: Props) {
  const tone = !delta || delta.value === 0
    ? 'neutral'
    : delta.value > 0 ? 'up' : 'down'

  const ToneIcon = tone === 'up' ? ArrowUp : tone === 'down' ? ArrowDown : Minus
  const toneClass = tone === 'up'
    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
    : tone === 'down'
      ? 'text-red-600 bg-red-50 dark:bg-red-950/30'
      : 'text-gray-500 bg-gray-100 dark:bg-muted'

  return (
    <div className={`bg-white dark:bg-card rounded-2xl p-4 border ${border} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`inline-flex w-9 h-9 rounded-xl ${bg} items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {delta && (
          <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full', toneClass)}>
            <ToneIcon className="w-2.5 h-2.5" />
            {delta.label}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-950 dark:text-white tabular-nums leading-none">{value}</p>
      <p className="text-xs font-semibold text-gray-700 dark:text-foreground mt-1">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      {visual && <div className="mt-2.5">{visual}</div>}
    </div>
  )
}
