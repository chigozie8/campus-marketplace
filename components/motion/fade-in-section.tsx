'use client'

import * as React from 'react'
import { m, LazyMotion, domAnimation, type HTMLMotionProps } from 'framer-motion'

import { cn } from '@/lib/utils'
import { DURATION, EASE, fadeUp } from '@/lib/motion'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'

type FadeInSectionProps = Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'whileInView'> & {
  /** Stagger delay (seconds) for sequencing reveals down a page. */
  delay?: number
  /** How far the element travels up while fading in. Default 16px. */
  y?: number
  /** Animation duration override. */
  duration?: number
  /** Render as a different HTML element. */
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'aside'
  /** Run animation every time it enters viewport (default: once). */
  repeat?: boolean
}

/**
 * FadeInSection — fades + slides its children up the first time the
 * element scrolls into view. Intersection thresholds are conservative
 * (15% visible) to feel snappy on long pages. Honors reduced-motion.
 *
 * Use this around hero blocks, feature rows, testimonials, etc.
 */
export function FadeInSection({
  className,
  children,
  delay = 0,
  y = 16,
  duration = DURATION.slow,
  as = 'div',
  repeat = false,
  ...rest
}: FadeInSectionProps) {
  const reduce = useReducedMotionPref()
  const Tag = m[as]

  if (reduce) {
    const Plain = as as React.ElementType
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    )
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <Tag
        className={cn(className)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: !repeat, amount: 0.15 }}
        variants={fadeUp}
        transition={{ duration, delay, ease: EASE.out }}
        {...rest}
      >
        {children}
      </Tag>
    </LazyMotion>
  )
}
