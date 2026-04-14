'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, MailCheck, RefreshCw, CheckCircle2, ShieldCheck, Lock, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const CODE_LENGTH = 6

function VerifyPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const char = value.slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    if (next.every(d => d !== '')) {
      handleVerify(next.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const next = [...digits]
        next[index - 1] = ''
        setDigits(next)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    const next = [...digits]
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
    if (pasted.length === CODE_LENGTH) handleVerify(pasted)
  }

  const handleVerify = useCallback(async (token: string) => {
    if (!email) {
      toast.error('Email not found. Please sign up again.')
      router.push('/auth/sign-up')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })

    if (error) {
      setLoading(false)
      setDigits(Array(CODE_LENGTH).fill(''))
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
      toast.error('Invalid or expired code', {
        description: 'Double-check the code from your email and try again.',
      })
      return
    }

    setVerified(true)
    setLoading(false)
    sessionStorage.removeItem('_vx_tmp_pw')
    toast.success('Email verified!', { description: 'Welcome to VendoorX 🎉' })
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 1200)
  }, [email, router])

  async function handleResend() {
    if (!canResend || resending || !email) return
    setResending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    if (error) {
      toast.error(error.message || 'Failed to resend code')
      return
    }
    setCountdown(60)
    setCanResend(false)
    setDigits(Array(CODE_LENGTH).fill(''))
    setTimeout(() => inputRefs.current[0]?.focus(), 50)
    toast.success('New code sent!', { description: 'Check your inbox and spam folder.' })
  }

  const code = digits.join('')
  const isComplete = code.length === CODE_LENGTH

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background px-6">
        <div className="text-center max-w-sm">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#16a34a]/20 rounded-full animate-ping" />
            <div className="w-20 h-20 bg-[#16a34a] rounded-full flex items-center justify-center shadow-xl relative">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white mb-2">You&apos;re verified!</h2>
          <p className="text-gray-500 dark:text-muted-foreground text-sm">Taking you to your dashboard…</p>
          <Loader2 className="w-5 h-5 animate-spin text-[#16a34a] mx-auto mt-4" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">
      {/* ── Left panel ── */}
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
              One step from<br />
              <span className="text-[#16a34a]">the market.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              We sent a 6-digit code to your email. Enter it to activate your VendoorX account.
            </p>

            <div className="space-y-3.5 mb-10">
              {[
                { icon: '📧', label: 'Check your inbox', sub: 'And your spam/junk folder too' },
                { icon: '🔢', label: 'Enter the 6-digit code', sub: 'It expires in 10 minutes' },
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
                Emails can take <strong className="text-white/70">1–2 minutes</strong> to arrive.
                No code? Hit <strong className="text-white/70">Resend</strong> after the timer.
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
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
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

        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-16">
          <div className="w-full max-w-[420px]">
            <div className="lg:hidden mb-8">
              <span className="text-2xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
                Vendoor<span className="text-[#16a34a]">X</span>
              </span>
            </div>

            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 bg-[#16a34a]/15 rounded-2xl blur-lg" />
              <div className="relative w-16 h-16 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-[#16a34a]" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-2">
              Check your email
            </h2>
            <p className="text-gray-500 dark:text-muted-foreground text-sm mb-1">
              We sent a 6-digit code to
            </p>
            <div className="flex items-center gap-2 mb-8">
              <p className="font-bold text-gray-900 dark:text-white text-sm break-all">
                {email || 'your email address'}
              </p>
              {email && (
                <span className="shrink-0 inline-flex items-center gap-1 bg-[#16a34a]/10 text-[#16a34a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#16a34a]/20">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Sent
                </span>
              )}
            </div>

            <div className="flex gap-2.5 sm:gap-3 justify-center mb-8" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading}
                  aria-label={`Digit ${i + 1}`}
                  className={cn(
                    'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-xl border-2 transition-all duration-150',
                    'bg-gray-50 dark:bg-muted text-gray-900 dark:text-foreground',
                    'focus:outline-none focus:ring-0',
                    digit
                      ? 'border-[#16a34a] bg-[#16a34a]/5 dark:bg-[#16a34a]/10 text-[#16a34a] dark:text-[#4ade80] scale-105 shadow-md shadow-[#16a34a]/20'
                      : 'border-gray-200 dark:border-border focus:border-[#16a34a] focus:shadow-md focus:shadow-[#16a34a]/15',
                    loading && 'opacity-50 cursor-not-allowed',
                  )}
                />
              ))}
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-[#16a34a] font-semibold mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying your code…
              </div>
            )}

            <Button
              onClick={() => handleVerify(code)}
              disabled={!isComplete || loading}
              className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] dark:bg-[#16a34a] dark:hover:bg-[#15803d] text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none mb-4"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying…</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" />Verify Email</>
              )}
            </Button>

            <div className="text-center space-y-3 mb-6">
              <p className="text-sm text-gray-500 dark:text-muted-foreground">
                Didn&apos;t receive a code?
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
                    <><RefreshCw className="w-3.5 h-3.5" />Resend code</>
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-400 dark:text-muted-foreground">
                  Resend available in{' '}
                  <span className="font-bold text-gray-700 dark:text-foreground tabular-nums">{countdown}s</span>
                </p>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                <span className="text-base shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <strong>Check your spam/junk folder</strong> — codes sometimes land there. Emails can take 1–2 minutes.
                </p>
              </div>
              <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                <span className="text-base shrink-0">💡</span>
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  <strong>Paste-friendly:</strong> You can paste the code directly into the boxes — it will fill automatically.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 my-5">
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

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
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
