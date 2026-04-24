'use client'

import * as React from 'react'
import { m, LazyMotion, domAnimation } from 'framer-motion'

import { cn } from '@/lib/utils'
import { DURATION, EASE, fadeUp, staggerContainer } from '@/lib/motion'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'

type MotionContainerProps = {
  className?: string
  children?: React.ReactNode
  /** Stagger gap between children (seconds). Default 0.06s. */
  stagger?: number
  /** Delay before the first child animates. */
  delay?: number
  /** Trigger on viewport enter (default) or immediately on mount. */
  triggerOnView?: boolean
}

/**
 * MotionContainer — wrap a list/grid to give every direct child a
 * staggered fade-up entrance. Pair with <MotionContainer.Item> for
 * children that need their own variant, or just put plain elements
 * inside (the container handles them as well via children stagger).
 *
 * Example:
 *   <MotionContainer stagger={0.05}>
 *     <MotionContainer.Item><Card /></MotionContainer.Item>
 *     <MotionContainer.Item><Card /></MotionContainer.Item>
 *   </MotionContainer>
 */
export function MotionContainer({
  className,
  children,
  stagger = 0.06,
  delay = 0,
  triggerOnView = true,
}: MotionContainerProps) {
  const reduce = useReducedMotionPref()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  const animProp = triggerOnView
    ? { whileInView: 'visible' as const, viewport: { once: true, amount: 0.1 } }
    : { animate: 'visible' as const }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={cn(className)}
        initial="hidden"
        {...animProp}
        variants={staggerContainer(stagger, delay)}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}

type ItemProps = {
  className?: string
  children?: React.ReactNode
}

/**
 * MotionContainer.Item — a fade-up child to nest inside MotionContainer.
 * Inherits stagger timing from its parent automatically.
 */
function Item({ className, children }: ItemProps) {
  return (
    <m.div
      className={cn(className)}
      variants={fadeUp}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      {children}
    </m.div>
  )
}

MotionContainer.Item = Item
