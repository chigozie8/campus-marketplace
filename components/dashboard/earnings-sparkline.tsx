interface Props {
  /** 7 daily totals, oldest first. Length should be 7. */
  data: number[]
  className?: string
}

/**
 * Tiny inline SVG sparkline of the last 7 days of earnings. No labels, no
 * axes — just enough shape to convey momentum. If all values are zero we
 * render a flat dotted line so the card doesn't look broken.
 */
export function EarningsSparkline({ data, className }: Props) {
  const W = 100
  const H = 24
  const pad = 2

  if (!data.length) return null
  const max = Math.max(1, ...data)
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1)
  const allZero = max === 0 || data.every(v => v === 0)

  const points = data.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (H - pad * 2) * (1 - v / max)
    return [x, y] as const
  })

  const path = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  // Area fill underneath
  const areaPath = `${path} L${(W - pad).toFixed(1)},${H - pad} L${pad},${H - pad} Z`

  if (allZero) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
        <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2}
          stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"
          className="text-gray-300 dark:text-muted-foreground/40" />
      </svg>
    )
  }

  const last = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true" preserveAspectRatio="none">
      <path d={areaPath} className="fill-amber-500/15" />
      <path d={path} className="stroke-amber-500" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="1.6" className="fill-amber-500" />
    </svg>
  )
}
