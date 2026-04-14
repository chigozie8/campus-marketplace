'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  ShieldCheck, Users, Zap, CheckCircle2, Lock
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
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">
      {/* ── Left panel: solid black branding ── */}
      <div className="hidden lg:flex lg:w-[48%] bg-[#0a0a0a] relative overflow-hidden flex-col">
        {/* Dot-grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Green glow blob */}
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#16a34a]/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#16a34a]/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                Vendoor<span className="text-[#16a34a]">X</span>
              </span>
            </Link>
          </div>

          {/* Center */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-3">
              <span className="inline-block bg-[#16a34a]/20 text-[#4ade80] text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#16a34a]/30">
                WhatsApp commerce platform
              </span>
            </div>
            <h1 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.1] tracking-tight mb-5">
              The smartest way<br />to buy & sell<br />
              <span className="text-[#16a34a]">online.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              Join thousands of Nigerian sellers trading smarter with WhatsApp-powered listings.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-12">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#16a34a]/15 border border-[#16a34a]/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#4ade80]" />
                  </div>
                  <span className="text-white/70 text-sm">{label}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex gap-8 pt-8 border-t border-white/10">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-white/40 text-xs mt-0.5 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-sm leading-relaxed italic mb-3">
              &quot;Sold my MacBook in 3 hours. No middleman, no stress — just WhatsApp and done.&quot;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#16a34a]/30 border border-[#16a34a]/40 flex items-center justify-center">
                <span className="text-[#4ade80] text-xs font-bold">TK</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Tunde K.</p>
                <p className="text-white/40 text-[11px]">UNILAG, Lagos</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#16a34a] text-xs">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: white form ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            No account?{' '}
            <Link href="/auth/sign-up" className="font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-16">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <span className="text-2xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
                Vendoor<span className="text-[#16a34a]">X</span>
              </span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-1.5">
                Welcome back
              </h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm">
                Sign in to your VendoorX account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
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

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-foreground">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#16a34a] hover:text-[#15803d] font-medium transition-colors"
                  >
                    Forgot password?
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
                    className="h-12 px-4 pr-12 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-muted-foreground transition-colors p-1"
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
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    rememberMe
                      ? 'bg-[#16a34a] border-[#16a34a]'
                      : 'border-gray-300 dark:border-border bg-white dark:bg-muted hover:border-[#16a34a]/50'
                  )}
                >
                  {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <span className="text-sm text-gray-600 dark:text-foreground select-none">Keep me signed in</span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>

            {/* Web3 Wallets divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-border" />
              <span className="text-xs text-gray-400 dark:text-muted-foreground font-medium">OR CONNECT WALLET</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-border" />
            </div>

            <Web3WalletButtons mode="signin" />

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-border" />
              <span className="text-xs text-gray-400 dark:text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-border" />
            </div>

            {/* Sign up CTA */}
            <Button
              asChild
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 dark:border-border hover:border-[#16a34a] hover:text-[#16a34a] font-semibold text-sm rounded-xl transition-all dark:text-foreground"
            >
              <Link href="/auth/sign-up">
                Create a free account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
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

            {/* Terms */}
            <p className="text-center text-[11px] text-gray-400 dark:text-muted-foreground mt-5 leading-relaxed">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-[#16a34a] hover:underline">Terms</Link>
              {' '}&{' '}
              <Link href="/privacy" className="text-[#16a34a] hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
