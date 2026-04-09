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
  // null = not yet animating → show static value
  // number = animating → show count
  const [animating, setAnimating] = useState<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const startedRef = useRef(false)
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el || end === 0) return

    function startAnimation() {
      if (startedRef.current) return
      startedRef.current = true

      // Use Date.now() so paused RAF frames don't freeze the counter
      const startTime = Date.now()

      function tick() {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        const current = ease * end

        setAnimating(decimal ? Math.round(current * 10) / 10 : Math.floor(current))

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          // Done — go back to showing the raw static string
          setAnimating(null)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startAnimation() },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)

    // Fallback: if element is already visible on mount (above the fold)
    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        startAnimation()
      }
    }, 200)

    return () => {
      observer.disconnect()
      clearTimeout(timer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration, decimal])

  return { animating, elRef }
}

function StatCard({ stat, Icon }: { stat: StatItem; Icon: typeof Users }) {
  const num = parseNumber(stat.value)
  const decimal = isDecimalStr(stat.value)
  const { animating, elRef } = useCountUp(num, 1400, decimal)

  const suffix = num > 0 ? stat.value.replace(/[₦]?\d[\d,.]*/, '') : ''
  const prefix = stat.value.startsWith('₦') ? '₦' : ''

  const displayValue = animating !== null
    ? `${prefix}${decimal ? animating.toFixed(1) : animating.toLocaleString()}${suffix}`
    : stat.value

  return (
    <div
      ref={elRef}
      className="flex flex-col items-center justify-center gap-1 py-7 px-4 group"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mb-2 transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums">
        {displayValue}
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
