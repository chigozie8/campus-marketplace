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
  { value: '50,000+', label: 'Active Sellers',      sublabel: 'Selling right now' },
  { value: '36+',     label: 'States Nationwide',   sublabel: 'Lagos to Maiduguri' },
  { value: '₦2.4B+',  label: 'Sales Processed',     sublabel: 'And growing daily' },
  { value: '4.9/5',   label: 'Average Rating',       sublabel: 'From 12,500+ reviews' },
]

function parseNumber(str: string) {
  const m = str.replace(/[₦,\s]/g, '').match(/^(\d+\.?\d*)/)
  return m ? parseFloat(m[1]) : 0
}
function isDecimal(str: string) {
  return /^\d+\.\d+/.test(str.replace(/[₦,\s]/g, ''))
}

function StatCard({
  stat, Icon, delay, triggered,
}: {
  stat: StatItem
  Icon: typeof Users
  delay: number
  triggered: boolean
}) {
  const end       = parseNumber(stat.value)
  const decimal   = isDecimal(stat.value)
  const suffix    = stat.value.replace(/[₦]?\d[\d,.]*/, '')
  const prefix    = stat.value.startsWith('₦') ? '₦' : ''

  const [val, setVal]         = useState(0)
  const [visible, setVisible] = useState(false)
  const done = useRef(false)
  const raf  = useRef<number | null>(null)

  useEffect(() => {
    if (!triggered || done.current) return
    done.current = true

    const timer = setTimeout(() => {
      setVisible(true)
      if (end === 0) return

      const t0       = Date.now()
      const DURATION = 1500
      const tick = () => {
        const p = Math.min((Date.now() - t0) / DURATION, 1)
        const e = 1 - Math.pow(1 - p, 3)   // ease-out cubic
        setVal(decimal ? Math.round(e * end * 10) / 10 : Math.floor(e * end))
        if (p < 1) raf.current = requestAnimationFrame(tick)
        else        setVal(end)
      }
      raf.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [triggered]) // eslint-disable-line react-hooks/exhaustive-deps

  const display = visible && val === end
    ? stat.value
    : `${prefix}${decimal ? val.toFixed(1) : val.toLocaleString()}${suffix}`

  return (
    <div
      className="flex flex-col items-center justify-center gap-1 py-7 px-4 group"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0px)' : 'translateY(18px)',
        transition: 'opacity 0.55s ease, transform 0.55s ease',
      }}
    >
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
  const items      = stats ?? DEFAULT_STATS
  const sectionRef = useRef<HTMLElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true) },
      { threshold: 0.15, rootMargin: '0px 0px 80px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="border-y border-border bg-muted/30 dark:bg-muted/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {items.map((stat, i) => (
            <StatCard
              key={stat.label}
              stat={stat}
              Icon={ICONS[i]}
              delay={i * 150}
              triggered={triggered}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
