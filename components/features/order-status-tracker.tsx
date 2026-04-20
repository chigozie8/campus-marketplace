'use client'

import { CheckCircle2, Clock, Package, Truck, Star, XCircle, Shield, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/api'

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType; description: string }[] = [
  { status: 'pending',   label: 'Pending',   icon: Clock,        description: 'Order placed, awaiting payment' },
  { status: 'paid',      label: 'Paid',      icon: CheckCircle2, description: 'Payment confirmed' },
  { status: 'shipped',   label: 'Shipped',   icon: Truck,        description: 'On its way to you' },
  { status: 'delivered', label: 'Delivered', icon: Package,      description: 'Delivered to your address' },
  { status: 'completed', label: 'Completed', icon: Star,         description: 'Order complete' },
]

const ORDER_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  shipped: 2,
  delivered: 3,
  completed: 4,
  cancelled: -1,
}

export interface OrderStatusTimestamps {
  pending?: string | null
  paid?: string | null
  shipped?: string | null
  delivered?: string | null
  completed?: string | null
}

interface OrderStatusTrackerProps {
  status: OrderStatus
  compact?: boolean
  timestamps?: OrderStatusTimestamps
}

function fmtTime(value?: string | null) {
  if (!value) return null
  try {
    const d = new Date(value)
    return d.toLocaleString('en-NG', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return null
  }
}

export function OrderStatusTracker({ status, compact = false, timestamps }: OrderStatusTrackerProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="w-4 h-4" />
        <span className="text-sm font-semibold">Order Cancelled</span>
      </div>
    )
  }

  const currentIndex = ORDER_INDEX[status]

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => (
          <div key={step.status} className="flex items-center gap-1">
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i < currentIndex ? 'bg-primary' :
                i === currentIndex ? 'bg-primary ring-2 ring-primary/30' :
                'bg-muted'
              )}
            />
            {i < STEPS.length - 1 && (
              <div className={cn('w-4 h-0.5 rounded', i < currentIndex ? 'bg-primary' : 'bg-muted')} />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs font-semibold text-foreground capitalize">{status}</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-0 relative">
        {/* Track line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
        <div
          className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
          style={{ width: currentIndex === 0 ? '0%' : `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, i) => {
          const Icon = step.icon
          const done = i < currentIndex
          const active = i === currentIndex
          const stamp = fmtTime(timestamps?.[step.status as keyof OrderStatusTimestamps])

          return (
            <div key={step.status} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  done ? 'bg-primary border-primary text-white' :
                  active ? 'bg-background border-primary text-primary shadow-lg shadow-primary/20 scale-110' :
                  'bg-background border-muted text-muted-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-center">
                <p className={cn(
                  'text-[11px] font-bold leading-tight',
                  active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </p>
                {stamp && (done || active) && (
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight tabular-nums">
                    {stamp}
                  </p>
                )}
                {active && !stamp && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block leading-tight">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Escrow status note */}
      {(status === 'paid' || status === 'shipped') && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
            <span className="font-bold">Your money is safe in escrow.</span> Funds are held by VendoorX and will only be released to the seller after you confirm delivery. If anything goes wrong, you get a full refund.
          </p>
        </div>
      )}

      {status === 'delivered' && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            <span className="font-bold">Item delivered.</span> Escrow will auto-release to the seller in 24 hours if no dispute is raised. Happy with your order? Confirm delivery to release payment now.
          </p>
        </div>
      )}
    </div>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { label: string; className: string }> = {
    pending:   { label: 'Pending',   className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' },
    paid:      { label: 'Paid',      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' },
    shipped:   { label: 'Shipped',   className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800' },
    delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' },
    completed: { label: 'Completed', className: 'bg-primary/10 text-primary border-primary/20' },
    cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:border-red-800' },
  }

  const { label, className } = config[status]

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', className)}>
      {label}
    </span>
  )
}
