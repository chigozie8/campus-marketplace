'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { m } from 'framer-motion'
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

// WhatsApp Icon Component using react-icons
function WhatsAppLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeMap = {
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
  }
  const dimension = sizeMap[size]
  
  return (
    <FaWhatsapp 
      size={dimension} 
      className="flex-shrink-0 text-white"
    />
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
      {showArrow && (
        <m.div
          className="flex-shrink-0 overflow-hidden"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 'auto', opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <m.div
            className="w-5 h-5"
            whileHover={{ x: [0, 4, 2], transition: { duration: 0.5, ease: 'easeInOut' } }}
            whileTap={{ x: -2 }}
          >
            <ArrowRight className="w-5 h-5" />
          </m.div>
        </m.div>
      )}
    </>
  )

  if (onClick) {
    return (
      <m.button 
        onClick={onClick} 
        className={cn(combinedClasses, 'group cursor-pointer')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {content}
      </m.button>
    )
  }

  return (
    <Link href={href} className={cn(combinedClasses, 'group')}>
      <m.div
        className="inline-flex items-center justify-center w-full h-full gap-inherit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {content}
      </m.div>
    </Link>
  )
}
