'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true if the user has set `prefers-reduced-motion: reduce` in
 * their OS. Updates live if the preference changes. SSR-safe (returns
 * false on the server / first paint to avoid hydration mismatch).
 */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}
