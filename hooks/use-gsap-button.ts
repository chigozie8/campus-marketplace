'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Tasteful button micro-interaction:
 *   • hover  → lifts up 2px + scales to 1.03 + soft shadow grows
 *   • press  → springs down to 0.96 (tactile "punch")
 *   • leave  → snaps back to rest
 *
 * Skips `prefers-reduced-motion` users, disabled buttons, and the 'link'
 * variant (which is just text and shouldn't bounce).
 */
export function useGsapButton<T extends HTMLElement>(disabled = false) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mq.matches) return
    }

    const ctx = gsap.context(() => {
      gsap.set(el, { willChange: 'transform' })

      const enter = () => {
        gsap.to(el, {
          y: -2,
          scale: 1.03,
          duration: 0.25,
          ease: 'power2.out',
        })
      }
      const leave = () => {
        gsap.to(el, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
      const down = () => {
        gsap.to(el, {
          scale: 0.96,
          y: 0,
          duration: 0.1,
          ease: 'power2.in',
        })
      }
      const up = () => {
        gsap.to(el, {
          scale: 1.03,
          y: -2,
          duration: 0.25,
          ease: 'back.out(2.5)',
        })
      }

      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', leave)
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', leave)

      return () => {
        el.removeEventListener('pointerenter', enter)
        el.removeEventListener('pointerleave', leave)
        el.removeEventListener('pointerdown', down)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', leave)
      }
    }, el)

    return () => ctx.revert()
  }, [disabled])

  return ref
}
