'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Send, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface NewsletterFormProps {
  className?: string
  variant?: 'inline' | 'card'
}

type AuthState =
  | { kind: 'loading' }
  | { kind: 'guest' }
  | { kind: 'user'; email: string; firstName: string | null }

export function NewsletterForm({ className = '', variant = 'inline' }: NewsletterFormProps) {
  const [auth, setAuth] = useState<AuthState>({ kind: 'loading' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [alreadySubscribed, setAlreadySubscribed] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch (e) {
      // Supabase env missing or misconfigured — degrade to guest so the user
      // gets a clear "log in" CTA instead of a blank/broken form.
      console.error('[newsletter-form] supabase client init failed', e)
      setAuth({ kind: 'guest' })
      return
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return
      if (!user?.email) {
        setAuth({ kind: 'guest' })
        return
      }
      const meta = (user.user_metadata || {}) as Record<string, unknown>
      const fullName =
        (typeof meta.full_name === 'string' && meta.full_name) ||
        (typeof meta.name === 'string' && meta.name) ||
        ''
      const firstName = fullName.trim().split(/\s+/)[0] || null
      setAuth({ kind: 'user', email: user.email, firstName })
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      const user = session?.user
      if (!user?.email) { setAuth({ kind: 'guest' }); return }
      const meta = (user.user_metadata || {}) as Record<string, unknown>
      const fullName =
        (typeof meta.full_name === 'string' && meta.full_name) ||
        (typeof meta.name === 'string' && meta.name) ||
        ''
      const firstName = fullName.trim().split(/\s+/)[0] || null
      setAuth({ kind: 'user', email: user.email, firstName })
    })
    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

  // Fetch current subscription status whenever we land in the "user" auth
  // state. Lets us flip the button to "Already subscribed ✓" before they
  // even click — no double-subscribe attempts.
  useEffect(() => {
    if (auth.kind !== 'user') { setAlreadySubscribed(null); return }
    let cancelled = false
    fetch('/api/newsletter/subscribe/status', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : { subscribed: false })
      .then(d => { if (!cancelled) setAlreadySubscribed(!!d.subscribed) })
      .catch(() => { if (!cancelled) setAlreadySubscribed(false) })
    return () => { cancelled = true }
  }, [auth])

  function handleGuestClick(e: React.MouseEvent | React.FormEvent) {
    e.preventDefault()
    toast.error('Please log in to subscribe to our newsletter — we only allow verified accounts to subscribe to keep things spam-free. 🛡️', {
      action: { label: 'Log in', onClick: () => { window.location.href = '/auth/login' } },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (auth.kind !== 'user') { handleGuestClick(e); return }
    if (alreadySubscribed) {
      toast.info("You're already subscribed — thanks! 💚")
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: auth.firstName }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Subscribed! Check your email.')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Connection error. Try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 text-green-600 font-semibold ${className}`}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    )
  }

  // ─── CARD VARIANT ──────────────────────────────────────────────────────────
  if (variant === 'card') {
    return (
      <div className={`rounded-2xl bg-[#0a0a0a] p-6 text-white ${className}`}>
        <h3 className="text-lg font-black mb-1">Stay in the loop</h3>
        <p className="text-sm text-white/60 mb-4">
          Exclusive deals, new features &amp; seller tips — straight to your inbox.
        </p>

        {auth.kind === 'loading' && (
          <div className="flex items-center gap-2 text-white/60 text-sm py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking your account…
          </div>
        )}

        {auth.kind === 'guest' && (
          <div>
            <Link
              href="/auth/login"
              onClick={handleGuestClick}
              className="flex items-center justify-center gap-2 w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-4 py-3 rounded-xl text-sm transition-colors"
            >
              <Lock className="w-4 h-4" />
              Log in to subscribe
            </Link>
            <p className="mt-2 text-xs text-white/50 text-center">
              We only accept subscriptions from verified accounts to prevent spam.
            </p>
          </div>
        )}

        {auth.kind === 'user' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5">
              <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
              <span className="text-sm text-white/90 truncate" title={auth.email}>{auth.email}</span>
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || alreadySubscribed === true}
              title={alreadySubscribed ? "You're already on the list" : undefined}
              className="flex items-center justify-center gap-2 w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : alreadySubscribed
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <Send className="w-4 h-4" />}
              {alreadySubscribed ? 'Already subscribed' : 'Subscribe'}
            </button>
            {status === 'error' && (
              <p className="text-xs text-red-400">{message}</p>
            )}
          </form>
        )}
      </div>
    )
  }

  // ─── INLINE VARIANT ────────────────────────────────────────────────────────
  if (auth.kind === 'loading') {
    return (
      <div className={`flex items-center gap-2 text-white/60 text-sm ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" /> Checking your account…
      </div>
    )
  }

  if (auth.kind === 'guest') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Link
          href="/auth/login"
          onClick={handleGuestClick}
          className="flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
        >
          <Lock className="w-4 h-4" />
          Log in to subscribe
        </Link>
        <p className="text-xs text-white/60">
          Verified accounts only — keeps our list spam-free.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5">
          <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
          <span className="text-sm text-white truncate" title={auth.email}>{auth.email}</span>
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || alreadySubscribed === true}
          title={alreadySubscribed ? "You're already on the list" : undefined}
          className="flex items-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
        >
          {status === 'loading'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : alreadySubscribed
              ? <CheckCircle2 className="w-4 h-4" />
              : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">{alreadySubscribed ? 'Subscribed' : 'Subscribe'}</span>
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-400">{message}</p>
      )}
    </form>
  )
}
