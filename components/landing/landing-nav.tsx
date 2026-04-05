'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { VendoorXLogo } from '@/components/vendoorx-logo'
import type { User } from '@supabase/supabase-js'

interface LandingNavProps {
  user: User | null
}

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#categories', label: 'Categories' },
  { href: '/marketplace', label: 'Browse' },
  { href: '#testimonials', label: 'Reviews' },
]

export function LandingNav({ user }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Announcement bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#16a34a] text-white text-center py-2 px-4 text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 shrink-0" />
        <span>VendoorX is live on 120+ Nigerian campuses — join for free today</span>
        <Sparkles className="w-3 h-3 shrink-0" />
      </div>

      {/* Main navbar — sits below announcement bar */}
      <nav className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4 pt-3">
        <div
          className={`w-full max-w-5xl transition-all duration-300 rounded-2xl ${
            scrolled
              ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-xl shadow-black/[0.10] dark:shadow-black/40 border border-gray-200/80 dark:border-gray-800'
              : 'bg-white dark:bg-gray-950 shadow-lg shadow-black/[0.07] dark:shadow-black/20 border border-gray-100 dark:border-gray-800/60'
          }`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">

            {/* Logo */}
            <VendoorXLogo size={38} />

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setActiveLink(href)}
                  className={`relative text-sm font-medium px-4 py-2 rounded-xl transition-colors group ${
                    activeLink === href
                      ? 'text-[#16a34a] bg-green-50 dark:bg-green-950/40'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  {label}
                  {/* active underline dot */}
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#16a34a] transition-opacity ${activeLink === href ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`} />
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />

              {user ? (
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-5 h-10 gap-1.5 shadow-md shadow-green-200 dark:shadow-green-900/30 transition-all hover:shadow-lg hover:shadow-green-200"
                  >
                    Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-10 px-4 font-medium"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button
                      size="sm"
                      className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-5 h-10 gap-1.5 shadow-md shadow-green-200 dark:shadow-green-900/30 transition-all hover:shadow-lg hover:shadow-green-200 active:scale-95"
                    >
                      Join for Free <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen
                  ? <X className="w-5 h-5" />
                  : <Menu className="w-5 h-5" />
                }
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#16a34a] hover:bg-green-50 dark:hover:bg-green-950/30 px-4 py-3 rounded-xl transition-colors"
                  onClick={() => { setMenuOpen(false); setActiveLink(href) }}
                >
                  {label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
                {user ? (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold h-11">
                      Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl h-11 font-medium">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)}>
                      <Button className="w-full rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold h-11 gap-1.5">
                        Join for Free <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
