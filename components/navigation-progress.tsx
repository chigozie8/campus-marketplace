'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function NavigationSpinnerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevUrl = useRef<string | null>(null)
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString()
    if (prevUrl.current === null) { prevUrl.current = currentUrl; return }

    if (prevUrl.current !== currentUrl) {
      prevUrl.current = currentUrl
      clearTimers()
      setVisible(true)
      setActive(true)

      const t1 = setTimeout(() => {
        setActive(false)
        const t2 = setTimeout(() => setVisible(false), 450)
        timersRef.current.push(t2)
      }, 750)
      timersRef.current.push(t1)
    }
    return clearTimers
  }, [pathname, searchParams])

  if (!visible) return null

  return (
    <>
      {/* Sliding shimmer bar at very top */}
      <div style={{ position:'fixed', top:0, left:0, right:0, height:'3px', zIndex:99999, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{
          position: 'absolute', top:0, left:'-100%', width:'60%', height:'100%',
          background: 'linear-gradient(90deg, transparent 0%, #16a34a 30%, #22c55e 60%, #4ade80 80%, transparent 100%)',
          borderRadius: '0 99px 99px 0',
          boxShadow: '0 0 16px 2px rgba(34,197,94,0.5)',
          animation: active ? 'vx-shimmer 1s cubic-bezier(0.4,0,0.2,1) infinite' : 'none',
          opacity: active ? 1 : 0,
          transition: 'opacity 350ms ease',
        }} />
      </div>

      {/* Beautiful round spinner — bottom-right on mobile, top-right on desktop */}
      <div style={{
        position: 'fixed',
        bottom: '96px',
        right: '20px',
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(12px)',
        transition: 'opacity 350ms cubic-bezier(0.34,1.56,0.64,1), transform 350ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Glass card */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(22,163,74,0.18), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(22,163,74,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Spinning ring */}
          <svg width="44" height="44" viewBox="0 0 44 44" style={{ position:'absolute', animation:'vx-spin 1s linear infinite' }}>
            <circle cx="22" cy="22" r="18" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="22" cy="22" r="18" fill="none"
              stroke="url(#vxg1)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="76 36"
            />
            <defs>
              <linearGradient id="vxg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
            </defs>
          </svg>

          {/* VX logo mark */}
          <div style={{ position:'relative', width:'20px', height:'20px', flexShrink:0 }}>
            <div style={{ position:'absolute', top:0, left:0, width:'13px', height:'13px', borderRadius:'3.5px', background:'#0a0a0a' }} />
            <div style={{ position:'absolute', bottom:0, right:0, width:'13px', height:'13px', borderRadius:'3.5px', background:'#16a34a', opacity:0.92 }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vx-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes vx-shimmer {
          0%   { left: -65%; }
          100% { left: 100%; }
        }
        @media (min-width: 1024px) {
          [data-vx-spinner] { bottom: 24px !important; }
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
