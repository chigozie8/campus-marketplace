'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Minimize2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'bot' | 'user'
  text: string
  time: string
}

type NotificationBubble = {
  id: string
  text: string
  delay: number
}

const NOTIFICATIONS: NotificationBubble[] = [
  { id: 'n1', text: '👋 Hi! Need help getting started?', delay: 4000 },
  { id: 'n2', text: '💬 Our team typically replies in minutes', delay: 12000 },
  { id: 'n3', text: '🎓 Special offer for new student vendors!', delay: 24000 },
]

const QUICK_REPLIES = [
  'How do I create a store?',
  'What are the pricing plans?',
  'How do payments work?',
  'Is it free to join?',
]

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '15792583013'

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: "Hi there! 👋 Welcome to **VendoorX**. I'm here to help you buy, sell, or answer any questions. How can I assist you today?",
      time: now(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [notifications, setNotifications] = useState<NotificationBubble[]>([])
  const [unread, setUnread] = useState(0)
  const [minimized, setMinimized] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const shownNotifs = useRef<Set<string>>(new Set())

  // Schedule notification bubbles
  useEffect(() => {
    if (open) return
    const timers = NOTIFICATIONS.map((n) =>
      setTimeout(() => {
        if (!open && !shownNotifs.current.has(n.id)) {
          shownNotifs.current.add(n.id)
          setNotifications((prev) => [...prev, n])
          setUnread((u) => u + 1)
          // Auto-dismiss after 5s
          setTimeout(() => {
            setNotifications((prev) => prev.filter((x) => x.id !== n.id))
          }, 5000)
        }
      }, n.delay),
    )
    return () => timers.forEach(clearTimeout)
  }, [open])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Focus input on open
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open, minimized])

  // Fix mobile keyboard pushing layout — scroll messages into view
  useEffect(() => {
    if (!open) return
    const handler = () => {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
    window.visualViewport?.addEventListener('resize', handler)
    return () => window.visualViewport?.removeEventListener('resize', handler)
  }, [open])

  const handleOpen = useCallback(() => {
    setOpen(true)
    setUnread(0)
    setNotifications([])
    setMinimized(false)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), time: now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'bot', text: data.reply || "I couldn't get a response. Try reaching us on WhatsApp!", time: now() },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'bot', text: "Oops, something went wrong! 😅 Tap the WhatsApp button in the header to reach our team directly.", time: now() },
      ])
    } finally {
      setTyping(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleWhatsApp = () => {
    const summary = messages.filter(m => m.role === 'user').map(m => m.text).join(' | ')
    const text = encodeURIComponent(`Hi VendoorX! I need help. My question: ${summary || 'I need assistance'}`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  // Render bold text (**text**)
  function renderText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i} className="whitespace-pre-wrap">{part}</span>
      ),
    )
  }

  return (
    <>
      {/* Notification bubbles */}
      {!open && (
        <div className="fixed bottom-36 right-5 md:bottom-24 z-50 flex flex-col gap-2 items-end pointer-events-none">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="pointer-events-auto bg-white dark:bg-card text-foreground text-sm font-medium px-4 py-2.5 rounded-2xl rounded-br-sm shadow-xl border border-border max-w-[240px] animate-in slide-in-from-right-4 fade-in duration-300"
            >
              {n.text}
            </div>
          ))}
        </div>
      )}

      {/* FAB button */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Open chat"
          className="fixed bottom-24 right-5 md:bottom-8 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <MessageCircle className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className={cn(
            'fixed bottom-24 right-4 z-50 bg-background rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden transition-all duration-300',
            minimized ? 'h-[64px]' : 'h-[min(520px,calc(100dvh-130px))]',
          )}
          style={{ width: 'min(360px, calc(100vw - 2rem))' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-primary text-white flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-primary rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">VendoorX Support</p>
              <p className="text-[11px] text-white/80 leading-tight">Typically replies in minutes</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleWhatsApp}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Chat on WhatsApp"
                title="Talk to a real person on WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </button>
              <button
                onClick={() => setMinimized((m) => !m)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
              >
                {minimized ? <ChevronDown className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scroll-smooth">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2 items-end', msg.role === 'user' && 'flex-row-reverse')}
                  >
                    {msg.role === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mb-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 mb-0.5">
                        <User className="w-4 h-4 text-foreground/70" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 max-w-[75%]">
                      <div
                        className={cn(
                          'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                          msg.role === 'bot'
                            ? 'bg-muted text-foreground rounded-bl-sm'
                            : 'bg-primary text-white rounded-br-sm',
                        )}
                      >
                        {renderText(msg.text)}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                  {QUICK_REPLIES.map((qr) => (
                    <button
                      key={qr}
                      onClick={() => sendMessage(qr)}
                      className="text-xs bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 text-foreground/80 px-3 py-1.5 rounded-full transition-all duration-150 font-medium"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-3 py-3 border-t border-border bg-background"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted rounded-full px-4 py-2 outline-none border border-transparent focus:border-primary/40 transition-colors placeholder:text-muted-foreground/60"
                  style={{ fontSize: 16 }}
                  maxLength={400}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-all duration-150 hover:scale-105 active:scale-95 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
