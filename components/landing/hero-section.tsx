'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Play, Shield, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AVATARS = [
  { initials: 'AO', color: 'bg-primary' },
  { initials: 'KU', color: 'bg-emerald-600' },
  { initials: 'TN', color: 'bg-teal-600' },
  { initials: 'EM', color: 'bg-green-700' },
  { initials: 'JD', color: 'bg-cyan-600' },
]

const FEATURES = [
  { icon: Shield, text: 'Verified Vendors' },
  { icon: Zap, text: 'WhatsApp Orders' },
  { icon: Users, text: '50K+ Sellers' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#fafafa] dark:bg-background">

      <div className="relative w-full max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center gap-6">
        {/* Trust badge pill */}
        <div
          className="animate-fade-up flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg shadow-primary/5 text-sm text-muted-foreground font-medium"
          style={{ animationDelay: '0ms' }}
        >
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          The Shopify for WhatsApp &amp; Social Sellers in Africa
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-balance"
          style={{ animationDelay: '100ms' }}
        >
          <span className="text-foreground">Sell smarter on</span>
          <br />
          <span className="text-primary italic">WhatsApp.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-up text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-2xl"
          style={{ animationDelay: '200ms' }}
        >
          Stop tracking orders in chats. VendoorX turns your WhatsApp, Instagram, and Facebook conversations into a{' '}
          <span className="text-primary font-semibold">structured, trackable store</span> — with payments, dashboards, and order management built in.
        </p>

        {/* Feature badges */}
        <div
          className="animate-fade-up flex flex-wrap justify-center gap-3 mt-2"
          style={{ animationDelay: '300ms' }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.text}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary transition-transform duration-200 hover:scale-105"
              >
                <Icon className="w-3.5 h-3.5" />
                {feature.text}
              </div>
            )
          })}
        </div>

        {/* CTA Buttons */}
        <div
          className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 mt-4"
          style={{ animationDelay: '400ms' }}
        >
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
          <Link href="#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full font-semibold px-8 h-14 text-base border-border hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 mr-2 text-primary" />
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Social proof row */}
        <div
          className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 mt-6 pt-6 border-t border-border/50"
          style={{ animationDelay: '500ms' }}
        >
          {/* Overlapping avatars */}
          <div className="flex -space-x-3">
            {AVATARS.map(({ initials, color }) => (
              <div
                key={initials}
                className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold ring-3 ring-background shadow-lg`}
              >
                {initials}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-yellow-500 fill-yellow-500"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              <span className="text-foreground font-bold">50,000+</span> active vendors
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
