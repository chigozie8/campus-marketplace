'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Crown, Sparkles, ArrowRight, Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Feature { text: string; included: boolean }
interface Plan {
  id: string
  name: string
  tagline: string
  monthly_price: number
  annual_price: number
  cta_text: string
  cta_href: string
  is_highlighted: boolean
  badge: string | null
  color: string
  sort_order: number
  features: Feature[]
}

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'starter', name: 'Starter', tagline: 'Perfect for getting started',
    monthly_price: 0, annual_price: 0, cta_text: 'Get Started Free', cta_href: '/auth/sign-up',
    is_highlighted: false, badge: null, color: 'from-slate-500 to-slate-700', sort_order: 1,
    features: [
      { text: 'Up to 10 product listings', included: true },
      { text: 'WhatsApp buyer links', included: true },
      { text: 'Your own public store page', included: true },
      { text: 'Basic buyer enquiries', included: true },
      { text: 'Community support', included: true },
      { text: 'Order management dashboard', included: false },
      { text: 'Sales & revenue analytics', included: false },
      { text: 'Accept online card payments', included: false },
      { text: 'Customer records & history', included: false },
      { text: 'AI listing assistant', included: false },
    ],
  },
  {
    id: 'growth', name: 'Growth', tagline: 'For serious campus sellers',
    monthly_price: 2500, annual_price: 2000, cta_text: 'Start Growing', cta_href: '/auth/sign-up',
    is_highlighted: true, badge: 'Most Popular', color: 'from-green-500 to-emerald-700', sort_order: 2,
    features: [
      { text: 'Unlimited product listings', included: true },
      { text: 'WhatsApp buyer links', included: true },
      { text: 'Your own public store page', included: true },
      { text: 'Priority support', included: true },
      { text: 'Order management dashboard', included: true },
      { text: 'Sales & revenue analytics', included: true },
      { text: 'Accept online card payments', included: true },
      { text: 'Customer records & history', included: true },
      { text: 'AI listing assistant', included: false },
      { text: 'Verified seller badge', included: false },
    ],
  },
  {
    id: 'pro', name: 'Pro', tagline: 'For full-time entrepreneurs',
    monthly_price: 5000, annual_price: 4000, cta_text: 'Go Pro', cta_href: '/auth/sign-up',
    is_highlighted: false, badge: 'Best Value', color: 'from-gray-800 to-black', sort_order: 3,
    features: [
      { text: 'Unlimited product listings', included: true },
      { text: 'WhatsApp buyer links', included: true },
      { text: 'Your own public store page', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Order management dashboard', included: true },
      { text: 'Advanced analytics & insights', included: true },
      { text: 'Accept online card payments', included: true },
      { text: 'Customer records & history', included: true },
      { text: 'AI listing assistant', included: true },
      { text: 'Verified seller badge', included: true },
    ],
  },
]

const PLAN_ICONS: Record<string, React.ElementType> = { starter: Zap, growth: Sparkles, pro: Crown }
function getPlanIcon(id: string) { return PLAN_ICONS[id] ?? Zap }

function formatPrice(price: number) {
  if (price === 0) return 'Free'
  return `₦${price.toLocaleString()}`
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false)
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then(d => { if (d.plans?.length) setPlans(d.plans) })
      .catch(() => {})
      .finally(() => setLoadingPlans(false))
  }, [])

  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-[0.18em] mb-5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Star className="w-3 h-3 fill-primary" />
            Simple Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground text-balance mt-3 mb-5 leading-[1.05]">
            Start free.{' '}
            <span className="text-primary">Upgrade when ready.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed text-pretty mb-10">
            Zero commission on every naira you earn. No hidden charges. Cancel whenever you want.
          </p>

          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted border border-border shadow-inner">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
                !annual ? 'bg-background text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                annual ? 'bg-background text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Annual
              <span className="text-[10px] font-black text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/20">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        {loadingPlans ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
            {plans.map((plan) => {
              const Icon = getPlanIcon(plan.id)
              const price = annual ? plan.annual_price : plan.monthly_price

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative flex flex-col rounded-3xl transition-all duration-300 group',
                    plan.is_highlighted
                      ? 'md:-translate-y-6 shadow-2xl shadow-primary/20'
                      : 'hover:-translate-y-1 hover:shadow-xl',
                  )}
                >
                  <div className={cn('h-1.5 w-full rounded-t-3xl bg-gradient-to-r', plan.color)} />

                  <div
                    className={cn(
                      'flex flex-col flex-1 rounded-b-3xl border border-t-0 p-7',
                      plan.is_highlighted
                        ? 'bg-gradient-to-b from-primary/8 to-background border-primary/40'
                        : 'bg-card border-border',
                    )}
                  >
                    {plan.badge && (
                      <span
                        className={cn(
                          'self-start mb-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                          plan.is_highlighted ? 'bg-primary text-white' : 'bg-foreground text-background',
                        )}
                      >
                        {plan.badge}
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-5">
                      <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br', plan.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-foreground tracking-tight">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                      </div>
                    </div>

                    <div className="mb-6 pb-6 border-b border-border/60">
                      <div className="flex items-end gap-1.5 mb-1">
                        <span className="text-5xl font-black text-foreground tabular-nums tracking-tight leading-none">
                          {formatPrice(price)}
                        </span>
                        {price > 0 && <span className="text-sm text-muted-foreground mb-1.5 leading-none">/mo</span>}
                      </div>
                      {price === 0 && <p className="text-xs text-muted-foreground mt-1.5">No card needed. No tricks.</p>}
                      {price > 0 && annual && (
                        <p className="text-xs text-primary font-bold mt-1.5">
                          You save ₦{((plan.monthly_price - plan.annual_price) * 12).toLocaleString()} per year
                        </p>
                      )}
                    </div>

                    <Button
                      size="lg"
                      className={cn(
                        'w-full rounded-2xl font-bold h-12 text-sm mb-7 transition-all duration-200',
                        plan.is_highlighted
                          ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 hover:scale-[1.02]'
                          : plan.id === 'pro'
                          ? 'bg-foreground hover:bg-foreground/90 text-background hover:scale-[1.02]'
                          : 'border border-border bg-muted hover:bg-muted/80 text-foreground',
                      )}
                      asChild
                    >
                      <Link href={plan.cta_href}>
                        {plan.cta_text}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>

                    <ul className="flex flex-col gap-2.5 flex-1">
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              'flex-shrink-0 mt-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center',
                              feature.included
                                ? plan.is_highlighted ? 'bg-primary/20 text-primary' : 'bg-foreground/10 text-foreground'
                                : 'bg-muted text-muted-foreground/30',
                            )}
                          >
                            {feature.included
                              ? <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              : <X className="w-2.5 h-2.5" strokeWidth={3} />}
                          </span>
                          <span
                            className={cn(
                              'text-sm leading-relaxed',
                              feature.included ? 'text-foreground/80' : 'text-muted-foreground/40 line-through decoration-muted-foreground/30',
                            )}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Trust strip */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          {['0% commission — ever', 'Cancel or upgrade anytime', '100% secure payments', '14-day money-back guarantee'].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
