'use client'

import { useEffect, useState } from 'react'

export function OfflineContent() {
  const [backOnline, setBackOnline] = useState(false)
  const [dots, setDots] = useState(1)

  useEffect(() => {
    function handleOnline() {
      setBackOnline(true)
      setTimeout(() => { window.location.href = '/' }, 1200)
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  useEffect(() => {
    if (backOnline) return
    const id = setInterval(() => setDots(d => (d % 3) + 1), 600)
    return () => clearInterval(id)
  }, [backOnline])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      {/* Nav bar */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-border bg-white dark:bg-card">
        <span className="text-lg font-black tracking-tight text-gray-950 dark:text-white">
          Vendoor<span className="text-primary">X</span>
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">

        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-3xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-xl shadow-black/5 flex items-center justify-center">
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 dark:text-gray-600"
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
          {/* Red dot badge */}
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-gray-50 dark:border-background flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M12 9v4m0 4h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight mb-3">
          {backOnline ? 'Back online!' : "You're offline"}
        </h1>

        <p className="text-gray-500 dark:text-muted-foreground text-sm max-w-[280px] leading-relaxed mb-8">
          {backOnline
            ? 'Connection restored. Taking you back now…'
            : 'Check your data or Wi-Fi connection and try again. Pages you visited before are still available.'}
        </p>

        {/* Status pill */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 transition-all ${
          backOnline
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'bg-gray-100 dark:bg-muted text-gray-500 dark:text-muted-foreground border border-gray-200 dark:border-border'
        }`}>
          <span className={`w-2 h-2 rounded-full ${backOnline ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500 animate-pulse'}`} />
          {backOnline
            ? 'Connected — redirecting'
            : `Waiting for connection${'.'.repeat(dots)}`}
        </div>

        {/* Action buttons */}
        {!backOnline && (
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-950 dark:bg-white text-white dark:text-gray-950 text-sm font-bold px-5 py-3.5 rounded-2xl active:scale-95 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Try Again
            </button>
            <a
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground text-sm font-bold px-5 py-3.5 rounded-2xl active:scale-95 transition-all"
            >
              Go Home
            </a>
          </div>
        )}
      </div>

      {/* Footer tip */}
      {!backOnline && (
        <div className="px-6 pb-10 text-center">
          <p className="text-xs text-gray-400 dark:text-muted-foreground">
            Tip: Pages you&apos;ve already visited can still be viewed while offline.
          </p>
        </div>
      )}
    </div>
  )
}
