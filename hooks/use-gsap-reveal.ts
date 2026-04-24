'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false
function ensureScrollTrigger() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
}

/**
 * One-shot scroll-reveal: fades + slides element up the first time it
 * crosses 85% of the viewport. Skips reduced-motion users entirely.
 *
 * Cards everywhere will gently rise into view as you scroll the page.
 */
export function useGsapReveal<T extends HTMLElement>(opts?: {
  delay?: number
  y?: number
  duration?: number
}) {
  const ref = useRef<T | null>(null)
  const { delay = 0, y = 24, duration = 0.7 } = opts ?? {}

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mq.matches) {
        gsap.set(el, { opacity: 1, y: 0 })
        return
      }
    }

    ensureScrollTrigger()

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y })

      const tween = gsap.to(el, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    }, el)

    return () => ctx.revert()
  }, [delay, y, duration])

  return ref
}
