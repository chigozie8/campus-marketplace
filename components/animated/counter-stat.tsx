'use client'

import { motion, Variants } from 'framer-motion'
import { useInViewAnimation } from '@/hooks/use-in-view-animation'
import { useNumberCounter } from '@/hooks/use-number-counter'
import { slideUpOnScroll } from '@/lib/motion'

interface CounterStatProps {
  label: string
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  className?: string
  threshold?: number
}

/**
 * Animated counter component for displaying numeric statistics.
 * Animates from 0 to target value when element enters viewport.
 */
export function CounterStat({
  label,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 800,
  className = '',
  threshold = 0.3,
}: CounterStatProps) {
  const { ref, isInView } = useInViewAnimation({
    threshold,
    triggerOnce: true,
  })

  const count = useNumberCounter({
    end: value,
    start: 0,
    duration,
    isActive: isInView,
    decimals,
  })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={slideUpOnScroll}
    >
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold text-foreground">
          {prefix}
          {count.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
          {suffix}
        </div>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          {label}
        </p>
      </div>
    </motion.div>
  )
}
