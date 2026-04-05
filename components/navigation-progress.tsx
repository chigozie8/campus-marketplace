'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevUrl = useRef<string>('')

  const start = () => {
    setVisible(true)
    setProgress(12)
    let current = 12
    intervalRef.current = setInterval(() => {
      const increment = current < 30 ? 10 : current < 55 ? 5 : current < 75 ? 2 : 0.4
      current = Math.min(current + increment, 90)
      setProgress(current)
    }, 180)
  }

  const complete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setProgress(100)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 350)
  }

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString()
    if (prevUrl.current && prevUrl.current !== currentUrl) {
      start()
      timerRef.current = setTimeout(complete, 80)
    }
    prevUrl.current = currentUrl
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [pathname, searchParams])

  if (!visible && progress === 0) return null

  return (
    <>
      {/* Thin progress line — 1.5px, black with green shimmer */}
      <div
        className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
        style={{ height: '1.5px' }}
        aria-hidden="true"
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            opacity: visible ? 1 : 0,
            transitionProperty: 'width, opacity',
            transitionDuration: progress === 100 ? '150ms, 300ms' : '250ms, 0ms',
            transitionTimingFunction: 'ease-out',
            background: '#0a0a0a',
            boxShadow: '0 0 6px 0px rgba(10,10,10,0.5)',
          }}
        />
      </div>

      {/* Circular spinner — bottom-right of screen */}
      {visible && (
        <div
          className="fixed bottom-28 right-4 z-[9999] pointer-events-none lg:bottom-6"
          aria-hidden="true"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="animate-spin"
            style={{ animationDuration: '700ms' }}
          >
            {/* Track */}
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            {/* Active arc — solid black */}
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="#0a0a0a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="30 20"
              strokeDashoffset="0"
            />
          </svg>
        </div>
      )}
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
