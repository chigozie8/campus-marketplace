'use client'

import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { botWhatsappUrl } from '@/lib/whatsapp-bot'

interface WhatsAppCTAProps {
  phoneNumber?: string
  productTitle: string
  productPrice?: number
  variant?: 'primary' | 'outline' | 'compact'
  className?: string
  label?: string
}

export function WhatsAppCTA({
  productTitle,
  productPrice,
  variant = 'primary',
  className,
  label,
}: WhatsAppCTAProps) {
  const message = productPrice
    ? `Hi VendoorX! I'm interested in "${productTitle}" listed for ₦${productPrice.toLocaleString()}. Is it still available?`
    : `Hi VendoorX! I'm interested in "${productTitle}". Is it still available?`

  const url = botWhatsappUrl(message)

  if (variant === 'compact') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold',
          'bg-[#25D366] text-white hover:bg-[#20BA5C] transition-all hover:-translate-y-0.5 shadow-sm',
          className
        )}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {label ?? 'WhatsApp'}
      </a>
    )
  }

  if (variant === 'outline') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center justify-center gap-2 w-full h-10 rounded-xl border-2 border-[#25D366] text-[#25D366] text-sm font-bold',
          'hover:bg-[#25D366] hover:text-white transition-all duration-200',
          className
        )}
      >
        <MessageCircle className="w-4 h-4" />
        {label ?? 'Chat Vendor on WhatsApp'}
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center justify-center gap-2 w-full h-12 rounded-xl text-base font-bold text-white',
        'bg-[#25D366] hover:bg-[#20BA5C] transition-all duration-200 hover:-translate-y-0.5',
        'shadow-lg shadow-[#25D366]/30',
        className
      )}
    >
      <MessageCircle className="w-5 h-5" />
      {label ?? 'Buy via WhatsApp'}
    </a>
  )
}
