'use client'

import { m, Variants } from 'framer-motion'
import { ReactNode } from 'react'
import { useInViewAnimation } from '@/hooks/use-in-view-animation'
import { slideUpOnScroll, staggerContainer } from '@/lib/motion'

interface StaggerListProps {
  children: ReactNode[]
  className?: string
  itemClassName?: string
  staggerDelay?: number
  threshold?: number
  variant?: 'slideUp' | 'fadeIn' | 'slideLeft' | 'slideRight'
}

const variantMap: Record<string, Variants> = {
  slideUp: slideUpOnScroll,
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: 24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
}

/**
 * Component that staggers child elements with animation on viewport entry.
 * Great for lists, testimonials, feature lists, etc.
 */
export function StaggerList({
  children,
  className = '',
  itemClassName = '',
  staggerDelay = 0.08,
  threshold = 0.2,
  variant = 'slideUp',
}: StaggerListProps) {
  const { ref, isInView } = useInViewAnimation({
    threshold,
    triggerOnce: true,
  })

  const selectedVariant = variantMap[variant] || slideUpOnScroll

  return (
    <m.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer(staggerDelay, 0)}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <m.div key={i} className={itemClassName} variants={selectedVariant}>
              {child}
            </m.div>
          ))
        : children}
    </m.div>
  )
}
