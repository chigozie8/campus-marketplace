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

  if (pathname.startsWith('/auth')) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      aria-label="Bottom navigation"
    >
      {/* Notch cutout container */}
      <div className="relative flex items-end justify-center">
        {/* SVG notch background */}
        <svg
          className="absolute bottom-0 left-0 w-full pointer-events-none dark:hidden"
          height="72"
          preserveAspectRatio="none"
          viewBox="0 0 390 72"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 L145,0 Q160,0 165,10 Q175,38 195,38 Q215,38 225,10 Q230,0 245,0 L390,0 L390,72 L0,72 Z"
            fill="white"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full pointer-events-none hidden dark:block"
          height="72"
          preserveAspectRatio="none"
          viewBox="0 0 390 72"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 L145,0 Q160,0 165,10 Q175,38 195,38 Q215,38 225,10 Q230,0 245,0 L390,0 L390,72 L0,72 Z"
            fill="rgb(17 24 39)"
          />
        </svg>

        {/* Border line above nav (split around notch) */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-800 pointer-events-none" />

        {/* Nav items */}
        <div className="relative z-10 flex items-center w-full max-w-md mx-auto px-2 h-[68px]">
          {NAV_ITEMS.map(({ href, icon: Icon, label, isAction }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

            if (isAction) {
              return (
                <div key={href} className="flex-1 flex justify-center -mt-6">
                  <Link href={href} aria-label={label}>
                    <div className="relative group">
                      {/* Shadow ring */}
                      <div className="absolute inset-0 rounded-full bg-black/20 blur-md translate-y-1 scale-90 group-hover:bg-black/30 transition-all duration-200" />
                      {/* Button */}
                      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-xl transition-all duration-200 group-hover:scale-105 group-active:scale-95 group-hover:bg-gray-900">
                        <Icon className="w-6 h-6 stroke-[2.5]" />
                      </div>
                    </div>
                  </Link>
                </div>
              )
            }

            return (
              <div key={href} className="flex-1 flex justify-center">
                <Link href={href} aria-label={label}>
                  <div className="relative group flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200">
                    {/* Active/hover background */}
                    <div
                      className={cn(
                        'absolute inset-1 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-black/8 dark:bg-white/10'
                          : 'bg-transparent group-hover:bg-black/6 dark:group-hover:bg-white/8'
                      )}
                    />

                    {/* Icon */}
                    <Icon
                      className={cn(
                        'relative w-[22px] h-[22px] transition-all duration-200',
                        isActive
                          ? 'text-black dark:text-white stroke-[2.5] scale-110'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white stroke-2'
                      )}
                    />

                    {/* Label */}
                    <span
                      className={cn(
                        'relative text-[10px] font-semibold mt-0.5 transition-colors duration-200',
                        isActive
                          ? 'text-black dark:text-white'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white'
                      )}
                    >
                      {label}
                    </span>

                    {/* Active dot */}
                    {isActive && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-black dark:bg-white" />
                    )}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
