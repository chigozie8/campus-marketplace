'use client'

import { m, Variants } from 'framer-motion'
import { ReactNode } from 'react'
import { useReducedMotionPref } from '@/hooks/use-reduced-motion-pref'
import { SPRING_HOVER } from '@/lib/motion'

interface PulseButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  enablePulse?: boolean
}

/**
 * Interactive button with spring physics and optional pulse effect.
 * Premium micro-interaction for CTA buttons and key actions.
 */
export function PulseButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  enablePulse = true,
}: PulseButtonProps) {
  const prefersReducedMotion = useReducedMotionPref()

  const pulseRing: Variants = {
    initial: { scale: 1, opacity: 1 },
    pulse: {
      scale: [1, 1.2],
      opacity: [1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeOut',
      },
    },
  }

  const buttonClasses = {
    primary:
      'bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-13 text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30',
    secondary:
      'bg-background border border-border hover:bg-muted/50 text-foreground font-semibold px-8 h-13 text-base',
  }

  return (
    <div className="relative inline-block">
      {/* Pulse ring background (only if enabled and not reduced motion) */}
      {enablePulse && !prefersReducedMotion && !disabled && (
        <m.div
          className={`absolute inset-0 rounded-full ${variant === 'primary' ? 'bg-primary' : 'bg-border'}`}
          variants={pulseRing}
          initial="initial"
          animate="pulse"
          style={{
            width: 'calc(100% + 24px)',
            height: 'calc(100% + 24px)',
            left: '-12px',
            top: '-12px',
          }}
        />
      )}

      {/* Button */}
      <m.button
        onClick={onClick}
        disabled={disabled}
        className={`${buttonClasses[variant]} rounded-full transition-all duration-300 relative z-10 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        whileHover={!disabled ? { scale: 1.03 } : {}}
        whileTap={!disabled ? { scale: 0.97 } : {}}
        transition={SPRING_HOVER}
      >
        {children}
      </m.button>
    </div>
  )
}
