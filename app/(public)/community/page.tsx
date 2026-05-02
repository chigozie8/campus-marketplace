'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  MessageCircle, Trophy, Zap, Star, Heart, Sparkles,
  Bell, ArrowRight, CheckCircle2, Users, Clock,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CommunityConfig {
  launch_date:       string
  hero_badge:        string
  hero_title_line1:  string
  hero_title_accent: string
  hero_subtitle:     string
  waitlist_count:    string
  hero_image_url:    string
  launch_date_label: string
}

const DEFAULT_CONFIG: CommunityConfig = {
  launch_date:       '2027-01-01T00:00:00Z',
  hero_badge:        'Something exciting is coming',
  hero_title_line1:  'Your Campus',
  hero_title_accent: 'Community',
  hero_subtitle:     "We're building a vibrant space where campus buyers, vendors, and deal-hunters come together — forums, leaderboards, exclusive drops, all in one place.",
  waitlist_count:    '2,400+',
  hero_image_url:    '',
  launch_date_label: 'Expected Launch',
}

// ─── Feature cards ────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: MessageCircle, label: 'Campus Forums',      desc: 'Discuss, discover & connect with students at your school',      dot: 'bg-green-500'  },
  { icon: Trophy,        label: 'Vendor Leaderboards', desc: 'Top sellers earn badges & get highlighted across the feed',     dot: 'bg-amber-400'  },
  { icon: Zap,           label: 'Flash Deals Feed',    desc: 'Community-curated deals that disappear fast',                  dot: 'bg-orange-400' },
  { icon: Star,          label: 'Peer Reviews',        desc: 'Honest ratings from real students you can trust',              dot: 'bg-sky-400'    },
  { icon: Heart,         label: 'Saved Collections',   desc: 'Share wishlists and discover what your friends love',          dot: 'bg-pink-400'   },
  { icon: Sparkles,      label: 'Events & Giveaways',  desc: 'Exclusive campus drops and community giveaways',               dot: 'bg-violet-400' },
]

// ─── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(targetISO: string): { time: TimeLeft; mounted: boolean } {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    setMounted(true)

    function calc(): TimeLeft {
      const diff = Math.max(0, new Date(targetISO).getTime() - Date.now())
      return {
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000)  / 60_000),
        seconds: Math.floor((diff % 60_000)     / 1_000),
      }
    }

    setTime(calc())
    const id = setInterval(() => setTime(calc()), 1_000)
    return () => clearInterval(id)
  }, [targetISO])

  return { time, mounted }
}

// ─── Countdown unit ───────────────────────────────────────────────────────────

