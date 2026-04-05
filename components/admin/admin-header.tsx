'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Bell } from 'lucide-react'

const TITLES: Record<string, string> = {
  '/admin':            'Overview',
  '/admin/users':      'Users',
  '/admin/listings':   'Listings',
  '/admin/categories': 'Categories',
  '/admin/reviews':    'Reviews',
  '/admin/messages':   'Messages',
  '/admin/analytics':  'Analytics',
  '/admin/settings':   'Settings',
}

export function AdminHeader() {
  const pathname = usePathname()
  const title = TITLES[pathname] ?? 'Admin'

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 border-b border-border bg-card flex-shrink-0 lg:pl-6">
      <div className="flex items-center gap-3 pl-10 lg:pl-0">
        <h1 className="text-base font-black text-foreground tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View Site</span>
        </Link>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
