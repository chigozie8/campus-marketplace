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

const BOT_RESPONSES: Record<string, string> = {
  default:
    "Thanks for reaching out! A VendoorX support agent will get back to you shortly. In the meantime, check out our FAQ section for quick answers. 🙏",
  'how do i create a store':
    "Creating your store is super easy! Just sign up for free, complete your vendor profile, and start listing products. It takes less than 5 minutes. Want me to walk you through it?",
  'what are the pricing plans':
    "We have 3 plans:\n• **Starter** — Free forever, up to 10 listings\n• **Growth** — ₦2,500/mo, unlimited listings + analytics\n• **Pro** — ₦5,000/mo, everything + AI assistant & verified badge\n\nAll plans charge 0% commission on sales!",
  'how do payments work':
    "VendoorX uses Paystack for secure payments. Buyers pay directly, and funds settle to your bank account within 1-2 business days. Growth and Pro plans have full Paystack integration built in.",
  'is it free to join':
    "Yes! Joining VendoorX is completely free. The Starter plan lets you list up to 10 products at no cost, forever. No credit card required. Upgrade anytime as your business grows! 🚀",
}

function getBotReply(text: string): string {
  const lower = text.toLowerCase().trim()
  for (const [key, reply] of Object.entries(BOT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return reply
  }
  return BOT_RESPONSES.default
}

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

  const handleOpen = useCallback(() => {
    setOpen(true)
    setUnread(0)
    setNotifications([])
    setMinimized(false)
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return
      const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), time: now() }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setTyping(true)

      setTimeout(() => {
        setTyping(false)
        const reply = getBotReply(text)
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'bot', text: reply, time: now() },
        ])
      }, 1200 + Math.random() * 600)
    },
    [],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
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
            'fixed bottom-24 right-5 md:bottom-8 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-background rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden transition-all duration-300',
            minimized ? 'h-[64px]' : 'h-[520px]',
          )}
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
                  className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-primary/40 transition-colors placeholder:text-muted-foreground/60"
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
