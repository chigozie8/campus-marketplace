'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Perfect to get going',
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    priceSuffix: 'Free forever',
    cta: 'Get Started Free',
    href: '/auth/sign-up',
    highlight: false,
    badge: null,
    features: [
      { text: 'Up to 10 product listings', included: true },
      { text: 'WhatsApp order links', included: true },
      { text: 'Public store profile page', included: true },
      { text: 'Basic buyer enquiries', included: true },
      { text: 'Community support', included: true },
      { text: 'Order management dashboard', included: false },
      { text: 'Sales analytics', included: false },
      { text: 'Paystack payment integration', included: false },
      { text: 'Customer records & CRM', included: false },
      { text: 'AI listing assistant', included: false },
      { text: 'Priority support', included: false },
      { text: 'Verified seller badge', included: false },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For serious campus sellers',
    icon: Sparkles,
    monthlyPrice: 2500,
    annualPrice: 2000,
    priceSuffix: 'per month',
    cta: 'Start Growing',
    href: '/auth/sign-up',
    highlight: true,
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited product listings', included: true },
      { text: 'WhatsApp order links', included: true },
      { text: 'Public store profile page', included: true },
      { text: 'Basic buyer enquiries', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Order management dashboard', included: true },
      { text: 'Sales analytics', included: true },
      { text: 'Paystack payment integration', included: true },
      { text: 'Customer records & CRM', included: true },
      { text: 'AI listing assistant', included: false },
      { text: 'Priority support', included: false },
      { text: 'Verified seller badge', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For full-time entrepreneurs',
    icon: Crown,
    monthlyPrice: 5000,
    annualPrice: 4000,
    priceSuffix: 'per month',
    cta: 'Go Pro',
    href: '/auth/sign-up',
    highlight: false,
    badge: 'Best Value',
    features: [
      { text: 'Unlimited product listings', included: true },
      { text: 'WhatsApp order links', included: true },
      { text: 'Public store profile page', included: true },
      { text: 'Basic buyer enquiries', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Order management dashboard', included: true },
      { text: 'Advanced sales analytics', included: true },
      { text: 'Paystack payment integration', included: true },
      { text: 'Customer records & CRM', included: true },
      { text: 'AI listing assistant', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Verified seller badge', included: true },
    ],
  },
]

function formatPrice(price: number) {
  if (price === 0) return 'Free'
  return `₦${price.toLocaleString()}`
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 bg-muted/20 dark:bg-muted/10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-5">
            Simple, transparent pricing.{' '}
            <span className="text-primary">Start free.</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-pretty mb-8">
            No setup fees. No commission on sales. Upgrade or downgrade anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-muted border border-border">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                !annual
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                annual
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Annual
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const price = annual ? plan.annualPrice : plan.monthlyPrice

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-3xl border p-8 transition-all duration-300',
                  plan.highlight
                    ? 'border-primary/60 bg-primary/5 dark:bg-primary/10 shadow-2xl shadow-primary/15 scale-[1.02]'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5',
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className={cn(
                      'absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap',
                      plan.highlight
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                        : 'bg-foreground text-background',
                    )}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      plan.highlight ? 'bg-primary/20' : 'bg-muted',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        plan.highlight ? 'text-primary' : 'text-foreground/70',
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-base">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-7">
                  <div className="flex items-end gap-1.5 mb-1">
                    <span className="text-4xl font-extrabold text-foreground tabular-nums">
                      {formatPrice(price)}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-muted-foreground mb-1.5">{plan.priceSuffix}</span>
                    )}
                  </div>
                  {price === 0 && (
                    <p className="text-sm text-muted-foreground">No credit card required</p>
                  )}
                  {price > 0 && annual && (
                    <p className="text-xs text-primary font-semibold">
                      Billed annually — save ₦{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString()}/yr
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  className={cn(
                    'w-full rounded-2xl font-bold h-12 text-sm mb-8 transition-all',
                    plan.highlight
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02]'
                      : 'bg-muted hover:bg-muted/80 text-foreground border border-border',
                  )}
                  asChild
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>

                {/* Feature list */}
                <div className="flex flex-col gap-3 flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    {plan.highlight ? 'Everything in Starter, plus:' : plan.id === 'pro' ? 'Everything in Growth, plus:' : "What's included:"}
                  </p>
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          'flex-shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center mt-0.5',
                          feature.included
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted text-muted-foreground/40',
                        )}
                      >
                        {feature.included ? (
                          <Check className="w-2.5 h-2.5" />
                        ) : (
                          <X className="w-2.5 h-2.5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-sm leading-relaxed',
                          feature.included ? 'text-foreground/80' : 'text-muted-foreground/50 line-through',
                        )}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          All plans include zero commission on sales.{' '}
          <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline underline-offset-4">
            Start with Starter, upgrade anytime.
          </Link>
        </p>
      </div>
    </section>
  )
}
