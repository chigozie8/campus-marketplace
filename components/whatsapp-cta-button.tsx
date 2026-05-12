'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhatsAppCtaButtonProps {
  text?: string
  href?: string
  secondary?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showArrow?: boolean
  onClick?: () => void
}

const sizeClasses = {
  sm: 'h-9 px-4 text-sm gap-2',
  md: 'h-11 px-6 text-base gap-2',
  lg: 'h-13 px-8 text-lg gap-3',
  xl: 'h-16 px-10 sm:px-14 text-base sm:text-lg gap-3',
}

// Official WhatsApp App Icon Component (rounded square with phone symbol)
function WhatsAppLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeMap = {
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
  }
  const dimension = sizeMap[size]
  
  return (
    <div className="flex-shrink-0 relative" style={{ width: dimension, height: dimension }}>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded green square background */}
        <rect width="100" height="100" rx="20" fill="#25D366" />
        
        {/* White phone symbol */}
        <g transform="translate(25, 25) scale(1.25)">
          <path
            d="M8 2C7.45 2 7 2.45 7 3V13C7 13.55 7.45 14 8 14H16C16.55 14 17 13.55 17 13V3C17 2.45 16.55 2 16 2H8ZM8 4H16V12.5H8V4Z"
            fill="white"
          />
          <circle cx="12" cy="13.5" r="0.5" fill="white" />
        </g>
      </svg>
    </div>
  )
}

export function WhatsAppCtaButton({
  text = 'Start Selling Now',
  href = '/auth/sign-up',
  secondary = false,
  size = 'lg',
  className,
  showArrow = true,
  onClick,
}: WhatsAppCtaButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'

  // Darker, richer WhatsApp green (#128C7E is WhatsApp's original brand green)
  const primaryClasses = 'bg-[#128C7E] hover:bg-[#0f6d56] text-white shadow-2xl shadow-[#128C7E]/40 hover:shadow-[#128C7E]/60 hover:scale-[1.03]'
  
  const secondaryClasses = 'border-2 border-[#128C7E] text-[#128C7E] bg-white hover:bg-[#128C7E]/5 shadow-lg shadow-[#128C7E]/20 hover:shadow-[#128C7E]/40'

  const variantClasses = secondary ? secondaryClasses : primaryClasses
  const sizeClass = sizeClasses[size]

  const combinedClasses = cn(baseClasses, sizeClass, variantClasses, className)

  const content = (
    <>
      <WhatsAppLogo size={size} />
      {text}
      {showArrow && <ArrowRight className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />}
    </>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(combinedClasses, 'group cursor-pointer')}>
        {content}
      </button>
    )
  }

  return (
    <Link href={href} className={cn(combinedClasses, 'group')}>
      {content}
    </Link>
  )
}
