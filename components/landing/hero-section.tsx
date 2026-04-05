'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, Star, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STATS = [
  { value: '50K+', label: 'Active Users' },
  { value: '₦2B+', label: 'Transactions' },
  { value: '120+', label: 'Campuses' },
]

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Verified Sellers' },
  { icon: MessageCircle, label: 'WhatsApp Direct' },
  { icon: TrendingUp, label: 'Zero Platform Fees' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Primary green accent blob — top right */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, oklch(0.52 0.18 152 / 0.08) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="flex justify-center lg:justify-start mb-6">
              <Badge
                variant="secondary"
                className="px-4 py-1.5 text-sm font-medium gap-2 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Nigeria&apos;s #1 Campus Marketplace
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.08] text-balance mb-6">
              Buy &amp; Sell{' '}
              <span className="text-primary">Anything</span>{' '}
              on Campus
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-xl mx-auto lg:mx-0 mb-8">
              Connect with thousands of campus buyers and sellers. List your products in minutes
              and close deals directly on WhatsApp — no middlemen, no fees.
            </p>

            {/* Trust items */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 mb-10">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-12">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto"
                >
                  Start Selling Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 h-12 text-base font-semibold w-full sm:w-auto border-border"
                >
                  Browse Marketplace
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center lg:justify-start gap-8">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product card mockup */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="relative">
              {/* Main card */}
              <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
                {/* Card header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive opacity-70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-70" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">campuscart.ng/marketplace</span>
                  <div className="w-16" />
                </div>

                {/* Listing cards inside mockup */}
                <div className="p-4 bg-muted/20 grid grid-cols-2 gap-3">
                  {[
                    { emoji: '📱', name: 'iPhone 13 Pro', price: '₦320,000', category: 'Electronics', badge: 'Hot' },
                    { emoji: '👟', name: 'Nike Air Max', price: '₦45,000', category: 'Fashion', badge: 'New' },
                    { emoji: '📚', name: 'JAMB CBT Guide', price: '₦3,500', category: 'Books', badge: null },
                    { emoji: '💻', name: 'HP Laptop 2024', price: '₦280,000', category: 'Electronics', badge: 'Hot' },
                  ].map((item) => (
                    <div key={item.name} className="bg-card rounded-xl border border-border p-3 group cursor-default">
                      <div className="w-full aspect-square rounded-lg bg-muted/60 flex items-center justify-center mb-2.5 relative overflow-hidden">
                        <span className="text-3xl">{item.emoji}</span>
                        {item.badge && (
                          <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badge === 'Hot' ? 'bg-primary' : 'bg-blue-500'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground mb-1.5">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{item.price}</span>
                      </div>
                      <button className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold text-white transition-opacity" style={{ backgroundColor: '#25D366' }}>
                        <MessageCircle className="w-3 h-3" />
                        Chat
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bottom bar */}
                <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-card">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">4.9 · 3,200 reviews</span>
                  </div>
                  <span className="text-xs text-primary font-semibold">12,000+ sellers</span>
                </div>
              </div>

              {/* Floating badge — top left */}
              <div className="absolute -left-4 top-8 hidden lg:flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground leading-none">WhatsApp-first</p>
                  <p className="text-[9px] text-muted-foreground">Buyers chat directly</p>
                </div>
              </div>

              {/* Floating badge — bottom right */}
              <div className="absolute -right-4 bottom-16 hidden lg:flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-foreground leading-none">Free to List</p>
                  <p className="text-[9px] text-muted-foreground">No hidden charges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
