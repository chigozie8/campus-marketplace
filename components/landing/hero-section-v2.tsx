'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  Play,
  CheckCircle,
  MessageSquare,
  Clock,
  Shield,
  LayoutDashboard,
  ShoppingBag,
  Bot,
  CreditCard,
  Package,
  Megaphone,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IPhone3DMockup } from '@/components/landing/iphone-3d-mockup'
import { FloatingDashboardCards } from '@/components/landing/floating-dashboard-cards'
import type { User } from '@supabase/supabase-js'
import type { SiteSettings } from '@/lib/site-settings-defaults'

gsap.registerPlugin(ScrollTrigger)

interface TrustedBrand {
  name: string
  logo?: string
}

const TRUSTED_BRANDS: TrustedBrand[] = [
  { name: 'Sabi' },
  { name: 'HOUSE OF LUMINOS' },
  { name: 'FASHION PLUG' },
  { name: 'Plug Gadgets' },
  { name: 'Belleza COSMETICS' },
]

const TRUST_BADGES = [
  { icon: CheckCircle, text: 'No coding required' },
  { icon: Clock, text: 'Setup in 5 minutes' },
  { icon: MessageSquare, text: 'Works with your WhatsApp number' },
  { icon: Shield, text: 'Trusted by 5,000+ businesses' },
]

interface HeroSectionV2Props {
  user?: User | null
  settings?: Partial<SiteSettings>
  visitorCampus?: string | null
}

export function HeroSectionV2({ user, settings }: HeroSectionV2Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const badgesRef = useRef<HTMLDivElement>(null)
  const brandsRef = useRef<HTMLDivElement>(null)
  const mockupContainerRef = useRef<HTMLDivElement>(null)

  const isAuthed = !!user

  useEffect(() => {

    const ctx = gsap.context(() => {
      // Create a master timeline
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' }
      })

      // Badge animation
      tl.fromTo(
        '.hero-badge',
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )

      // Headline words stagger
      tl.fromTo(
        '.headline-word',
        { opacity: 0, y: 40, rotateX: -45 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.1,
        },
        '-=0.3'
      )

      // Subtitle
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )

      // CTA buttons
      tl.fromTo(
        '.cta-button',
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
        },
        '-=0.3'
      )

      // Trust badges
      tl.fromTo(
        '.trust-badge',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
        },
        '-=0.2'
      )

      // Brand logos
      tl.fromTo(
        '.brand-logo',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
        },
        '-=0.3'
      )

      // Subtle parallax on scroll
      gsap.to('.hero-content', {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.to('.mockup-container', {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* Main container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 lg:pt-36 pb-12">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 xl:gap-16">
          {/* Left Column - Content */}
          <div className="hero-content flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl lg:max-w-none">
            {/* Trust Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-sm font-semibold text-foreground">Powered by WhatsApp.</span>
              <span className="text-sm font-medium text-primary">Built for Commerce.</span>
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem] font-black tracking-tight leading-[1.1] mb-6"
              style={{ perspective: '1000px' }}
            >
              <span className="headline-word inline-block text-foreground">Turn Your </span>
              <span className="headline-word inline-block text-primary">WhatsApp</span>
              <br className="hidden sm:block" />
              <span className="headline-word inline-block text-foreground">Into a Full </span>
              <span className="headline-word inline-block text-primary">Online Store</span>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-8"
            >
              Sell products, automate chats, receive payments, manage orders and grow your business — all from your WhatsApp number.
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row items-center lg:items-start gap-4 w-full sm:w-auto mb-8">
              {isAuthed ? (
                <>
                  <Button
                    size="lg"
                    className="cta-button group relative overflow-hidden rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-14 text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 w-full sm:w-auto"
                    asChild
                  >
                    <Link href="/dashboard" className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="cta-button rounded-2xl font-semibold px-8 h-14 text-base border-2 border-border hover:bg-muted/50 transition-all w-full sm:w-auto"
                    asChild
                  >
                    <Link href="/marketplace">Browse Marketplace</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="cta-button group relative overflow-hidden rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-14 text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 w-full sm:w-auto"
                    asChild
                  >
                    <Link href="/auth/sign-up" className="flex items-center gap-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>Start Selling on WhatsApp</span>
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="cta-button rounded-2xl font-semibold px-8 h-14 text-base border-2 border-border hover:bg-muted/50 transition-all w-full sm:w-auto group"
                    asChild
                  >
                    <Link href="/#how-it-works" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                        <Play className="w-4 h-4 text-foreground fill-foreground" />
                      </div>
                      <span>Watch Demo</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div ref={badgesRef} className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mb-10">
              {TRUST_BADGES.map(({ icon: Icon, text }, i) => (
                <div key={text} className="trust-badge flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Trusted By Section */}
            <div ref={brandsRef} className="w-full border-t border-border pt-8">
              <p className="text-sm text-muted-foreground mb-6 text-center lg:text-left">
                Trusted by thousands of businesses across Nigeria
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-8">
                {TRUSTED_BRANDS.map((brand, i) => (
                  <div
                    key={brand.name}
                    className="brand-logo text-lg font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-default"
                  >
                    {brand.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Mockup */}
          <div
            ref={mockupContainerRef}
            className="mockup-container flex-1 w-full max-w-lg lg:max-w-[550px] relative min-h-[600px] lg:min-h-[700px]"
          >
            {/* 3D iPhone Mockup */}
            <div className="relative w-full h-full flex items-center justify-center lg:justify-start">
              <IPhone3DMockup />
            </div>

            {/* Floating Dashboard Cards */}
            <FloatingDashboardCards />
          </div>
        </div>
      </div>

      {/* Features Section Preview */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-foreground">
          Everything you need to sell and grow on WhatsApp
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { Icon: ShoppingBag, title: 'WhatsApp Store', desc: 'Showcase your products with a beautiful catalog inside WhatsApp.' },
            { Icon: Bot, title: 'AI Chat & Auto Replies', desc: 'Automate conversations and close more sales with AI.' },
            { Icon: CreditCard, title: 'Payments', desc: 'Receive payments securely with Paystack, Flutterwave and more.' },
            { Icon: Package, title: 'Order & Delivery', desc: 'Manage orders, track deliveries and keep customers updated.' },
            { Icon: Megaphone, title: 'Broadcast Campaigns', desc: 'Send promotions and updates to the right audience.' },
            { Icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track sales, performance and customer insights in real-time.' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-muted/50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
