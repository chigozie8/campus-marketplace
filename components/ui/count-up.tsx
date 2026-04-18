'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Animates a numeric value from 0 to its target as it scrolls into view.
 *
 * Accepts strings like "50,000+", "₦2B+", "4.9/5", "120+" — preserves the
 * non-numeric prefix/suffix and animates the leading numeric portion.
 * Falls back to the raw string if no number can be parsed.
 */
export function CountUp({
  value,
  duration = 1800,
  className,
}: {
  value: string | number
  duration?: number
  className?: string
}) {
  const raw = String(value).trim()
  const parsed = parseValue(raw)

  const [display, setDisplay] = useState(parsed ? parsed.formatStart() : raw)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!parsed) return
    const node = ref.current
    if (!node) return

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true
            animate()
            obs.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )
    obs.observe(node)

    function animate() {
      if (!parsed) return
      const start = performance.now()
      const target = parsed.numeric
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        setDisplay(parsed.format(target))
        return
      }
      function tick(now: number) {
        const elapsed = now - start
        const t = Math.min(1, elapsed / duration)
        const eased = 1 - Math.pow(1 - t, 3)
        const current = target * eased
        setDisplay(parsed!.format(current))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, duration])

  return <span ref={ref} className={className}>{display}</span>
}

type Parsed = {
  numeric: number
  format: (n: number) => string
  formatStart: () => string
}

function parseValue(raw: string): Parsed | null {
  // Match leading prefix (e.g. ₦, $), then a number with optional commas/decimals,
  // then optional suffix (B, M, K, +, /5, %, etc.)
  const match = raw.match(/^([^\d.]*)([\d.,]+)([\s\S]*)$/)
  if (!match) return null

  const prefix = match[1] ?? ''
  const numStr = (match[2] ?? '').replace(/,/g, '')
  const suffix = match[3] ?? ''

  const numeric = Number(numStr)
  if (!Number.isFinite(numeric)) return null

  const hasComma = (match[2] ?? '').includes(',')
  const decimals = numStr.includes('.') ? (numStr.split('.')[1]?.length ?? 0) : 0

  const formatNumber = (n: number) => {
    if (decimals > 0) return n.toFixed(decimals)
    if (hasComma) return Math.round(n).toLocaleString('en-US')
    return String(Math.round(n))
  }

  return {
    numeric,
    format: (n) => `${prefix}${formatNumber(n)}${suffix}`,
    formatStart: () => `${prefix}${formatNumber(0)}${suffix}`,
  }
}
