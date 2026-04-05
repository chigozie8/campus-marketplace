'use client'

import type { Conversation } from '@/lib/types'
import { PlatformBadge, platformLabel } from './platform-badge'
import { Phone, MessageCircle, Package } from 'lucide-react'

interface Props {
  conversation: Conversation
  products: { id: string; title: string; price: number; images: string[] | null }[]
}

export function CustomerPanel({ conversation, products }: Props) {
  const initial = conversation.customer_name.charAt(0)

  return (
    <div className="hidden xl:flex w-64 flex-shrink-0 bg-white dark:bg-card border-l border-gray-100 dark:border-border flex-col overflow-y-auto">
      <div className="p-5 border-b border-gray-100 dark:border-border">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Customer</p>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center font-black text-xl text-gray-700 dark:text-gray-300">
              {initial}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5">
              <PlatformBadge platform={conversation.platform} />
            </div>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-950 dark:text-white">{conversation.customer_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">via {platformLabel(conversation.platform)}</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-4 space-y-2">
          {conversation.customer_phone && (
            <a
              href={`tel:${conversation.customer_phone}`}
              className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              {conversation.customer_phone}
            </a>
          )}
          {conversation.platform === 'whatsapp' && conversation.customer_phone && (
            <a
              href={`https://wa.me/${conversation.customer_phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs text-[#25D366] hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Open in WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Conversation stats */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-border">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Stats</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Messages', value: conversation.messages.length },
            { label: 'Unread', value: conversation.unread_count },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 dark:bg-muted rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-gray-950 dark:text-white">{value}</p>
              <p className="text-[10px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick product share */}
      {products.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Share Product</p>
          <div className="space-y-2">
            {products.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    : <Package className="w-4 h-4 text-gray-400 m-auto mt-2" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{p.title}</p>
                  <p className="text-[10px] text-gray-400">₦{p.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
