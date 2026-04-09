'use client'

import { useEffect, useState, useCallback } from 'react'
import { MessageCircle, Search, RefreshCw, Loader2, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

interface ChatMessage {
  id: string
  order_id: string
  sender_id: string
  receiver_id: string
  message: string
  read: boolean
  created_at: string
}

interface Conversation {
  orderId: string
  messages: ChatMessage[]
  lastMessage: ChatMessage
  unread: number
}

export default function AdminChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Record<string, string>>({})

  const fetchChats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/chats')
      const data = await res.json()
      if (res.ok) {
        setConversations(data.conversations ?? [])
        // Collect all user IDs
        const ids = new Set<string>()
        data.conversations?.forEach((c: Conversation) => {
          c.messages.forEach((m: ChatMessage) => {
            ids.add(m.sender_id)
            ids.add(m.receiver_id)
          })
        })
        if (ids.size > 0) {
          const { data: profileData } = await adminDb
            .from('profiles')
            .select('id, full_name')
            .in('id', [...ids])
          if (profileData) {
            const map: Record<string, string> = {}
            profileData.forEach(p => { map[p.id] = p.full_name ?? 'Unknown' })
            setProfiles(map)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchChats() }, [fetchChats])

  const filtered = conversations.filter(c =>
    !search || c.orderId.toLowerCase().includes(search.toLowerCase()) ||
    c.messages.some(m => m.message.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Chat Monitor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All buyer-seller conversations across orders</p>
        </div>
        <button onClick={fetchChats} disabled={loading} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID or message…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold text-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-1">Buyer-seller chats will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(conv => (
            <div key={conv.orderId} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setExpanded(e => e === conv.orderId ? null : conv.orderId)}
                className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground truncate">
                      Order #{conv.orderId.slice(0, 8).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {conv.unread > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-black">
                          {conv.unread} unread
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(conv.lastMessage.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </span>
                      {expanded === conv.orderId
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      }
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    <span className="font-medium text-foreground">
                      {profiles[conv.lastMessage.sender_id] ?? 'User'}:
                    </span>{' '}
                    {conv.lastMessage.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>

              {expanded === conv.orderId && (
                <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-2.5 max-h-72 overflow-y-auto">
                  {conv.messages.map(msg => {
                    const senderName = profiles[msg.sender_id] ?? 'User'
                    return (
                      <div key={msg.id} className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-primary">
                          {senderName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-xs font-bold text-foreground">{senderName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(msg.created_at).toLocaleString('en-NG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                            </p>
                            {!msg.read && (
                              <span className="text-[9px] font-bold text-amber-500 uppercase">unread</span>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-0.5 break-words">{msg.message}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
