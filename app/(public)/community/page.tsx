'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle, Trophy, Zap, Star, Bell,
  ArrowRight, CheckCircle2, Users, Clock,
  ShieldCheck, Sparkles,
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
  { icon: MessageCircle, label: 'Campus Forums',       desc: 'Discuss, discover & connect with your campus community' },
  { icon: Trophy,        label: 'Vendor Leaderboards', desc: 'Top sellers earn badges and get featured in the feed'     },
  { icon: Zap,           label: 'Flash Deals',         desc: 'Community-curated deals that disappear fast'             },
  { icon: Star,          label: 'Peer Reviews',        desc: 'Honest ratings from real students you can trust'         },
  { icon: ShieldCheck,   label: 'Verified Sellers',    desc: 'Campus ID-verified vendors you can trust'                },
  { icon: Sparkles,      label: 'Events & Drops',      desc: 'Exclusive campus giveaways and community events'         },
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
  const prevRef = useRef(value)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (!mounted) return
    if (prevRef.current !== value) {
      prevRef.current = value
      setAnimate(true)
      const t = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(t)
    }
  }, [value, mounted])

  const display = mounted ? String(value).padStart(2, '0') : '--'

  return (
    <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
      <div
        className={[
          'w-full aspect-square max-w-[90px] rounded-2xl border-2 border-black',
          'bg-white flex items-center justify-center relative overflow-hidden',
          'transition-transform duration-300',
          animate ? 'scale-90' : 'scale-100',
        ].join(' ')}
      >
        {/* green top stripe */}
        <span className="absolute top-0 inset-x-0 h-[3px] bg-green-500" />
        <span
          className="font-black tabular-nums text-black leading-none"
          style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}
        >
          {display}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 text-center">
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
    <div className="min-h-screen bg-white text-black font-sans">

      {/* ── Announcement bar ── */}
      <div className="bg-black text-white text-center text-[11px] font-semibold tracking-wide py-2.5 px-4">
        <span className="inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          {config.hero_badge}
        </span>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-24">

        {/* ── HERO ── */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-start border-b-2 border-black pb-14 mb-14">

          {/* Left: text */}
          <div className="space-y-7">
            {/* overline */}
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-green-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-green-600">
                Coming Soon
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-black leading-[0.92] tracking-tight text-balance"
              style={{ fontSize: 'clamp(3rem, 9vw, 6rem)' }}
            >
              <span className="block text-black">{config.hero_title_line1}</span>
              <span className="block relative text-green-500">
                {config.hero_title_accent}
                <svg
                  aria-hidden
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 300 10"
                  preserveAspectRatio="none"
                  height="8"
                >
                  <path
                    d="M0,5 Q75,1 150,5 Q225,9 300,5"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeOpacity="0.4"
                  />
                </svg>
              </span>
              <span className="block text-black/10">Awaits.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-black/55 leading-relaxed max-w-lg text-pretty">
              {config.hero_subtitle}
            </p>

            {/* Social proof */}
            <div className="inline-flex items-center gap-3 bg-black/[0.03] border border-black/8 rounded-full px-4 py-2">
              <div className="flex -space-x-2" aria-hidden>
                {['AO', 'TK', 'NB', 'CI', 'EM'].map((init, i) => (
                  <div
                    key={init}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white"
                    style={{ background: i % 2 === 0 ? '#16a34a' : '#111', zIndex: 5 - i }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-xs text-black/60">
                <span className="font-bold text-black">{config.waitlist_count}</span> students waiting
              </p>
            </div>
          </div>

          {/* Right: countdown */}
          <div className="lg:pt-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-4">
              <Clock className="w-3 h-3" />
              {config.launch_date_label}
            </div>

            {/* countdown grid — fully fluid */}
            <div className="flex items-start gap-2 sm:gap-3">
              <CountCard value={time.days}    label="Days"    mounted={mounted} />
              <span className="text-2xl sm:text-3xl font-black text-black/20 mt-3 leading-none select-none">:</span>
              <CountCard value={time.hours}   label="Hours"   mounted={mounted} />
              <span className="text-2xl sm:text-3xl font-black text-black/20 mt-3 leading-none select-none">:</span>
              <CountCard value={time.minutes} label="Mins"    mounted={mounted} />
              <span className="text-2xl sm:text-3xl font-black text-black/20 mt-3 leading-none select-none">:</span>
              <CountCard value={time.seconds} label="Secs"    mounted={mounted} />
            </div>

            {/* launch year chip */}
            <div className="mt-5 inline-flex items-center gap-2 bg-green-500 text-black text-[11px] font-black uppercase tracking-[0.12em] px-3 py-1.5 rounded-lg">
              <Users className="w-3 h-3" />
              Launch {new Date(config.launch_date).getFullYear()}
            </div>
          </div>
        </div>

        {/* ── EMAIL CAPTURE ── */}
        <div className="grid md:grid-cols-[1fr_1fr] gap-8 items-center border-b-2 border-black pb-14 mb-14">
          {/* copy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-green-500" />
              <h2 className="text-lg font-black tracking-tight">Get early access</h2>
            </div>
            <p className="text-sm text-black/50 leading-relaxed">
              Drop your email and be the first through the door when we open. No spam — just the launch announcement.
            </p>
          </div>

          {/* form */}
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
                    className="flex-1 min-w-0 border-2 border-black rounded-xl px-4 py-3 text-sm font-medium placeholder:text-black/30 outline-none focus:border-green-500 transition-colors disabled:opacity-50 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-black hover:bg-green-600 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  <p className="text-xs text-red-500 font-medium">{error}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-green-50 border-2 border-green-500 rounded-xl px-5 py-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-black text-green-900">{"You're on the list!"}</p>
                  <p className="text-xs text-green-700 mt-0.5">{"We'll reach out the moment we launch."}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div>
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{"What's coming"}</h2>
            <div className="flex-1 h-px bg-black/10 hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <div
                key={label}
                className="bg-white p-6 flex flex-col gap-3 hover:bg-green-50/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-black">{label}</p>
                  <p className="text-xs text-black/45 mt-1 leading-relaxed">{desc}</p>
                </div>
                {/* feature number */}
                <span className="mt-auto text-[10px] font-black text-black/15 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
