'use client'

import { m, LazyMotion, domAnimation } from 'framer-motion'
import { UserPlus, Camera, Share2, MessageCircle, CheckCircle2, type LucideIcon } from 'lucide-react'
import type { HiwStep } from '@/lib/site-settings-defaults'

const STEP_ICONS: LucideIcon[] = [UserPlus, Camera, Share2, MessageCircle]
const STEP_BG_COLORS = [
  'bg-primary',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-emerald-700',
]

const FALLBACK_STEPS: HiwStep[] = [
  { step: '01', title: 'Create your free account',          description: 'Sign up in seconds. Add your name, WhatsApp number, and what you sell. Your store profile goes live immediately — no approval, no waiting, no technical setup.' },
  { step: '02', title: 'List your first product',           description: 'Upload a photo, write a short description, set your price, and pick a category. Done. Your listing is instantly visible to buyers looking for exactly what you sell.' },
  { step: '03', title: 'Share everywhere in one tap',       description: 'Hit share and your listing lands on WhatsApp Status, Instagram Stories, Facebook, and TikTok in seconds. One action. Maximum reach across every channel your buyers are on.' },
  { step: '04', title: 'Let AI close the deal on WhatsApp', description: 'Buyers tap "Chat on WhatsApp" and land right in your store. VendoorX AI handles their questions, confirms orders, and collects payment — so you earn even while you sleep.' },
]

interface Props {
  title?: string
  subtitle?: string
  steps?: HiwStep[]
}

export function HowItWorksSection({ title, subtitle, steps }: Props = {}) {
  const STEPS = (steps && steps.length ? steps : FALLBACK_STEPS).map((s, i) => ({
    ...s,
    icon: STEP_ICONS[i % STEP_ICONS.length],
    bgColor: STEP_BG_COLORS[i % STEP_BG_COLORS.length],
  }))
  return (
    <LazyMotion features={domAnimation} strict>
      <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-background relative overflow-hidden scroll-mt-24">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <m.div
            className="text-center mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <CheckCircle2 className="w-4 h-4" />
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-5">
              {title ?? <>From sign-up to first sale <span className="text-primary">in under 5 minutes</span></>}
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
              {subtitle ?? 'No technical knowledge needed. No complicated setup. Just four simple steps between you and your next sale — powered by AI on WhatsApp.'}
            </p>
          </m.div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <m.div
                  key={step.step}
                  className="relative flex flex-col group"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Connector line + arrowhead for desktop */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden lg:flex absolute top-10 left-[calc(100%-0.5rem)] w-8 items-center z-10">
                      <div className="flex-1 h-[2px] bg-primary/30" />
                      <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[5px] border-t-transparent border-b-transparent border-l-primary/40" />
                    </div>
                  )}

                  {/* Card */}
                  <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group-hover:-translate-y-2">
                    <div className="relative mb-6">
                      <div
                        className={`w-20 h-20 rounded-2xl ${step.bgColor} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon className="w-9 h-9 text-white" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary text-sm font-bold flex items-center justify-center shadow-lg">
                        {index + 1}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-foreground mb-3 text-balance group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                      {step.description}
                    </p>
                  </div>
                </m.div>
              )
            })}
          </div>
        </div>
      </section>
    </LazyMotion>
  )
}
