'use client'

import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function NavigationSpinnerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevUrl = useRef<string | null>(null)
  const [spinning, setSpinning] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setSpinning(true)
  }, [])

  const stop = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setSpinning(false), 400)
  }, [])

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString()
    if (prevUrl.current === null) {
      prevUrl.current = currentUrl
      return
    }
    if (prevUrl.current !== currentUrl) {
      prevUrl.current = currentUrl
      stop()
    }
  }, [pathname, searchParams, stop])

  useEffect(() => {
    function isInternalHref(href: string): boolean {
      if (!href) return false
      if (href.startsWith('http') || href.startsWith('//')) return false
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return false
      if (href.startsWith('#')) return false
      return true
    }

    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || !isInternalHref(href)) return
      if (target.target === '_blank') return
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
      start()
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setSpinning(false), 8000)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [start])

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  return (
    <>
      {/* ── Top shimmer bar ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          zIndex: 99999,
          pointerEvents: 'none',
          overflow: 'hidden',
          opacity: spinning ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-65%',
            width: '60%',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent 0%, #16a34a 30%, #22c55e 60%, #4ade80 80%, transparent 100%)',
            borderRadius: '0 99px 99px 0',
            boxShadow: '0 0 16px 2px rgba(34,197,94,0.5)',
            animation: spinning ? 'vx-shimmer 1s cubic-bezier(0.4,0,0.2,1) infinite' : 'none',
          }}
        />
      </div>

      {/* ── Top-right spinner dot ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '14px',
          right: '14px',
          zIndex: 99999,
          pointerEvents: 'none',
          opacity: spinning ? 1 : 0,
          transform: spinning ? 'scale(1)' : 'scale(0.6)',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          style={{ animation: 'vx-spin 0.7s linear infinite' }}
        >
          <circle
            cx="11"
            cy="11"
            r="9"
            stroke="#e5e7eb"
            strokeWidth="2.5"
          />
          <path
            d="M11 2 A9 9 0 0 1 20 11"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <style>{`
        @keyframes vx-shimmer {
          0%   { left: -65%; }
          100% { left: 110%; }
        }
        @keyframes vx-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationSpinnerInner />
    </Suspense>
  )
}
