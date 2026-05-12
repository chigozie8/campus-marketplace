'use client'

import { useEffect, useState } from 'react'
import { useReducedMotionPref } from './use-reduced-motion-pref'

interface UseNumberCounterProps {
  end: number
  start?: number
  duration?: number // in milliseconds
  isActive?: boolean
  decimals?: number
}

/**
 * Hook to animate a number from start to end value.
 * Useful for stats counters and metric animations.
 *
 * @param end - Target number to count to
 * @param start - Starting number (default 0)
 * @param duration - Animation duration in ms (default 800)
 * @param isActive - Whether to animate (useful for viewport triggers)
 * @param decimals - Number of decimal places to show
 * @returns Current number value
 */
export function useNumberCounter({
  end,
  start = 0,
  duration = 800,
  isActive = true,
  decimals = 0,
}: UseNumberCounterProps) {
  const [count, setCount] = useState(start)
  const prefersReducedMotion = useReducedMotionPref()

  useEffect(() => {
    if (!isActive || prefersReducedMotion) {
      setCount(end)
      return
    }

    let animationFrame: number
    let startTime: number | null = null

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime
      }

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for natural deceleration (easeOut)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = start + (end - start) * easeProgress

      setCount(parseFloat(currentValue.toFixed(decimals)))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, start, duration, isActive, decimals, prefersReducedMotion])

  return count
}
