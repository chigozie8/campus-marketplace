'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useInViewAnimation } from '@/hooks/use-in-view-animation'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'
import { scrollStaggerContainer } from '@/lib/motion'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  containerDelay?: number
  threshold?: number
  triggerOnce?: boolean
}

/**
 * Wrapper component that animates children with staggered entrance on scroll.
 * Respects prefers-reduced-motion preference.
 */
export function AnimatedSection({
  children,
  className = '',
  staggerDelay = 0.08,
  containerDelay = 0,
  threshold = 0.2,
  triggerOnce = true,
}: AnimatedSectionProps) {
  const { ref, isInView } = useInViewAnimation({
    threshold,
    triggerOnce,
  })
  const prefersReducedMotion = useReducedMotionPref()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={scrollStaggerContainer(staggerDelay, containerDelay)}
      style={{
        willChange: isInView && !prefersReducedMotion ? 'transform, opacity' : 'auto',
      }}
    >
      {children}
    </motion.div>
  )
}
