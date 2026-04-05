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
    setProgress(10)
    let current = 10
    intervalRef.current = setInterval(() => {
      // Increments slow as it approaches 90 — never reaches 100 until done
      const increment = current < 30 ? 8 : current < 60 ? 4 : current < 80 ? 2 : 0.5
      current = Math.min(current + increment, 90)
      setProgress(current)
    }, 200)
  }

  const complete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setProgress(100)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 400)
  }

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString()
    if (prevUrl.current && prevUrl.current !== currentUrl) {
      start()
      // complete immediately — Next.js RSC navigation is instant after hydration
      timerRef.current = setTimeout(complete, 100)
    }
    prevUrl.current = currentUrl

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [pathname, searchParams])

  if (!visible && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-primary shadow-[0_0_8px_2px_oklch(0.45_0.22_155/0.6)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transitionDuration: progress === 100 ? '200ms' : '300ms',
        }}
      />
    </div>
  )
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  )
}
