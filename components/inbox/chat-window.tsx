'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, ShoppingCart, User, MessageCircle } from 'lucide-react'
import type { Conversation } from '@/lib/types'
import { PlatformBadge, platformLabel } from './platform-badge'
import { CreateOrderModal } from './create-order-modal'

interface Props {
  conversation: Conversation | null
  onSend: (msg: string) => void
  products: { id: string; title: string; price: number; images: string[] | null }[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
}

export function ChatWindow({ conversation, onSend, products }: Props) {
  const [input, setInput] = useState('')
  const [orderModal, setOrderModal] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages])

  if (!conversation) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#f5f6f8] dark:bg-background gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border flex items-center justify-center shadow-sm">
          <MessageCircle className="w-8 h-8 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 dark:text-white text-sm">Select a conversation</p>
          <p className="text-xs text-gray-400 mt-1">Choose a chat from the left to get started</p>
        </div>
      </div>
    )
  }

  function handleSend() {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f5f6f8] dark:bg-background overflow-hidden">
      {/* Top bar */}
      <div className="bg-white dark:bg-card border-b border-gray-100 dark:border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-muted flex items-center justify-center font-bold text-sm">
              {conversation.customer_name.charAt(0)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5">
              <PlatformBadge platform={conversation.platform} size="sm" />
            </div>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-950 dark:text-white">{conversation.customer_name}</p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              via <PlatformBadge platform={conversation.platform} variant="pill" size="sm" />
              {conversation.customer_phone && <span className="ml-1">{conversation.customer_phone}</span>}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOrderModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Create Order
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-border text-gray-600 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted transition-all">
            <User className="w-3.5 h-3.5" />
            View Customer
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] group`}>
              <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.direction === 'outgoing'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-white dark:bg-card text-gray-800 dark:text-foreground rounded-tl-sm border border-gray-100 dark:border-border'
              }`}>
                {msg.content}
              </div>
              <p className={`text-[10px] text-gray-400 mt-1 ${msg.direction === 'outgoing' ? 'text-right' : 'text-left'}`}>
                {formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-card border-t border-gray-100 dark:border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-muted rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Message via ${platformLabel(conversation.platform)}…`}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-all hover:scale-105 disabled:hover:scale-100"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {orderModal && (
        <CreateOrderModal
          customerName={conversation.customer_name}
          products={products}
          onClose={() => setOrderModal(false)}
        />
      )}
    </div>
  )
}
