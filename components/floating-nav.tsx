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
              'relative flex items-center h-16 px-2.5 rounded-full',
              'bg-white/95 dark:bg-black/90 backdrop-blur-2xl',
              'shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35),0_4px_14px_-4px_rgba(0,0,0,0.18),inset_0_1px_0_0_rgba(255,255,255,0.6)]',
              'dark:shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7),0_4px_14px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)]',
            )}
          >
            {/* Left tabs */}
            <div className="flex items-center gap-0.5">
              {NAV_ITEMS.filter(i => !i.isAction).slice(0, 2).map(item => (
                <NavTab key={item.href} item={item} active={isItemActive(item.href, pathname)} />
              ))}
            </div>

            {/* Reserved space for the center FAB so the marketplace icon never collides */}
            <div className="w-[84px] shrink-0" aria-hidden />

            {/* Right tabs */}
            <div className="flex items-center gap-0.5">
              {NAV_ITEMS.filter(i => !i.isAction).slice(2).map(item => (
                <NavTab key={item.href} item={item} active={isItemActive(item.href, pathname)} />
              ))}
            </div>

            {/* Absolutely-centered Sell FAB — never drifts when a tab label expands */}
            {(() => {
              const sell = NAV_ITEMS.find(i => i.isAction)!
              return (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="pointer-events-auto">
                    <SellAction item={sell} active={isItemActive(sell.href, pathname)} />
                  </div>
                </div>
              )
            })()}
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
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="relative flex flex-col items-center justify-center h-12 px-3.5 rounded-full"
      >
        <m.div
          animate={active ? { y: -1, scale: 1.05 } : { y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative flex items-center justify-center"
        >
          <Icon
            className={cn(
              'transition-colors duration-200 w-[22px] h-[22px]',
              active
                ? 'text-foreground stroke-[2.6]'
                : 'text-gray-400 dark:text-gray-500 stroke-[2.1]',
            )}
          />
        </m.div>

        {/* Active label sits beneath the icon — small, tight, no heavy pill */}
        <AnimatePresence initial={false}>
          {active && (
            <m.span
              key="label"
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute -bottom-0.5 text-[10px] font-bold text-foreground whitespace-nowrap tracking-tight leading-none"
            >
              {item.label}
            </m.span>
          )}
        </AnimatePresence>

        {/* Tiny indicator dot when active */}
        <AnimatePresence initial={false}>
          {active && (
            <m.span
              key="dot"
              layoutId="nav-active-dot"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute -top-0.5 w-1 h-1 rounded-full bg-foreground"
              aria-hidden
            />
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
      className="relative flex items-center justify-center"
    >
      {/* Soft glow halo */}
      <m.span
        aria-hidden
        animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/35 dark:bg-white/30 blur-xl"
      />

      {/* The button */}
      <m.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className={cn(
          'relative w-12 h-12 rounded-full flex items-center justify-center -translate-y-3',
          'bg-black text-white dark:bg-white dark:text-black',
          'shadow-[0_10px_24px_-6px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.2)]',
          'ring-[3px] ring-white dark:ring-black',
          active && 'ring-gray-200 dark:ring-gray-800',
        )}
      >
        <Icon className="w-[22px] h-[22px] stroke-[2.75]" />
      </m.div>
    </Link>
  )
}
