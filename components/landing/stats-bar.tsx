'use client'

import { useEffect, useState, useRef } from 'react'
import { Users, Building2, TrendingUp, Star } from 'lucide-react'

export interface StatItem {
  value: string
  label: string
  sublabel: string
}

const ICONS = [Users, Building2, TrendingUp, Star]

function parseNumber(str: string): { num: number; isDecimal: boolean } {
  const cleaned = str.replace(/[₦,\s]/g, '')
  const match = cleaned.match(/^(\d+\.?\d*)/)
  if (!match) return { num: 0, isDecimal: false }
  const num = parseFloat(match[1])
  return { num, isDecimal: num % 1 !== 0 }
}

function useCountUp(end: number, duration = 1800, isDecimal = false) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime: number
    let raf: number
    const animate = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 4)
      const current = ease * end
      setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [started, end, duration, isDecimal])

  return { count, ref }
}

function StatCard({ stat, Icon, index }: { stat: StatItem; Icon: typeof Users; index: number }) {
  const { num, isDecimal } = parseNumber(stat.value)
  const { count, ref } = useCountUp(num, 1800, isDecimal)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (count >= num && num > 0) setDone(true)
  }, [count, num])

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center gap-1 py-7 px-4 group"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mb-2 transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
        {done || num === 0 ? stat.value : (isDecimal ? count.toFixed(1) : count.toLocaleString())}
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
  { value: '50,000+', label: 'Active Vendors',      sublabel: 'Selling right now' },
  { value: '120+',    label: 'Nigerian Campuses',    sublabel: 'From UNILAG to BUK' },
  { value: '₦2.4B+',  label: 'Sales Processed',     sublabel: 'And growing daily' },
  { value: '4.9/5',   label: 'Average Rating',       sublabel: 'From 12,500+ reviews' },
]

export function StatsBar({ stats }: Props) {
  const items = stats ?? DEFAULT_STATS
  return (
    <section className="border-y border-border bg-muted/30 dark:bg-muted/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {items.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} Icon={ICONS[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
