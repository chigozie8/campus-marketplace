'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { m, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'

import {
  pageTransition,
  pageTransitionConfig,
} from '@/lib/motion'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'

/**
 * PageTransitionWrapper — drop this around `{children}` in app/layout.tsx
 * to fade + slide each route on navigation. Uses pathname as the key
 * so AnimatePresence can run an exit on the outgoing page and an enter
 * on the incoming one. mode="wait" prevents both pages overlapping.
 *
 * For users with prefers-reduced-motion, the wrapper renders children
 * directly with no animation overhead.
 */
export function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const reduce = useReducedMotionPref()

  if (reduce) return <>{children}</>

  return (
    <LazyMotion features={domAnimation} strict>
      {/* mode="popLayout" lets the new route start entering immediately
           while the old one fades out in absolute position — navigation is
           never blocked waiting for an exit to finish. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <m.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransition}
          transition={pageTransitionConfig}
          style={{ minHeight: '100%' }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}
