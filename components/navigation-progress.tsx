'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function ProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevUrl = useRef<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString()

    if (prevUrl.current === null) {
      prevUrl.current = currentUrl
      return
    }

    if (prevUrl.current !== currentUrl) {
      prevUrl.current = currentUrl

      // Clear any existing timers
      if (timerRef.current) clearTimeout(timerRef.current)

      // Start the bar
      setProgress(0)
      setVisible(true)

      // Use setTimeout instead of rAF to avoid pre-mount state updates
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setProgress(70)
      }, 16)

      timerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setProgress(100)
          timerRef.current = setTimeout(() => {
            if (mountedRef.current) {
              setVisible(false)
              setProgress(0)
            }
          }, 300)
        }
      }, 200)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname, searchParams])

  if (!visible) return null

  return (
    <>
      {/* Progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: '3px',
          backgroundColor: '#e5e7eb',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#0a0a0a',
            transition: progress === 100 ? 'width 150ms ease-out' : 'width 200ms ease-out',
          }}
        />
      </div>

      {/* Spinner */}
      <div
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ animation: 'nprogress-spin 0.6s linear infinite' }}
        >
          <circle
            cx="9"
            cy="9"
            r="7"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <path
            d="M9 2 A7 7 0 0 1 16 9"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <style>{`
        @keyframes nprogress-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  )
}
