'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
          whatsapp_number: whatsapp,
        },
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Check your email</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start buying & selling!
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-green-sm">
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden mesh-bg">
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative z-10 text-center px-12">
          <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-green-sm">
              <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">
              Vendoor<span className="text-primary">X</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-8 text-balance">
            Join 50,000+ campus{' '}
            <span className="gradient-text">entrepreneurs</span>
          </h1>
          <div className="space-y-3 text-left">
            {[
              'List products in under 60 seconds',
              'Connect buyers via WhatsApp instantly',
              'Reach students across all campuses',
              'Track sales with a real-time dashboard',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 glass-card rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-foreground text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight">Vendoor<span className="text-primary">X</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">Create your account</h2>
            <p className="text-muted-foreground">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu.ng"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+234 800 000 0000"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-green-sm mt-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Creating account...' : 'Create Free Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
