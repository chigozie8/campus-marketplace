'use client'

import { Users, Building2, TrendingUp, Star } from 'lucide-react'

export interface StatItem {
  value: string
  label: string
  sublabel: string
}

const ICONS = [Users, Building2, TrendingUp, Star]

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
          {items.map((stat, i) => {
            const Icon = ICONS[i]
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center gap-1 py-7 px-4 group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 mb-2 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-foreground font-semibold text-center">{stat.label}</p>
                <p className="text-[11px] text-muted-foreground text-center leading-tight">{stat.sublabel}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
