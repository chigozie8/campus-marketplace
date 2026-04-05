'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Welcome back!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden mesh-bg">
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }}
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
          <h1 className="text-2xl font-bold text-foreground mb-3 text-balance">
            The campus commerce OS built for{' '}
            <span className="gradient-text">winners</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto mb-10">
            Discover, chat, and close deals instantly via WhatsApp, Instagram, and Facebook.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {['50K+ Students', '120K+ Products', '2M+ WhatsApp Chats', '4.9/5 Rating'].map(stat => (
              <div key={stat} className="glass-card rounded-xl px-4 py-3">
                <p className="text-foreground font-semibold text-sm">{stat}</p>
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
            <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your VendoorX account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
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
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-green-sm"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
              Sign up free
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing, you agree to our{' '}
            <Link href="#" className="hover:underline">Terms</Link>
            {' & '}
            <Link href="#" className="hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
