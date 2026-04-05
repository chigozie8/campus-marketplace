'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Star, TrendingUp, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const FLOATING_CARDS = [
  { icon: '📱', label: 'Electronics', price: '₦45,000', top: '15%', left: '2%', delay: '0s' },
  { icon: '👟', label: 'Fashion', price: '₦12,500', top: '55%', left: '0%', delay: '0.6s' },
  { icon: '📚', label: 'Textbooks', price: '₦3,200', top: '20%', right: '2%', delay: '1.2s' },
  { icon: '🍔', label: 'Food & Drinks', price: '₦1,800', top: '65%', right: '0%', delay: '1.8s' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient opacity-[0.08] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, oklch(0.52 0.18 152 / 0.12) 0%, transparent 50%),
                            radial-gradient(circle at 70% 80%, oklch(0.60 0.16 162 / 0.08) 0%, transparent 50%)`,
        }}
      />

      {/* Floating product cards */}
      {FLOATING_CARDS.map((card) => (
        <div
          key={card.label}
          className="absolute hidden lg:flex items-center gap-2 glass rounded-xl px-3 py-2 shadow-lg animate-bounce"
          style={{
            top: card.top,
            left: card.left,
            right: card.right,
            animationDuration: '3s',
            animationDelay: card.delay,
          }}
        >
          <span className="text-lg">{card.icon}</span>
          <div>
            <p className="text-xs font-semibold text-foreground leading-none">{card.label}</p>
            <p className="text-xs text-primary font-bold">{card.price}</p>
          </div>
        </div>
      ))}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm font-medium gap-2 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Nigeria&apos;s #1 Campus Marketplace
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground text-balance mb-6 leading-[1.1]">
          Buy &amp; Sell Anything{' '}
          <span className="text-primary">on Campus</span>{' '}
          via WhatsApp
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto mb-8 leading-relaxed">
          Connect with thousands of campus buyers and sellers. List your products in minutes
          and close deals directly on WhatsApp, Instagram, or Facebook — no middlemen, no fees.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-primary/30 gap-2"
            >
              Start Selling Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8 h-12 text-base font-semibold border-border gap-2"
            >
              Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['25D366', '1877F2', 'E1306C'].map((color) => (
                <div
                  key={color}
                  className="w-7 h-7 rounded-full border-2 border-background"
                  style={{ background: `#${color}` }}
                />
              ))}
            </div>
            <span>12,000+ active sellers</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
            ))}
            <span className="ml-1">4.9/5 from 3,200+ reviews</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Verified sellers only</span>
          </div>
        </div>

        {/* WhatsApp highlight */}
        <div className="mt-12 flex justify-center">
          <div className="glass rounded-2xl px-6 py-4 flex items-center gap-3 shadow-sm border border-border/50">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">WhatsApp-first Commerce</p>
              <p className="text-xs text-muted-foreground">Buyers contact you directly — no login required for them</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
