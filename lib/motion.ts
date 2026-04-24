/**
 * VendoorX motion system — single source of truth for animation tokens.
 *
 * All durations and easings used across the app should pull from here so
 * the entire product has one consistent feel. To globally speed up or slow
 * down everything, change the numbers in DURATION below.
 */

import type { Transition, Variants } from 'framer-motion'

/* ── Tokens ──────────────────────────────────────────────────────────── */

/** Motion durations in seconds — keep aligned with Tailwind transition utilities. */
export const DURATION = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const

/**
 * Cubic-bezier easings. We bias toward ease-out so motion decelerates
 * naturally (feels native, premium). Spring is reserved for tactile
 * micro-interactions like buttons.
 */
export const EASE = {
  /** Default smooth ease-out — use for opacity/translate. */
  out: [0.22, 1, 0.36, 1] as const,
  /** Soft ease-in-out for back-and-forth or continuous motion. */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Snappy entrance — quick start, soft landing. */
  snap: [0.32, 0.72, 0, 1] as const,
} as const

/** Light, low-bounce spring — used for press/tap micro-interactions. */
export const SPRING_TAP: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 0.6,
}

/** Hover spring — slightly softer than tap. */
export const SPRING_HOVER: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
  mass: 0.7,
}

/* ── Reusable variants ───────────────────────────────────────────────── */

/** Page transition — fade + 8px upward slide. ~0.25s, ease-out. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

export const pageTransitionConfig: Transition = {
  duration: DURATION.normal,
  ease: EASE.out,
}

/** Fade up on viewport entry. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

/** Container that staggers its children's entrance. */
export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
})

/** Button micro-interaction values. */
export const BUTTON_MOTION = {
  whileHover: { scale: 1.04 },
  whileTap: { scale: 0.96 },
} as const

/** Icon micro-interaction values. */
export const ICON_MOTION = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.9 },
} as const
