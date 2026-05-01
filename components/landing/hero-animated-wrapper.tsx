'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function HeroAnimatedWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center gap-6"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {children}
    </motion.div>
  )
}

export function HeroAnimatedItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}
