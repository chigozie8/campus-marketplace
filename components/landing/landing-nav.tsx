'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, ArrowRight, LayoutDashboard, ShoppingBag, ChevronDown, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface LandingNavProps {
  user: User | null
}

const NAV_LINKS = [
  { 
    label: 'Features', 
    href: '/features',
    hasDropdown: true,
  },
  { 
    label: 'Solutions', 
    href: '/solutions',
    hasDropdown: true,
  },
  { label: 'Pricing', href: '/pricing' },
  { 
    label: 'Resources', 
    href: '/resources',
    hasDropdown: true,
  },
  { 
    label: 'Company', 
    href: '/about',
    hasDropdown: true,
  },
]

function VxLogo() {
  return (
    <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-none">
      vendoor<span className="text-primary">x</span>
    </span>
  )
}

export function LandingNav({ user }: LandingNavProps) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'You'
  const initials = fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <VxLogo />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, hasDropdown }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {label}
                  {hasDropdown && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>
              ))}
            </div>

            {/* Right side — desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:text-primary hover:bg-primary/5 font-semibold"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button
                      size="sm"
                      className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-md shadow-primary/20"
                    >
                      Start Free on WhatsApp
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/5 font-semibold"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button
                      size="sm"
                      className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-md shadow-primary/20"
                    >
                      Start Free on WhatsApp
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle />
              {user && <NotificationBell />}
              <button
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span className="relative block w-5 h-5">
                  <Menu className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                  <X className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="absolute top-0 right-0 bottom-0 w-[300px] sm:w-[340px] bg-background shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <VxLogo />
              </Link>
              <button
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info (if authenticated) */}
            {user && (
              <div className="px-5 py-4 bg-primary/5 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/30">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={fullName} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
                    <p className="text-xs text-primary font-medium">Logged in</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label, hasDropdown }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-4 py-3 rounded-lg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                  {hasDropdown && <ChevronDown className="w-3.5 h-3.5 -rotate-90" />}
                </Link>
              ))}
            </div>

            {/* Auth CTAs */}
            <div className="px-4 py-5 border-t border-border flex flex-col gap-2.5 bg-muted/30">
              {user ? (
                <>
                  <Link href="/marketplace" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-lg h-11 font-semibold gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Browse Marketplace
                    </Button>
                  </Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 gap-2 shadow-md shadow-primary/20">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5 font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {loggingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-lg h-11 font-semibold">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 gap-1.5 shadow-md shadow-primary/20">
                      Start Free on WhatsApp <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )}
              <p className="text-center text-[11px] text-muted-foreground mt-1">
                Free forever. No credit card needed.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
