'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
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
  /** Optional index for staggered animations */
  index?: number
}

/**
 * Single stat tile used across the dashboard. Optional `delta` shows a tiny
 * "▲ +N this week" pill in green/red/grey. `visual` slot lets the earnings
 * card embed a sparkline without bloating this component.
 */
export function StatCard({ icon: Icon, label, value, sub, delta, color, bg, border, visual, index = 0 }: Props) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={`bg-white dark:bg-card rounded-2xl p-4 border ${border} shadow-sm hover:shadow-lg transition-shadow cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-3">
        <motion.div
          className={`inline-flex w-9 h-9 rounded-xl ${bg} items-center justify-center`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className={`w-4 h-4 ${color}`} />
        </motion.div>
        {delta && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full', toneClass)}
          >
            <motion.div
              animate={{ y: delta.value > 0 ? [0, -2, 0] : [0, 2, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 2 }}
            >
              <ToneIcon className="w-2.5 h-2.5" />
            </motion.div>
            {delta.label}
          </motion.span>
        )}
      </div>
      <motion.p
        className="text-2xl font-black text-gray-950 dark:text-white tabular-nums leading-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.1 }}
      >
        {value}
      </motion.p>
      <p className="text-xs font-semibold text-gray-700 dark:text-foreground mt-1">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      {visual && <div className="mt-2.5">{visual}</div>}
    </motion.div>
  )
}
