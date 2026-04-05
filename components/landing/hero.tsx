'use client'

import Link from 'next/link'
import { ArrowRight, Star, Users, ShoppingBag, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-emerald-50/30 dark:to-emerald-950/10" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-emerald-400/6 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-sm px-4 py-1.5 rounded-full font-medium">
            <Star className="w-3.5 h-3.5 mr-1.5 fill-primary" />
            #1 Campus Marketplace in Nigeria
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6 leading-tight">
          Buy & Sell on Campus
          <br />
          <span className="text-primary">Powered by WhatsApp</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
          The smartest way to discover deals, connect with sellers, and grow your campus business. Connect directly via WhatsApp, Instagram & Facebook.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" className="hero-gradient border-0 text-white hover:opacity-90 shadow-lg shadow-primary/25 h-12 px-8 text-base" asChild>
            <Link href="/marketplace">
              Browse Marketplace
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/30 hover:bg-primary/5" asChild>
            <Link href="/auth/sign-up">
              Start Selling Free
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { icon: Users, label: 'Active Students', value: '50K+' },
            { icon: ShoppingBag, label: 'Products Listed', value: '120K+' },
            { icon: MessageCircle, label: 'WhatsApp Chats', value: '2M+' },
            { icon: Star, label: 'Happy Sellers', value: '8K+' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 p-4 rounded-xl bg-card border border-border/50 card-hover">
              <Icon className="w-5 h-5 text-primary mb-1" />
              <span className="text-2xl font-bold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 mt-12">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['#16a34a', '#059669', '#0d9488', '#0891b2'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Join 50,000+ students</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm text-muted-foreground ml-1">4.9/5 rating</span>
          </div>
        </div>
      </div>
    </section>
  )
}
