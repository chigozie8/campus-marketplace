'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, ArrowRight, LayoutDashboard, ShoppingBag, Tag, Info, HelpCircle, BarChart3, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/notifications/notification-bell'
import type { User } from '@supabase/supabase-js'

interface LandingNavProps {
  user: User | null
}

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '/marketplace', label: 'Browse' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Reviews' },
]

const MOBILE_NAV_EXTRAS = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/help', label: 'Help Center', icon: HelpCircle },
]

function VxLogo() {
  return (
    <div className="relative w-8 h-8 shrink-0">
      <div className="absolute top-0 left-0 w-[22px] h-[22px] rounded-[5px] bg-gray-950 dark:bg-white" />
      <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-[5px] bg-[#16a34a] opacity-90" />
    </div>
  )
}

export function LandingNav({ user }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3">
        <div
          className={`w-full max-w-5xl transition-all duration-500 rounded-2xl ${
            scrolled
              ? 'bg-white/96 dark:bg-gray-950/96 backdrop-blur-2xl shadow-2xl shadow-black/[0.12] dark:shadow-black/50 border border-gray-200/90 dark:border-gray-800'
              : 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-lg shadow-black/[0.06] dark:shadow-black/20 border border-gray-100/80 dark:border-gray-800/50'
          }`}
        >
          <div className="flex items-center justify-between px-4 sm:px-5 h-[66px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group select-none shrink-0">
              <VxLogo />
              <span className="text-[1.35rem] font-black tracking-tight text-gray-950 dark:text-white leading-none group-hover:opacity-80 transition-opacity">
                Vendoor<span className="text-[#16a34a]">X</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setActiveLink(href)}
                  className={`relative text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-200 ${
                    activeLink === href
                      ? 'text-[#16a34a] bg-green-50 dark:bg-green-950/40'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/60'
                  }`}
                >
                  {label}
                  {activeLink === href && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#16a34a]" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side — desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-4 h-9 gap-1.5 shadow-md shadow-green-200 dark:shadow-green-900/30 transition-all hover:shadow-lg hover:shadow-green-200 active:scale-95"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Button>
                  </Link>
                  {/* Avatar */}
                  <Link href="/profile" className="shrink-0">
                    <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#16a34a]/30 hover:ring-[#16a34a]/60 transition-all">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={fullName} width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#16a34a] to-emerald-600 flex items-center justify-center text-white text-xs font-black">
                          {initials}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-4 font-medium"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button
                      size="sm"
                      className="rounded-xl bg-gray-950 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold px-4 h-9 gap-1.5 transition-all active:scale-95"
                    >
                      Join Free
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button
                      size="sm"
                      className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-4 h-9 gap-1.5 shadow-md shadow-green-200 dark:shadow-green-900/30 transition-all hover:shadow-lg active:scale-95"
                    >
                      Start Selling <ArrowRight className="w-3.5 h-3.5" />
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
                className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer — slide from right */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="absolute top-0 right-0 bottom-0 w-[300px] sm:w-[340px] bg-white dark:bg-gray-950 shadow-2xl flex flex-col overflow-hidden">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-800">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <VxLogo />
                <span className="text-lg font-black tracking-tight text-gray-950 dark:text-white">
                  Vendoor<span className="text-[#16a34a]">X</span>
                </span>
              </Link>
              <button
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info (if authenticated) */}
            {user && (
              <div className="px-5 py-4 bg-green-50 dark:bg-green-950/30 border-b border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-2 ring-[#16a34a]/30">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={fullName} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#16a34a] to-emerald-600 flex items-center justify-center text-white text-sm font-black">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{fullName}</p>
                    <p className="text-xs text-[#16a34a] font-medium">Logged in</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#16a34a] dark:hover:text-[#16a34a] hover:bg-green-50 dark:hover:bg-green-950/30 px-4 py-3 rounded-xl transition-colors"
                  onClick={() => { setMenuOpen(false); setActiveLink(href) }}
                >
                  {label}
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 opacity-40" />
                </Link>
              ))}

              <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                {MOBILE_NAV_EXTRAS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/60 px-4 py-2.5 rounded-xl transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth CTAs */}
            <div className="px-4 py-5 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 bg-gray-50/50 dark:bg-gray-900/30">
              {user ? (
                <>
                  <Link href="/marketplace" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl h-11 font-semibold gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Browse Marketplace
                    </Button>
                  </Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold h-11 gap-2 shadow-md shadow-green-200 dark:shadow-green-900/30">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl h-11 font-semibold">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold h-11 gap-1.5 shadow-md shadow-green-200 dark:shadow-green-900/30">
                      Join for Free <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                    <span className="text-xs text-gray-400 font-medium px-2">or</span>
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-gray-950 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-950 font-bold h-11 gap-1.5">
                      <Tag className="w-4 h-4" />
                      Start Selling Today
                    </Button>
                  </Link>
                </>
              )}
              <p className="text-center text-[11px] text-gray-400 mt-1">
                Free forever · No credit card needed
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
