'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const VARIANTS: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
}

interface FadeInViewProps {
  children: ReactNode
  variant?: keyof typeof VARIANTS
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  amount?: number
}

export function FadeInView({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.55,
  className,
  once = true,
  amount = 0.15,
}: FadeInViewProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={VARIANTS[variant]}
    >
      {children}
    </motion.div>
  )
}

/** Staggered children container */
interface StaggerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
  amount?: number
  containerVariant?: keyof typeof VARIANTS
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
  amount = 0.1,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  )
}

/** Individual stagger item — use inside StaggerContainer */
interface StaggerItemProps {
  children: ReactNode
  variant?: keyof typeof VARIANTS
  className?: string
  duration?: number
}

export function StaggerItem({
  children,
  variant = 'fadeUp',
  className,
  duration = 0.5,
}: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={VARIANTS[variant]}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
