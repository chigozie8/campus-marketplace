'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, Mail, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading('Sending reset link...')
    try {
      // Custom endpoint: mints the recovery link via Supabase admin API and
      // delivers it through Mailtrap so the email actually lands in the inbox
      // (the default Supabase SMTP path was being flagged as spam).
      const res = await fetch('/api/auth/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await res.json().catch(() => ({}))
      toast.dismiss(toastId)
      if (!res.ok) {
        toast.error(result.error || 'Could not send reset link. Please try again.')
        setLoading(false)
        return
      }
      toast.success('Reset link sent!', { description: 'Check your inbox.' })
      setSuccess(true)
    } catch {
      toast.dismiss(toastId)
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background px-6">
        <div className={cn(
          'text-center max-w-md w-full transition-all duration-500',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#16a34a]/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-xl">
              <Mail className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-2">Email sent!</h2>
          <p className="text-gray-500 dark:text-muted-foreground leading-relaxed mb-2 text-sm">
            We sent a password reset link to{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
          </p>
          <p className="text-gray-400 dark:text-muted-foreground text-xs mb-8">The link expires in 1 hour for your security.</p>

          <div className="bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed">
              <span className="font-semibold text-gray-700 dark:text-foreground">Did not receive it?</span> Check your spam folder or{' '}
              <a href="mailto:support@vendoorx.ng" className="text-[#16a34a] hover:underline">contact support</a>.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-bold rounded-xl"
            >
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="text-sm text-[#16a34a] hover:underline font-medium"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[48%] bg-[#0a0a0a] relative overflow-hidden flex-col">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#16a34a]/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#16a34a]/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="inline-flex items-center w-fit">
            <span className="text-2xl font-black tracking-tight text-white leading-none">
              Vendoor<span className="text-[#16a34a]">X</span>
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#16a34a]/15 border border-[#16a34a]/25 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-[#4ade80]" />
            </div>
            <h1 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.1] tracking-tight mb-5">
              Happens to<br />the best of us.
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              Enter your email and we&apos;ll send a secure reset link. Back to trading in minutes.
            </p>

            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: 'Secure process', desc: 'Link expires in 1 hour' },
                { icon: Mail, title: 'Instant delivery', desc: 'Sent to your inbox right away' },
                { icon: CheckCircle2, title: 'One-click reset', desc: 'No complicated steps' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#16a34a]/15 border border-[#16a34a]/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#4ade80]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-white/40 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/60 text-xs text-center">
              Need more help?{' '}
              <a href="mailto:support@vendoorx.ng" className="text-[#4ade80] hover:underline">
                support@vendoorx.ng
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-sm font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors"
          >
            Create account
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-16">
          <div className={cn(
            'w-full max-w-[420px] transition-all duration-500',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <div className="lg:hidden mb-8">
              <span className="text-2xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
                Vendoor<span className="text-[#16a34a]">X</span>
              </span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center mb-6">
              <Lock className="w-7 h-7 text-gray-700 dark:text-foreground" />
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-1.5">
                Forgot password?
              </h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm leading-relaxed">
                Enter your email address and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-12 px-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending link...</>
                ) : (
                  <><Mail className="w-4 h-4 mr-2" />Send Reset Link</>
                )}
              </Button>
            </form>

            <div className="mt-6 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-2xl p-4">
              <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed">
                <span className="font-semibold text-gray-700 dark:text-foreground">Did not get the email?</span> Check your spam folder or{' '}
                <a href="mailto:support@vendoorx.ng" className="text-[#16a34a] hover:underline">
                  contact support
                </a>
                .
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-border" />
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Expires in 1 hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
