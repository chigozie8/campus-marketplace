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
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">CampusCart</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-lg transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-lg transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#categories"
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-lg transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/marketplace"
              className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-lg transition-colors"
            >
              Browse
            </Link>
          </div>

          {/* Desktop CTA + theme toggle */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Link href="/marketplace">
                  <Button variant="ghost" size="sm" className="rounded-lg">Browse Market</Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground hover:text-foreground">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4">
                    Get started free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 flex flex-col gap-1">
          <Link
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-lg transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-lg transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/marketplace"
            className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2.5 rounded-lg transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Browse
          </Link>
          <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-border">
            {user ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground rounded-lg font-semibold">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-lg">Sign in</Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground rounded-lg font-semibold">Get started free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
