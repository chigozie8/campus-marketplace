'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Wordmark */}
          <Link href="/" className="flex items-center flex-shrink-0 group select-none">
            <span className="text-[1.45rem] font-black tracking-tight text-gray-950 dark:text-white leading-none group-hover:opacity-80 transition-opacity">
              Vendoor<span className="text-[#16a34a]">X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="#categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </Link>
            <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </Link>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" className="hero-gradient border-0 text-white hover:opacity-90" asChild>
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/50">
          <div className="px-4 py-4 space-y-3">
            <Link href="#features" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
              Features
            </Link>
            <Link href="#how-it-works" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
              How it Works
            </Link>
            <Link href="/marketplace" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
              Marketplace
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" className="hero-gradient border-0 text-white" asChild>
                <Link href="/auth/sign-up">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
