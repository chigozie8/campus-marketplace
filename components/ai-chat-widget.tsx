'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Minimize2, MessageSquare } from 'lucide-react'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '15792583013'

const QUICK_REPLIES = [
  'How do I start selling?',
  'How does payment work?',
  'Is VendoorX free?',
  'How is delivery handled?',
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Vee 👋 VendoorX's AI assistant.\n\nAsk me anything about buying, selling, payments, or how the platform works!",
      id: 'welcome',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 1500)
    const t2 = setTimeout(() => { if (!dismissed) setTooltipVisible(true) }, 3500)
    const t3 = setTimeout(() => setTooltipVisible(false), 9000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [dismissed])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Fix mobile keyboard distortion — scroll messages into view without zooming
  useEffect(() => {
    if (!open) return
    const handleResize = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [open])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const userMsg: Message = { role: 'user', content: msg, id: Date.now().toString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply || "I couldn't get a response. Try reaching us on WhatsApp!", id: Date.now().toString() },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Oops, something went wrong! 😅 Tap the button below to reach us on WhatsApp.", id: Date.now().toString() },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const handleWhatsApp = () => {
    const summary = messages.filter(m => m.role === 'user').map(m => m.content).join(' | ')
    const text = encodeURIComponent(`Hi VendoorX! I need help. My question: ${summary || 'I need assistance'}`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTooltipVisible(false)
    setDismissed(true)
  }

  if (!visible) return null

  return (
    <>
      {/* Full-screen overlay on mobile when open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">

        {/* ── Chat Window ── */}
        {open && (
          <div
            ref={chatRef}
            className="flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-300"
            style={{
              width: 'min(360px, calc(100vw - 24px))',
              maxHeight: 'min(520px, calc(100dvh - 180px))',
              background: '#fff',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-base shadow-inner">
                  V
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-300 border-2 border-green-700 rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">Vee — VendoorX AI</p>
                <p className="text-xs text-green-200">Always online · Replies instantly</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 shrink-0"
              >
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
              style={{ background: '#f8fafb', minHeight: 200 }}
            >
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
                      V
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                    }`}
                  >
                    {renderText(msg.content)}
                  </div>
                </div>
              ))}

              {/* Typing dots */}
              {loading && (
                <div className="flex items-end gap-2">
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

            {/* Quick replies — shown only at the start */}
            {messages.length <= 2 && !loading && (
              <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 bg-white border-t border-gray-100 shrink-0">
                {QUICK_REPLIES.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* WhatsApp handoff */}
            <div className="px-4 pt-2 pb-1 bg-white shrink-0">
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 text-xs text-green-700 hover:text-green-800 font-medium py-1.5 rounded-xl hover:bg-green-50 transition-colors border border-green-100"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Talk to a real person on WhatsApp
              </button>
            </div>

            {/* Input — font-size 16px prevents iOS zoom on focus */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all placeholder:text-gray-400"
                style={{ fontSize: 16 }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shrink-0"
                style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Tooltip bubble */}
        {!open && tooltipVisible && (
          <div className="relative flex items-start gap-2 bg-white rounded-2xl rounded-br-sm shadow-xl border border-gray-100 px-4 py-3 max-w-[210px] animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-800 leading-tight">Need help? 👋</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">Chat with Vee, our AI — or reach us on WhatsApp!</p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-300 hover:text-gray-500 transition-colors mt-0.5 shrink-0"
            >
              <X size={12} />
            </button>
            <div className="absolute -bottom-2 right-5 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
          </div>
        )}

        {/* FAB button — MessageSquare icon */}
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
    </>
  )
}
