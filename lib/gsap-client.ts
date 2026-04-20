'use client'

// Single shared GSAP instance + ScrollTrigger registration.
// Importing this file from any client component guarantees the plugin is
// registered exactly once and animations don't re-initialise on hot reload.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined' && !(gsap as any)._vendoorxRegistered) {
  gsap.registerPlugin(ScrollTrigger)
  // Reduce CPU on slower devices: smoother but cheaper scroll updates.
  ScrollTrigger.config({ ignoreMobileResize: true })
  ;(gsap as any)._vendoorxRegistered = true
}

export { gsap, ScrollTrigger }

// True when the user has asked for reduced motion at the OS level.
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// True for low-end / data-saver browsers — we skip heavier animations there.
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const conn = (navigator as any).connection
  if (conn?.saveData) return true
  if (conn?.effectiveType && /^(slow-2g|2g)$/.test(conn.effectiveType)) return true
  const mem = (navigator as any).deviceMemory
  if (typeof mem === 'number' && mem > 0 && mem < 2) return true
  return false
}
