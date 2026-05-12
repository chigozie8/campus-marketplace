'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotionPref } from './use-reduced-motion-pref'

interface UseParallaxProps {
  speed?: number // Multiplier for parallax effect (0.1 to 1)
  direction?: 'vertical' | 'horizontal'
}

/**
 * Hook to apply parallax scrolling effect to an element.
 * Element moves at a different rate than the scroll speed.
 *
 * @param speed - Parallax speed multiplier (default 0.5). Lower = slower movement
 * @param direction - Direction of parallax effect ('vertical' or 'horizontal')
 * @returns Object with ref to attach and transform value for applying
 */
export function useParallax({ speed = 0.5, direction = 'vertical' }: UseParallaxProps = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const prefersReducedMotion = useReducedMotionPref()

  useEffect(() => {
    if (prefersReducedMotion) return

    const handleScroll = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const elementCenter = rect.top + rect.height / 2
      const viewportCenter = window.innerHeight / 2
      const distance = elementCenter - viewportCenter

      // Only apply parallax when element is in viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setOffset(distance * speed)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, prefersReducedMotion])

  // Memoize transform to avoid excessive re-renders
  const transform =
    direction === 'vertical'
      ? `translateY(${offset}px)`
      : `translateX(${offset}px)`

  return { ref, transform, offset }
}
