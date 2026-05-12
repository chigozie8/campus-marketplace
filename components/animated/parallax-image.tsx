'use client'

import { m } from 'framer-motion'
import Image from 'next/image'
import { useParallax } from '@/hooks/use-parallax'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'

interface ParallaxImageProps {
  src: string
  alt: string
  width: number
  height: number
  speed?: number
  className?: string
  containerClassName?: string
}

/**
 * Image component with parallax scrolling effect.
 * Creates depth effect where image moves slower than scroll speed.
 */
export function ParallaxImage({
  src,
  alt,
  width,
  height,
  speed = 0.5,
  className = '',
  containerClassName = '',
}: ParallaxImageProps) {
  const { ref, transform } = useParallax({ speed, direction: 'vertical' })
  const prefersReducedMotion = useReducedMotionPref()

  return (
    <div ref={ref} className={`overflow-hidden ${containerClassName}`}>
      <m.div
        style={prefersReducedMotion ? {} : { transform }}
        className={className}
      >
        <Image src={src} alt={alt} width={width} height={height} />
      </m.div>
    </div>
  )
}
