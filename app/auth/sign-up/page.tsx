'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  CheckCircle2, ShieldCheck, Sparkles, Lock,
  ShoppingBag, Store, Repeat, GraduationCap, Phone,
} from 'lucide-react'
import { VendoorXIcon } from '@/components/vendoorx-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { detectUniversity } from '@/lib/universities'
import { Web3WalletButtons } from '@/components/auth/web3-wallet-buttons'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Symbol', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const tiers = [
    { label: '', textColor: '' },
    { label: 'Weak', textColor: 'text-red-500' },
    { label: 'Medium', textColor: 'text-orange-500' },
    { label: 'Strong', textColor: 'text-amber-500' },
    { label: 'Perfect', textColor: 'text-green-600' },
  ]
  const barColor = ['bg-red-400', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-500'][score]
  const tier = tiers[score]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i < score ? barColor : 'bg-gray-100 dark:bg-muted'
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-3 flex-wrap">
          {checks.map(({ label, pass }) => (
            <span
              key={label}
              className={cn(
                'text-[10px] flex items-center gap-1 transition-colors',
                pass ? 'text-[#16a34a]' : 'text-gray-300 dark:text-muted-foreground'
              )}
            >
              <CheckCircle2 className="w-2.5 h-2.5" />
              {label}
            </span>
          ))}
        </div>
        {tier.label && (
          <span className={cn('text-[11px] font-black uppercase tracking-wider', tier.textColor)}>
            {tier.label}
          </span>
        )}
      </div>
    </div>
  )
}

type Role = 'buyer' | 'seller' | 'both' | ''

function SignUpPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref') || ''
  const [role, setRole] = useState<Role>('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [detectedUniversity, setDetectedUniversity] = useState<string | null>(null)
  const [university, setUniversity] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  function handleEmailChange(val: string) {
    setEmail(val)
    const uni = detectUniversity(val)
    setDetectedUniversity(uni)
    if (uni && !university) setUniversity(uni)
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!role) { toast.error('Please select your account type'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (!/[A-Z]/.test(password)) { toast.error('Password must contain at least one uppercase letter'); return }
    if (!/[0-9]/.test(password)) { toast.error('Password must contain at least one number'); return }
    if (!/[^A-Za-z0-9]/.test(password)) { toast.error('Password must contain at least one special character (e.g. !@#$%)'); return }
    if (!agreedToTerms) { toast.error('Please agree to the Terms & Privacy Policy'); return }
    if (whatsapp.trim() && !/^\+?[\d\s\-()]{10,15}$/.test(whatsapp.trim())) {
      toast.error('Enter a valid WhatsApp number, e.g. 08012345678 or +2348012345678')
      return
    }
    setLoading(true)
    const toastId = toast.loading('Creating your account...')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        whatsapp_number: whatsapp,
        university: university || detectedUniversity || '',
        role,
        referred_by: referralCode || null,
        is_student_verified: !!detectedUniversity,
      }),
    })
    const result = await res.json()
    if (!res.ok) {
      toast.dismiss(toastId)
      toast.error(result.error || 'Registration failed. Please try again.')
      setLoading(false)
      return
    }

    toast.dismiss(toastId)
    toast.success('Account created! Check your email for a confirmation link.')
    const tokenParam = result.verifyToken ? `&token=${encodeURIComponent(result.verifyToken)}` : ''
    router.push(`/auth/verify?email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}${tokenParam}`)
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#0a0a0a] relative overflow-hidden flex-col">
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-[#25D366]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/7 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <Link href="/" className="inline-flex w-fit">
            <VendoorXIcon height={36} />
          </Link>

          <div className="flex-1 flex flex-col justify-center mt-10">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-[#25D366]/15 text-[#4ade80] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#25D366]/25 w-fit mb-5">
              <Sparkles className="w-3 h-3" />
              Free forever
            </span>

            <h1 className="text-[2.4rem] xl:text-[2.75rem] font-black text-white leading-[1.08] tracking-tight mb-5">
              Start selling in<br />under{' '}
              <span className="text-[#25D366]">60 seconds.</span>
            </h1>
            <p className="text-white/50 text-[15px] leading-relaxed mb-10 max-w-[280px]">
              List items for free, connect buyers directly on WhatsApp, and get paid — zero commissions.
            </p>

            {/* Bullet features */}
            <div className="space-y-3 mb-10">
              {[
                'Free to join, free to list forever',
                'Direct WhatsApp buyer connections',
                'Seller analytics & verified badge',
                'Trusted seller community',
                'Instant buyer notifications',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                  </div>
                  <span className="text-white/65 text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-7 border-t border-white/[0.08]">
              {[
                { value: '₦0', label: 'Commission' },
                { value: '60s', label: 'To list' },
                { value: '50K+', label: 'Buyers' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white leading-none">{value}</p>
                  <p className="text-white/35 text-[10px] mt-1 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-white/75 text-sm leading-relaxed italic mb-4">
              &quot;I listed my textbooks and got 4 messages in an hour. VendoorX is the real deal!&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/25 border border-[#25D366]/35 flex items-center justify-center flex-shrink-0">
                <span className="text-[#4ade80] text-[11px] font-black">AO</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Adaeze O.</p>
                <p className="text-white/35 text-[10px]">Enugu</p>
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
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

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
            Have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-start justify-center px-5 sm:px-8 py-7 lg:px-16">
          <div className="w-full max-w-[440px] pb-12">

            {/* Mobile logo */}
            <div className="lg:hidden mb-7">
              <div className="inline-flex items-center rounded-xl bg-[#0a0a0a] px-3 py-2">
                <VendoorXIcon height={28} />
              </div>
            </div>

            {/* Header */}
            <div className="mb-7">
              <h2 className="text-[1.85rem] font-black text-gray-950 dark:text-white tracking-tight leading-tight mb-1.5 text-balance">
                Create your account
              </h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm">
                Free forever. No credit card required.
              </p>
            </div>

            {/* WhatsApp CTA — prominent hero button */}
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="flex items-center gap-3 w-full rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1aab50] transition-colors px-5 py-3.5 mb-6 shadow-md shadow-[#25D366]/25 group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white" aria-hidden="true">
                  <path d="M16 2.9C8.8 2.9 2.9 8.8 2.9 16c0 2.3.6 4.5 1.7 6.5L2.2 29.8l7.5-2.4c1.9 1 4 1.5 6.3 1.5 7.2 0 13.1-5.9 13.1-13.1S23.2 2.9 16 2.9zm0 24c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-4.4 1.4 1.4-4.3-.3-.4C5.5 20.1 4.9 18.1 4.9 16 4.9 10 10 4.9 16 4.9S27.1 10 27.1 16 22 26.9 16 26.9zm7.1-9.7c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.2.4-.9 1.2-1.1 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8l.6-.7c.2-.2.2-.4.4-.6.1-.2.1-.4 0-.6-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.7c-.2 0-.6.1-.9.5-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.2.8.4 1.4.6 1.9.7.8.2 1.5.2 2.1.1.6-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[15px] leading-tight">Sign up with WhatsApp</p>
                <p className="text-white/75 text-xs mt-0.5">Fastest way to get started</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <span className="text-[11px] text-gray-400 dark:text-muted-foreground font-semibold tracking-widest uppercase">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">

              {/* Role selector */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-600 dark:text-foreground uppercase tracking-wider">
                  I want to
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'buyer' as Role, icon: ShoppingBag, label: 'Buy', sub: 'Browse & buy' },
                    { value: 'seller' as Role, icon: Store, label: 'Sell', sub: 'List & earn' },
                    { value: 'both' as Role, icon: Repeat, label: 'Both', sub: 'Buy & sell' },
                  ].map(({ value, icon: Icon, label, sub }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={cn(
                        'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center',
                        role === value
                          ? 'border-[#25D366] bg-[#25D366]/5 text-[#16a34a] dark:text-[#4ade80]'
                          : 'border-gray-100 dark:border-border hover:border-gray-200 dark:hover:border-border/80 text-gray-500 dark:text-muted-foreground bg-gray-50 dark:bg-muted'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                        role === value ? 'bg-[#25D366]/15' : 'bg-gray-100 dark:bg-muted'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">{label}</p>
                        <p className="text-[10px] text-gray-400 dark:text-muted-foreground mt-0.5">{sub}</p>
                      </div>
                      {role === value && (
                        <CheckCircle2 className="w-4 h-4 text-[#25D366] absolute top-2 right-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-bold text-gray-600 dark:text-foreground uppercase tracking-wider">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="h-12 px-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-foreground placeholder:text-gray-300 dark:placeholder:text-muted-foreground focus-visible:ring-[#25D366]/30 focus-visible:border-[#25D366] transition-all"
                />
              </div>

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
                  onChange={e => handleEmailChange(e.target.value)}
                  required
                  className="h-12 px-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-foreground placeholder:text-gray-300 dark:placeholder:text-muted-foreground focus-visible:ring-[#25D366]/30 focus-visible:border-[#25D366] transition-all"
                />
                {detectedUniversity && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#16a34a] font-semibold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Institution detected — {detectedUniversity}
                  </div>
                )}
              </div>

              {/* University */}
              <div className="space-y-1.5">
                <Label htmlFor="university" className="text-xs font-bold text-gray-600 dark:text-foreground uppercase tracking-wider">
                  Organisation / Business{' '}
                  <span className="text-gray-300 dark:text-muted-foreground font-normal normal-case tracking-normal text-xs">
                    (optional)
                  </span>
                </Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-muted-foreground pointer-events-none" />
                  <Input
                    id="university"
                    type="text"
                    placeholder="e.g. Your business or school name"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="h-12 pl-10 pr-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-foreground placeholder:text-gray-300 dark:placeholder:text-muted-foreground focus-visible:ring-[#25D366]/30 focus-visible:border-[#25D366] transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp number */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-xs font-bold text-gray-600 dark:text-foreground uppercase tracking-wider">
                  WhatsApp number{' '}
                  <span className="text-gray-300 dark:text-muted-foreground font-normal normal-case tracking-normal text-xs">
                    (optional)
                  </span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-muted-foreground pointer-events-none" />
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="h-12 pl-10 pr-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-foreground placeholder:text-gray-300 dark:placeholder:text-muted-foreground focus-visible:ring-[#25D366]/30 focus-visible:border-[#25D366] transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-300 dark:text-muted-foreground">
                  Buyers will contact you directly via WhatsApp
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-gray-600 dark:text-foreground uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-12 px-4 pr-12 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border rounded-xl text-gray-900 dark:text-foreground placeholder:text-gray-300 dark:placeholder:text-muted-foreground focus-visible:ring-[#25D366]/30 focus-visible:border-[#25D366] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 dark:hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  aria-checked={agreedToTerms}
                  role="checkbox"
                  className={cn(
                    'w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    agreedToTerms
                      ? 'bg-[#16a34a] border-[#16a34a]'
                      : 'border-gray-200 dark:border-border bg-white dark:bg-muted hover:border-[#25D366]/60'
                  )}
                >
                  {agreedToTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <span className="text-sm text-gray-500 dark:text-muted-foreground leading-snug select-none">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#16a34a] hover:underline font-semibold">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#16a34a] hover:underline font-semibold">Privacy Policy</Link>
                </span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1c1c1c] dark:bg-foreground dark:text-background text-white font-bold text-[15px] rounded-xl shadow-sm transition-all hover:shadow-md mt-1"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating account...</>
                ) : (
                  <>Create Free Account <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>

            {/* Web3 wallet sign up */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <span className="text-[11px] text-gray-400 dark:text-muted-foreground font-semibold tracking-widest uppercase">
                or connect wallet
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>

            <Web3WalletButtons mode="signup" />

            {/* Switch to Sign In */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full h-12 border-2 border-gray-100 dark:border-border hover:border-[#25D366]/50 hover:text-[#16a34a] font-semibold text-sm rounded-xl transition-all text-gray-600 dark:text-foreground"
            >
              <Link href="/auth/login">
                Sign in to existing account
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
                <span>Secure &amp; private</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-border" />
              <span>No credit card</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpPageInner />
    </Suspense>
  )
}
