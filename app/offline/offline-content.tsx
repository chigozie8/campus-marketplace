'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function OfflineContent() {
  const [backOnline, setBackOnline] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setBackOnline(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 800)
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      {/* Wordmark */}
      <p className="text-sm font-black tracking-tight text-gray-950 dark:text-white mb-6 select-none">
        Vendoor<span className="text-[#16a34a]">X</span>
      </p>

      <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-3">
        You&apos;re offline
      </h1>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
        No internet connection detected. Previously visited pages are still available — try navigating back.
        Everything will reload automatically when you&apos;re back online.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-950 text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Try Again
        </button>
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-muted active:scale-95 transition-all shadow-sm"
        >
          Go Home
        </Link>
      </div>

      {/* Connection status */}
      <div className="mt-10 flex items-center gap-2 text-xs text-gray-400">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            backOnline ? 'bg-[#16a34a]' : 'bg-red-400 animate-pulse'
          }`}
          aria-hidden="true"
        />
        <span>
          {backOnline ? 'Back online — reloading…' : 'Waiting for connection…'}
        </span>
      </div>
    </div>
  )
}
