'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { CheckCircle2, Clock, MessageSquare, Users } from 'lucide-react'
import { IPhone3DMockup } from './iphone-3d-mockup'
import { FloatingDashboardCards } from './floating-dashboard-cards'

const trustBadges = [
  { icon: CheckCircle2, text: 'No coding required' },
  { icon: Clock, text: 'Setup in 5 minutes' },
  { icon: MessageSquare, text: 'Works with your WhatsApp number' },
  { icon: Users, text: 'Trusted by 5,000+ businesses' },
]

const trustedBrands = [
  { name: 'Sabi', style: 'font-bold text-xl' },
  { name: 'HOUSE OF LUMINOS', style: 'font-semibold text-xs tracking-widest uppercase' },
  { name: 'FASHION PLUG', style: 'font-bold text-sm tracking-wider uppercase' },
  { name: 'Plug Gadgets', style: 'font-medium text-base' },
  { name: 'Belleza', subtitle: 'COSMETICS', style: 'font-semibold text-base' },
]

export function HeroTrustSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate trust badges
      gsap.fromTo(
        '.trust-badge',
        { opacity: 0, y: 15, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.2,
        }
      )

      // Animate brand logos
      gsap.fromTo(
        '.brand-logo',
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
          delay: 0.5,
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-12 lg:py-20 bg-background overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/30 via-background to-background pointer-events-none" />
      
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          {trustBadges.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="trust-badge flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">{text}</span>
            </div>
          ))}
        </div>

        {/* Trusted By Section */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm text-muted-foreground mb-5 sm:mb-6">Trusted by thousands of businesses across Nigeria</p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12">
            {trustedBrands.map((brand) => (
              <div key={brand.name} className="brand-logo flex flex-col items-center text-muted-foreground/60 hover:text-foreground transition-colors cursor-default">
                <span className={brand.style}>{brand.name}</span>
                {brand.subtitle && (
                  <span className="text-[9px] tracking-[0.25em] uppercase mt-0.5">{brand.subtitle}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3D iPhone and Dashboard Cards Display */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16">
          {/* Dashboard Cards - Left Side (Desktop only) */}
          <div className="hidden lg:block w-[340px] xl:w-[380px] flex-shrink-0">
            <FloatingDashboardCards />
          </div>

          {/* 3D iPhone - Center */}
          <div className="relative w-full max-w-[300px] sm:max-w-[320px] h-[580px] sm:h-[620px] flex-shrink-0">
            <IPhone3DMockup />
          </div>

          {/* Stats Summary - Right Side (Desktop only) */}
          <div className="hidden lg:flex flex-col gap-4 w-[280px] xl:w-[320px] flex-shrink-0">
            <div className="bg-card rounded-2xl border border-border p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Performance</span>
                <span className="text-xs text-muted-foreground">This Week</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="text-sm font-bold text-foreground">&lt; 30 seconds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                  <span className="text-sm font-bold text-foreground">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Orders Completed</span>
                  <span className="text-sm font-bold text-foreground">2,847</span>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5">
              <p className="text-sm font-semibold text-foreground mb-2">Why businesses love us</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">24/7 AI-powered customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Automatic order processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Integrated payment collection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Stats - Shown on smaller screens */}
        <div className="lg:hidden mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { value: '342', label: 'Orders', growth: '+18.7%' },
            { value: '1,254', label: 'Customers', growth: '+21.5%' },
            { value: '24.6%', label: 'Conversion', growth: '+16.3%' },
            { value: '₦12.4M', label: 'Sales', growth: '+23.4%' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
              <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-primary font-medium">{stat.growth}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
