import { cn } from '@/lib/utils'

/**
 * Lightweight skeleton with a shimmer sweep — pure CSS, GPU-friendly,
 * no JS overhead. Falls back gracefully (no shimmer) if reduced-motion
 * is set; the keyframe is paused via the global media query in
 * app/globals.css.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-accent relative overflow-hidden rounded-md',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent',
        'dark:before:via-white/10',
        'before:animate-shimmer',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
