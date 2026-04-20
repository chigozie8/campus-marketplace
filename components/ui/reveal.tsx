'use client'

import { useEffect, useRef, type ReactNode, type ElementType, type CSSProperties } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion, isLowEndDevice } from '@/lib/gsap-client'

type RevealProps = {
  children: ReactNode
  /** Stagger child elements (matches direct children of this wrapper). */
  stagger?: boolean
  /** Per-child delay for stagger (default 0.08s). */
  staggerAmount?: number
  /** Initial Y offset in pixels. Mobile auto-scales to ~⅓ this value. */
  y?: number
  /** Animation duration in seconds. */
  duration?: number
  /** Delay before the animation begins. */
  delay?: number
  /** Trigger immediately on mount instead of when scrolled into view. */
  immediate?: boolean
  /** ScrollTrigger start position — see GSAP docs. Default 'top 85%'. */
  start?: string
  /** Optional element to render as. Defaults to a div. */
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/**
 * Lightweight, mobile-friendly fade-up reveal powered by GSAP + ScrollTrigger.
 *
 * Performance design:
 *  - Uses `gsap.matchMedia` so mobile gets shorter, smaller animations
 *  - Honors `prefers-reduced-motion` (renders content immediately)
 *  - Skips animation entirely on low-end devices / Save-Data
 *  - Uses transform + opacity only (GPU-accelerated, no layout thrash)
 *  - Adds + removes `will-change` to keep memory clean
 *  - Auto-cleans up triggers on unmount
 */
export function Reveal({
  children,
  stagger = false,
  staggerAmount = 0.08,
  y = 24,
  duration = 0.6,
  delay = 0,
  immediate = false,
  start = 'top 85%',
  as: Tag = 'div',
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Bail out for accessibility / weak devices — show content as-is.
    if (prefersReducedMotion() || isLowEndDevice()) return

    const targets: Element[] = stagger
      ? Array.from(el.children)
      : [el]
    if (targets.length === 0) return

    targets.forEach(t => ((t as HTMLElement).style.willChange = 'transform, opacity'))

    const mm = gsap.matchMedia()

    mm.add(
      {
        // Desktop: full motion
        isDesktop: '(min-width: 768px)',
        // Mobile: gentler, faster, no parallax
        isMobile: '(max-width: 767px)',
      },
      (ctx) => {
        const { isMobile } = ctx.conditions as { isDesktop: boolean; isMobile: boolean }
        const yOffset = isMobile ? Math.min(y, 12) : y
        const dur = isMobile ? Math.min(duration, 0.45) : duration

        gsap.fromTo(
          targets,
          { y: yOffset, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: dur,
            delay,
            ease: 'power2.out',
            stagger: stagger ? staggerAmount : 0,
            force3D: true,
            scrollTrigger: immediate
              ? undefined
              : {
                  trigger: el,
                  start,
                  // Run once — no scrubbing, no toggle on/off (cheap on mobile).
                  toggleActions: 'play none none none',
                  once: true,
                },
            onComplete: () => {
              targets.forEach(t => ((t as HTMLElement).style.willChange = 'auto'))
            },
          }
        )
      }
    )

    return () => {
      mm.revert()
    }
  }, [stagger, staggerAmount, y, duration, delay, immediate, start])

  // We type-assert here because TS can't narrow the ref for a polymorphic Tag.
  const Component = Tag as ElementType
  return (
    <Component ref={ref as any} className={className} style={style}>
      {children}
    </Component>
  )
}
