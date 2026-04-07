'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Inbox, Package, ShoppingBag,
  Settings, LogOut, Bell, Store, BookOpen,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inbox',         icon: Inbox,           label: 'Inbox',    badge: true },
  { href: '/products',      icon: Package,         label: 'My Listings' },
  { href: '/orders',        icon: ShoppingBag,     label: 'Orders' },
  { href: '/notifications', icon: Bell,            label: 'Notifications' },
  { href: '/seller',        icon: Store,           label: 'My Store' },
  { href: '/blog',          icon: BookOpen,        label: 'Blog' },
  { href: '/profile',       icon: Settings,        label: 'Settings' },
]

interface Props {
  initials: string
  fullName: string
  email: string
  unreadInbox?: number
}

export function VendorSidebar({ initials, fullName, email, unreadInbox = 0 }: Props) {
  const pathname = usePathname()

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

      {/* Support */}
      <div className="px-2.5 pb-2">
        <a
          href="https://wa.me/2347082039150"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-sidebar-foreground hover:bg-[#25D366]/10 hover:text-[#25D366] dark:hover:text-[#25D366] transition-all duration-150 group"
        >
          <div className="w-4 h-4 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z"/>
            </svg>
          </div>
          <span className="flex-1">Contact Support</span>
        </a>
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
        <form action="/api/auth/sign-out" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2.5 text-xs text-gray-500 hover:text-red-600 dark:text-muted-foreground dark:hover:text-red-400 w-full px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
