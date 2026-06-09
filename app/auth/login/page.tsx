'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  ShieldCheck, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Web3WalletButtons } from '@/components/auth/web3-wallet-buttons'
import { AuthSidePanel } from '@/components/auth/auth-side-panel'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam), { description: 'Please request a new link.' })
    }
  }, [searchParams])

  function validate() {
    let valid = true
    setEmailError('')
    setPasswordError('')
    if (!email) { setEmailError('Email is required'); valid = false }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email address'); valid = false }
    if (!password) { setPasswordError('Password is required'); valid = false }
    return valid
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
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
      }
      setPasswordError('Incorrect email or password. Please try again.')
      setLoading(false)
      toast.error('Sign in failed', { description: 'Check your email and password.' })
      return
    }
    toast.dismiss(toastId)
    toast.success('Welcome back!')
    fetch('/api/auth/login-alert', { method: 'POST' }).catch(() => {})
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">
      <AuthSidePanel mode="login" />

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </Link>
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden">
            <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
              Vendoor<span className="text-[#25D366]">X</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400 dark:text-muted-foreground">
            No account?{' '}
            <Link href="/auth/sign-up" className="font-semibold text-[#128C7E] hover:text-[#075E54] dark:text-[#25D366] dark:hover:text-[#1ebe57] transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 lg:px-16 py-6">
          <div className="w-full max-w-[400px]">

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] rounded-full px-3 py-1 text-xs font-semibold tracking-wide mb-4">
                <WhatsAppMark size={13} />
                WhatsApp Commerce Platform
              </div>
              <h2 className="text-2xl sm:text-[1.75rem] font-black text-gray-950 dark:text-white tracking-tight leading-tight mb-1.5">
                Welcome back
              </h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm leading-relaxed">
                Sign in to manage your listings and connect with buyers on WhatsApp.
              </p>
            </div>

            {/* WhatsApp primary CTA */}
            <WhatsAppLoginCard />

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <span className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase">or sign in with email</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleLogin} noValidate className="space-y-4">
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
                  onChange={e => { setEmail(e.target.value); setEmailError('') }}
                  className={cn(
                    'h-12 px-4 bg-gray-50 dark:bg-muted border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:bg-white dark:focus:bg-muted transition-all rounded-xl',
                    emailError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                      : 'border-gray-200 dark:border-border focus:border-[#128C7E] focus:ring-[#25D366]/10'
                  )}
                />
                {emailError && <p className="text-xs text-red-500 font-medium">{emailError}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-foreground">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-[#128C7E] hover:text-[#075E54] dark:text-[#25D366] dark:hover:text-[#1ebe57] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                    className={cn(
                      'h-12 px-4 pr-12 bg-gray-50 dark:bg-muted border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:bg-white dark:focus:bg-muted transition-all rounded-xl',
                      passwordError
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                        : 'border-gray-200 dark:border-border focus:border-[#128C7E] focus:ring-[#25D366]/10'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-500 font-medium">{passwordError}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:-translate-y-px hover:shadow-lg mt-1"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>

            {/* Web3 */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <span className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase">or connect wallet</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>
            <Web3WalletButtons mode="signin" />

            {/* Trust row */}
            <div className="mt-7 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
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

            <p className="text-center text-[11px] text-gray-400 dark:text-muted-foreground mt-5 leading-relaxed">
              By signing in you agree to our{' '}
              <Link href="/terms" className="text-[#128C7E] dark:text-[#25D366] hover:underline">Terms</Link>
              {' '}&{' '}
              <Link href="/privacy" className="text-[#128C7E] dark:text-[#25D366] hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Inline WhatsApp card ── */
function WhatsAppLoginCard() {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] dark:from-[#052e16]/60 dark:to-[#14532d]/40 border border-[#25D366]/25 p-5 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#25D366]/10" />
      <div className="absolute -right-2 top-8 w-12 h-12 rounded-full bg-[#25D366]/08" />

      <div className="relative flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#25D366]/30">
          <WhatsAppMark size={22} color="white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-gray-900 dark:text-white mb-0.5">Sign in with WhatsApp</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Sellers connect buyers directly on WhatsApp — it&apos;s how deals get done on VendoorX.
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-white dark:bg-[#0a2e1a] border border-[#25D366]/30 rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#128C7E] dark:text-[#25D366]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              50K+ active sellers
            </span>
            <span className="inline-flex items-center gap-1 bg-white dark:bg-[#0a2e1a] border border-[#25D366]/30 rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#128C7E] dark:text-[#25D366]">
              Zero commission
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── WhatsApp SVG mark ── */
export function WhatsAppMark({ size = 20, color = '#25D366' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
