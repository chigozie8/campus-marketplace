'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, ArrowRight, LayoutDashboard, ShoppingBag, Info, HelpCircle, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/notifications/notification-bell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'

interface LandingNavProps {
  user: User | null
  profile?: Pick<Profile, 'full_name' | 'avatar_url'> | null
}

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/marketplace', label: 'Browse' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
]

const MOBILE_NAV_EXTRAS = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/help', label: 'Help Center', icon: HelpCircle },
]

// ---------------------------------------------------------------------------
// NavAvatar — shared avatar placeholder used in trigger, dropdown, and drawer
// ---------------------------------------------------------------------------
interface NavAvatarProps {
  avatarUrl?: string
  fullName: string
  initials: string
  size: 'sm' | 'md'
}

function NavAvatar({ avatarUrl, fullName, initials, size }: NavAvatarProps) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const imgSize = size === 'sm' ? 32 : 40
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[13px]'

  return (
    <div className={`${dim} rounded-xl overflow-hidden shrink-0 bg-primary`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={fullName}
          width={imgSize}
          height={imgSize}
          className="object-cover w-full h-full"
          unoptimized
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center text-primary-foreground ${textSize} font-bold tracking-wider select-none`}
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function VxLogo() {
  return (
    <div className="relative w-8 h-8 shrink-0">
      <div className="absolute top-0 left-0 w-[22px] h-[22px] rounded-[5px] bg-gray-950 dark:bg-white" />
      <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-[5px] bg-[#16a34a] opacity-90" />
    </div>
  )
}

export function LandingNav({ user, profile }: LandingNavProps) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

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

  // Prefer DB profile data (real uploaded avatar) over OAuth metadata
  const avatarUrl = profile?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined)
  const fullName = profile?.full_name || (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'You'
  const userEmail = user?.email ?? ''
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
                      ? 'text-primary bg-primary/10 dark:bg-primary/15'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/60'
                  }`}
                >
                  {label}
                  {activeLink === href && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
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
                      className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 h-9 gap-1.5 shadow-md shadow-primary/20 transition-all hover:shadow-lg active:scale-95"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Button>
                  </Link>

                  {/* Avatar dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="group flex items-center gap-1 rounded-xl ring-1 ring-border hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 transition-all duration-200 p-1"
                        aria-label="Account menu"
                      >
                        <NavAvatar avatarUrl={avatarUrl} fullName={fullName} initials={initials} size="sm" />
                        <ChevronDown className="w-3 h-3 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200 mr-0.5" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={10}
                      className="w-64 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/98 dark:bg-gray-950/98 backdrop-blur-xl shadow-2xl shadow-black/[0.12] dark:shadow-black/50 p-1.5"
                    >
                      {/* Identity header */}
                      <div className="flex items-center gap-3 px-3 py-3 mb-1">
                        <NavAvatar avatarUrl={avatarUrl} fullName={fullName} initials={initials} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{fullName}</p>
                          <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{userEmail}</p>
                        </div>
                      </div>

                      <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800/80 mx-1" />

                      <DropdownMenuGroup className="py-1">
                        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/60 focus:bg-gray-50 dark:focus:bg-gray-900/60">
                          <Link href="/profile">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/15 shrink-0">
                              <UserIcon className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">View Profile</span>
                              <span className="text-[11px] text-muted-foreground leading-tight">Manage your public profile</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/60 focus:bg-gray-50 dark:focus:bg-gray-900/60">
                          <Link href="/dashboard">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 shrink-0">
                              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Dashboard</span>
                              <span className="text-[11px] text-muted-foreground leading-tight">Your listings & analytics</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/60 focus:bg-gray-50 dark:focus:bg-gray-900/60">
                          <Link href="/marketplace">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 shrink-0">
                              <ShoppingBag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Marketplace</span>
                              <span className="text-[11px] text-muted-foreground leading-tight">Browse campus listings</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800/80 mx-1" />

                      <DropdownMenuGroup className="py-1">
                        <DropdownMenuItem
                          onSelect={handleLogout}
                          disabled={loggingOut}
                          className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-400 disabled:opacity-50"
                        >
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 shrink-0">
                            <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                          </div>
                          <span className="text-sm font-semibold leading-tight">
                            {loggingOut ? 'Signing out…' : 'Sign Out'}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 h-9 gap-1.5 shadow-md shadow-primary/20 transition-all hover:shadow-lg active:scale-95"
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
                <span className="relative block w-5 h-5">
                  <Menu className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                  <X className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                </span>
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="absolute top-0 right-0 bottom-0 w-[300px] sm:w-[340px] bg-white dark:bg-gray-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ease-out">

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
              <div className="px-5 py-4 bg-primary/5 dark:bg-primary/10 border-b border-primary/10 dark:border-primary/20">
                <div className="flex items-center gap-3">
                  <NavAvatar avatarUrl={avatarUrl} fullName={fullName} initials={initials} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{fullName}</p>
                    <p className="text-xs text-primary font-medium">Logged in</p>
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
                  className="flex items-center justify-between text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/8 dark:hover:bg-primary/15 px-4 py-3 rounded-xl transition-colors"
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
                    <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 gap-2 shadow-md shadow-primary/20">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {loggingOut ? 'Signing out…' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl h-11 font-semibold">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 gap-1.5 shadow-md shadow-primary/20">
                      Start Selling Today <ArrowRight className="w-4 h-4" />
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
