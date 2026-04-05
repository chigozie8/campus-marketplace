'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import type { User } from '@supabase/supabase-js'

interface LandingNavProps {
  user: User | null
}

export function LandingNav({ user }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      {/* Floating pill container */}
      <div
        className={`w-full max-w-3xl transition-all duration-300 ${
          scrolled
            ? 'bg-card/95 backdrop-blur-md shadow-lg shadow-black/[0.08] dark:shadow-black/30 border border-border'
            : 'bg-card shadow-md shadow-black/[0.06] dark:shadow-black/20 border border-border/60'
        } rounded-2xl`}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base text-foreground tracking-tight">
              Vendoor<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How it works' },
              { href: '#categories', label: 'Categories' },
              { href: '/marketplace', label: 'Browse' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right: Theme toggle + CTA */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold px-5 h-9 gap-1.5"
                >
                  Dashboard →
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground h-9 px-4">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button
                    size="sm"
                    className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold px-5 h-9 gap-1"
                  >
                    Join for Free →
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown — inside the pill */}
        {menuOpen && (
          <div className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-1">
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How it works' },
              { href: '/marketplace', label: 'Browse' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-xl transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 mt-1 border-t border-border">
              {user ? (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">Sign in</Button>
                  </Link>
                  <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold">
                      Join for Free →
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
