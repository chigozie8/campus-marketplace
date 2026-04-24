'use client'

import * as React from 'react'
import { m, LazyMotion, domAnimation } from 'framer-motion'

import { ICON_MOTION, SPRING_HOVER } from '@/lib/motion'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'

type AnimatedIconProps = {
  /** The Lucide (or any) icon component to render. */
  icon: React.ComponentType<{ className?: string }>
  className?: string
  /** Disable the wrapping click handler — defaults to none. */
  onClick?: () => void
  /** Disable animation per-instance. */
  motionDisabled?: boolean
  /** Pass a label for screen readers when the icon is interactive. */
  'aria-label'?: string
}

/**
 * AnimatedIcon — wraps any icon (Lucide, custom SVG component) with a
 * tasteful hover lift (translateY -2px) and a tap squish. Uses spring
 * for natural feel. Honors prefers-reduced-motion. Renders an inline
 * span so it composes inside text and flex rows without layout shift.
 */
export function AnimatedIcon({
  icon: Icon,
  className,
  onClick,
  motionDisabled,
  'aria-label': ariaLabel,
}: AnimatedIconProps) {
  const reduce = useReducedMotionPref()
  const interactive = Boolean(onClick)

  if (reduce || motionDisabled) {
    return (
      <span
        className="inline-flex"
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        aria-label={ariaLabel}
        tabIndex={interactive ? 0 : undefined}
      >
        <Icon className={className} />
      </span>
    )
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.span
        className="inline-flex"
        whileHover={ICON_MOTION.whileHover}
        whileTap={ICON_MOTION.whileTap}
        transition={SPRING_HOVER}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        aria-label={ariaLabel}
        tabIndex={interactive ? 0 : undefined}
      >
        <Icon className={className} />
      </m.span>
    </LazyMotion>
  )
}
