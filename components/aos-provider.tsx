'use client'

import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

/**
 * Initialises Animate-On-Scroll once for the whole app.
 *
 * - Lightweight (~14kb gzipped) — way smaller than framer-motion.
 * - Honours `prefers-reduced-motion` so users with motion sensitivity
 *   see no animation at all.
 * - Uses a single IntersectionObserver under the hood, so adding
 *   `data-aos="fade-up"` to any element just works.
 */
export function AosProvider() {
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,            // animate only the first time we scroll into view
      offset: 60,            // start a bit before the element fully enters
      delay: 0,
      disable: reduced,      // accessibility first
    })

    // Re-scan after lazy-loaded sections mount so they get picked up too.
    const t = setTimeout(() => AOS.refreshHard(), 600)
    return () => clearTimeout(t)
  }, [])

  return null
}
