'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, LogOut, Bell, Inbox } from 'lucide-react'
import { VendorSidebar } from './vendor-sidebar'

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
  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-background">
      <div className="flex h-screen overflow-hidden">
        <VendorSidebar
          initials={initials}
          fullName={fullName}
          email={email}
          unreadInbox={unreadInbox}
        />

        {/* Mobile topbar */}
        <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-background border-b border-gray-100 dark:border-border h-14 flex items-center justify-between px-4">
          <Link href="/" className="select-none">
            <span className="text-xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
              Vendoor<span className="text-primary">X</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/inbox" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Inbox className="w-5 h-5 text-gray-600" />
              {unreadInbox > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Link>
            <Link href="/seller/new" className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              <Plus className="w-3.5 h-3.5" /> Sell
            </Link>
            <form action="/api/auth/sign-out" method="POST">
              <button type="submit" className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 md:ml-60 overflow-y-auto flex flex-col">
          {/* Top bar */}
          {pageTitle && (
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-gray-100 dark:border-border hidden md:flex items-center justify-between px-6 h-14">
              <h1 className="text-base font-bold text-gray-950 dark:text-white">{pageTitle}</h1>
              <div className="flex items-center gap-2">
                {pageAction}
                <Link href="/notifications" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors relative">
                  <Bell className="w-4.5 h-4.5 text-gray-500" />
                </Link>
              </div>
            </div>
          )}

          <div className="flex-1 mt-14 md:mt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
