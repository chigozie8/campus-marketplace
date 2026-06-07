'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackClassName?: string
  /** Show the "Image unavailable" label beneath the icon. Defaults to true. */
  showLabel?: boolean
}

/**
 * Drop-in replacement for <img> that catches broken/missing URLs and renders
 * a clean placeholder in the exact same container so layout never shifts.
 *
 * Usage:
 *   <SafeImage src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
 */
export function SafeImage({ src, alt, className, fallbackClassName, showLabel = true }: SafeImageProps) {
  const [errored, setErrored] = useState(!src)

  if (errored || !src) {
    return (
      <div
        role="img"
        aria-label="Image unavailable"
        className={cn(
          'w-full h-full flex flex-col items-center justify-center gap-1',
          'bg-gray-100 dark:bg-muted text-gray-400 dark:text-muted-foreground',
          fallbackClassName,
        )}
      >
        <ImageOff className="w-5 h-5 shrink-0" strokeWidth={1.5} />
        {showLabel && (
          <span className="text-[10px] font-medium tracking-wide select-none">
            Image unavailable
          </span>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  )
}
