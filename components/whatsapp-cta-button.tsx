'use client'

import Link from 'next/link'
import { MessageCircle, ArrowRight } from 'lucide-react'
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

  const primaryClasses = 'bg-[#25D366] hover:bg-[#1fb855] text-white shadow-2xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-[1.03]'
  
  const secondaryClasses = 'border-2 border-[#25D366] text-[#25D366] bg-white hover:bg-[#25D366]/5 shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40'

  const variantClasses = secondary ? secondaryClasses : primaryClasses
  const sizeClass = sizeClasses[size]

  const combinedClasses = cn(baseClasses, sizeClass, variantClasses, className)

  const content = (
    <>
      <MessageCircle className="w-5 h-5 flex-shrink-0" />
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
