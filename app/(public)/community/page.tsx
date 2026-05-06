'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  MessageCircle, Trophy, Zap, Star,
  Bell, ArrowRight, CheckCircle2, Users,
  ShieldCheck, Sparkles, Clock,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CommunityConfig {
  launch_date: string
  hero_badge: string
  hero_title_line1: string
  hero_title_accent: string
  hero_subtitle: string
  waitlist_count: string
  hero_image_url: string
  launch_date_label: string
}

const DEFAULT_CONFIG: CommunityConfig = {
  launch_date: '2027-01-01T00:00:00Z',
  hero_badge: 'Something exciting is coming',
  hero_title_line1: 'Your Campus',
  hero_title_accent: 'Community',
  hero_subtitle:
    "We're building a vibrant space where campus buyers, vendors, and deal-hunters come together — forums, leaderboards, exclusive drops, all in one place.",
  waitlist_count: '2,400+',
  hero_image_url: '',
  launch_date_label: 'Expected Launch',
}

const FEATURES = [
  { icon: MessageCircle, label: 'Campus Forums',       desc: 'Discuss, discover & connect with your campus community'  },
  { icon: Trophy,        label: 'Vendor Leaderboards', desc: 'Top sellers earn badges and get featured in the feed'      },
  { icon: Zap,           label: 'Flash Deals',         desc: 'Community-curated deals that disappear fast'              },
  { icon: Star,          label: 'Peer Reviews',        desc: 'Honest ratings from real students you can trust'          },
  { icon: ShieldCheck,   label: 'Verified Sellers',    desc: 'Campus ID-verified vendors you can trust'                 },
  { icon: Sparkles,      label: 'Events & Drops',      desc: 'Exclusive campus giveaways and community events'          },
]

// ── Floating animation styles ──
const floatingStyle = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-25px) rotate(2deg); }
  }
  @keyframes pulse-border {
    0%, 100% { border-color: rgba(34, 197, 94, 0.2); }
    50% { border-color: rgba(34, 197, 94, 0.6); }
  }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
