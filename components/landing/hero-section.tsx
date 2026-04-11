'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, ArrowRight, Play, Shield, Zap, Users, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import type { SiteSettings } from '@/lib/site-settings-defaults'
import { DEFAULT_SETTINGS } from '@/lib/site-settings-defaults'

const AVATAR_META = [
  { alt: 'Nigerian seller on VendoorX',   fallback: 'AO', color: 'bg-primary' },
  { alt: 'WhatsApp business owner',        fallback: 'CE', color: 'bg-emerald-600' },
  { alt: 'Nigerian entrepreneur',          fallback: 'BN', color: 'bg-teal-600' },
  { alt: 'Active vendor on VendoorX',      fallback: 'OA', color: 'bg-green-700' },
  { alt: 'Online seller Nigeria',          fallback: 'FA', color: 'bg-cyan-600' },
]

interface HeroSectionProps {
  user?: User | null
  settings?: Partial<SiteSettings>
}

export function HeroSection({ user, settings }: HeroSectionProps) {
  const vendorCount = settings?.stat_active_vendors ?? DEFAULT_SETTINGS.stat_active_vendors
  const avatarSrcs = [
    settings?.hero_avatar_1 ?? DEFAULT_SETTINGS.hero_avatar_1,
    settings?.hero_avatar_2 ?? DEFAULT_SETTINGS.hero_avatar_2,
    settings?.hero_avatar_3 ?? DEFAULT_SETTINGS.hero_avatar_3,
    settings?.hero_avatar_4 ?? DEFAULT_SETTINGS.hero_avatar_4,
    settings?.hero_avatar_5 ?? DEFAULT_SETTINGS.hero_avatar_5,
  ]
  const AVATARS = AVATAR_META.map((meta, i) => ({ ...meta, src: avatarSrcs[i] }))
  const FEATURES = [
    { icon: Shield, text: 'Verified Sellers' },
    { icon: Zap, text: 'AI-Powered Orders' },
    { icon: Users, text: `${vendorCount} Active Sellers` },
  ]
  const isAuthed = !!user
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] || null

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-background">

      {/* Dark mode subtle glow only */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full dark:bg-green-500/5 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center gap-6">

        {/* Trust badge pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg shadow-primary/5 text-sm text-muted-foreground font-medium">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          {isAuthed && firstName
            ? `Welcome back, ${firstName}! Your store awaits 🎉`
            : 'Nigeria\'s AI-Powered WhatsApp Commerce Platform'
          }
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-balance">
          <span className="text-foreground">Sell smarter on</span>
          <br />
          <span className="text-primary italic">WhatsApp.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-2xl">
          Stop tracking orders in chats. VendoorX is a conversational commerce platform where{' '}
          <span className="text-primary font-semibold">AI handles your customer conversations, product discovery, order flow, and payments</span>{' '}
          — all on WhatsApp.
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.text}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary"
              >
                <Icon className="w-3.5 h-3.5" />
                {feature.text}
              </div>
            )
          })}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          {isAuthed ? (
            <>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group relative rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 sm:px-10 h-14 text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold px-8 h-14 text-base border-border hover:bg-muted/50 transition-all"
                >
                  Browse Marketplace
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="group relative rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 sm:px-10 h-14 text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold px-8 h-14 text-base border-border hover:bg-muted/50 transition-all"
                >
                  <Play className="w-4 h-4 mr-2 text-primary" />
                  See How It Works
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Social proof row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-6 border-t border-border/50">
          {/* Overlapping real avatars */}
          <div className="flex -space-x-3">
            {AVATARS.map(({ src, alt, fallback, color }, i) => (
              <div
                key={fallback}
                className="w-10 h-10 rounded-full ring-3 ring-background shadow-lg overflow-hidden"
                style={{ zIndex: AVATARS.length - i }}
              >
                <Image
                  src={src}
                  alt={alt}
                  width={40}
                  height={40}
                  priority
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.className = `w-10 h-10 rounded-full ring-3 ring-background shadow-lg flex items-center justify-center text-white text-xs font-bold ${color}`
                      parent.textContent = fallback
                    }
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              <span className="text-foreground font-bold">{vendorCount}</span> active sellers
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="pb-10 flex flex-col items-center gap-2 group cursor-pointer select-none">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/50 group-hover:text-primary transition-colors duration-300">
          Scroll
        </span>
        <div className="relative w-10 h-10 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-primary/25 animate-ping opacity-50" />
          <span className="absolute inset-1 rounded-full border border-primary/15" />
          <svg className="w-5 h-5 text-primary animate-bounce relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
