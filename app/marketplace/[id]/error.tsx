'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ArrowLeft, RefreshCw, WifiOff } from 'lucide-react'

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[VendoorX] Product page error:', error.message)
  }, [error])

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6">
        <WifiOff className="w-9 h-9 text-[#16a34a]" strokeWidth={1.5} />
      </div>

      <p className="text-sm font-black tracking-tight text-gray-950 mb-6 select-none">
        Vendoor<span className="text-[#16a34a]">X</span>
      </p>

      <h1 className="text-2xl font-black text-gray-950 tracking-tight mb-3">
        {isOffline ? 'You\'re offline' : 'Product unavailable'}
      </h1>

      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
        {isOffline
          ? 'This product page is not cached. Browse back to the marketplace for listings that may have been saved.'
          : 'We couldn\'t load this product. It may have been removed or there\'s a temporary issue.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-950 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/marketplace"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Marketplace
        </Link>
      </div>
    </div>
  )
}
