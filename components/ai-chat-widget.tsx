'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, ChevronDown, Sparkles, Zap } from 'lucide-react'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '15792583013'

const QUICK_REPLIES = [
  '🚀 How do I start selling?',
  '💳 How does payment work?',
  '🆓 Is VendoorX free?',
  '📦 How is delivery handled?',
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! 👋 I'm **Vee**, your VendoorX AI guide.\n\nAsk me anything about buying, selling, payments, or how the platform works!",
      id: 'welcome',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 1500)
    const t2 = setTimeout(() => setPulse(true), 3000)
    const t3 = setTimeout(() => setPulse(false), 8000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
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
      const reply = data.reply || "I couldn't get a response. Try reaching us on WhatsApp!"

      setMessages(prev => [...prev, { role: 'assistant', content: reply, id: Date.now().toString() }])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Oops, something went wrong! 😅 Tap 'Talk to a real person' below to reach us on WhatsApp.", id: Date.now().toString() },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, open])

  const handleWhatsApp = () => {
    const summary = messages.filter(m => m.role === 'user').map(m => m.content).join(' | ')
    const text = encodeURIComponent(`Hi VendoorX! I need help. My question: ${summary || 'I need assistance'}`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{
            width: 'min(360px, calc(100vw - 32px))',
            maxHeight: '82vh',
            background: '#fff',
            border: '1.5px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Header */}
          <div
            className="relative px-4 py-4 flex items-center gap-3 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/5" />

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shadow-inner">
                🤖
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-300 border-2 border-emerald-800 rounded-full animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-white font-bold text-sm">Vee — AI Assistant</p>
                <Sparkles size={12} className="text-yellow-300" />
              </div>
              <p className="text-emerald-200 text-xs">VendoorX Support · Always online</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="shrink-0 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronDown size={17} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)', minHeight: 220, maxHeight: 340 }}
          >
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-sm shrink-0 mb-0.5 shadow-sm">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'text-gray-800 bg-white rounded-bl-sm border border-gray-100'
                  }`}
                  style={msg.role === 'user' ? { background: 'linear-gradient(135deg,#059669,#047857)' } : {}}
                >
                  {renderText(msg.content)}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-gray-200 flex items-center justify-center text-sm shrink-0 mb-0.5">
                    🙂
                  </div>
                )}
              </div>
            ))}

            {/* Typing dots */}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-sm shrink-0">🤖</div>
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-gray-100 bg-white">
              {QUICK_REPLIES.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q.replace(/^[^\s]+\s/, ''))}
                  className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* WhatsApp handoff */}
          <div className="px-3 py-2 bg-white border-t border-gray-100">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-xl transition-colors"
              style={{ background: 'linear-gradient(90deg,#dcfce7,#d1fae5)', color: '#065f46' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Talk to a real person on WhatsApp
            </button>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shadow-md"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── FAB Button ── */}
      <div className="relative">
        {/* Unread badge */}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -left-1 z-10 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg animate-bounce">
            {unread}
          </span>
        )}

        {/* Tooltip */}
        {!open && pulse && (
          <div className="absolute bottom-16 right-0 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-xl">
              <Zap size={11} className="inline mr-1 text-yellow-400" />
              Ask our AI anything 👋
              <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-gray-900 rotate-45" />
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Chat with Vee"
          className="relative w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 60%, #065f46 100%)' }}
        >
          {/* Glow ring */}
          {!open && (
            <>
              <span className="absolute inset-0 rounded-2xl animate-ping opacity-25 bg-emerald-400" />
              <span className="absolute inset-0 rounded-2xl animate-ping opacity-15 bg-emerald-300 [animation-delay:0.75s]" />
            </>
          )}
          <span className="relative z-10 text-2xl">
            {open ? '✕' : '🤖'}
          </span>
        </button>
      </div>
    </div>
  )
}
