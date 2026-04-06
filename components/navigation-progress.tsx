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
  const [mounted, setMounted] = useState(false)
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

      setCompleting(false)
      setProgress(0)
      setVisible(true)
      setMounted(true)

      const t1 = setTimeout(() => setProgress(30), 50)
      const t2 = setTimeout(() => setProgress(60), 400)
      const t3 = setTimeout(() => setProgress(80), 900)

      const t4 = setTimeout(() => {
        setCompleting(true)
        setProgress(100)
        const t5 = setTimeout(() => {
          setMounted(false)
          const t6 = setTimeout(() => {
            setVisible(false)
            setProgress(0)
            setCompleting(false)
          }, 350)
          timersRef.current.push(t6)
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
      {/* Top progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: '2.5px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 60%, #4ade80 100%)',
            transition: completing
              ? 'width 220ms cubic-bezier(0.4,0,0.2,1)'
              : progress === 30
              ? 'width 120ms ease-out'
              : 'width 650ms cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 12px rgba(34,197,94,0.7), 0 0 4px rgba(34,197,94,0.4)',
          }}
        />
        {/* Glowing head */}
        <div
          style={{
            position: 'absolute',
            top: '-1px',
            right: `${100 - progress}%`,
            width: '60px',
            height: '4.5px',
            background: 'radial-gradient(ellipse at right, rgba(74,222,128,0.9) 0%, transparent 70%)',
            transition: completing
              ? 'right 220ms cubic-bezier(0.4,0,0.2,1)'
              : 'right 650ms cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Floating pill indicator — top right */}
      <div
        style={{
          position: 'fixed',
          top: '14px',
          right: '14px',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.92)',
          transition: 'opacity 250ms cubic-bezier(0.34,1.56,0.64,1), transform 250ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '100px',
            padding: '5px 11px 5px 8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          {/* Spinner ring */}
          <div style={{ position: 'relative', width: '14px', height: '14px', flexShrink: 0 }}>
            {/* Track */}
            <svg
              width="14" height="14" viewBox="0 0 14 14"
              style={{ position: 'absolute', inset: 0 }}
            >
              <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(22,163,74,0.15)" strokeWidth="1.5" />
            </svg>
            {/* Spinning arc */}
            <svg
              width="14" height="14" viewBox="0 0 14 14"
              style={{
                position: 'absolute', inset: 0,
                animation: 'nav-spin 0.75s linear infinite',
              }}
            >
              <circle
                cx="7" cy="7" r="5.5"
                fill="none"
                stroke="#16a34a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="20 16"
                strokeDashoffset="0"
              />
            </svg>
          </div>

          <span
            style={{
              color: '#111',
              fontSize: '11.5px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            Loading…
          </span>
        </div>
      </div>

      <style>{`
        @keyframes nav-spin {
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
