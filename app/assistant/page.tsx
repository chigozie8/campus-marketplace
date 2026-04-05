'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ShoppingBag,
  Send,
  Bot,
  User,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Find me a cheap laptop under ₦100k',
  'What textbooks are available for 200 level Engineering?',
  'Who sells the best jollof rice on UNILAG campus?',
  'How do I list my items for sale?',
  'Show me fashion items under ₦5,000',
]

const SAMPLE_RESPONSES: Record<string, string> = {
  default: "I'm CampusCart AI, your smart shopping assistant! I can help you find products, compare prices, guide you through selling, or answer any marketplace questions. What are you looking for today?",
}

function getBotResponse(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('laptop') || m.includes('computer')) {
    return "Great choice! I found several laptops listed on CampusCart. There's a **Lenovo IdeaPad** for ₦85,000 (like new) at UNILAG, and a **Dell Inspiron** for ₦95,000 at UI. Both sellers are WhatsApp-verified. Shall I show you the full listings?\n\n👉 [Browse Electronics](/marketplace?category=electronics)"
  }
  if (m.includes('sell') || m.includes('list') || m.includes('listing')) {
    return "Listing on CampusCart is super easy and free! Here's how:\n\n1. **Create your account** (if you haven't already)\n2. **Go to your Dashboard** → New Listing\n3. **Add photos, title, price** and condition\n4. **Add your WhatsApp number** in your profile\n5. **Publish** — buyers can find you instantly!\n\nYour WhatsApp number is used so buyers can contact you directly. Need help with anything specific?\n\n👉 [Start Selling](/seller/new)"
  }
  if (m.includes('fashion') || m.includes('cloth') || m.includes('shirt') || m.includes('dress')) {
    return "I can see lots of fashion deals on campus right now! There are over 18,000 fashion items listed, including:\n\n• **Ankara sets** from ₦2,500 – ₦8,000\n• **Sneakers & shoes** from ₦3,000\n• **Accessories** from ₦500\n\nMany sellers are students like you selling quality items at student-friendly prices.\n\n👉 [Browse Fashion](/marketplace?category=fashion)"
  }
  if (m.includes('food') || m.includes('jollof') || m.includes('eat') || m.includes('snack')) {
    return "Hungry? There are food sellers on campus right now! From jollof rice to shawarma to snacks — many students and campus businesses are listed.\n\nPro tip: WhatsApp the seller to confirm availability before going. Most food sellers respond within minutes!\n\n👉 [Browse Food & Drinks](/marketplace?category=food-drinks)"
  }
  if (m.includes('book') || m.includes('textbook') || m.includes('material')) {
    return "Textbooks are one of our most popular categories! Students regularly sell their used textbooks at 50–70% off the original price.\n\nTips for finding your books:\n• Search by course code or title\n• Filter by your campus\n• Most are in 'Good' or 'Like New' condition\n\n👉 [Browse Books](/marketplace?category=books)"
  }
  if (m.includes('whatsapp') || m.includes('contact') || m.includes('message')) {
    return "When you find an item you like, just click the **'Chat on WhatsApp'** button on any product card or detail page. It'll open WhatsApp with a pre-filled message to the seller.\n\nMake sure your own WhatsApp number is set in your **Profile Settings** so buyers can reach you too!"
  }
  return `Great question! I'm searching the CampusCart marketplace for "${message}". \n\nHere's what I suggest:\n\n• Browse our [marketplace](/marketplace) and use the search bar\n• Filter by category to narrow down results\n• Use the sort options to find the best prices\n\nIs there anything more specific I can help you with? I can help you find products, understand pricing, or guide you through selling!`
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: SAMPLE_RESPONSES.default,
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function sendMessage(text?: string) {
    const content = text || input.trim()
    if (!content) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setTyping(true)

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 900))

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getBotResponse(content),
    }
    setMessages(prev => [...prev, botMessage])
    setTyping(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">CampusCart AI</p>
                <p className="text-xs text-primary leading-none mt-0.5">Online</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                message.role === 'assistant'
                  ? 'hero-gradient'
                  : 'bg-secondary border border-border'
              }`}>
                {message.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-foreground" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-card border border-border/50 text-foreground rounded-tl-sm'
              }`}>
                {message.content.split('\n').map((line, i) => {
                  // Simple markdown bold
                  const parts = line.split(/\*\*(.*?)\*\*/g)
                  return (
                    <p key={i} className={line === '' ? 'mt-1' : ''}>
                      {parts.map((part, j) =>
                        j % 2 === 1
                          ? <strong key={j}>{part}</strong>
                          : part.includes('[') && part.includes('](')
                            ? part.split(/\[([^\]]+)\]\(([^)]+)\)/g).map((seg, k) =>
                                k % 3 === 1
                                  ? <span key={k} className="font-medium underline">{seg}</span>
                                  : k % 3 === 0
                                    ? seg
                                    : null
                              )
                            : part
                      )}
                    </p>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full hero-gradient flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-4">
          <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border glass">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Ask anything about the marketplace..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-11 pr-4"
              />
            </div>
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="hero-gradient border-0 text-white h-11 w-11 p-0 flex-shrink-0"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-2.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <p className="text-xs text-muted-foreground">
              AI assistant powered by CampusCart. For real-time product info,{' '}
              <Link href="/marketplace" className="text-primary hover:underline">browse the marketplace</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