`

// ── Countdown hook ─────────────────────────────────────────────────────────────

function useCountdown(targetISO: string) {
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

// ── Countdown card ─────────────────────────────────────────────────────────────

function CountCard({ value, label, mounted }: { value: number; label: string; mounted: boolean }) {
  const prevRef  = useRef(value)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (!mounted) return
    if (prevRef.current !== value) {
      prevRef.current = value
      setFlip(true)
      const t = setTimeout(() => setFlip(false), 250)
      return () => clearTimeout(t)
    }
  }, [value, mounted])

  const display = mounted ? String(value).padStart(2, '0') : '00'

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      {/* glass card */}
      <div
        className={[
          'w-full rounded-2xl border border-green-200 dark:border-green-700 bg-white dark:bg-slate-800 shadow-sm',
          'flex items-center justify-center relative overflow-hidden',
          'transition-all duration-250',
          flip ? 'scale-95 opacity-70' : 'scale-100 opacity-100',
        ].join(' ')}
        style={{ aspectRatio: '1 / 1', maxWidth: 100 }}
      >
        {/* green top glow line */}
        <span className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60" />
        {/* inner glow */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-green-50 dark:from-green-950/20 to-transparent pointer-events-none" />
        <span
          className="font-black tabular-nums text-slate-900 dark:text-white leading-none relative z-10"
          style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)' }}
        >
          {display}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-center">
        {label}
      </span>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CommunityComingSoonPage() {
  const [config,    setConfig]    = useState<CommunityConfig>(DEFAULT_CONFIG)
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    fetch('/api/community-settings')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.config) setConfig(c => ({ ...c, ...d.config })) })
      .catch(() => {})
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
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-white dark:bg-slate-950">
      <style>{floatingStyle}</style>

      {/* ── Background: gradient circles + grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl opacity-40 dark:opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-green-200/20 to-transparent rounded-full blur-3xl opacity-40 dark:opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,1px) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1px) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Announcement bar ── */}
      <div className="relative z-10 border-b border-green-200 dark:border-green-900 py-2.5 px-4 text-center bg-green-50 dark:bg-green-950/30">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-green-600 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse shrink-0" />
          {config.hero_badge}
        </span>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-28">

        {/* ── HERO ── */}
        <div className="text-center mb-16 sm:mb-20 space-y-6">
          {/* overline chip */}
          <div className="inline-flex items-center gap-2 border border-green-300 dark:border-green-700 bg-green-100/50 dark:bg-green-950/50 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700 dark:text-green-400">Coming Soon</span>
          </div>

          {/* Headline */}
          <h1
            className="font-black leading-[0.9] tracking-tight text-balance mx-auto text-slate-900 dark:text-white"
            style={{ fontSize: 'clamp(3.2rem, 10vw, 7.5rem)', maxWidth: '14ch' }}
          >
            <span className="block">{config.hero_title_line1}</span>
            <span
              className="block"
              style={{
                WebkitTextFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                backgroundImage: 'linear-gradient(135deg, #16a34a 0%, #22c55e 40%, #4ade80 100%)',
              }}
            >
              {config.hero_title_accent}
            </span>
            <span className="text-slate-300 dark:text-slate-700 block">Awaits.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 text-pretty mx-auto"
            style={{ maxWidth: '52ch' }}
          >
            {config.hero_subtitle}
          </p>

          {/* Social proof */}
          <div className="inline-flex items-center gap-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-sm">
            <div className="flex -space-x-2" aria-hidden>
              {['AO', 'TK', 'NB', 'CI', 'EM'].map((init, i) => (
                <div
                  key={init}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-black text-white shrink-0"
                  style={{
                    background: i % 2 === 0 ? '#16a34a' : '#94a3b8',
                    zIndex: 5 - i,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">{config.waitlist_count}</span> students already waiting
            </p>
          </div>
        </div>

        {/* ── HERO IMAGE SECTION WITH ANIMATION ── */}
        {config.hero_image_url && (
          <div className="mb-16 sm:mb-20">
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              {/* Image wrapper with shimmer effect */}
              <div className="relative h-96 sm:h-96 w-full bg-gradient-to-br from-green-100 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                <Image
                  src={config.hero_image_url}
                  alt="Community showcase"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* ── COUNTDOWN ── */}
        <div className="mb-16 sm:mb-20">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {config.launch_date_label}
            </span>
          </div>

          <div className="flex items-start justify-center gap-2 sm:gap-4 max-w-md mx-auto">
            <CountCard value={time.days}    label="Days"    mounted={mounted} />
            <span className="text-2xl sm:text-4xl font-black text-slate-300 dark:text-slate-600 mt-4 sm:mt-5 leading-none select-none shrink-0">:</span>
            <CountCard value={time.hours}   label="Hours"   mounted={mounted} />
            <span className="text-2xl sm:text-4xl font-black text-slate-300 dark:text-slate-600 mt-4 sm:mt-5 leading-none select-none shrink-0">:</span>
            <CountCard value={time.minutes} label="Mins"    mounted={mounted} />
            <span className="text-2xl sm:text-4xl font-black text-slate-300 dark:text-slate-600 mt-4 sm:mt-5 leading-none select-none shrink-0">:</span>
            <CountCard value={time.seconds} label="Secs"    mounted={mounted} />
          </div>

          <div className="flex justify-center mt-5">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-lg px-4 py-2">
              <Users className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-bold text-green-700 dark:text-green-400">
                Launch {new Date(config.launch_date).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* ── EMAIL CAPTURE ── */}
        <div
          className="mb-16 sm:mb-20 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 relative overflow-hidden bg-white dark:bg-slate-900/50 shadow-lg"
        >
          {/* subtle green glow inside card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 grid md:grid-cols-[1fr_1fr] gap-8 items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center border border-green-300 dark:border-green-700">
                  <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Get early access</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drop your email and be the first through the door when we open. No spam — just the launch announcement.
              </p>
            </div>

            <div>
              {!submitted ? (
                <div className="space-y-3">
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@university.edu"
                      required
                      disabled={loading}
                      className="flex-1 min-w-0 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-green-400 dark:focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/30 transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 active:scale-95 text-white font-black px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-60 shadow-lg shadow-green-600/30"
                    >
                      {loading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          Notify Me
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                  {error && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-xl px-5 py-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-green-700 dark:text-green-300">{"You're on the list!"}</p>
                    <p className="text-xs text-green-600 dark:text-green-500/80 mt-0.5">{"We'll reach out the moment we launch."}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div>
          <div className="flex items-center gap-4 mb-8 justify-center">
            <div className="flex-1 max-w-16 h-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <h2 className="text-lg font-black tracking-tight text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-[0.2em]">
              {"What's coming"}
            </h2>
            <div className="flex-1 max-w-16 h-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <div
                key={label}
                className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 flex flex-col gap-3 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all duration-300 shadow-sm hover:shadow-lg"
                style={{ animation: `float-delayed 4s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-700 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 group-hover:border-green-400 dark:group-hover:border-green-600 transition-all">
                    <Icon className="w-4.5 h-4.5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" style={{ width: 18, height: 18 }} />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 tabular-nums group-hover:text-green-400 dark:group-hover:text-green-600 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
