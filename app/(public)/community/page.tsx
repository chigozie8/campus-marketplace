'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Users, Bell, ArrowRight, MessageCircle, Star,
  Zap, Trophy, Heart, Sparkles, CheckCircle2,
} from 'lucide-react'

const AVATARS = [
  { initials: 'AO', color: 'bg-emerald-500', delay: '0s',   top: '15%', left: '8%'  },
  { initials: 'TK', color: 'bg-green-400',   delay: '0.4s', top: '25%', left: '88%' },
  { initials: 'NB', color: 'bg-teal-500',    delay: '0.8s', top: '65%', left: '6%'  },
  { initials: 'CI', color: 'bg-lime-500',    delay: '1.2s', top: '70%', left: '90%' },
  { initials: 'EM', color: 'bg-emerald-600', delay: '0.2s', top: '45%', left: '3%'  },
  { initials: 'RS', color: 'bg-green-600',   delay: '1s',   top: '40%', left: '94%' },
]

const FEATURES = [
  { icon: MessageCircle, label: 'Campus Forums',        desc: 'Discuss, discover & connect with students at your school' },
  { icon: Trophy,        label: 'Vendor Leaderboards',  desc: 'Top sellers earn badges & get highlighted across the feed' },
  { icon: Zap,           label: 'Flash Deals Feed',     desc: 'Community-curated deals that disappear fast'              },
  { icon: Star,          label: 'Peer Reviews',         desc: 'Honest ratings from real students you can trust'          },
  { icon: Heart,         label: 'Saved Collections',    desc: 'Share wishlists and discover what your friends love'      },
  { icon: Sparkles,      label: 'Events & Giveaways',   desc: 'Exclusive campus drops and community giveaways'           },
]

function useCountdown(targetDate: Date) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTime({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000)  / 60_000),
        seconds: Math.floor((diff % 60_000)     / 1_000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return time
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const prev = useRef(value)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value
      setFlip(true)
      const t = setTimeout(() => setFlip(false), 300)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`
          w-16 h-16 sm:w-20 sm:h-20 rounded-2xl
          bg-white border-2 border-green-100
          flex items-center justify-center
          shadow-lg shadow-green-100/60
          transition-transform duration-300
          ${flip ? 'scale-90' : 'scale-100'}
        `}
      >
        <span className="text-2xl sm:text-3xl font-black text-green-600 tabular-nums leading-none">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">{label}</span>
    </div>
  )
}

export default function CommunityComingSoonPage() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Launch: 60 days from a fixed date so SSR/CSR match
  const launchDate = new Date('2025-09-01T00:00:00Z')
  const { days, hours, minutes, seconds } = useCountdown(launchDate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'community' }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white flex flex-col">

      {/* ── Background decoration ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Large soft green circle – top-left */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-green-50 opacity-80" />
        {/* Large soft circle – bottom-right */}
        <div className="absolute -bottom-52 -right-52 w-[700px] h-[700px] rounded-full bg-emerald-50 opacity-70" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right,#16a34a 1px,transparent 1px),linear-gradient(to bottom,#16a34a 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ── Floating student avatars ── */}
      <div aria-hidden className="pointer-events-none hidden lg:block">
        {AVATARS.map(({ initials, color, delay, top, left }) => (
          <div
            key={initials}
            className={`absolute w-11 h-11 rounded-full ${color} flex items-center justify-center text-white text-xs font-black shadow-lg`}
            style={{
              top, left,
              animation: `float 4s ease-in-out ${delay} infinite`,
            }}
          >
            {initials}
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-20">
        <div className="w-full max-w-2xl flex flex-col items-center text-center gap-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Something exciting is coming
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-950 leading-[1.05] tracking-tight text-balance">
              Your Campus<br />
              <span className="text-green-500">Community</span> Awaits
            </h1>
            <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg mx-auto text-pretty">
              We&apos;re building a vibrant space where campus buyers, vendors, and deal-hunters come together. Forums, leaderboards, exclusive drops — all in one place.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3 sm:gap-5">
            <CountdownUnit value={days}    label="Days"    />
            <Dot />
            <CountdownUnit value={hours}   label="Hours"   />
            <Dot />
            <CountdownUnit value={minutes} label="Mins"    />
            <Dot />
            <CountdownUnit value={seconds} label="Secs"    />
          </div>

          {/* Email signup */}
          <div className="w-full bg-white border-2 border-green-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-green-50">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Bell className="w-4 h-4 text-green-500" />
              <p className="text-sm font-bold text-gray-800">Get early access</p>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Join {' '}
              <span className="text-green-600 font-semibold">2,400+ students</span>
              {' '}already on the waitlist. No spam, ever.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  required
                  className="flex-1 min-w-0 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all whitespace-nowrap shadow-md shadow-green-200"
                >
                  {loading ? 'Saving…' : (
                    <>Notify Me <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2.5 py-2 text-green-600 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                You&apos;re on the list! We&apos;ll reach out soon.
              </div>
            )}

            {error && <p className="mt-2 text-xs text-red-500 text-left">{error}</p>}
          </div>

          {/* Features grid */}
          <div className="w-full">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              What&apos;s coming
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-md hover:shadow-green-50 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof avatars */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {['AO','TK','NB','CI','EM'].map((init, i) => (
                <div
                  key={init}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white ${
                    ['bg-emerald-500','bg-green-400','bg-teal-500','bg-lime-500','bg-green-600'][i]
                  }`}
                >
                  {init}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              <span className="font-bold text-gray-700">2,400+ students</span> waiting to join
            </p>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-gray-100 py-5 px-5 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Users className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs font-black text-gray-800 tracking-tight">
            Vendoor<span className="text-green-500">X</span> Community
          </span>
        </div>
        <p className="text-[11px] text-gray-400">
          &copy; {new Date().getFullYear()} VendoorX &middot; Building Nigeria&apos;s campus marketplace
        </p>
      </footer>

      {/* ── Float keyframes ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}

function Dot() {
  return (
    <span className="text-2xl font-black text-green-300 leading-none select-none mb-6">:</span>
  )
}
