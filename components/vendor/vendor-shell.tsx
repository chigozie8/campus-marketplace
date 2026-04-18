'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, LogOut, Inbox, Loader2 } from 'lucide-react'
import { VendorSidebar } from './vendor-sidebar'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { createClient } from '@/lib/supabase/client'

interface Props {
  children: React.ReactNode
  initials: string
  fullName: string
  email: string
  unreadInbox?: number
  pageTitle?: string
  pageAction?: React.ReactNode
}

export function VendorShell({
  children, initials, fullName, email,
  unreadInbox = 0, pageTitle, pageAction,
}: Props) {
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-background">

      {/* ── Fixed sidebar (desktop only) ── */}
      <VendorSidebar
        initials={initials}
        fullName={fullName}
        email={email}
        unreadInbox={unreadInbox}
      />

      {/* ── Mobile topbar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-background border-b border-gray-100 dark:border-border h-14 flex items-center justify-between px-4">
        <Link href="/" className="select-none">
          <span className="text-xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
            Vendoor<span className="text-primary">X</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link href="/inbox" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-muted transition-colors">
            <Inbox className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadInbox > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Link>
          <Link href="/seller/new" className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> Sell
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
            className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Main content — uses native document scroll ── */}
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
        {pageTitle && (
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-gray-100 dark:border-border hidden md:flex items-center justify-between px-6 h-14">
            <h1 className="text-base font-bold text-gray-950 dark:text-white">{pageTitle}</h1>
            <div className="flex items-center gap-2">
              {pageAction}
              <NotificationBell />
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
