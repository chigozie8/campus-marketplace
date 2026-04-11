'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { RefreshCw, ShoppingBag, LogIn } from 'lucide-react'

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[VendoorX] Orders error:', error.message)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center mb-5">
        <ShoppingBag className="w-7 h-7 text-[#16a34a]" strokeWidth={1.5} />
      </div>

      <h2 className="text-xl font-black text-foreground tracking-tight mb-2">
        Orders unavailable
      </h2>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-7">
        We couldn&apos;t load your orders right now. Please try again or contact support if the problem persists.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={reset}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-950 dark:bg-white dark:text-gray-950 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground text-sm font-bold px-5 py-3 rounded-xl hover:bg-muted active:scale-95 transition-all shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  )
}
