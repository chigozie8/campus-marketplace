'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Users, Building2, TrendingUp, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PERKS = [
  'Free to join, free to list',
  'WhatsApp-first, no middlemen',
  'Verified seller badge',
  'No commission on sales',
]

const STATS = [
  { endValue: 50000, suffix: '+', label: 'Active Vendors', icon: Users },
  { endValue: 120, suffix: '+', label: 'Campuses', icon: Building2 },
  { endValue: 2, prefix: '₦', suffix: 'B+', label: 'Transacted', icon: TrendingUp },
  { endValue: 4.9, suffix: '/5', label: 'Avg Rating', icon: Star, isDecimal: true },
]

function useCountUp(end: number, duration = 2000, isDecimal = false) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime: number
    let raf: number
    const animate = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 4)
      if (mountedRef.current) {
        setCount(isDecimal ? Math.round(ease * end * 10) / 10 : Math.floor(ease * end))
      }
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [started, end, duration, isDecimal])

  return { count, ref }
}

function StatCard({
  endValue, prefix = '', suffix = '', label, icon: Icon, isDecimal = false,
}: { endValue: number; prefix?: string; suffix?: string; label: string; icon: React.ElementType; isDecimal?: boolean }) {
  const { count, ref } = useCountUp(endValue, 2000, isDecimal)
  const display = isDecimal ? count.toFixed(1) : endValue >= 1000 ? `${Math.floor(count / 1000)}K` : count

  return (
    <div
      ref={ref}
      className="group flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-10 h-10 rounded-xl bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 text-[#16a34a]" />
      </div>
      <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
        {prefix}{display}{suffix}
      </p>
      <p className="text-xs text-white/50 font-medium text-center leading-tight">{label}</p>
    </div>
  )
}

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] py-24 sm:py-36">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Green glow top-center */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#16a34a]/20 blur-[100px] pointer-events-none" />
      {/* Subtle green glow bottom */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-[#16a34a]/10 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#16a34a]/40 bg-[#16a34a]/10 mb-8">
          <Zap className="w-4 h-4 text-[#16a34a]" />
          <span className="text-sm font-semibold text-[#16a34a] tracking-wide">Join the largest campus marketplace</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white text-balance leading-[1.06] mb-6 tracking-tight">
          Ready to buy &amp; sell{' '}
          <span className="text-[#16a34a]">smarter?</span>
        </h2>

        {/* Sub-copy */}
        <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-balance mb-10">
          Join <span className="text-white font-bold">50,000+</span> students already trading on VendoorX.
          It&apos;s <span className="text-[#16a34a] font-semibold">free to join</span> and{' '}
          <span className="text-[#16a34a] font-semibold">free to list</span>.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mb-12">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Perks row */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
              <span className="text-sm text-white/70 font-medium">{perk}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button
            size="lg"
            className="group bg-[#16a34a] hover:bg-[#15803d] text-white font-bold h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg rounded-2xl shadow-2xl shadow-[#16a34a]/30 hover:shadow-[#16a34a]/50 transition-all duration-300 hover:scale-[1.03] w-full sm:w-auto"
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
            className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg font-semibold rounded-2xl bg-transparent w-full sm:w-auto transition-all duration-300"
            asChild
          >
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </div>

        {/* Trust line */}
        <p className="text-white/30 text-sm mt-10 tracking-wide">
          Trusted by students across 120+ Nigerian campuses &bull; No credit card required
        </p>
      </div>
    </section>
  )
}
