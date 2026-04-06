'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tag,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  BarChart3,
  BadgeCheck,
  Menu,
  X,
  Package,
  Megaphone,
  BookOpen,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Overview',       href: '/admin',                  icon: LayoutDashboard },
  { label: 'Users',          href: '/admin/users',            icon: Users },
  { label: 'Listings',       href: '/admin/listings',         icon: ShoppingBag },
  { label: 'Orders',         href: '/admin/orders',           icon: Package },
  { label: 'Verifications',  href: '/admin/verifications',    icon: BadgeCheck },
  { label: 'Categories',     href: '/admin/categories',       icon: Tag },
  { label: 'Reviews',        href: '/admin/reviews',          icon: Star },
  { label: 'Messages',       href: '/admin/messages',         icon: MessageSquare },
  { label: 'Analytics',      href: '/admin/analytics',        icon: BarChart3 },
  { label: 'Blog',           href: '/admin/blog',             icon: BookOpen },
  { label: 'Broadcast',      href: '/admin/broadcast',        icon: Megaphone },
  { label: 'Settings',       href: '/admin/settings',         icon: Settings },
]

interface Props {
  role: string
  userEmail: string
}

export function AdminSidebar({ role, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0">
          <span className="text-background text-sm font-black tracking-tight leading-none">
            V<span className="text-primary">X</span>
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-black text-sm text-foreground tracking-tight">VendoorX</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xs font-black">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{userEmail}</p>
            <p className="text-[10px] text-muted-foreground">
              {role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
