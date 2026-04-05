'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Plus, User, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/marketplace', icon: ShoppingBag, label: 'Browse' },
  { href: '/seller/new', icon: Plus, label: 'Sell', isAction: true },
  { href: '/assistant', icon: MessageCircle, label: 'AI' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function FloatingNav() {
  const pathname = usePathname()

  // Hide on auth pages
  if (pathname.startsWith('/auth')) {
    return null
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden">
      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-black/15 dark:shadow-black/50 border border-gray-200/60 dark:border-gray-700/60">
        {NAV_ITEMS.map(({ href, icon: Icon, label, isAction }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

          if (isAction) {
            return (
              <Link key={href} href={href} aria-label={label}>
                <div className="relative group">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                  
                  {/* Main button */}
                  <div className="relative flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white shadow-lg shadow-green-500/30 dark:shadow-green-500/20 transition-all duration-200 group-hover:scale-110 group-active:scale-95">
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-semibold text-white bg-gray-900 dark:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {label}
                  </span>
                </div>
              </Link>
            )
          }

          return (
            <Link key={href} href={href} aria-label={label}>
              <div className="relative group flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200">
                {/* Active indicator */}
                <div
                  className={cn(
                    'absolute inset-1 rounded-xl transition-all duration-300',
                    isActive
                      ? 'bg-green-50 dark:bg-green-950/50'
                      : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                  )}
                />

                {/* Icon */}
                <Icon
                  className={cn(
                    'relative w-5 h-5 transition-all duration-200',
                    isActive
                      ? 'text-[#16a34a] stroke-[2.5] scale-110'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 stroke-[2]'
                  )}
                />

                {/* Label */}
                <span
                  className={cn(
                    'relative text-[10px] font-medium mt-0.5 transition-colors duration-200',
                    isActive
                      ? 'text-[#16a34a]'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  )}
                >
                  {label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#16a34a]" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
