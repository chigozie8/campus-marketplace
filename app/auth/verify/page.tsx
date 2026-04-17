'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, MailCheck, RefreshCw, ShieldCheck, Lock, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function VerifyPageInner() {
  const router = useRouter()
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
      toast.success('Link resent!', { description: 'Check your inbox.' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend link')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">
      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#0a0a0a] relative overflow-hidden flex-col">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#16a34a]/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#16a34a]/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="inline-flex items-center w-fit">
            <span className="text-2xl font-black tracking-tight text-white leading-none">
              Vendoor<span className="text-[#16a34a]">X</span>
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 bg-[#16a34a]/20 rounded-2xl blur-xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-[#16a34a]/15 border border-[#16a34a]/30 flex items-center justify-center">
                <MailCheck className="w-10 h-10 text-[#4ade80]" />
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 bg-[#16a34a]/20 text-[#4ade80] text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#16a34a]/30 w-fit mb-4">
              <Sparkles className="w-3 h-3" />
              Almost there
            </span>

            <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight mb-4">
              One click from<br />
              <span className="text-[#16a34a]">the market.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              We sent a confirmation link to your email. Click it to activate your VendoorX account.
            </p>

            <div className="space-y-3.5 mb-10">
              {[
                { icon: '📧', label: 'Check your inbox', sub: 'And your spam/junk folder too' },
                { icon: '🔗', label: 'Click the confirmation link', sub: 'It expires in 24 hours' },
                { icon: '🚀', label: 'Start trading on VendoorX', sub: 'Free forever, no commissions' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-lg">
                    {icon}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-semibold">{label}</p>
                    <p className="text-white/40 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-white/50 text-xs leading-relaxed">
                No email? Hit <strong className="text-white/70">Resend</strong> after the timer.
                Emails can take <strong className="text-white/70">1–2 minutes</strong> to arrive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/30 mt-6">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secured by Supabase</div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 256-bit SSL</div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to sign up
          </Link>
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            Already verified?{' '}
            <Link href="/auth/login" className="font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-16">
          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="lg:hidden mb-6">
              <span className="text-2xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
                Vendoor<span className="text-[#16a34a]">X</span>
              </span>
            </div>

            <div className="relative w-14 h-14 mb-5">
              <div className="absolute inset-0 bg-[#16a34a]/15 rounded-2xl blur-lg" />
              <div className="relative w-14 h-14 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center justify-center">
                <MailCheck className="w-7 h-7 text-[#16a34a]" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-2">
              Check your email
            </h2>
            <p className="text-gray-500 dark:text-muted-foreground text-sm mb-1">
              We sent a confirmation link to
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-sm break-all mb-7">
              {email || 'your email address'}
            </p>

            <div className="bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-2xl p-4 mb-7 text-center">
              <p className="text-[#15803d] dark:text-[#4ade80] text-sm font-semibold leading-relaxed">
                Click the <strong>Confirm my email</strong> button in the email to activate your account.
              </p>
            </div>

            <div className="text-center space-y-2 mb-6">
              <p className="text-sm text-gray-500 dark:text-muted-foreground">
                Didn&apos;t receive the email?
              </p>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors disabled:opacity-50"
                >
                  {resending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending…</>
                  ) : (
                    <><RefreshCw className="w-3.5 h-3.5" />Resend link</>
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-400 dark:text-muted-foreground">
                  Resend in{' '}
                  <span className="font-bold text-gray-700 dark:text-foreground tabular-nums">{countdown}s</span>
                </p>
              )}
            </div>

            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl mb-5">
              <span className="text-base shrink-0">⚠️</span>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Check your spam/junk folder</strong> — the email sometimes lands there.
              </p>
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-border" />
              <span className="text-xs text-gray-400 dark:text-muted-foreground font-medium">WRONG EMAIL?</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-border" />
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full h-11 border-2 border-gray-200 dark:border-border hover:border-[#16a34a] hover:text-[#16a34a] font-semibold text-sm rounded-xl transition-all dark:text-foreground"
            >
              <Link href="/auth/sign-up">Sign up with a different email</Link>
            </Button>

            <div className="mt-5 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-border" />
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Secured by Supabase</span>
              </div>
            </div>
          </div>
        </div>
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
