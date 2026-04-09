'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Send, X, Loader2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  order_id: string
  sender_id: string
  receiver_id: string
  message: string
  read: boolean
  created_at: string
}

interface Props {
  orderId: string
  currentUserId: string
  otherUserName: string
  orderRef: string
}

export function OrderChat({ orderId, currentUserId, otherUserName, orderRef }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/chats/${orderId}`)
      const data = await res.json()
      if (res.ok) {
        setMessages(data.messages)
        setUnread(0)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [orderId])

  // Fetch on open
  useEffect(() => {
    if (open) {
      fetchMessages()
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_chats',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          if (msg.receiver_id === currentUserId && !open) {
            setUnread(u => u + 1)
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId, currentUserId, open, supabase])

  async function handleSend() {
    if (!text.trim() || sending) return
    const msg = text.trim()
    setText('')
    setSending(true)
    try {
      const res = await fetch(`/api/chats/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
      setText(msg)
    } finally {
      setSending(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5 text-primary" />
        Chat with {otherUserName.split(' ')[0]}
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center px-1">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[360px] flex flex-col bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[80vh] sm:max-h-[500px]">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{otherUserName}</p>
                <p className="text-[10px] text-muted-foreground">Order #{orderRef}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(msg => {
                const mine = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      mine
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}>
                      <p className="break-words">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        {mine && msg.read && ' · ✓✓'}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border bg-card rounded-b-2xl">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                placeholder="Type a message… (Enter to send)"
                className="flex-1 resize-none bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 max-h-24 overflow-y-auto"
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-all active:scale-95"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : <Send className="w-4 h-4 text-white" />
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
