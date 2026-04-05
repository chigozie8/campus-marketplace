'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  CheckCircle2, ShieldCheck, Sparkles, Lock, Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-[#16a34a]']
  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-all duration-300', i < score ? colors[score] : 'bg-gray-200')}
          />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map(({ label, pass }) => (
          <span key={label} className={cn('text-[10px] flex items-center gap-1', pass ? 'text-[#16a34a]' : 'text-gray-400')}>
            <CheckCircle2 className="w-2.5 h-2.5" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const toastId = toast.loading('Creating your account...')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        data: { full_name: fullName, whatsapp_number: whatsapp },
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div
          className={cn(
            'text-center max-w-md transition-all duration-500',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#16a34a]/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-xl">
              <Mail className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-950 tracking-tight mb-2">Check your inbox</h2>
          <p className="text-gray-500 leading-relaxed mb-8 text-sm">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-gray-900">{email}</span>.
            Click it to activate your VendoorX account.
          </p>
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
    <div className="min-h-screen flex bg-white">
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
          <Link href="/" className="inline-flex items-center gap-2 group w-fit">
            <span className="text-2xl font-black tracking-tight text-white leading-none">
              Vendoor<span className="text-[#16a34a]">X</span>
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 bg-[#16a34a]/20 text-[#4ade80] text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#16a34a]/30">
                <Sparkles className="w-3 h-3" />
                Free forever
              </span>
            </div>
            <h1 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.1] tracking-tight mb-5">
              Start selling in<br />under{' '}
              <span className="text-[#16a34a]">60 seconds.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              List items for free, connect buyers directly on WhatsApp, and get paid — no commissions.
            </p>

            <div className="space-y-3 mb-12">
              {[
                'Free to join, free to list forever',
                'Direct WhatsApp buyer connections',
                'Seller analytics & verified badge',
                'Campus-only trusted community',
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
              {[{ value: '₦0', label: 'Commission' }, { value: '60s', label: 'To list' }, { value: '50K+', label: 'Buyers' }].map(({ value, label }) => (
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
              <div className="w-8 h-8 rounded-full bg-[#16a34a]/30 border border-[#16a34a]/40 flex items-center justify-center">
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
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>
          <p className="text-sm text-gray-500">
            Have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-6 lg:px-16">
          <div
            className={cn(
              'w-full max-w-[420px] transition-all duration-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <div className="lg:hidden mb-8">
              <span className="text-2xl font-black tracking-tight text-gray-950 leading-none">
                Vendoor<span className="text-[#16a34a]">X</span>
              </span>
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-black text-gray-950 tracking-tight mb-1.5">Create account</h2>
              <p className="text-gray-500 text-sm">Free forever. No credit card required.</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="h-12 px-4 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white transition-all rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu.ng"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-12 px-4 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white transition-all rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">
                  WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="h-12 px-4 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white transition-all rounded-xl"
                />
                <p className="text-[11px] text-gray-400">Buyers will contact you directly via WhatsApp</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-12 px-4 pr-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white transition-all rounded-xl"
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
                Sign in to your account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
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

            <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
              By signing up, you agree to our{' '}
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
