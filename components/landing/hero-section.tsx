'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AVATARS = [
  { initials: 'AO', color: 'bg-primary' },
  { initials: 'KU', color: 'bg-emerald-500' },
  { initials: 'TN', color: 'bg-teal-500' },
  { initials: 'EM', color: 'bg-green-600' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">

      {/* Subtle green radial tint — same mint feel as Safeeely */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.50 0.19 152 / 0.07) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none dark:block hidden"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.58 0.20 152 / 0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-2xl mx-auto px-6 pt-36 pb-24 flex flex-col items-center text-center gap-7">

        {/* Trust badge pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm text-sm text-muted-foreground font-medium">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          Nigeria&apos;s #1 Campus Marketplace
        </div>

        {/* Headline — two-line Safeeely style */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-balance">
          <span className="text-foreground">everything is</span>
          <br />
          <span className="text-primary italic">VendoorX.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-lg">
          Buy and sell anything on campus — electronics, books, fashion, food &amp; services.
          Close deals directly on WhatsApp with zero platform fees.
        </p>

        {/* Primary CTA */}
        <Link href="/auth/sign-up">
          <Button
            size="lg"
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold px-10 h-14 text-base shadow-md transition-all hover:scale-[1.03]"
          >
            Join for Free
          </Button>
        </Link>

        {/* Social proof row */}
        <div className="flex items-center gap-3 mt-1">
          {/* Overlapping avatars */}
          <div className="flex -space-x-2.5">
            {AVATARS.map(({ initials, color }) => (
              <div
                key={initials}
                className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold ring-2 ring-background`}
              >
                {initials}
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            50,000+ active students
          </span>
        </div>

      </div>
    </section>
  )
}
