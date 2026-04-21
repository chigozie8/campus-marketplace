'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Plus, User, MessageCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'

type NavItem = {
  href: string
  icon: LucideIcon
  label: string
  isAction?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/',            icon: Home,          label: 'Home'    },
  { href: '/marketplace', icon: ShoppingBag,   label: 'Browse'  },
  { href: '/seller/new',  icon: Plus,          label: 'Sell',     isAction: true },
  { href: '/assistant',   icon: MessageCircle, label: 'AI'      },
  { href: '/profile',     icon: User,          label: 'Profile' },
]

function isItemActive(itemHref: string, pathname: string) {
  if (itemHref === '/') return pathname === '/'
  return pathname === itemHref || pathname.startsWith(itemHref + '/')
}

export function FloatingNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/auth')) return null
  if (pathname === '/coming-soon')  return null

  return (
    <LazyMotion features={domAnimation}>
      {/* Spacer so floating bar never covers page content */}
      <div className="h-[88px] lg:hidden" aria-hidden />

      <nav
        className="fixed bottom-0 inset-x-0 z-50 lg:hidden pointer-events-none"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
        aria-label="Bottom navigation"
      >
        <div className="pointer-events-auto mx-auto w-fit max-w-[calc(100%-1rem)] px-3">
          {/* Floating pill */}
          <div
            className={cn(
              'relative flex items-center gap-1 h-16 px-2.5 rounded-full',
              'bg-white dark:bg-black backdrop-blur-xl',
              'border-2 border-black dark:border-white',
              'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.45),0_2px_8px_-2px_rgba(0,0,0,0.15)]',
              'dark:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.15)]',
            )}
          >
            {NAV_ITEMS.map((item) => {
              if (item.isAction) return <SellAction key={item.href} item={item} active={isItemActive(item.href, pathname)} />
              return <NavTab key={item.href} item={item} active={isItemActive(item.href, pathname)} />
            })}
          </div>
        </div>
      </nav>
    </LazyMotion>
  )
}

/* ─── Regular nav tab ─────────────────────────────────────────────────────── */
function NavTab({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link href={item.href} aria-label={item.label} className="relative">
      <m.div
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={cn(
          'relative flex items-center gap-1.5 h-11 rounded-full overflow-hidden',
          'transition-colors duration-200',
          active
            ? 'bg-black text-white dark:bg-white dark:text-black px-3.5'
            : 'px-3',
        )}
      >
        <m.div
          animate={active ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative flex items-center justify-center"
        >
          <Icon
            className={cn(
              'transition-all duration-200 w-[22px] h-[22px]',
              active
                ? 'text-white dark:text-black stroke-[2.75]'
                : 'text-gray-400 dark:text-gray-500 stroke-[2.25]',
            )}
          />
        </m.div>

        <AnimatePresence initial={false}>
          {active && (
            <m.span
              key="label"
              initial={{ opacity: 0, width: 0, x: -4 }}
              animate={{ opacity: 1, width: 'auto', x: 0 }}
              exit={{ opacity: 0, width: 0, x: -4 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="text-[13px] font-black text-white dark:text-black whitespace-nowrap overflow-hidden tracking-tight"
            >
              {item.label}
            </m.span>
          )}
        </AnimatePresence>
      </m.div>
    </Link>
  )
}

/* ─── Center "Sell" floating action button ────────────────────────────────── */
function SellAction({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      className="relative -my-6 mx-1 flex items-center justify-center"
    >
      {/* Soft glow halo */}
      <m.span
        aria-hidden
        animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.2, 0.45] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/40 dark:bg-white/40 blur-xl"
      />

      {/* The button */}
      <m.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className={cn(
          'relative w-14 h-14 rounded-full flex items-center justify-center',
          'bg-black text-white dark:bg-white dark:text-black',
          'shadow-[0_8px_24px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.18)]',
          'ring-4 ring-white dark:ring-black',
          active && 'ring-gray-200 dark:ring-gray-800',
        )}
      >
        <Icon className="w-6 h-6 stroke-[3]" />
      </m.div>
    </Link>
  )
}
