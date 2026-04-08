'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Minimize2, MessageSquare } from 'lucide-react'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '15792583013'

const SYSTEM_PROMPT = `You are Vee, the friendly AI support assistant for VendoorX — a campus marketplace platform for Nigerian university students. You help buyers and sellers with questions about the platform.

Key facts about VendoorX:
- VendoorX is a structured online marketplace for Nigerian university students to buy and sell products
- Sellers can list products (fashion, electronics, food, services, books, etc.) and get their own storefront
- Buyers browse the marketplace, make offers, and pay securely via Paystack (cards, bank transfer, USSD)
- VendoorX connects WhatsApp, Instagram, and Facebook messages into one inbox for sellers
- Sellers get order management, analytics, and a shareable store link
- Plans: Free (basic listing), and paid boost plans to promote products
- Verified student badge available for university email holders
- Referral program: earn rewards for inviting friends
- Disputes are handled through the platform's resolution system
- Delivery is arranged between buyer and seller directly (VendoorX does not handle logistics)

Your personality:
- Warm, friendly, concise — like a helpful Nigerian university student
- Use light informal language but stay professional
- Keep responses short (2-4 sentences max)
- If you cannot answer something or the user needs urgent/personal help, offer to connect them to the human support team on WhatsApp

Never make up features or pricing numbers you are not sure about. If unsure, say you will connect them to the team.`

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (messages: Array<{ role: string; content: string }>, options?: { model?: string }) => Promise<{ message: { content: string } }>
      }
    }
  }
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Vee 👋 VendoorX's AI assistant. How can I help you today?",
      id: 'welcome',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [puterReady, setPuterReady] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load Puter.js
  useEffect(() => {
    if (document.querySelector('script[src*="puter.com"]')) {
      setPuterReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    script.async = true
    script.onload = () => setPuterReady(true)
    document.head.appendChild(script)
  }, [])

  // Show button after 2s, tooltip after 4s
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 2000)
    const t2 = setTimeout(() => setTooltipVisible(true), 4000)
    const t3 = setTimeout(() => setTooltipVisible(false), 10000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text, id: Date.now().toString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      if (!puterReady || !window.puter) throw new Error('Puter not ready')

      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const chatMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
      ]

      const response = await window.puter.ai.chat(chatMessages, { model: 'gpt-4o-mini' })
      const reply = response?.message?.content || "I'm having trouble connecting right now. Please try again or chat with us on WhatsApp."

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply, id: Date.now().toString() },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having a little trouble right now 😅 You can reach our team directly on WhatsApp and we'll sort you out!",
          id: Date.now().toString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, puterReady])

  const handleWhatsApp = () => {
    const summary = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' | ')
    const text = encodeURIComponent(
      `Hi VendoorX! I need help. Here's my issue: ${summary || 'I need assistance'}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">

      {/* Chat Window */}
      {open && (
        <div className="w-[340px] sm:w-[370px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ maxHeight: '520px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 text-white"
            style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">V</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-300 border-2 border-green-700 rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-tight">Vee — VendoorX AI</p>
              <p className="text-xs text-green-200">Always online · Replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50" style={{ minHeight: 260, maxHeight: 340 }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">V</div>
                )}
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">V</div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp handoff */}
          <div className="px-4 pt-2 pb-1">
            <button onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 text-xs text-green-700 hover:text-green-800 font-medium py-1.5 rounded-xl hover:bg-green-50 transition-colors border border-green-100">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Talk to a real person on WhatsApp
            </button>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all placeholder:text-gray-400"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Tooltip bubble */}
      {!open && tooltipVisible && (
        <div className="relative bg-white rounded-2xl rounded-br-sm shadow-xl border border-gray-100 px-4 py-3 max-w-[210px] animate-in slide-in-from-bottom-2 fade-in duration-300">
          <button onClick={() => setTooltipVisible(false)}
            className="absolute top-2 right-2 text-gray-300 hover:text-gray-500">
            <X size={12} />
          </button>
          <p className="text-xs font-semibold text-gray-800">Need help? 👋</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">Ask Vee, our AI — or get transferred to WhatsApp!</p>
          <div className="absolute -bottom-2 right-5 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={() => { setOpen(o => !o); setTooltipVisible(false) }}
        aria-label="Chat with Vee"
        className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
      >
        {!open && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-green-400" />
            <span className="absolute inset-0 rounded-full animate-ping opacity-10 bg-green-400 [animation-delay:0.5s]" />
          </>
        )}
        {open
          ? <X size={22} className="text-white" />
          : <MessageSquare size={22} className="text-white" />
        }
      </button>
    </div>
  )
}