function CountdownUnit({ value, label, mounted }: { value: number; label: string; mounted: boolean }) {
  const prevRef = useRef(value)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (!mounted) return
    if (prevRef.current !== value) {
      prevRef.current = value
      setFlip(true)
      const t = setTimeout(() => setFlip(false), 280)
      return () => clearTimeout(t)
    }
  }, [value, mounted])

  const display = mounted ? String(value).padStart(2, '0') : '--'

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          relative w-[76px] h-[80px] sm:w-[90px] sm:h-[96px] rounded-2xl
          bg-white border-2 border-black/8 shadow-[0_2px_20px_rgba(0,0,0,0.07)]
          flex items-center justify-center overflow-hidden
          transition-all duration-[280ms]
          ${flip ? 'scale-95 shadow-sm' : 'scale-100'}
        `}
      >
        {/* green bottom bar accent */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-green-500 rounded-b-2xl" />
        <span className="text-3xl sm:text-4xl font-black text-black tabular-nums tracking-tight">
          {display}
        </span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/35">
        {label}
      </span>
    </div>
  )
}

function Colon() {
  return (
    <span className="text-3xl font-black text-black/20 mb-6 select-none leading-none">:</span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CommunityComingSoonPage() {
  const [config,    setConfig]    = useState<CommunityConfig>(DEFAULT_CONFIG)
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  // Load community settings from DB
  useEffect(() => {
    fetch('/api/community-settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.config) setConfig(c => ({ ...c, ...d.config })) })
      .catch(() => {/* use defaults */})
  }, [])

  const { time, mounted } = useCountdown(config.launch_date)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-white text-black overflow-hidden">

      {/* ── Subtle dot grid background ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Top green accent bar ── */}
      <div className="relative z-10 h-1 bg-green-500 w-full" />

      {/* ── Hero section ── */}
      <main className="relative z-10 flex flex-col items-center justify-center px-5 pt-16 pb-24">
        <div className="w-full max-w-3xl flex flex-col items-center text-center gap-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-black text-white text-[11px] font-bold tracking-[0.14em] uppercase px-5 py-2.5 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {config.hero_badge}
          </div>

          {/* Hero image (if set) */}
          {config.hero_image_url && (
            <div className="w-full max-w-lg aspect-video rounded-3xl overflow-hidden border border-black/8 shadow-xl">
              <Image
                src={config.hero_image_url}
                alt="Community preview"
                width={640}
                height={360}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-[80px] font-black leading-[0.95] tracking-tight text-balance">
              <span className="text-black">{config.hero_title_line1}</span>
              <br />
              <span
                className="text-green-500 relative inline-block"
                style={{ WebkitTextStroke: '0px' }}
              >
                {config.hero_title_accent}
                {/* underline squiggle */}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full bg-green-500/25"
                />
              </span>
              <br />
              <span className="text-black/15">Awaits.</span>
            </h1>
            <p className="text-black/55 text-base sm:text-lg leading-relaxed max-w-xl mx-auto text-pretty">
              {config.hero_subtitle}
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-56">
            <div className="flex-1 h-px bg-black/10" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* Launch label */}
          <div className="flex items-center gap-2 text-xs font-bold text-black/40 uppercase tracking-[0.15em]">
            <Clock className="w-3.5 h-3.5" />
            {config.launch_date_label}
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            <CountdownUnit value={time.days}    label="Days"    mounted={mounted} />
            <Colon />
            <CountdownUnit value={time.hours}   label="Hours"   mounted={mounted} />
            <Colon />
            <CountdownUnit value={time.minutes} label="Minutes" mounted={mounted} />
            <Colon />
            <CountdownUnit value={time.seconds} label="Seconds" mounted={mounted} />
          </div>

          {/* Email capture card */}
          <div className="w-full rounded-3xl border border-black/8 bg-black text-white p-7 sm:p-9 shadow-[0_8px_48px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-green-400" />
              <p className="text-sm font-bold">Be the first to know</p>
            </div>
            <p className="text-xs text-white/40 mb-6">
              Join{' '}
              <span className="text-green-400 font-semibold">{config.waitlist_count} students</span>
              {' '}already on the waitlist. No spam, ever.
            </p>

            {!submitted ? (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                    className="flex-1 min-w-0 bg-white/8 border border-white/12 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/15 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95 disabled:opacity-60 text-black font-bold px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap shadow-lg shadow-green-500/30 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>Notify Me <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
                {error && (
                  <p className="mt-3 text-xs text-red-400 text-left">{error}</p>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center gap-2.5 py-1 text-green-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                {"You're on the list! We'll reach out when we launch."}
              </div>
            )}
          </div>

          {/* Feature cards */}
          <div className="w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-5">
              {"What's coming"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, label, desc, dot }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-black/7 bg-white hover:border-green-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                >
                  <div className={`w-2 h-2 rounded-full ${dot} mt-1.5 shrink-0`} />
                  <div>
                    <p className="text-sm font-bold text-black">{label}</p>
                    <p className="text-xs text-black/45 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof row */}
          <div className="flex items-center gap-3 pb-2">
            <div className="flex -space-x-2">
              {['AO','TK','NB','CI','EM'].map((init, i) => (
                <div
                  key={init}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                  style={{ background: i % 2 === 0 ? '#16a34a' : '#111111', zIndex: 5 - i }}
                >
                  {init}
                </div>
              ))}
            </div>
            <p className="text-xs text-black/45">
              <span className="font-bold text-black/70">{config.waitlist_count} students</span> already waiting
            </p>
          </div>

          {/* Bottom brand line */}
          <div className="flex items-center gap-1.5 text-xs text-black/30 font-semibold">
            <Users className="w-3.5 h-3.5 text-green-500" />
            VendoorX Community &mdash; Coming {new Date(config.launch_date).getFullYear()}
          </div>

        </div>
      </main>
    </div>
  )
}
