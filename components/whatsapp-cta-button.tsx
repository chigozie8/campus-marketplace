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

// Official WhatsApp Logo Component
function WhatsAppLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeMap = {
    sm: 18,
    md: 20,
    lg: 20,
    xl: 24,
  }
  const dimension = sizeMap[size]
  
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="flex-shrink-0"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.971 1.203l-.36.214-.373-.058c-1.25-.196-2.458-.666-3.426-1.43l-.04-.032-.046.016A9.884 9.884 0 002.25 12c0 5.514 4.486 10 10 10 5.514 0 10-4.486 10-10S17.764 2 12.25 2c-.508 0-1.01.041-1.502.122l-.064.011-.064.011z" />
    </svg>
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
