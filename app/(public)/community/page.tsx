'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Trophy,
  Zap,
  Star,
  Heart,
  Sparkles,
  Bell,
  ArrowRight,
  CheckCircle2,
  Users,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Fixed future target — always in the future relative to now
const LAUNCH_DATE = new Date('2025-11-01T00:00:00Z')

const FEATURES = [
  {
    icon: MessageCircle,
    label: 'Campus Forums',
    desc: 'Discuss, discover & connect with students at your school',
    accent: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    icon: Trophy,
    label: 'Vendor Leaderboards',
    desc: 'Top sellers earn badges & get highlighted across the feed',
    accent: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: Zap,
    label: 'Flash Deals Feed',
    desc: 'Community-curated deals that disappear fast',
    accent: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    icon: Star,
    label: 'Peer Reviews',
    desc: 'Honest ratings from real students you can trust',
    accent: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Heart,
    label: 'Saved Collections',
    desc: 'Share wishlists and discover what your friends love',
    accent: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  {
    icon: Sparkles,
    label: 'Events & Giveaways',
    desc: 'Exclusive campus drops and community giveaways',
    accent: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
]

const AVATAR_DATA = [
  { initials: 'AO', bg: '#16a34a', delay: 0,   top: '14%', left: '5%' },
  { initials: 'TK', bg: '#15803d', delay: 0.5, top: '28%', left: '91%' },
  { initials: 'NB', bg: '#14532d', delay: 1,   top: '62%', left: '4%' },
  { initials: 'CI', bg: '#166534', delay: 1.5, top: '72%', left: '92%' },
  { initials: 'EM', bg: '#4ade80', delay: 0.3, top: '46%', left: '2%' },
  { initials: 'RS', bg: '#22c55e', delay: 0.8, top: '40%', left: '95%' },
]

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(target: Date): TimeLeft {
  const calc = (): TimeLeft => {
    const diff = Math.max(0, target.getTime() - Date.now())
    return {
      days:    Math.floor(diff / 86_400_000),
      hours:   Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
    }
  }

  const [time, setTime] = useState<TimeLeft>(calc)

  useEffect(() => {
    // Re-run immediately to sync after hydration
    setTime(calc())
    const id = setInterval(() => setTime(calc()), 1_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return time
}

// ─── Countdown unit ───────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const prevRef = useRef(value)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value
      setFlip(true)
      const t = setTimeout(() => setFlip(false), 300)
      return () => clearTimeout(t)
    }
  }, [value])

  const display = String(value).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          relative w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl
          bg-white/5 border border-white/10
          flex items-center justify-center
          overflow-hidden
          transition-transform duration-300
          ${flip ? 'scale-95' : 'scale-100'}
        `}
      >
        {/* subtle green glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-500/10 to-transparent" />
        <span className="relative text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">
          {display}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <span className="text-xl sm:text-2xl font-black text-green-500/50 leading-none mb-7 select-none">
      :
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CommunityComingSoonPage() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const { days, hours, minutes, seconds } = useCountdown(LAUNCH_DATE)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()
      if (res.ok && (data.success || data.message === 'Already registered.')) {
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
    <div className="relative min-h-screen bg-[#080808] text-white overflow-hidden flex flex-col">

      {/* ── Grid overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Radial green glow ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(22,163,74,0.18) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[700px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(22,163,74,0.10) 0%, transparent 70%)' }}
      />

      {/* ── Floating avatars (desktop only) ── */}
      <div aria-hidden className="pointer-events-none hidden lg:block">
        {AVATAR_DATA.map(({ initials, bg, delay, top, left }) => (
          <div
            key={initials}
            className="absolute w-11 h-11 rounded-full border-2 border-white/10 flex items-center justify-center text-white text-xs font-black shadow-lg"
            style={{
              background: bg,
              top,
              left,
              animation: `float 5s ease-in-out ${delay}s infinite`,
            }}
          >
            {initials}
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-20">
        <div className="w-full max-w-2xl flex flex-col items-center text-center gap-10">

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold tracking-[0.15em] uppercase px-5 py-2.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Something exciting is coming
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-[72px] font-black leading-[1.02] tracking-tight text-balance">
              Your Campus
              <br />
              <span className="text-green-400">Community</span>
              <br />
              <span className="text-white/30">Awaits.</span>
            </h1>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-lg mx-auto text-pretty font-medium">
              We&apos;re building a vibrant space where campus buyers, vendors, and deal-hunters come together. Forums, leaderboards, exclusive drops — all in one place.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3 sm:gap-4">
            <CountdownUnit value={days}    label="Days"    />
            <Separator />
            <CountdownUnit value={hours}   label="Hours"   />
            <Separator />
            <CountdownUnit value={minutes} label="Mins"    />
            <Separator />
            <CountdownUnit value={seconds} label="Secs"    />
          </div>

          {/* Email capture card */}
          <div className="w-full bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 justify-center mb-1.5">
              <Bell className="w-4 h-4 text-green-400" />
              <p className="text-sm font-bold text-white">Get early access</p>
            </div>
            <p className="text-xs text-white/40 mb-6">
              Join{' '}
              <span className="text-green-400 font-semibold">2,400+ students</span>
              {' '}already on the waitlist. No spam, ever.
            </p>

            {!submitted ? (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95 disabled:opacity-60 text-black font-bold px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap shadow-lg shadow-green-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Saving…
                      </span>
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
              <div className="flex items-center justify-center gap-2.5 py-2 text-green-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                You&apos;re on the list! We&apos;ll reach out when we launch.
              </div>
            )}
          </div>

          {/* Features grid */}
          <div className="w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-5">
              What&apos;s coming
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, label, desc, accent, bg }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06] transition-all text-left"
                >
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${accent}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">{label}</p>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {AVATAR_DATA.slice(0, 5).map(({ initials, bg }) => (
                <div
                  key={initials}
                  className="w-8 h-8 rounded-full border-2 border-[#080808] flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: bg }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40">
              <span className="font-bold text-white/70">2,400+ students</span> waiting to join
            </p>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-5 px-5 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Users className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs font-black text-white/60 tracking-tight">
            Vendoor<span className="text-green-500">X</span> Community
          </span>
        </div>
        <p className="text-[11px] text-white/25">
          &copy; {new Date().getFullYear()} VendoorX &middot; Building Nigeria&apos;s campus marketplace
        </p>
      </footer>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-14px) rotate(1deg); }
        }
      `}</style>
    </div>
  )
}
