'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, MessageCircle, CheckCircle2, Sparkles, Users, Building2, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PERKS = [
  'Free to join, free to list',
  'WhatsApp-first, no middlemen',
  'Verified seller badge',
  'No commission on sales',
]

const STATS = [
  { endValue: 50000, suffix: '+', label: 'Active users', icon: Users },
  { endValue: 120, suffix: '+', label: 'Campuses', icon: Building2 },
  { endValue: 2, prefix: '₦', suffix: 'B+', label: 'Transacted', icon: TrendingUp },
  { endValue: 4.9, suffix: '', label: 'Average rating', icon: Star, isDecimal: true },
]

function useCountUp(end: number, duration: number = 2000, isDecimal: boolean = false) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = easeOutQuart * end

      setCount(isDecimal ? Math.round(currentValue * 10) / 10 : Math.floor(currentValue))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [hasStarted, end, duration, isDecimal])

  return { count, ref }
}

function AnimatedStat({ 
  endValue, 
  prefix = '', 
  suffix = '', 
  label, 
  icon: Icon,
  isDecimal = false,
}: { 
  endValue: number
  prefix?: string
  suffix?: string
  label: string
  icon: React.ElementType
  isDecimal?: boolean
}) {
  const { count, ref } = useCountUp(endValue, 2000, isDecimal)

  const formatNumber = (num: number) => {
    if (isDecimal) return num.toFixed(1)
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  return (
    <div 
      ref={ref}
      className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
          <Icon className="w-6 h-6 text-white/90" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {prefix}{formatNumber(count)}{suffix}
        </p>
        <p className="text-xs sm:text-sm text-white/70 mt-1 font-medium">{label}</p>
      </div>
    </div>
  )
}

export function CtaSection() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main CTA Card */}
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-emerald-700 p-8 sm:p-12 lg:p-16 shadow-2xl shadow-primary/30">
          {/* Background patterns */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
            {/* Glow orbs */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold text-white">Join the largest campus marketplace</span>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl shadow-black/10">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white text-balance mb-5 leading-tight">
                Ready to buy &amp; sell smarter?
              </h2>
              <p className="text-white/85 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed text-balance">
                Join 50,000+ students already trading on VendoorX. It&apos;s free to join and free to list.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 max-w-3xl mx-auto">
              {STATS.map((stat) => (
                <AnimatedStat 
                  key={stat.label} 
                  {...stat} 
                />
              ))}
            </div>

            {/* Perks */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-10">
              {PERKS.map((perk) => (
                <div
                  key={perk}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base text-white/90 font-medium">{perk}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="group bg-white text-primary hover:bg-white/95 shadow-2xl shadow-black/20 h-14 sm:h-16 px-10 sm:px-12 text-base sm:text-lg font-bold rounded-2xl w-full sm:w-auto transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/auth/sign-up">
                  Start for Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/15 hover:border-white/60 h-14 sm:h-16 px-10 sm:px-12 text-base sm:text-lg font-semibold rounded-2xl w-full sm:w-auto bg-white/5 backdrop-blur-sm transition-all duration-300"
                asChild
              >
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>

            {/* Trust indicator */}
            <p className="text-center text-white/60 text-sm mt-8">
              Trusted by students across 120+ Nigerian campuses
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
