'use client'

import { useEffect, useState, useRef } from 'react'
import { Users, Building2, TrendingUp, Star } from 'lucide-react'

const STATS = [
  {
    endValue: 50,
    prefix: '',
    suffix: 'K+',
    label: 'Active Vendors',
    sublabel: 'Selling right now',
    icon: Users,
    isDecimal: false,
  },
  {
    endValue: 120,
    prefix: '',
    suffix: '+',
    label: 'Nigerian Campuses',
    sublabel: 'From UNILAG to BUK',
    icon: Building2,
    isDecimal: false,
  },
  {
    endValue: 2.4,
    prefix: '₦',
    suffix: 'B+',
    label: 'Sales Processed',
    sublabel: 'And growing daily',
    icon: TrendingUp,
    isDecimal: true,
  },
  {
    endValue: 4.9,
    prefix: '',
    suffix: '/5',
    label: 'Average Rating',
    sublabel: 'From 12,500+ reviews',
    icon: Star,
    isDecimal: true,
  },
]

function useCountUp(end: number, duration = 1800, isDecimal = false) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true)
      },
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

function Stat({
  endValue,
  prefix,
  suffix,
  label,
  sublabel,
  icon: Icon,
  isDecimal,
}: (typeof STATS)[number]) {
  const { count, ref } = useCountUp(endValue, 1800, isDecimal)

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center gap-1 py-7 px-4 group"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mb-2 transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
        {prefix}
        {isDecimal ? count.toFixed(1) : count}
        {suffix}
      </p>
      <p className="text-xs sm:text-sm text-foreground font-semibold text-center">{label}</p>
      <p className="text-[11px] text-muted-foreground text-center leading-tight">{sublabel}</p>
    </div>
  )
}

export function StatsBar() {
  return (
    <section className="border-y border-border bg-muted/30 dark:bg-muted/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {STATS.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
