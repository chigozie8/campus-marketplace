'use client'

import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'
import { CARD_HOVER, SPRING_HOVER, slideUpOnScroll } from '@/lib/motion'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'feature' | 'testimonial'
  whileHover?: any
  whileTap?: any
  transition?: any
  onClick?: () => void
}

/**
 * Reusable animated card component with entrance and hover animations.
 * Applies consistent motion patterns across the app.
 */
export function AnimatedCard({
  children,
  className = '',
  variant = 'default',
  whileHover,
  whileTap,
  transition,
  onClick,
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotionPref()

  const getDefaultHoverState = () => {
    switch (variant) {
      case 'feature':
        return {
          whileHover: { scale: 1.03, y: -6 },
          whileTap: { scale: 0.98 },
        }
      case 'testimonial':
        return {
          whileHover: { scale: 1.02, y: -4 },
          whileTap: { scale: 0.99 },
        }
      default:
        return {
          whileHover: { scale: 1.02, y: -4 },
          whileTap: { scale: 0.98 },
        }
    }
  }

  const defaultState = getDefaultHoverState()

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={slideUpOnScroll}
      whileHover={whileHover || defaultState.whileHover}
      whileTap={whileTap || defaultState.whileTap}
      transition={transition || SPRING_HOVER}
      onClick={onClick}
      style={{
        willChange: prefersReducedMotion ? 'auto' : 'transform, box-shadow',
      }}
    >
      {children}
    </motion.div>
  )
}
