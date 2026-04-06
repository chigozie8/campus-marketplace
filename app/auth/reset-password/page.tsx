'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ArrowLeft, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'One number', pass: /\d/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-[#16a34a]']
  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-300', i < score ? colors[score - 1] : 'bg-gray-200 dark:bg-muted')} />
        ))}
      </div>
      <div className="space-y-1">
        {checks.map(({ label, pass }) => (
          <div key={label} className="flex items-center gap-1.5">
            <CheckCircle2 className={cn('w-3 h-3 transition-colors', pass ? 'text-[#16a34a]' : 'text-gray-300 dark:text-muted-foreground')} />
            <span className={cn('text-xs transition-colors', pass ? 'text-gray-600 dark:text-foreground' : 'text-gray-400 dark:text-muted-foreground')}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
      } else {
        toast.error('Invalid or expired reset link', {
          description: 'Please request a new password reset link.',
        })
      }
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    const toastId = toast.loading('Updating your password...')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    toast.dismiss(toastId)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Password updated!', {
      description: 'You can now sign in with your new password.',
    })
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-background">
      {/* Left branding panel */}
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
              <ShieldCheck className="w-8 h-8 text-[#4ade80]" />
            </div>
            <h1 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.1] tracking-tight mb-5">
              Choose a strong<br />new
              <span className="text-[#16a34a]"> password.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              Make it unique and hard to guess. Your account security is our priority.
            </p>

            <div className="space-y-4">
              {[
                { icon: Lock, title: 'Min. 8 characters', desc: 'Use letters, numbers and symbols' },
                { icon: ShieldCheck, title: 'Fully encrypted', desc: 'Your password is securely hashed' },
                { icon: CheckCircle2, title: 'Instant access', desc: 'Signed in automatically after reset' },
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
              Need help?{' '}
              <a href="mailto:support@vendoorx.com" className="text-[#4ade80] hover:underline">
                support@vendoorx.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center px-6 py-5 lg:px-10">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to sign in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-16">
          <div
            className={cn(
              'w-full max-w-[420px] transition-all duration-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
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
                Set new password
              </h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm leading-relaxed">
                Choose a strong password you have not used before.
              </p>
            </div>

            {!ready ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-muted-foreground" />
                <p className="text-sm text-gray-400 dark:text-muted-foreground">Verifying reset link...</p>
                <Link href="/auth/forgot-password" className="text-xs text-[#16a34a] hover:underline mt-2">
                  Request a new link instead
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-foreground">
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="h-12 px-4 pr-12 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:border-[#16a34a] focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-sm font-semibold text-gray-700 dark:text-foreground">
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      className={cn(
                        'h-12 px-4 pr-12 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border text-gray-900 dark:text-foreground placeholder:text-gray-400 focus:ring-[#16a34a]/20 focus:bg-white dark:focus:bg-muted transition-all rounded-xl',
                        confirm && password !== confirm
                          ? 'border-red-400 focus:border-red-400'
                          : 'focus:border-[#16a34a]'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-foreground transition-colors p-1"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Updating password...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4 mr-2" />Set New Password</>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-border" />
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Bank-grade security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
