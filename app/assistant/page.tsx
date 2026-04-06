'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShoppingBag,
  BookOpen,
  Utensils,
  Shirt,
  Laptop,
  Home,
  RotateCcw,
  ChevronRight,
} from 'lucide-react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    puter: any
  }
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { icon: Laptop, label: 'Cheap laptops', query: 'Find me a cheap laptop under ₦100k on campus' },
  { icon: BookOpen, label: 'Textbooks', query: 'What textbooks are available for 200 level students?' },
  { icon: Utensils, label: 'Food nearby', query: 'Who sells the best jollof rice on campus?' },
  { icon: Shirt, label: 'Fashion deals', query: 'Show me fashion items under ₦5,000' },
  { icon: ShoppingBag, label: 'How to sell', query: 'How do I list my items for sale on VendoorX?' },
  { icon: Home, label: 'Accommodation', query: 'Are there student accommodation listings?' },
]

const SYSTEM_PROMPT = `You are VendoorX AI — a smart, friendly, and energetic shopping assistant for VendoorX, Nigeria's #1 campus marketplace. You help university students buy and sell products like electronics, textbooks, fashion, food, services, and accommodation.

Your personality: upbeat, helpful, knowledgeable about Nigerian campus life, uses light Nigerian slang naturally (e.g. "sharp sharp", "no wahala", "omo"), but always professional and clear.

Key marketplace facts:
- VendoorX connects 50,000+ students across 120+ Nigerian campuses (UNILAG, OAU, UI, FUTA, LASU, ABU, etc.)
- Buyers contact sellers directly via WhatsApp — zero platform fees, zero commission
- Product categories: Electronics, Textbooks, Clothing, Food & Drinks, Services, Accommodation, Furniture, Sports, Beauty, Others
- Listing is free — go to /seller/new to create a listing
- Browse at /marketplace
- Students can filter by campus, category, condition (new/like-new/good/fair) and price

When users ask about products, give helpful suggestions, price ranges typical on Nigerian campuses, and always include a call to action to browse the marketplace. Format responses nicely with line breaks. Keep responses concise but warm and friendly.`

// Typewriter effect hook
function useTypewriter(text: string, speed = 12, active = false) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active || !text) {
      setDisplayed(text)
      setDone(true)
      return
    }
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, active])

  return { displayed, done }
}

// Bot face SVG (shared)
function BotFace({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
      <rect x="4" y="6" width="16" height="13" rx="3" fill="#22c55e" />
      <line x1="12" y1="2" x2="12" y2="6" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.5" fill="#4ade80" />
      <circle cx="9" cy="11" r="2" fill="#052e16" />
      <circle cx="15" cy="11" r="2" fill="#052e16" />
      <circle cx="9.7" cy="10.3" r="0.6" fill="#86efac" />
      <circle cx="15.7" cy="10.3" r="0.6" fill="#86efac" />
      <path d="M9 14.5 Q12 16.5 15 14.5" stroke="#052e16" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="2" y="9" width="2.5" height="5" rx="1" fill="#16a34a" />
      <rect x="19.5" y="9" width="2.5" height="5" rx="1" fill="#16a34a" />
    </svg>
  )
}

