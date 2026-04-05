'use client'

import React from 'react'
import { ShoppingCart, ClipboardList, Wallet, Gift, Star, Settings, CheckCircle2, Zap } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'

const MENU_BUTTONS = [
  { icon: ShoppingCart, label: 'Browse Listings' },
  { icon: ClipboardList, label: 'My Orders' },
  { icon: Wallet, label: 'Balance & Wallet' },
  { icon: Gift, label: 'Referral' },
  { icon: Star, label: 'Reviews & Ratings' },
  { icon: Settings, label: 'Settings & Account' },
]

const TRUSTED_BRANDS = [
  'UniLagMarket',
  'OAU Connect',
  'ABU Trade',
  'FUTA Hub',
  'UI Marketplace',
  'LASU Deals',
]

const FLOATING_BADGES = [
  { icon: CheckCircle2, title: 'Zero app needed', subtitle: 'Works in WhatsApp', position: '-right-4 sm:-right-8 top-16' },
  { icon: Star, title: '4.9 / 5 rating', subtitle: 'From 12k+ users', position: '-left-4 sm:-left-8 bottom-24', iconColor: 'text-yellow-500' },
  { icon: Zap, title: 'Instant Connect', subtitle: 'Chat in seconds', position: '-right-4 sm:-right-8 bottom-40' },
]

export function WhatsappMockupSection() {
  const { ref, isInView } = useInView()
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="relative bg-background overflow-hidden py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.45 0.22 155 / 0.08) 0%, transparent 60%)',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Section label */}
        <p
          className={`text-xs font-semibold tracking-[0.18em] uppercase text-primary ${isInView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '0ms' }}
        >
          See how it works
        </p>

        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-center text-balance text-foreground ${isInView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '100ms' }}
        >
          Your personal WhatsApp<br className="hidden sm:block" /> store — managed by <span className="text-primary">VendoorX</span>
        </h2>

        <p
          className={`text-base sm:text-lg text-muted-foreground text-center max-w-lg leading-relaxed text-pretty ${isInView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '200ms' }}
        >
          VendoorX gives you a smart WhatsApp storefront. Browse, buy, and sell right inside the chat — no app download needed.
        </p>

        {/* Phone mockup */}
        <div
          className={`mt-8 relative ${isInView ? 'animate-fade-up' : 'opacity-0'}`}
          style={{ animationDelay: '300ms' }}
        >
          {/* Phone glow effect */}
          <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full scale-75" />

          {/* Outer phone shell */}
          <div
            className="relative mx-auto rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
            style={{
              width: 300,
              background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
              padding: '12px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Screen bezel */}
            <div className="rounded-[2.4rem] overflow-hidden bg-[#ECE5DD] dark:bg-[#1a1a1a]">

              {/* Status bar */}
              <div className="flex items-center justify-between px-5 pt-3 pb-1 bg-[#075E54]">
                <span className="text-white text-[11px] font-semibold">12:55</span>
                {/* Dynamic island */}
                <div className="w-20 h-5 bg-black rounded-full" />
                <span className="text-white text-[11px] font-semibold">LTE</span>
              </div>

              {/* WhatsApp chat header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#075E54]">
                <div className="flex items-center gap-1 text-white">
                  <span className="text-[11px] opacity-70">{'<'}</span>
                  <span className="text-[11px] bg-white/20 rounded-full px-2 py-0.5 font-medium">244</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-white text-[13px] font-bold">VendoorX</span>
                  <span className="text-white/60 text-[10px]">bot</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                  VX
                </div>
              </div>

              {/* Chat body */}
              <div className="flex flex-col gap-2 px-3 py-3 min-h-[420px] bg-[#ECE5DD] dark:bg-[#0d1117]">

                {/* Welcome message */}
                <div className="self-start max-w-[85%]">
                  <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <p className="text-[12px] text-gray-800 dark:text-gray-100">
                      Welcome back, <strong>Ken!</strong>
                    </p>
                    <span className="text-[9px] text-gray-400 float-right mt-0.5">12:52 PM</span>
                  </div>
                </div>

                {/* Main menu card */}
                <div className="self-start max-w-[92%]">
                  <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 mb-0.5">
                      Main Menu
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                      What would you like to do today?
                    </p>
                    <span className="text-[9px] text-gray-400 float-right">12:52 PM</span>
                  </div>
                  {/* Menu grid buttons */}
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {MENU_BUTTONS.map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        className="flex items-center gap-1.5 bg-white dark:bg-[#202c33] hover:bg-primary/10 border border-border/40 rounded-xl px-2.5 py-2 text-[10.5px] font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 text-left hover:scale-105"
                      >
                        <Icon className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create listing flow card */}
                <div className="self-start max-w-[85%] mt-1">
                  <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 mb-0.5 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3 text-primary" /> Post a Listing
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Are you buying or selling?
                    </p>
                    <span className="text-[9px] text-gray-400 float-right mt-0.5">12:53 PM</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    {['I am a buyer', 'I am a seller'].map((text, index) => (
                      <button
                        key={text}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl px-3 py-2 text-[11px] font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                      >
                        <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[9px] font-bold">
                          {index + 1}
                        </span>
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          {FLOATING_BADGES.map((badge) => (
            <div
              key={badge.title}
              className={`absolute ${badge.position} bg-card/95 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 transition-transform duration-300 hover:scale-110`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <badge.icon className={`w-5 h-5 ${badge.iconColor || 'text-primary'} flex-shrink-0`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted by strip */}
      <div className="mt-24 max-w-4xl mx-auto px-6">
        <p className="text-center text-xs font-bold tracking-[0.22em] uppercase text-muted-foreground/60 mb-8">
          Trusted by campus communities
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {TRUSTED_BRANDS.map((brand) => (
            <span
              key={brand}
              className="text-lg font-black italic text-muted-foreground/30 hover:text-primary/60 transition-all duration-300 cursor-default select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
