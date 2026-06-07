import Link from 'next/link'
import { BadgeCheck, Zap, Sparkles, Crown, ArrowRight, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Subscription } from '@/lib/types'

const PLAN_META: Record<string, { label: string; icon: React.ElementType; color: string; accent: string }> = {
  starter: { label: 'Starter',  icon: Zap,       color: 'from-slate-500 to-slate-700',    accent: 'text-slate-600 dark:text-slate-400' },
  growth:  { label: 'Growth',   icon: Sparkles,   color: 'from-green-500 to-emerald-700',  accent: 'text-emerald-600 dark:text-emerald-400' },
  pro:     { label: 'Pro',      icon: Crown,      color: 'from-gray-800 to-black',          accent: 'text-gray-800 dark:text-gray-200' },
}

interface PlanCardProps {
  subscription: Pick<Subscription, 'plan_id' | 'billing_cycle' | 'expires_at' | 'status'> | null
}

function formatExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) return null
  const d = new Date(expiresAt)
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Expired'
  if (diff === 0) return 'Expires today'
  if (diff === 1) return 'Expires tomorrow'
  if (diff <= 7) return `Expires in ${diff} days`
  return `Renews ${d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export function PlanCard({ subscription }: PlanCardProps) {
  const planId = subscription?.plan_id ?? 'starter'
  const meta = PLAN_META[planId] ?? PLAN_META.starter
  const Icon = meta.icon
  const expiry = formatExpiry(subscription?.expires_at ?? null)
  const isActive = subscription?.status === 'active'

  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
      {/* gradient top bar */}
      <div className={cn('h-1 w-full bg-gradient-to-r', meta.color)} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0', meta.color)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-foreground">{meta.label} Plan</p>
                {isActive && planId !== 'starter' && (
                  <BadgeCheck className={cn('w-4 h-4', meta.accent)} />
                )}
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                {subscription?.billing_cycle ? `${subscription.billing_cycle} billing` : 'Free forever'}
              </p>
            </div>
          </div>

          <Link
            href="/pricing"
            className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {planId === 'starter' ? 'Upgrade' : 'Change plan'}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {expiry && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {expiry}
          </div>
        )}

        {planId === 'starter' && (
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            You are on the free plan — up to 10 listings.{' '}
            <Link href="/pricing" className="text-primary font-semibold hover:underline">
              Upgrade to Growth or Pro
            </Link>{' '}
            to unlock unlimited listings, payments, and analytics.
          </p>
        )}
      </div>
    </div>
  )
}
