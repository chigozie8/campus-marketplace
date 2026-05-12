'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotionPref } from './use-reduced-motion-pref'

interface UseInViewAnimationProps {
  threshold?: number
  triggerOnce?: boolean
  delay?: number
}

/**
 * Hook to detect when an element enters the viewport and trigger animations.
 * Respects prefers-reduced-motion preference.
 *
 * @param threshold - How much of the element needs to be visible (0-1)
 * @param triggerOnce - If true, animation triggers only once
 * @param delay - Delay before animation starts (ms)
 * @returns Object with ref to attach to element and isInView boolean
 */
export function useInViewAnimation({
  threshold = 0.2,
  triggerOnce = true,
  delay = 0,
}: UseInViewAnimationProps = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const hasTriggered = useRef(false)
  const prefersReducedMotion = useReducedMotionPref()

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (prefersReducedMotion) {
            setIsInView(true)
            hasTriggered.current = true
          } else if (!triggerOnce || !hasTriggered.current) {
            if (delay > 0) {
              const timeout = setTimeout(() => {
                setIsInView(true)
              }, delay)
              return () => clearTimeout(timeout)
            } else {
              setIsInView(true)
            }
            if (triggerOnce) {
              hasTriggered.current = true
            }
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { threshold }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold, triggerOnce, delay, prefersReducedMotion])

  return { ref, isInView }
}
