'use client'

import * as React from 'react'
import {
  m,
  LazyMotion,
  domAnimation,
  type HTMLMotionProps,
} from 'framer-motion'

import { cn } from '@/lib/utils'
import { BUTTON_MOTION, SPRING_TAP } from '@/lib/motion'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'
import { Button, buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'

type AnimatedButtonProps = Omit<
  HTMLMotionProps<'button'>,
  'whileHover' | 'whileTap' | 'transition' | 'ref'
> &
  VariantProps<typeof buttonVariants> & {
    /** Disable animation per-instance. */
    motionDisabled?: boolean
    /** Use Radix Slot to render the child as the trigger (e.g. <Link>). */
    asChild?: boolean
  }

/**
 * AnimatedButton — drop-in replacement for the shadcn Button. Adds:
 *   • hover → scale 1.04
 *   • tap   → scale 0.96
 *   • soft spring (SPRING_TAP)
 *
 * Renders a real `<button>` (no extra wrapper div), so width / flex /
 * grid placement keeps working. For `asChild` usage we fall back to
 * the original Button (Radix Slot composes ref/className onto its child
 * which doesn't pair cleanly with motion).
 *
 * Skipped automatically for users with `prefers-reduced-motion`.
 */
export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(function AnimatedButton(
  { className, variant, size, motionDisabled, asChild, children, ...props },
  ref,
) {
  const reduce = useReducedMotionPref()

  if (reduce || motionDisabled || asChild) {
    return (
      <Button
        ref={ref}
        className={className}
        variant={variant}
        size={size}
        asChild={asChild}
        {...(props as React.ComponentProps<'button'>)}
      >
        {children as React.ReactNode}
      </Button>
    )
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        whileHover={BUTTON_MOTION.whileHover}
        whileTap={BUTTON_MOTION.whileTap}
        transition={SPRING_TAP}
        {...props}
      >
        {children as React.ReactNode}
      </m.button>
    </LazyMotion>
  )
})
