'use client'

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { prefersReducedMotion, isLowEndDevice } from '@/lib/gsap-client'

// Lazy-load the Lottie renderer so it doesn't bloat the initial JS bundle.
// (~50 KB gzipped — only paid for on pages that actually render an animation.)
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => null,
})

type LottiePlayerProps = {
  /** Public URL to a Lottie JSON file (e.g. lottiefiles asset URL). */
  src?: string
  /** Pre-loaded Lottie JSON object. Use this OR `src`. */
  animationData?: object
  loop?: boolean
  autoplay?: boolean
  className?: string
  style?: CSSProperties
  /** Rendered while loading or if animation can't play (reduced motion / fetch fail). */
  fallback?: ReactNode
}

/**
 * Production-friendly Lottie wrapper:
 *  - Lazy-loaded (no cost on pages that don't use it)
 *  - Only fetches + plays when scrolled into view (IntersectionObserver)
 *  - Pauses when off-screen
 *  - Honors prefers-reduced-motion + low-end devices (renders fallback)
 *  - Falls back gracefully if the JSON URL can't be fetched
 */
export function LottiePlayer({
  src,
  animationData,
  loop = true,
  autoplay = true,
  className,
  style,
  fallback = null,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)
  const [data, setData] = useState<object | null>(animationData ?? null)
  const [failed, setFailed] = useState(false)
  const skip = prefersReducedMotion() || isLowEndDevice()

  // Observe visibility so we don't render Lottie until the user can see it.
  useEffect(() => {
    if (skip) return
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true)
            obs.disconnect()
            break
          }
        }
      },
      { rootMargin: '100px' }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [skip])

  // Fetch JSON only when (a) we have a URL, (b) we're in view, (c) not already loaded.
  useEffect(() => {
    if (skip || data || !src || !inView) return
    let cancelled = false
    fetch(src)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(json => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [src, inView, data, skip])

  if (skip || failed) {
    return <div className={className} style={style}>{fallback}</div>
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      {inView && data ? (
        <Lottie animationData={data} loop={loop} autoplay={autoplay} />
      ) : (
        fallback
      )}
    </div>
  )
}
