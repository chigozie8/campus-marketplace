'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Store, ShoppingBag, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'seller' | 'buyer'

interface Props {
  currentMode: Mode
  /** Whether the seller pill is meaningful for this user (false for pure buyers
   * who've never sold). Even pure buyers can switch to seller view to set up. */
  showSellerOption?: boolean
}

/**
 * Two-pill segmented control that flips the dashboard between Selling and
 * Buying views. The active mode lives in the URL (?view=...) so the server
 * component can branch on it; we also stash the last choice in localStorage
 * so subsequent visits remember the preference.
 */
export function DashboardModeToggle({ currentMode, showSellerOption = true }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // First-load redirect: if no `view` param yet but localStorage has one,
  // honour it. Done in an effect (after hydration) to avoid SSR mismatches.
  useEffect(() => {
    if (params.get('view')) return
    let stored: string | null = null
    try { stored = localStorage.getItem('vx_dashboard_view') } catch {}
    if (stored !== 'buyer' && stored !== 'seller') return
    if (stored === currentMode) return
    const sp = new URLSearchParams(params.toString())
    sp.set('view', stored)
    router.replace(`${pathname}?${sp.toString()}`)
    // Run only once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setMode(next: Mode) {
    if (next === currentMode || isLoading) return
    setIsLoading(true)
    try { localStorage.setItem('vx_dashboard_view', next) } catch {}
    const sp = new URLSearchParams(params.toString())
    sp.set('view', next)
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
    // Keep loading state active for smooth transition
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <div className="inline-flex items-center bg-gray-100 dark:bg-muted/60 p-1 rounded-2xl border border-gray-200/60 dark:border-border">
      {showSellerOption && (
        <button
          type="button"
          onClick={() => setMode('seller')}
          disabled={isLoading}
          aria-pressed={currentMode === 'seller'}
          className={cn(
            'flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60',
            currentMode === 'seller'
              ? 'bg-white dark:bg-card text-gray-950 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-foreground',
          )}
        >
          {isLoading && currentMode === 'seller' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Store className="w-3.5 h-3.5" />
          )}
          Selling
        </button>
      )}
      <button
        type="button"
        onClick={() => setMode('buyer')}
        disabled={isLoading}
        aria-pressed={currentMode === 'buyer'}
        className={cn(
          'flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60',
          currentMode === 'buyer'
            ? 'bg-white dark:bg-card text-gray-950 dark:text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-foreground',
        )}
      >
        {isLoading && currentMode === 'buyer' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ShoppingBag className="w-3.5 h-3.5" />
        )}
        Buying
      </button>
    </div>
  )
}
