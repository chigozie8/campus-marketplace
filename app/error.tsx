'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[VendoorX] Page error:', error.message)
  }, [error])

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
  const isDbError =
    error.message?.toLowerCase().includes('supabase') ||
    error.message?.toLowerCase().includes('url and key') ||
    error.message?.toLowerCase().includes('fetch')

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm flex items-center justify-center mb-6">
        <WifiOff className="w-9 h-9 text-[#16a34a]" strokeWidth={1.5} />
      </div>

      <p className="text-sm font-black tracking-tight text-gray-950 dark:text-white mb-6 select-none">
        Vendoor<span className="text-[#16a34a]">X</span>
      </p>

      <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-3">
        {isOffline ? 'You\'re offline' : isDbError ? 'Service unavailable' : 'Something went wrong'}
      </h1>

      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
        {isOffline
          ? 'No internet connection. Check your network and try again — cached pages are still available.'
          : isDbError
          ? 'We\'re having trouble connecting to the database right now. This is temporary — please try again.'
          : 'An unexpected error occurred. Tap below to retry or go back home.'}
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
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-muted active:scale-95 transition-all shadow-sm"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  )
}
