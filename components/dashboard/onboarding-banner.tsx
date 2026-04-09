'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Package, UserCheck, ShoppingBag, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

interface OnboardingStep {
  id: string
  icon: typeof Package
  title: string
  description: string
  href: string
  cta: string
  done: boolean
}

interface OnboardingBannerProps {
  hasListings: boolean
  isVerified: boolean
  hasOrders: boolean
  profileComplete: boolean
}

export function OnboardingBanner({ hasListings, isVerified, hasOrders, profileComplete }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vendoorx_onboarding_dismissed') === '1'
    }
    return false
  })

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      icon: UserCheck,
      title: 'Complete your profile',
      description: 'Add your photo, campus, and contact details so buyers trust you.',
      href: '/profile',
      cta: 'Edit Profile',
      done: profileComplete,
    },
    {
      id: 'listing',
      icon: Package,
      title: 'Add your first listing',
      description: 'List a product to start selling. It takes under 2 minutes.',
      href: '/products/new',
      cta: 'Add Listing',
      done: hasListings,
    },
    {
      id: 'verify',
      icon: ShoppingBag,
      title: 'Verify your account',
      description: 'Verified sellers get a badge, more trust, and 3× more buyers.',
      href: '/profile#verify',
      cta: 'Get Verified',
      done: isVerified,
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const allDone = completedCount === steps.length
  const progressPct = Math.round((completedCount / steps.length) * 100)

  const dismiss = () => {
    localStorage.setItem('vendoorx_onboarding_dismissed', '1')
    setDismissed(true)
  }

  if (dismissed || allDone) return null

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-5 mb-6 overflow-hidden">
      {/* Decorative blur blob */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
        aria-label="Dismiss onboarding"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-black text-foreground">Welcome to VendoorX!</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Complete these steps to start selling on your campus.
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-foreground">{completedCount} of {steps.length} done</span>
          <span className="text-[11px] text-muted-foreground">{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {steps.map(step => {
          const Icon = step.icon
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                step.done
                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 opacity-70'
                  : 'border-border bg-background hover:bg-muted/40'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                step.done
                  ? 'bg-emerald-100 dark:bg-emerald-950/40'
                  : 'bg-primary/10'
              }`}>
                {step.done
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  : <Icon className="w-4 h-4 text-primary" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${step.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {step.title}
                </p>
                {!step.done && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>
                )}
              </div>
              {!step.done && (
                <Link
                  href={step.href}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline flex-shrink-0"
                >
                  {step.cta}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