// Message bubble component
function MessageBubble({ message, isLatestBot }: { message: Message; isLatestBot: boolean }) {
  const isBot = message.role === 'assistant'
  const { displayed } = useTypewriter(message.content, 10, isBot && isLatestBot)

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const boldParts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <p key={i} className={line === '' ? 'h-2' : 'leading-relaxed'}>
          {boldParts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-bold">
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      )
    })
  }

  return (
    <div className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'} items-end`}>
      {/* Bot avatar */}
      {isBot && (
        <div className="flex-shrink-0 relative">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center shadow-md shadow-green-200 border border-green-200">
            <BotFace size={20} />
          </div>
          {isLatestBot && (
            <span className="absolute inset-0 rounded-2xl animate-ping border border-green-400/60" />
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[78%] sm:max-w-[70%] text-sm space-y-0.5 ${
          isBot
            ? 'bg-gray-100 dark:bg-muted text-gray-800 dark:text-gray-100 rounded-3xl rounded-tl-md px-4 py-3 shadow-sm'
            : 'bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white rounded-3xl rounded-br-md px-4 py-3 shadow-md shadow-green-200'
        }`}
      >
        {isBot ? renderContent(displayed) : renderContent(message.content)}

        <p className={`text-[10px] mt-1.5 ${isBot ? 'text-gray-400 dark:text-gray-500' : 'text-white/60'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* User avatar */}
      {!isBot && (
        <div className="w-8 h-8 rounded-2xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-500 dark:text-gray-400">
          You
        </div>
      )}
    </div>
  )
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center shadow-md shadow-green-200 border border-green-200 flex-shrink-0">
        <BotFace size={20} />
      </div>
      <div className="bg-gray-100 dark:bg-muted rounded-3xl rounded-tl-md px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:175ms]" />
          <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:350ms]" />
        </div>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hey there! I'm VendoorX AI, your personal campus shopping assistant.\n\nI can help you find the best deals, discover sellers near your campus, guide you on how to sell, and answer any marketplace questions — sharp sharp!\n\nWhat are you looking for today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [puterReady, setPuterReady] = useState(false)
  const [latestBotId, setLatestBotId] = useState('1')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const conversationHistory = useRef<{ role: string; content: string }[]>([])

  // Load puter.js
  useEffect(() => {
    if (window.puter) { setPuterReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    script.async = true
    script.onload = () => setPuterReady(true)
    document.head.appendChild(script)
    return () => { if (script.parentNode) script.parentNode.removeChild(script) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text || input).trim()
      if (!content || typing) return

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMsg])
      setInput('')
      setTyping(true)

      conversationHistory.current.push({ role: 'user', content })

      try {
        let responseText = ''

        if (puterReady && window.puter?.ai?.chat) {
          // Build messages array for puter
          const aiMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.current.slice(-10),
          ]
          const response = await window.puter.ai.chat(aiMessages, { model: 'gpt-4o-mini' })
          responseText =
            typeof response === 'string'
              ? response
              : response?.message?.content || response?.content || "No wahala! Let me help you out.\n\nBrowse the [marketplace](/marketplace) and use the search to find what you need. Need anything specific?"
        } else {
          // Fallback if puter not ready
          await new Promise(r => setTimeout(r, 1200))
          responseText = getFallbackResponse(content)
        }

        conversationHistory.current.push({ role: 'assistant', content: responseText })

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMsg])
        setLatestBotId(botMsg.id)
      } catch {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "Hmm, my network went on a quick break. No wahala — try again in a moment, or browse the marketplace directly!\n\n[Browse Marketplace](/marketplace)",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errMsg])
        setLatestBotId(errMsg.id)
      } finally {
        setTyping(false)
        inputRef.current?.focus()
      }
    },
    [input, typing, puterReady]
  )

  function getFallbackResponse(msg: string): string {
    const m = msg.toLowerCase()
    if (m.includes('laptop') || m.includes('computer') || m.includes('phone'))
      return "Omo, you're looking for gadgets! Browse electronics listings from verified campus sellers — prices start from ₦15,000 for phones and ₦60,000 for laptops.\n\n[Browse Electronics](/marketplace?category=electronics)"
    if (m.includes('sell') || m.includes('list'))
      return "Listing is free and takes less than 2 minutes!\n\n1. **Go to** New Listing\n2. **Add photos** and description\n3. **Set your price** and WhatsApp number\n4. **Publish** — buyers will find you!\n\n[Start Selling](/seller/new)"
    if (m.includes('food') || m.includes('eat') || m.includes('jollof'))
      return "Campus food sellers are everywhere on VendoorX! From jollof rice to shawarma, many students sell fresh food daily.\n\n[Browse Food](/marketplace?category=food)"
    if (m.includes('book') || m.includes('textbook'))
      return "Textbooks are super popular here — students sell at 50-70% off retail price. Sharp savings!\n\n[Browse Books](/marketplace?category=textbooks)"
    if (m.includes('fashion') || m.includes('cloth') || m.includes('shoe'))
      return "Major fashion deals on campus! Ankara, sneakers, accessories — all at student prices.\n\n[Browse Fashion](/marketplace?category=clothing)"
    return "I'm still warming up my AI engine! For now, browse the marketplace directly — over 50,000 students are selling on VendoorX.\n\n[Browse Marketplace](/marketplace)"
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    conversationHistory.current = []
    const resetMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Chat cleared! Ready to help you find the best campus deals. What are you looking for?",
      timestamp: new Date(),
    }
    setMessages([resetMsg])
    setLatestBotId(resetMsg.id)
  }

  const showSuggestions = messages.length <= 1

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-background overflow-hidden">

      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b border-gray-100 dark:border-border bg-white/90 dark:bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-3">
            {/* Back */}
            <Link
              href="/dashboard"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-muted transition-all flex-shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Bot identity */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center shadow-md shadow-green-200 border border-green-200">
                  <BotFace size={20} />
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-background">
                  <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">VendoorX AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-[11px] text-green-600">
                    {puterReady ? 'Online — GPT-4o powered' : 'Connecting…'}
                  </p>
                </div>
              </div>
            </div>

            {/* Powered badge + clear */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl">
                <Sparkles className="w-3 h-3" />
                GPT-4o
              </div>
              <button
                onClick={clearChat}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-muted transition-all"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

          {/* Welcome hero — shown before any user message */}
          {showSuggestions && (
            <div className="text-center pt-4 pb-6">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute w-24 h-24 rounded-full bg-green-100 dark:bg-green-950/30 animate-pulse" />
                <div className="absolute w-32 h-32 rounded-full bg-green-50 dark:bg-green-950/20 animate-pulse [animation-delay:500ms]" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center shadow-2xl shadow-green-300 border-2 border-green-200">
                  <BotFace size={44} />
                </div>
              </div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">VendoorX AI</h1>
              <p className="text-gray-500 text-sm mt-1">Your campus shopping genius</p>
            </div>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLatestBot={msg.id === latestBotId && msg.role === 'assistant'}
            />
          ))}

          {/* Typing */}
          {typing && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ── Quick prompts ── */}
      {showSuggestions && (
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-border bg-gray-50/80 dark:bg-muted/20 backdrop-blur-sm px-4 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
              Quick questions
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {QUICK_PROMPTS.map(({ icon: Icon, label, query }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(query)}
                  className="flex items-center gap-1.5 bg-white dark:bg-card border border-gray-200 dark:border-border hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 text-gray-700 dark:text-foreground hover:text-green-700 text-xs font-medium px-3 py-2 rounded-2xl whitespace-nowrap transition-all flex-shrink-0 shadow-sm group"
                >
                  <Icon className="w-3.5 h-3.5 text-green-600 group-hover:text-green-700 transition-colors" />
                  {label}
                  <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Input area ── */}
      <div className="flex-shrink-0 border-t border-gray-100 dark:border-border bg-white dark:bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 pb-4">
          <div className="flex items-end gap-2.5">
            {/* Textarea */}
            <div className="flex-1 relative bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-3xl overflow-hidden focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 dark:focus-within:ring-green-900 transition-all">
              <textarea
                ref={inputRef}
                placeholder="Ask anything about campus deals…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="w-full bg-transparent text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground text-sm px-4 py-3 resize-none focus:outline-none min-h-[46px] max-h-[120px]"
                style={{ height: 'auto' }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
                }}
              />
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              aria-label="Send message"
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center shadow-lg shadow-green-200 hover:shadow-green-300 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0"
            >
              {typing ? (
                <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <Sparkles className="w-3 h-3 text-green-500" />
            <p className="text-[10px] font-semibold text-green-600 tracking-wide">
              Your smartest campus shopping companion ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
