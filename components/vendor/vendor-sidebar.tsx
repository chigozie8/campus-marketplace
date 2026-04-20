'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Inbox, Package, ShoppingBag,
  Settings, LogOut, Bell, Store, BookOpen, ClipboardList, BarChart2,
  Heart, Gift, Loader2, MessageSquare, ShieldAlert,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inbox',               icon: Inbox,           label: 'Inbox',     badge: true },
  { href: '/dashboard/offers',    icon: MessageSquare,   label: 'Messages' },
  { href: '/products',            icon: Package,         label: 'My Listings' },
  { href: '/orders',              icon: ShoppingBag,     label: 'My Orders' },
  { href: '/seller-orders',       icon: ClipboardList,   label: 'Seller Orders' },
  { href: '/dashboard/disputes',  icon: ShieldAlert,     label: 'Disputes' },
  { href: '/dashboard/analytics', icon: BarChart2,       label: 'Analytics' },
  { href: '/dashboard/wishlist',  icon: Heart,           label: 'Wishlist' },
  { href: '/dashboard/loyalty',   icon: Gift,            label: 'Loyalty Points' },
  { href: '/notifications',       icon: Bell,            label: 'Notifications' },
  { href: '/seller',              icon: Store,           label: 'My Store' },
  { href: '/blog',                icon: BookOpen,        label: 'Blog' },
  { href: '/profile',             icon: Settings,        label: 'Settings' },
]

interface Props {
  initials: string
  fullName: string
  email: string
  unreadInbox?: number
}

export function VendorSidebar({ initials, fullName, email, unreadInbox = 0 }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-sidebar border-r border-gray-100 dark:border-sidebar-border fixed h-full z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-sidebar-border">
        <Link href="/" className="group select-none flex items-center gap-2">
          <span className="text-[1.35rem] font-black tracking-tight text-gray-950 dark:text-white leading-none group-hover:opacity-80 transition-opacity">
            Vendoor<span className="text-primary">X</span>
          </span>
        </Link>
        <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 tracking-widest uppercase">Campus Commerce</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-600 dark:text-sidebar-foreground hover:bg-gray-100 dark:hover:bg-sidebar-accent hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && unreadInbox > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                  active ? 'bg-white/20 text-white' : 'bg-primary text-white'
                }`}>
                  {unreadInbox > 99 ? '99+' : unreadInbox}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Support — opens the in-app help center, not a third-party DM. */}
      <div className="px-2.5 pb-2">
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-sidebar-foreground hover:bg-gray-100 dark:hover:bg-sidebar-accent hover:text-gray-900 dark:hover:text-white transition-all duration-150"
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">Help &amp; Support</span>
        </Link>
      </div>

      {/* User */}
      <div className="p-3 border-t border-gray-100 dark:border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-sidebar-accent mb-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{fullName}</p>
            <p className="text-[10px] text-gray-400 dark:text-muted-foreground truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2.5 text-xs text-gray-500 hover:text-red-600 dark:text-muted-foreground dark:hover:text-red-400 w-full px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {signingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
