'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  CheckCircle2, ShieldCheck, Sparkles, Lock,
  Mail, ShoppingBag, Store, GraduationCap, Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { detectUniversity } from '@/lib/universities'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const barColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-[#16a34a]'][score]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i < score ? barColor : 'bg-gray-200 dark:bg-muted'
            )}
          />
        ))}
      </div>
      <div className="flex gap-4">
        {checks.map(({ label, pass }) => (
          <span
            key={label}
            className={cn(
              'text-[10px] flex items-center gap-1 transition-colors',
              pass ? 'text-[#16a34a]' : 'text-gray-400'
            )}
          >
            <CheckCircle2 className="w-2.5 h-2.5" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

type Role = 'buyer' | 'seller' | ''

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
  const [success, setSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [resending, setResending] = useState(false)
  const [resentAt, setResentAt] = useState<number | null>(null)

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
    if (!agreedToTerms) { toast.error('Please agree to the Terms & Privacy Policy'); return }
    setLoading(true)
    const toastId = toast.loading('Creating your account...')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        data: {
          full_name: fullName,
          whatsapp_number: whatsapp,
          university: university || detectedUniversity || '',
          role,
          referred_by: referralCode || null,
          is_student_verified: !!detectedUniversity,
        },
      },
    })
    toast.dismiss(toastId)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Account created!', { description: 'Check your email to confirm.' })
    setSuccess(true)
    setLoading(false)
  }

  async function handleResend() {
    const now = Date.now()
    if (resentAt && now - resentAt < 60000) {
      toast.error('Please wait a minute before resending.')
      return
    }
    setResending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    if (error) {
      toast.error(error.message)
    } else {
      setResentAt(now)
      toast.success('Confirmation email resent!', { description: 'Check your inbox and spam folder.' })
    }
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background px-6">
        <div className="text-center max-w-md">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#16a34a]/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-[#16a34a]/10 rounded-full animate-ping [animation-delay:150ms]" />
            <div className="relative w-24 h-24 bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-2xl">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-3">Check your inbox</h2>
          <p className="text-gray-500 dark:text-muted-foreground leading-relaxed mb-2 text-sm max-w-sm mx-auto">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
            Click it to activate your VendoorX account.
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-6 text-left">
            ⚠️ <strong>Check your spam/junk folder</strong> — confirmation emails sometimes land there. If you still don&apos;t see it, click Resend below.
          </p>
          <div className="bg-gray-50 dark:bg-muted rounded-2xl p-4 mb-6 text-left space-y-2">
            {[
              "Open the email and click the confirmation link",
              "The link expires in 24 hours",
              "After confirming, return here to sign in",
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] mt-0.5 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-bold rounded-xl">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full h-11 rounded-xl border-2 border-gray-200 dark:border-border text-sm font-semibold text-gray-700 dark:text-foreground hover:border-[#16a34a] hover:text-[#16a34a] transition-all disabled:opacity-50"
            >
              {resending ? 'Resending…' : 'Resend confirmation email'}
            </button>
            <button onClick={() => setSuccess(false)} className="text-sm text-[#16a34a] hover:underline font-medium">
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
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-[#16a34a]/8 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="inline-flex items-center w-fit">
            <span className="text-2xl font-black tracking-tight text-white leading-none">
              Vendoor<span className="text-[#16a34a]">X</span>
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 bg-[#16a34a]/20 text-[#4ade80] text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#16a34a]/30 w-fit mb-4">
              <Sparkles className="w-3 h-3" />
              Free forever
            </span>
            <h1 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.1] tracking-tight mb-5">
              Start selling in<br />under{' '}
              <span className="text-[#16a34a]">60 seconds.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              List items for free, connect buyers directly on WhatsApp, and get paid — zero commissions.
            </p>

            <div className="space-y-3 mb-12">
              {[
                'Free to join, free to list forever',
                'Direct WhatsApp buyer connections',
                'Seller analytics & verified badge',
                'Campus-only trusted community',
                'Instant buyer notifications',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                  </div>
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-8 pt-8 border-t border-white/10">
              {[
                { value: '₦0', label: 'Commission' },
                { value: '60s', label: 'To list' },
                { value: '50K+', label: 'Buyers' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-white/40 text-xs mt-0.5 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-sm leading-relaxed italic mb-3">
              &quot;I listed my textbooks and got 4 messages in an hour. VendoorX is the real deal!&quot;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#16a34a]/30 border border-[#16a34a]/40 flex items-center justify-center flex-shrink-0">
                <span className="text-[#4ade80] text-xs font-bold">AO</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Adaeze O.</p>
                <p className="text-white/40 text-[11px]">OAU, Ile-Ife</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => <span key={i} className="text-[#16a34a] text-xs">★</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>
          <p className="text-sm text-gray-500 dark:text-muted-foreground">
            Have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex-1 flex items-start justify-center px-6 py-6 lg:px-16">
          <div className="w-full max-w-[440px] pb-10">
            {/* Mobile wordmark */}
            <div className="lg:hidden mb-8">
              <span className="text-2xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
                Vendoor<span className="text-[#16a34a]">X</span>
              </span>
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-1.5">Create account</h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm">Free forever. No credit card required.</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Role selector */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700 dark:text-foreground">I want to</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'buyer' as Role, icon: ShoppingBag, label: 'Buy items', sub: 'Browse & buy' },
                    { value: 'seller' as Role, icon: Store, label: 'Sell items', sub: 'List & earn' },
                  ].map(({ value, icon: Icon, label, sub }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center',
                        role === value
                          ? 'border-[#16a34a] bg-[#16a34a]/5 text-[#16a34a]'
                          : 'border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border/80 text-gray-600 dark:text-muted-foreground bg-gray-50 dark:bg-muted'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                        role === value ? 'bg-[#16a34a]/15' : 'bg-gray-200 dark:bg-muted'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">{label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                      </div>
                      {role === value && (
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a] absolute top-3 right-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 dark:text-foreground">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="h-12 px-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-foreground">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu.ng"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  required
                  className="h-12 px-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl"
                />
                {detectedUniversity && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#16a34a] font-semibold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Student email detected — {detectedUniversity}
                  </div>
                )}
              </div>

              {/* University */}
              <div className="space-y-1.5">
                <Label htmlFor="university" className="text-sm font-semibold text-gray-700 dark:text-foreground">
                  University <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="university"
                    type="text"
                    placeholder="e.g. University of Lagos"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="h-12 pl-10 pr-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700 dark:text-foreground">
                  WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="h-12 pl-10 pr-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Buyers will contact you directly via WhatsApp</p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-foreground">Password</Label>
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
                    className="h-12 px-4 pr-12 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                  className={cn(
                    'w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    agreedToTerms
                      ? 'bg-[#16a34a] border-[#16a34a]'
                      : 'border-gray-300 bg-white hover:border-[#16a34a]/50'
                  )}
                >
                  {agreedToTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <span className="text-sm text-gray-600 leading-snug select-none">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#16a34a] hover:underline font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#16a34a] hover:underline font-medium">Privacy Policy</Link>
                </span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl mt-1"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating account...</>
                ) : (
                  <>Create Free Account <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">ALREADY REGISTERED?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-[#16a34a] hover:text-[#16a34a] font-semibold text-sm rounded-xl transition-all"
            >
              <Link href="/auth/login">
                Sign in to existing account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <div className="mt-7 flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure & private</span>
              </div>
              <div className="w-px h-3 bg-gray-200" />
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
