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

      <style>{`
        @keyframes vx-shimmer {
          0%   { left: -65%; }
          100% { left: 100%; }
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
