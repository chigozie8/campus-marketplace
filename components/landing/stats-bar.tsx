'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, Building2, TrendingUp, Star } from 'lucide-react'

export interface StatItem {
  value: string
  label: string
  sublabel: string
}

const ICONS = [Users, Building2, TrendingUp, Star]

function parseNumber(str: string): number {
  const cleaned = str.replace(/[₦,\s]/g, '')
  const match = cleaned.match(/^(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : 0
}

function isDecimalStr(str: string): boolean {
  return /^\d+\.\d+/.test(str.replace(/[₦,\s]/g, ''))
}

function useCountUp(end: number, duration = 1400, decimal = false) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startedRef = useRef(false)
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          let startTime: number
          const animate = (ts: number) => {
            if (!startTime) startTime = ts
            const progress = Math.min((ts - startTime) / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            const current = ease * end
            setCount(decimal ? Math.round(current * 10) / 10 : Math.floor(current))
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(animate)
            } else {
              setDone(true)
            }
          }
          rafRef.current = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration, decimal])

  return { count, done, elRef }
}

function StatCard({ stat, Icon }: { stat: StatItem; Icon: typeof Users }) {
  const num = parseNumber(stat.value)
  const decimal = isDecimalStr(stat.value)
  const { count, done, elRef } = useCountUp(num, 1400, decimal)

  const displayCount = decimal ? count.toFixed(1) : count.toLocaleString()
  const suffix = num > 0 ? stat.value.replace(/[₦]?\d[\d,.]*/, '') : ''
  const prefix = stat.value.startsWith('₦') ? '₦' : ''

  return (
    <div
      ref={elRef}
      className="flex flex-col items-center justify-center gap-1 py-7 px-4 group"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mb-2 transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
        {done || num === 0 ? stat.value : `${prefix}${displayCount}${suffix}`}
      </p>
      <p className="text-xs sm:text-sm text-foreground font-semibold text-center">{stat.label}</p>
      <p className="text-[11px] text-muted-foreground text-center leading-tight">{stat.sublabel}</p>
    </div>
  )
}

interface Props {
  stats?: StatItem[]
}

const DEFAULT_STATS: StatItem[] = [
  { value: '50,000+', label: 'Active Vendors',    sublabel: 'Selling right now' },
  { value: '120+',    label: 'Nigerian Campuses', sublabel: 'From UNILAG to BUK' },
  { value: '₦2.4B+',  label: 'Sales Processed',  sublabel: 'And growing daily' },
  { value: '4.9/5',   label: 'Average Rating',    sublabel: 'From 12,500+ reviews' },
]

export function StatsBar({ stats }: Props) {
  const items = stats ?? DEFAULT_STATS
  return (
    <section className="border-y border-border bg-muted/30 dark:bg-muted/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {items.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} Icon={ICONS[i]} />
          ))}
        </div>
      </div>
    </section>
  )
}
