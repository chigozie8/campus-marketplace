'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, Building2, TrendingUp, Star } from 'lucide-react'

export interface StatItem {
  value: string
  label: string
  sublabel: string
}

const ICONS = [Users, Building2, TrendingUp, Star]

const DEFAULT_STATS: StatItem[] = [
  { value: '50,000+', label: 'Active Vendors',    sublabel: 'Selling right now' },
  { value: '120+',    label: 'Nigerian Campuses', sublabel: 'From UNILAG to BUK' },
  { value: '₦2.4B+',  label: 'Sales Processed',  sublabel: 'And growing daily' },
  { value: '4.9/5',   label: 'Average Rating',    sublabel: 'From 12,500+ reviews' },
]

function parseNumber(str: string) {
  const cleaned = str.replace(/[₦,\s]/g, '')
  const m = cleaned.match(/^(\d+\.?\d*)/)
  return m ? parseFloat(m[1]) : 0
}

function isDecimalStr(str: string) {
  return /^\d+\.\d+/.test(str.replace(/[₦,\s]/g, ''))
}

function useCountUp(end: number, duration = 1600, decimal = false) {
  const [val, setVal] = useState(0)
  const elRef  = useRef<HTMLDivElement>(null)
  const done   = useRef(false)
  const raf    = useRef<number | null>(null)

  useEffect(() => {
    if (end === 0) return
    const el = elRef.current
    if (!el) return

    const start = () => {
      if (done.current) return
      done.current = true
      const t0 = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - t0) / duration, 1)
        const e = 1 - Math.pow(1 - p, 3)
        setVal(decimal ? Math.round(e * end * 10) / 10 : Math.floor(e * end))
        if (p < 1) raf.current = requestAnimationFrame(tick)
        else        setVal(end)
      }
      raf.current = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) start() },
      { threshold: 0.2, rootMargin: '0px 0px 80px 0px' },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [end, duration, decimal])

  return { val, elRef }
}

function StatCard({ stat, Icon }: { stat: StatItem; Icon: typeof Users }) {
  const num     = parseNumber(stat.value)
  const decimal = isDecimalStr(stat.value)
  const { val, elRef } = useCountUp(num, 1600, decimal)

  const suffix  = stat.value.replace(/[₦]?\d[\d,.]*/, '')
  const prefix  = stat.value.startsWith('₦') ? '₦' : ''
  const display = val === num
    ? stat.value
    : `${prefix}${decimal ? val.toFixed(1) : val.toLocaleString()}${suffix}`

  return (
    <div ref={elRef} className="flex flex-col items-center justify-center gap-1 py-7 px-4 group">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mb-2 transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
        {display}
      </p>
      <p className="text-xs sm:text-sm text-foreground font-semibold text-center">{stat.label}</p>
      <p className="text-[11px] text-muted-foreground text-center leading-tight">{stat.sublabel}</p>
    </div>
  )
}

interface Props { stats?: StatItem[] }

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
