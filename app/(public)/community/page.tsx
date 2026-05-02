'use client'

import { useState, useEffect, useRef } from 'react'
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
          'w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm',
          'flex items-center justify-center relative overflow-hidden',
          'transition-all duration-250',
          flip ? 'scale-95 opacity-70' : 'scale-100 opacity-100',
        ].join(' ')}
        style={{ aspectRatio: '1 / 1', maxWidth: 100 }}
      >
        {/* green top glow line */}
        <span className="absolute top-0 inset-x-0 h-px bg-green-400/60" />
        {/* inner glow */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <span
          className="font-black tabular-nums text-white leading-none relative z-10"
          style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)' }}
        >
          {display}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 text-center">
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
    <div
      className="min-h-screen font-sans relative overflow-hidden"
      style={{ background: '#080b08' }}
    >
      {/* ── Background: radial glow + grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,197,94,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(34,197,94,0.07) 0%, transparent 60%),
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* ── Announcement bar ── */}
      <div
        className="relative z-10 border-b border-white/5 py-2.5 px-4 text-center"
        style={{ background: 'rgba(34,197,94,0.08)' }}
      >
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          {config.hero_badge}
        </span>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-28">

        {/* ── HERO ── */}
        <div className="text-center mb-16 sm:mb-20 space-y-6">
          {/* overline chip */}
          <div className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-green-400">Coming Soon</span>
          </div>

          {/* Headline */}
          <h1
            className="font-black leading-[0.9] tracking-tight text-balance mx-auto"
            style={{ fontSize: 'clamp(3.2rem, 10vw, 7.5rem)', maxWidth: '14ch' }}
          >
            <span className="text-white block">{config.hero_title_line1}</span>
            <span
              className="block"
              style={{
                WebkitTextFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                backgroundImage: 'linear-gradient(135deg, #4ade80 0%, #22c55e 40%, #16a34a 100%)',
              }}
            >
              {config.hero_title_accent}
            </span>
            <span className="text-white/10 block">Awaits.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg leading-relaxed text-white/45 text-pretty mx-auto"
            style={{ maxWidth: '52ch' }}
          >
            {config.hero_subtitle}
          </p>

          {/* Social proof */}
          <div className="inline-flex items-center gap-3 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full px-5 py-2.5">
            <div className="flex -space-x-2" aria-hidden>
              {['AO', 'TK', 'NB', 'CI', 'EM'].map((init, i) => (
                <div
                  key={init}
                  className="w-7 h-7 rounded-full border-2 border-white/10 flex items-center justify-center text-[9px] font-black text-white shrink-0"
                  style={{
                    background: i % 2 === 0 ? '#16a34a' : '#1a1a1a',
                    zIndex: 5 - i,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50">
              <span className="font-bold text-white">{config.waitlist_count}</span> students already waiting
            </p>
          </div>
        </div>

        {/* ── COUNTDOWN ── */}
        <div className="mb-16 sm:mb-20">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
              {config.launch_date_label}
            </span>
          </div>

          <div className="flex items-start justify-center gap-2 sm:gap-4 max-w-md mx-auto">
            <CountCard value={time.days}    label="Days"    mounted={mounted} />
            <span className="text-2xl sm:text-4xl font-black text-white/15 mt-4 sm:mt-5 leading-none select-none shrink-0">:</span>
            <CountCard value={time.hours}   label="Hours"   mounted={mounted} />
            <span className="text-2xl sm:text-4xl font-black text-white/15 mt-4 sm:mt-5 leading-none select-none shrink-0">:</span>
            <CountCard value={time.minutes} label="Mins"    mounted={mounted} />
            <span className="text-2xl sm:text-4xl font-black text-white/15 mt-4 sm:mt-5 leading-none select-none shrink-0">:</span>
            <CountCard value={time.seconds} label="Secs"    mounted={mounted} />
          </div>

          <div className="flex justify-center mt-5">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
              <Users className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400">
                Launch {new Date(config.launch_date).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* ── EMAIL CAPTURE ── */}
        <div
          className="mb-16 sm:mb-20 rounded-3xl border border-white/10 p-8 sm:p-12 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
        >
          {/* subtle green glow inside card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 grid md:grid-cols-[1fr_1fr] gap-8 items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center border border-green-500/20">
                  <Bell className="w-4 h-4 text-green-400" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">Get early access</h2>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
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
                      className="flex-1 min-w-0 border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 text-sm text-white font-medium placeholder:text-white/20 outline-none focus:border-green-500/60 focus:bg-white/8 transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95 text-black font-black px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
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
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-green-300">{"You're on the list!"}</p>
                    <p className="text-xs text-green-400/60 mt-0.5">{"We'll reach out the moment we launch."}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div>
          <div className="flex items-center gap-4 mb-8 justify-center">
            <div className="flex-1 max-w-16 h-px bg-white/10 hidden sm:block" />
            <h2 className="text-lg font-black tracking-tight text-white/70 uppercase text-[11px] tracking-[0.2em]">
              {"What's coming"}
            </h2>
            <div className="flex-1 max-w-16 h-px bg-white/10 hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <div
                key={label}
                className="group rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col gap-3 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-green-500/15 group-hover:border-green-500/20 transition-all">
                    <Icon className="w-4.5 h-4.5 text-white/50 group-hover:text-green-400 transition-colors" style={{ width: 18, height: 18 }} />
                  </div>
                  <span className="text-[10px] font-black text-white/10 tabular-nums group-hover:text-green-500/30 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-black text-white/80">{label}</p>
                  <p className="text-xs text-white/35 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
