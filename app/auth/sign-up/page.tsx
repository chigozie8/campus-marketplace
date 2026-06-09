'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  CheckCircle2, ShieldCheck, Lock,
  ShoppingBag, Store, Repeat, GraduationCap, Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { detectUniversity } from '@/lib/universities'
import { Web3WalletButtons } from '@/components/auth/web3-wallet-buttons'
import { AuthSidePanel } from '@/components/auth/auth-side-panel'
import { WhatsAppMark } from '@/app/auth/login/page'

/* ── Password strength indicator ── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Symbol', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const barColors = ['bg-red-400', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-500']
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Perfect']
  const labelColors = ['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-green-600']
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={cn(
            'h-1 flex-1 rounded-full transition-all duration-300',
            i < score ? barColors[score] : 'bg-gray-200 dark:bg-muted'
          )} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {checks.map(({ label, pass }) => (
            <span key={label} className={cn('text-[10px] flex items-center gap-1', pass ? 'text-[#128C7E]' : 'text-gray-400')}>
              <CheckCircle2 className="w-2.5 h-2.5" />
              {label}
            </span>
          ))}
        </div>
        {labels[score] && (
          <span className={cn('text-[11px] font-bold uppercase tracking-wider', labelColors[score])}>
            {labels[score]}
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
  const [university, setUniversity] = useState('')
  const [detectedUniversity, setDetectedUniversity] = useState<string | null>(null)
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
    if (!/[A-Z]/.test(password)) { toast.error('Password needs at least one uppercase letter'); return }
    if (!/[0-9]/.test(password)) { toast.error('Password needs at least one number'); return }
    if (!/[^A-Za-z0-9]/.test(password)) { toast.error('Password needs at least one special character (e.g. !@#$%)'); return }
    if (!agreedToTerms) { toast.error('Please agree to the Terms & Privacy Policy'); return }
    if (whatsapp.trim() && !/^\+?[\d\s\-()]{10,15}$/.test(whatsapp.trim())) {
      toast.error('Enter a valid WhatsApp number, e.g. 08012345678')
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
      <AuthSidePanel mode="signup" />

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5 flex-shrink-0">
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
            Have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-[#128C7E] hover:text-[#075E54] dark:text-[#25D366] dark:hover:text-[#1ebe57] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-start justify-center px-5 sm:px-8 lg:px-16 py-4 sm:py-6">
          <div className="w-full max-w-[420px] pb-10">

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] rounded-full px-3 py-1 text-xs font-semibold tracking-wide mb-4">
                <WhatsAppMark size={13} />
                Free forever — no credit card
              </div>
              <h2 className="text-2xl sm:text-[1.75rem] font-black text-gray-950 dark:text-white tracking-tight leading-tight mb-1.5">
                Create your account
              </h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm leading-relaxed">
                List items, connect with buyers on WhatsApp, and get paid — in minutes.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">

              {/* Role picker */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-foreground">I want to</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'buyer' as Role, icon: ShoppingBag, label: 'Buy', sub: 'Browse & buy' },
                    { value: 'seller' as Role, icon: Store, label: 'Sell', sub: 'List & earn' },
                    { value: 'both' as Role, icon: Repeat, label: 'Both', sub: 'Buy & sell' },
                  ] as const).map(({ value, icon: Icon, label, sub }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={cn(
                        'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center',
                        role === value
                          ? 'border-[#25D366] bg-[#25D366]/6 text-[#128C7E]'
                          : 'border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-gray-500 hover:border-gray-300'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                        role === value ? 'bg-[#25D366]/15' : 'bg-gray-200/80 dark:bg-muted'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">{label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                      </div>
                      {role === value && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] absolute top-1.5 right-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <FieldWrap label="Full name" htmlFor="fullName">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className={INPUT_CLS}
                />
              </FieldWrap>

              {/* Email */}
              <FieldWrap label="Email address" htmlFor="reg-email">
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  required
                  className={INPUT_CLS}
                />
                {detectedUniversity && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#128C7E] font-semibold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Institution detected — {detectedUniversity}
                  </div>
                )}
              </FieldWrap>

              {/* Organisation */}
              <FieldWrap label="Organisation / Business" htmlFor="university" optional>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="university"
                    type="text"
                    placeholder="e.g. Your business or school name"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className={cn(INPUT_CLS, 'pl-10')}
                  />
                </div>
              </FieldWrap>

              {/* WhatsApp — primary field, highlighted */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700 dark:text-foreground flex items-center gap-1.5">
                  <WhatsAppMark size={14} color="#25D366" />
                  WhatsApp number
                  <span className="text-[11px] font-medium text-[#128C7E] bg-[#25D366]/10 rounded-full px-2 py-0.5">recommended</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className={cn(
                      INPUT_CLS,
                      'pl-10 border-[#25D366]/30 focus:border-[#25D366] focus:ring-[#25D366]/10 bg-[#f0fdf4]/60 dark:bg-[#052e16]/20'
                    )}
                  />
                </div>
                <p className="text-[11px] text-gray-400">Buyers will contact you directly — this is how deals get done on VendoorX.</p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-sm font-semibold text-gray-700 dark:text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className={cn(INPUT_CLS, 'pr-12')}
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
                <PasswordStrength password={password} />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={cn(
                    'w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    agreedToTerms
                      ? 'bg-[#25D366] border-[#25D366]'
                      : 'border-gray-300 dark:border-border bg-white dark:bg-muted hover:border-[#25D366]/50'
                  )}
                  aria-label="Agree to Terms of Service"
                >
                  {agreedToTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <span className="text-sm text-gray-600 dark:text-muted-foreground leading-snug select-none">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#128C7E] dark:text-[#25D366] hover:underline font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#128C7E] dark:text-[#25D366] hover:underline font-medium">Privacy Policy</Link>
                </span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-bold text-sm rounded-xl shadow-md transition-all hover:-translate-y-px hover:shadow-lg mt-1 text-white"
                style={{
                  background: loading ? '#1a6e40' : '#128C7E',
                }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating account...</>
                ) : (
                  <>
                    <WhatsAppMark size={17} color="white" />
                    <span className="ml-2">Create Free Account</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Web3 wallet sign up */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
              <span className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase">or connect wallet</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-border" />
            </div>
            <Web3WalletButtons mode="signup" />

            {/* Trust row */}
            <div className="mt-7 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-border" />
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure & private</span>
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

/* ── Small helpers ── */
const INPUT_CLS =
  'h-12 px-4 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#128C7E] focus:ring-[#25D366]/10 focus:bg-white dark:focus:bg-muted transition-all rounded-xl'

function FieldWrap({
  label, htmlFor, optional, children,
}: { label: string; htmlFor: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700 dark:text-foreground">
        {label}
        {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </Label>
      {children}
    </div>
  )
}
