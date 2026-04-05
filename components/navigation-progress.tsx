'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function ProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevUrl = useRef<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [completing, setCompleting] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString()

    if (prevUrl.current === null) {
      prevUrl.current = currentUrl
      return
    }

    if (prevUrl.current !== currentUrl) {
      prevUrl.current = currentUrl
      clearTimers()

      // Reset and start
      setCompleting(false)
      setProgress(0)
      setVisible(true)

      // Step 1: quickly jump to 30%
      const t1 = setTimeout(() => setProgress(30), 50)
      // Step 2: slowly creep to 60%
      const t2 = setTimeout(() => setProgress(60), 400)
      // Step 3: creep to 80% — stays here until route resolves
      const t3 = setTimeout(() => setProgress(80), 900)

      // Step 4: finish bar
      const t4 = setTimeout(() => {
        setCompleting(true)
        setProgress(100)
        // Step 5: fade out
        const t5 = setTimeout(() => {
          setVisible(false)
          setProgress(0)
          setCompleting(false)
        }, 400)
        timersRef.current.push(t5)
      }, 1200)

      timersRef.current.push(t1, t2, t3, t4)
    }

    return clearTimers
  }, [pathname, searchParams])

  if (!visible) return null

  return (
    <>
      {/* Progress bar — thick green stripe, highly visible */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: '3px',
          background: 'transparent',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #16a34a, #22c55e)',
            transition: completing
              ? 'width 200ms ease-out'
              : progress === 30
              ? 'width 100ms ease-out'
              : 'width 600ms ease-out',
            boxShadow: '0 0 8px rgba(22,163,74,0.6)',
          }}
        />
      </div>

      {/* Pulsing dot indicator — bottom-left on mobile (above nav), top-right on desktop */}
      <div
        style={{
          position: 'fixed',
          bottom: completing ? undefined : undefined,
          top: '10px',
          right: '10px',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          borderRadius: '20px',
          padding: '4px 10px 4px 8px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'inline-block',
            animation: 'nav-pulse 1s ease-in-out infinite',
          }}
        />
        <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, letterSpacing: '0.01em' }}>
          Loading…
        </span>
      </div>

      <style>{`
        @keyframes nav-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
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
