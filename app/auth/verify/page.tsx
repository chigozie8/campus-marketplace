'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, RefreshCw, Mail, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

function VerifyPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = (searchParams.get('email') ?? '').trim().toLowerCase()
  const name = searchParams.get('name') ?? ''
  const verifyToken = searchParams.get('token') ?? ''

  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const handledRef = useRef(false)

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Auto-detect confirmation across tabs / browsers ────────────────────
  // Three signals, listed in order of latency:
  //   1. BroadcastChannel — instant, same browser, multiple tabs
  //   2. localStorage 'storage' event — same browser fallback (covers older
  //      Safari that lacks BroadcastChannel)
  //   3. Polling /api/auth/check-confirmation — works across browsers /
  //      devices (e.g. signup on desktop, confirm via Gmail mobile app)
  // Whichever fires first wins; handledRef ensures we redirect only once.
  useEffect(() => {
    if (!email) return

    function handleConfirmed() {
      if (handledRef.current) return
      handledRef.current = true
      setConfirmed(true)
      toast.success('Email confirmed! Redirecting…')
      // Brief pause so the user sees the success state before navigation.
      setTimeout(() => { router.replace('/dashboard?welcome=1') }, 900)
    }

    // Identity check — only act on broadcast/storage events whose payload
    // matches THIS tab's email. Otherwise a different signup/login event
    // fired in the same browser profile could redirect the wrong user.
    function maybeHandle(raw: unknown): void {
      try {
        const payload = (typeof raw === 'string' ? JSON.parse(raw) : raw) as {
          email?: string | null; type?: string; at?: number
        }
        if (!payload || typeof payload !== 'object') return
        const evtEmail = (payload.email || '').toLowerCase()
        if (!evtEmail || evtEmail !== email) return
        // Only treat signup-style events as confirmations — recovery / email
        // change events shouldn't kick the verify tab into the dashboard.
        if (payload.type !== 'signup' && payload.type !== 'email') return
        handleConfirmed()
      } catch { /* ignore */ }
    }

    // 1. BroadcastChannel
    let bc: BroadcastChannel | null = null
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('vx-auth')
        bc.onmessage = (e) => maybeHandle(e.data)
      }
    } catch { /* ignore */ }

    // 2. storage event
    function onStorage(e: StorageEvent) {
      if (e.key === 'vx_auth_event' && e.newValue) maybeHandle(e.newValue)
    }
    window.addEventListener('storage', onStorage)

    // 2b. Catch-up on mount: callback may have fired before this tab loaded.
    try {
      const raw = localStorage.getItem('vx_auth_event')
      if (raw) {
        const parsed = JSON.parse(raw) as { at?: number }
        if (parsed?.at && Date.now() - parsed.at < 5 * 60 * 1000) {
          maybeHandle(raw)
        }
      }
    } catch { /* ignore */ }

    // 3. Polling fallback — only enabled when we have a verify token.
    // (Without a token the endpoint will 401 every poll, so don't bother.)
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    if (verifyToken) {
      const poll = async (): Promise<void> => {
        if (cancelled || handledRef.current) return
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
          timer = setTimeout(poll, 5000)
          return
        }
        try {
          const res = await fetch('/api/auth/check-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token: verifyToken }),
          })
          if (res.ok) {
            const data = await res.json().catch(() => ({}))
            if (data?.confirmed) { handleConfirmed(); return }
          } else if (res.status === 401) {
            // Token expired — stop polling. The user can still get the same
            // signal via BroadcastChannel/storage if confirming on this device.
            cancelled = true
            return
          }
        } catch { /* ignore network errors */ }
        timer = setTimeout(poll, 5000)
      }
      timer = setTimeout(poll, 3000)
    }

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      if (bc) try { bc.close() } catch { /* ignore */ }
      window.removeEventListener('storage', onStorage)
    }
  }, [email, verifyToken, router])

  async function handleResend() {
    if (!canResend || resending || !email) return
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend')
      setCountdown(60)
      setCanResend(false)
      toast.success('Link resent! Check your inbox.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend link')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <Link href="/" className="mb-10">
        <span className="text-2xl font-black tracking-tight text-gray-950 leading-none">
          Vendoor<span className="text-[#16a34a]">X</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-10 text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl flex items-center justify-center mx-auto mb-6">
          {confirmed
            ? <CheckCircle2 className="w-8 h-8 text-[#16a34a]" strokeWidth={2} />
            : <Mail className="w-8 h-8 text-[#16a34a]" strokeWidth={1.5} />
          }
        </div>

        <h1 className="text-2xl font-black text-gray-950 tracking-tight mb-2">
          {confirmed ? 'Email confirmed!' : 'Check your email'}
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-1">
          We sent a confirmation link to
        </p>
        <p className="text-gray-900 font-bold text-sm mb-7 break-all">
          {email || 'your email address'}
        </p>

        {/* Steps */}
        <div className="space-y-3 text-left mb-8">
          {[
            { num: '1', text: 'Open the email from VendoorX' },
            { num: '2', text: 'Click "Confirm my email"' },
            { num: '3', text: "You're in — start trading!" },
          ].map(({ num, text }) => (
            <div key={num} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center shrink-0">
                <span className="text-[#16a34a] text-xs font-black">{num}</span>
              </div>
              <p className="text-gray-600 text-sm">{text}</p>
            </div>
          ))}
        </div>

        {/* Spam note */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-8">
          <p className="text-amber-700 text-xs leading-relaxed">
            Can't find it? Check your <strong>spam or junk</strong> folder.
          </p>
        </div>

        {/* Resend */}
        <div className="text-sm text-gray-500">
          Didn't receive it?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors disabled:opacity-50"
            >
              {resending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending…</>
                : <><RefreshCw className="w-3.5 h-3.5" />Resend link</>
              }
            </button>
          ) : (
            <span className="font-semibold text-gray-400 tabular-nums">
              Resend in {countdown}s
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-4 text-xs text-gray-400">
        <Link href="/auth/sign-up" className="hover:text-gray-600 transition-colors">
          Wrong email? Sign up again
        </Link>
        <span>·</span>
        <Link href="/auth/login" className="hover:text-gray-600 transition-colors">
          Already verified? Sign in
        </Link>
      </div>

    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyPageInner />
    </Suspense>
  )
}
