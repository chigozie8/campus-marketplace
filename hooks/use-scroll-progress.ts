'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hook to calculate scroll progress within a specific element.
 * Returns a value from 0 to 1 representing scroll position within the element's bounds.
 * Useful for triggering progressive animations as user scrolls through a section.
 *
 * @returns Object with ref and scrollProgress (0-1)
 */
export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (!ref.current) return

    const handleScroll = () => {
      if (!ref.current) return

      const element = ref.current
      const elementTop = element.getBoundingClientRect().top
      const elementHeight = element.offsetHeight
      const viewportHeight = window.innerHeight

      // Calculate how far through the element we are
      // 0 when element bottom is at top of viewport
      // 1 when element top is at bottom of viewport
      const progress = Math.max(
        0,
        Math.min(1, (viewportHeight - elementTop) / (elementHeight + viewportHeight))
      )

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { ref, scrollProgress }
}
