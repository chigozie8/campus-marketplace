'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Users, GraduationCap, TrendingUp, Star, Zap, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

interface CtaSectionProps {
  user?: User | null
}

const PERKS = [
  'Free for students',
  'WhatsApp-native checkout',
  'Verified campus sellers',
  'Zero commission on sales',
]

const STATS = [
  { end: 50000, fmt: (n: number) => n >= 1000 ? `${Math.floor(n / 1000)}K+` : `${n}+`, label: 'Student Sellers',     icon: Users },
  { end: 120,   fmt: (n: number) => `${n}+`,                                             label: 'Universities',       icon: GraduationCap },
  { end: 2,     fmt: (n: number) => `₦${n}B+`,                                           label: 'Campus Sales',       icon: TrendingUp },
  { end: 4.9,   fmt: (n: number) => `${n.toFixed(1)}/5`,                                 label: 'Avg Rating',         icon: Star, decimal: true },
]

function StatCard({
  end, fmt, label, icon: Icon, decimal = false, delay, triggered,
}: {
  end: number; fmt: (n: number) => string; label: string
  icon: React.ElementType; decimal?: boolean; delay: number; triggered: boolean
}) {
  const [val, setVal]         = useState(0)
  const [visible, setVisible] = useState(false)
  const done = useRef(false)
  const raf  = useRef<number | null>(null)

  useEffect(() => {
    if (!triggered || done.current) return
    done.current = true

    const timer = setTimeout(() => {
      setVisible(true)
      const t0       = Date.now()
      const DURATION = 1600
      const tick = () => {
        const p = Math.min((Date.now() - t0) / DURATION, 1)
        const e = 1 - Math.pow(1 - p, 4)
        setVal(decimal ? Math.round(e * end * 10) / 10 : Math.floor(e * end))
        if (p < 1) raf.current = requestAnimationFrame(tick)
        else        setVal(end)
      }
      raf.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [triggered]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="group flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0px)' : 'translateY(20px)',
        transition: 'opacity 0.55s ease, transform 0.55s ease',
      }}
    >
      <div className="w-10 h-10 rounded-xl bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 text-[#16a34a]" />
      </div>
      <p className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
        {fmt(val)}
      </p>
      <p className="text-xs text-white/50 font-medium text-center leading-tight">{label}</p>
    </div>
  )
}

export function CtaSection({ user }: CtaSectionProps) {
  const isAuthed = !!user
  const statsRef = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true) },
      { threshold: 0.15, rootMargin: '0px 0px 80px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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

      {/* Green glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#16a34a]/20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-[#16a34a]/10 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#16a34a]/40 bg-[#16a34a]/10 mb-8">
          <Zap className="w-4 h-4 text-[#16a34a]" />
          <span className="text-sm font-semibold text-[#16a34a] tracking-wide">
            {isAuthed ? 'Your campus store is live and ready to grow' : 'The marketplace built for Nigerian university campuses'}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white text-balance leading-[1.06] mb-6 tracking-tight">
          {isAuthed ? (
            <>Keep growing your{' '}<span className="text-[#16a34a]">campus store.</span></>
          ) : (
            <>Your campus side-hustle{' '}<span className="text-[#16a34a]">starts here.</span></>
          )}
        </h2>

        {/* Sub-copy */}
        <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-balance mb-10">
          {isAuthed ? (
            <>
              Everything you need is in your dashboard. Boost your listings, track your orders, and{' '}
              <span className="text-[#16a34a] font-semibold">keep growing your campus store</span>.
            </>
          ) : (
            <>
              Join <span className="text-white font-bold">50,000+ students</span> already making money selling to classmates on VendoorX.
              It&apos;s{' '}
              <span className="text-[#16a34a] font-semibold">free to join</span>{' '}
              and <span className="text-[#16a34a] font-semibold">free to start selling</span> — right now.
            </>
          )}
        </p>

        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mb-12">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} end={stat.end} fmt={stat.fmt} label={stat.label} icon={stat.icon} decimal={stat.decimal} delay={i * 150} triggered={triggered} />
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
          {isAuthed ? (
            <>
              <Button
                size="lg"
                className="group bg-[#16a34a] hover:bg-[#15803d] text-white font-bold h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg rounded-2xl shadow-2xl shadow-[#16a34a]/30 hover:shadow-[#16a34a]/50 transition-all duration-300 hover:scale-[1.03] w-full sm:w-auto"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 w-5 h-5" />
                  Go to Dashboard
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
            </>
          ) : (
            <>
              <Button
                size="lg"
                className="group bg-[#16a34a] hover:bg-[#15803d] text-white font-bold h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg rounded-2xl shadow-2xl shadow-[#16a34a]/30 hover:shadow-[#16a34a]/50 transition-all duration-300 hover:scale-[1.03] w-full sm:w-auto"
                asChild
              >
                <Link href="/auth/sign-up">
                  Start Selling on Campus
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg font-semibold rounded-2xl bg-transparent w-full sm:w-auto transition-all duration-300"
                asChild
              >
                <Link href="/marketplace">Browse Campus Deals</Link>
              </Button>
            </>
          )}
        </div>

        {/* Trust line */}
        <p className="text-white/30 text-sm mt-10 tracking-wide">
          Trusted by students at 120+ Nigerian universities &bull; No credit card required &bull; Cancel anytime
        </p>
      </div>
    </section>
  )
}
