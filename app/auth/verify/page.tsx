'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, RefreshCw, Mail } from 'lucide-react'
import { toast } from 'sonner'

function VerifyPageInner() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const name = searchParams.get('name') ?? ''

  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

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
          <Mail className="w-8 h-8 text-[#16a34a]" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-black text-gray-950 tracking-tight mb-2">
          Check your email
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
