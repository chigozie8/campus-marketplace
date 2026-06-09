'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  ShieldCheck, Users, Zap, CheckCircle2, Lock,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Web3WalletButtons } from '@/components/auth/web3-wallet-buttons'

const FEATURES = [
  { icon: Zap, label: 'Instant WhatsApp connect with buyers' },
  { icon: ShieldCheck, label: 'Verified seller badges for trust' },
  { icon: Users, label: '50,000+ active sellers' },
]

const STATS = [
  { value: '50K+', label: 'Sellers' },
  { value: '120K+', label: 'Listings' },
  { value: '4.9★', label: 'Rating' },
]

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam), {
        description: 'Please request a new link.',
      })
    }
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    const toastId = toast.loading('Signing you in...')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.dismiss(toastId)
      const isUnconfirmed =
        error.message.toLowerCase().includes('email not confirmed') ||
        (error as { code?: string }).code === 'email_not_confirmed'
      if (isUnconfirmed) {
        await supabase.auth.resend({ type: 'signup', email })
        router.push(`/auth/verify?email=${encodeURIComponent(email)}&resent=1`)
        setLoading(false)
        return
      } else {
        toast.error(error.message, { description: 'Check your email and password and try again.' })
      }
      setLoading(false)
      return
    }
    toast.dismiss(toastId)
    toast.success('Welcome back!', { description: 'Redirecting to your dashboard...' })

    // Fire a security alert email — best-effort, never blocks the redirect.
    fetch('/api/auth/login-alert', { method: 'POST' }).catch(() => {})

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#0a0a0a] relative overflow-hidden flex-col">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        {/* Green atmospheric glows */}
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-56 h-56 bg-[#25D366]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit">
            {/* WhatsApp-style icon mark */}
            <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30">
              <MessageCircle className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white leading-none">
              Vendoor<span className="text-[#25D366]">X</span>
            </span>
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center mt-12">
            {/* Badge */}
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 bg-[#25D366]/15 text-[#4ade80] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#25D366]/25">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                WhatsApp commerce platform
              </span>
            </div>

            <h1 className="text-[2.4rem] xl:text-[2.75rem] font-black text-white leading-[1.08] tracking-tight mb-5">
              The smartest way<br />to buy &amp; sell<br />
              <span className="text-[#25D366]">on campus.</span>
            </h1>
            <p className="text-white/50 text-[15px] leading-relaxed mb-10 max-w-[280px]">
              Join thousands of Nigerian sellers trading smarter with WhatsApp-powered listings.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-10">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/12 border border-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#4ade80]" />
                  </div>
                  <span className="text-white/65 text-sm">{label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-7 border-t border-white/[0.08]">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white leading-none">{value}</p>
                  <p className="text-white/35 text-[10px] mt-1 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial card */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-white/75 text-sm leading-relaxed italic mb-4">
              &quot;Sold my MacBook in 3 hours. No middleman, no stress — just WhatsApp and done.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/25 border border-[#25D366]/35 flex items-center justify-center flex-shrink-0">
                <span className="text-[#4ade80] text-[11px] font-black">TK</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Tunde K.</p>
                <p className="text-white/35 text-[10px]">UNILAG, Lagos</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#25D366] text-xs leading-none">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 sm:py-5 lg:px-10 border-b border-gray-100 dark:border-border">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </Link>
          <p className="text-sm text-gray-400 dark:text-muted-foreground">
            No account?{' '}
            <Link
              href="/auth/sign-up"
              className="font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 lg:px-16">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="lg:hidden mb-7 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center shadow-md shadow-[#25D366]/30">
                <MessageCircle className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
                Vendoor<span className="text-[#25D366]">X</span>
              </span>
            </div>

            {/* Header */}
            <div className="mb-7">
              <h2 className="text-[1.85rem] font-black text-gray-950 dark:text-white tracking-tight leading-tight mb-1.5 text-balance">
                Welcome back
              </h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm">
                Sign in to your VendoorX account
              </p>
            </div>

            {/* WhatsApp sign-in CTA — visually prominent */}
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="flex items-center gap-3 w-full rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1aab50] transition-colors px-5 py-3.5 mb-6 shadow-md shadow-[#25D366]/25 group"
            >
              {/* WhatsApp icon */}
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white" aria-hidden="true">
                  <path d="M16 2.9C8.8 2.9 2.9 8.8 2.9 16c0 2.3.6 4.5 1.7 6.5L2.2 29.8l7.5-2.4c1.9 1 4 1.5 6.3 1.5 7.2 0 13.1-5.9 13.1-13.1S23.2 2.9 16 2.9zm0 24c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-4.4 1.4 1.4-4.3-.3-.4C5.5 20.1 4.9 18.1 4.9 16 4.9 10 10 4.9 16 4.9S27.1 10 27.1 16 22 26.9 16 26.9zm7.1-9.7c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.2.4-.9 1.2-1.1 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7c.2-.2.2-.4.4-.6.1-.2.1-.4 0-.6-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.7c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.2.8.4 1.4.6 1.9.7.8.2 1.5.2 2.1.1.6-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[15px] leading-tight">Continue with WhatsApp</p>
                <p className="text-white/75 text-xs mt-0.5">Verify your identity instantly</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <span className="text-[11px] text-gray-400 dark:text-muted-foreground font-semibold tracking-widest uppercase">
                or sign in with email
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-gray-600 dark:text-foreground uppercase tracking-wider">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-12 px-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-foreground placeholder:text-gray-300 dark:placeholder:text-muted-foreground focus-visible:ring-[#25D366]/30 focus-visible:border-[#25D366] transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-gray-600 dark:text-foreground uppercase tracking-wider">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#16a34a] hover:text-[#15803d] font-semibold transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="h-12 px-4 pr-12 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-foreground placeholder:text-gray-300 dark:placeholder:text-muted-foreground focus-visible:ring-[#25D366]/30 focus-visible:border-[#25D366] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 dark:hover:text-muted-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  aria-checked={rememberMe}
                  role="checkbox"
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    rememberMe
                      ? 'bg-[#16a34a] border-[#16a34a]'
                      : 'border-gray-200 dark:border-border bg-white dark:bg-muted hover:border-[#25D366]/60'
                  )}
                >
                  {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <span className="text-sm text-gray-500 dark:text-foreground select-none">Keep me signed in</span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1c1c1c] dark:bg-foreground dark:text-background text-white font-bold text-[15px] rounded-xl shadow-sm transition-all hover:shadow-md mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>

            {/* Web3 Wallets */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <span className="text-[11px] text-gray-400 dark:text-muted-foreground font-semibold tracking-widest uppercase">
                or connect wallet
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>

            <Web3WalletButtons mode="signin" />

            {/* Switch to Sign Up */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full h-12 border-2 border-gray-100 dark:border-border hover:border-[#25D366]/50 hover:text-[#16a34a] font-semibold text-sm rounded-xl transition-all text-gray-600 dark:text-foreground"
            >
              <Link href="/auth/sign-up">
                Create a free account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            {/* Trust row */}
            <div className="mt-7 flex items-center justify-center gap-4 text-[11px] text-gray-300 dark:text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-border" />
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure login</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-border" />
              <span>Free forever</span>
            </div>

            {/* Legal */}
            <p className="text-center text-[11px] text-gray-300 dark:text-muted-foreground mt-5 leading-relaxed">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-[#16a34a] hover:underline">Terms</Link>
              {' '}&amp;{' '}
              <Link href="/privacy" className="text-[#16a34a] hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
