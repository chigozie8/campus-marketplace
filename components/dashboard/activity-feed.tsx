import Link from 'next/link'
import { ShoppingBag, MessageSquare, CheckCircle2, Truck, Activity } from 'lucide-react'

export type ActivityItem = {
  id: string
  kind: 'order_new' | 'order_paid' | 'order_shipped' | 'order_delivered' | 'inbox_message'
  title: string
  subtitle?: string
  href?: string
  at: string // ISO
}

interface Props {
  items: ActivityItem[]
}

const ICON: Record<ActivityItem['kind'], React.ElementType> = {
  order_new: ShoppingBag,
  order_paid: CheckCircle2,
  order_shipped: Truck,
  order_delivered: CheckCircle2,
  inbox_message: MessageSquare,
}

const TONE: Record<ActivityItem['kind'], string> = {
  order_new: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30',
  order_paid: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  order_shipped: 'text-sky-600 bg-sky-50 dark:bg-sky-950/30',
  order_delivered: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  inbox_message: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
}

function relTime(iso: string): string {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return ''
  const diff = Date.now() - t
  if (diff < 60_000) return 'just now'
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hr ago`
  const d = Math.floor(h / 24)
  return `${d} day${d === 1 ? '' : 's'} ago`
}

export function ActivityFeed({ items }: Props) {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-border flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <p className="text-sm font-black text-gray-900 dark:text-white">Recent activity</p>
        <span className="ml-auto text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Last 24h</span>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-xs text-gray-400">Nothing happened in the last 24 hours.</p>
          <p className="text-[11px] text-gray-400 mt-1">Share your store link to get more eyes on it.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50 dark:divide-border">
          {items.map(item => {
            const Icon = ICON[item.kind]
            const tone = TONE[item.kind]
            const inner = (
              <div className="flex items-center gap-3 px-5 py-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tone}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.subtitle}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">{relTime(item.at)}</span>
              </div>
            )
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link href={item.href} className="block hover:bg-gray-50/70 dark:hover:bg-muted/30 transition-colors">{inner}</Link>
                ) : inner}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
