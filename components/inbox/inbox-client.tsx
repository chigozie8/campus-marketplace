'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { VendorSidebar } from '@/components/vendor/vendor-sidebar'
import { ConversationList } from './conversation-list'
import { ChatWindow } from './chat-window'
import { CustomerPanel } from './customer-panel'
import { ArrowLeft } from 'lucide-react'
import type { Conversation, Platform } from '@/lib/types'
import { useNotificationSound } from '@/hooks/use-notification-sound'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initials: string
  fullName: string
  email: string
  products: { id: string; title: string; price: number; images: string[] | null }[]
  userId: string
}

export function InboxClient({ initials, fullName, email, products, userId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Platform | 'all'>('all')
  const { playWhatsApp } = useNotificationSound()
  const supabase = createClient()
  const prevConvIds = useRef<Set<string>>(new Set())

  // ── Load conversations from Supabase ────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id, platform, customer_name, customer_phone, last_message,
        last_message_at, unread_count, seller_id,
        conversation_messages (
          id, conversation_id, direction, content, created_at, platform
        )
      `)
      .or(`seller_id.eq.${userId},seller_id.is.null`)
      .order('last_message_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[inbox] load error:', error)
      setLoading(false)
      return
    }

    if (data && data.length > 0) {
      const mapped: Conversation[] = data.map((c) => ({
        id: c.id,
        platform: c.platform as Conversation['platform'],
        customer_name: c.customer_name,
        customer_phone: c.customer_phone ?? undefined,
        last_message: c.last_message ?? '',
        last_message_at: c.last_message_at ?? new Date().toISOString(),
        unread_count: c.unread_count ?? 0,
        messages: (c.conversation_messages ?? []).map((m: {
          id: string; conversation_id: string; direction: string;
          content: string; created_at: string; platform: string
        }) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          direction: m.direction as 'incoming' | 'outgoing',
          content: m.content,
          created_at: m.created_at,
          platform: m.platform as Conversation['platform'],
        })),
      }))
      setConversations(mapped)
      data.forEach((c) => prevConvIds.current.add(c.id))
    }
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // ── Realtime: subscribe to new/updated conversations ────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('inbox-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        async (payload) => {
          const updated = payload.new as Conversation & { id: string }
          if (!updated?.id) return

          // Fetch full conversation with messages
          const { data } = await supabase
            .from('conversations')
            .select(`
              id, platform, customer_name, customer_phone, last_message,
              last_message_at, unread_count,
              conversation_messages (
                id, conversation_id, direction, content, created_at, platform
              )
            `)
            .eq('id', updated.id)
            .single()

          if (!data) return

          const mapped: Conversation = {
            id: data.id,
            platform: data.platform as Conversation['platform'],
            customer_name: data.customer_name,
            customer_phone: data.customer_phone ?? undefined,
            last_message: data.last_message ?? '',
            last_message_at: data.last_message_at ?? new Date().toISOString(),
            unread_count: data.unread_count ?? 0,
            messages: (data.conversation_messages ?? []).map((m: {
              id: string; conversation_id: string; direction: string;
              content: string; created_at: string; platform: string
            }) => ({
              id: m.id,
              conversation_id: m.conversation_id,
              direction: m.direction as 'incoming' | 'outgoing',
              content: m.content,
              created_at: m.created_at,
              platform: m.platform as Conversation['platform'],
            })),
          }

          const isNew = !prevConvIds.current.has(data.id)
          if (isNew) {
            prevConvIds.current.add(data.id)
            playWhatsApp()
            setConversations((prev) => [mapped, ...prev])
          } else {
            setConversations((prev) =>
              prev.map((c) => c.id === data.id ? mapped : c)
            )
            if (data.unread_count > 0 && data.id !== activeId) {
              playWhatsApp()
            }
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, activeId, playWhatsApp])

  // ── Send message (store + sync) ─────────────────────────────────────────────
  async function sendMessage(content: string) {
    const active = conversations.find((c) => c.id === activeId)
    if (!active || !content.trim()) return

    const optimistic = {
      id: `opt-${Date.now()}`,
      conversation_id: active.id,
      direction: 'outgoing' as const,
      content,
      created_at: new Date().toISOString(),
      platform: active.platform,
    }

    setConversations((prev) => prev.map((c) =>
      c.id === active.id
        ? { ...c, messages: [...c.messages, optimistic], last_message: content, last_message_at: optimistic.created_at }
        : c
    ))

    await supabase.from('conversation_messages').insert({
      conversation_id: active.id,
      direction: 'outgoing',
      content,
      platform: active.platform,
    })

    await supabase.from('conversations').update({
      last_message: content,
      last_message_at: new Date().toISOString(),
      unread_count: 0,
    }).eq('id', active.id)
  }

  function markRead(id: string) {
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, unread_count: 0 } : c))
    supabase.from('conversations').update({ unread_count: 0 }).eq('id', id).then(() => {})
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0)
  const active = conversations.find((c) => c.id === activeId) || null
  const filtered = filter === 'all' ? conversations : conversations.filter((c) => c.platform === filter)

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-background">
      <div className="flex h-screen overflow-hidden">
        <VendorSidebar initials={initials} fullName={fullName} email={email} unreadInbox={totalUnread} />

        <div className="flex-1 md:ml-60 flex overflow-hidden">

          <div className={`${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 flex-shrink-0`}>
            <ConversationList
              conversations={filtered}
              activeId={activeId}
              filter={filter}
              onFilterChange={setFilter}
              onSelect={(id) => { setActiveId(id); markRead(id) }}
              loading={loading}
            />
          </div>

          <div className={`${activeId ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
            {activeId && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border-b border-gray-100 dark:border-border md:hidden">
                <button
                  onClick={() => setActiveId(null)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-white hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to inbox
                </button>
              </div>
            )}
            <ChatWindow
              conversation={active}
              onSend={sendMessage}
              products={products}
            />
          </div>

          {active && (
            <div className="hidden lg:block">
              <CustomerPanel conversation={active} products={products} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
