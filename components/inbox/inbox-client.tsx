'use client'

import { useState } from 'react'
import { VendorSidebar } from '@/components/vendor/vendor-sidebar'
import { ConversationList } from './conversation-list'
import { ChatWindow } from './chat-window'
import { CustomerPanel } from './customer-panel'
import type { Conversation, Platform } from '@/lib/types'

// --- Demo data (replace with real API integration) ---
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: '1', platform: 'whatsapp', customer_name: 'Amaka Obi',
    customer_phone: '+2348012345678', last_message: 'Is this still available?',
    last_message_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(), unread_count: 2,
    messages: [
      { id: 'm1', conversation_id: '1', direction: 'incoming', content: 'Hello, is this item still available?', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), platform: 'whatsapp' },
      { id: 'm2', conversation_id: '1', direction: 'outgoing', content: 'Yes it is! Are you interested?', created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(), platform: 'whatsapp' },
      { id: 'm3', conversation_id: '1', direction: 'incoming', content: 'Is this still available?', created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(), platform: 'whatsapp' },
    ],
  },
  {
    id: '2', platform: 'instagram', customer_name: 'Tunde Bello',
    last_message: 'Can I get a discount?', last_message_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), unread_count: 0,
    messages: [
      { id: 'm4', conversation_id: '2', direction: 'incoming', content: 'Hi! Saw your product on IG. Can I get a discount?', created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), platform: 'instagram' },
      { id: 'm5', conversation_id: '2', direction: 'outgoing', content: 'Hey! Best I can do is 5% off for first order.', created_at: new Date(Date.now() - 1000 * 60 * 17).toISOString(), platform: 'instagram' },
      { id: 'm6', conversation_id: '2', direction: 'incoming', content: 'Can I get a discount?', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), platform: 'instagram' },
    ],
  },
  {
    id: '3', platform: 'facebook', customer_name: 'Ngozi Adeyemi',
    last_message: 'What is the delivery time?', last_message_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), unread_count: 1,
    messages: [
      { id: 'm7', conversation_id: '3', direction: 'incoming', content: 'Hello! What is the delivery time for this product?', created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(), platform: 'facebook' },
      { id: 'm8', conversation_id: '3', direction: 'outgoing', content: 'Delivery is same day on campus, 1-2 days off campus.', created_at: new Date(Date.now() - 1000 * 60 * 47).toISOString(), platform: 'facebook' },
      { id: 'm9', conversation_id: '3', direction: 'incoming', content: 'What is the delivery time?', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), platform: 'facebook' },
    ],
  },
  {
    id: '4', platform: 'whatsapp', customer_name: 'Chidi Eze',
    last_message: 'I will take 2 pieces', last_message_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), unread_count: 0,
    messages: [
      { id: 'm10', conversation_id: '4', direction: 'incoming', content: 'Do you do bulk orders?', created_at: new Date(Date.now() - 1000 * 60 * 100).toISOString(), platform: 'whatsapp' },
      { id: 'm11', conversation_id: '4', direction: 'outgoing', content: 'Yes! I offer 10% off for 5+ items.', created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(), platform: 'whatsapp' },
      { id: 'm12', conversation_id: '4', direction: 'incoming', content: 'I will take 2 pieces', created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), platform: 'whatsapp' },
    ],
  },
  {
    id: '5', platform: 'instagram', customer_name: 'Blessing Okoro',
    last_message: 'Sent you a DM on IG!', last_message_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), unread_count: 3,
    messages: [
      { id: 'm13', conversation_id: '5', direction: 'incoming', content: 'Sent you a DM on IG!', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), platform: 'instagram' },
    ],
  },
]

interface Props {
  initials: string
  fullName: string
  email: string
  products: { id: string; title: string; price: number; images: string[] | null }[]
}

export function InboxClient({ initials, fullName, email, products }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(DEMO_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Platform | 'all'>('all')

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0)
  const active = conversations.find(c => c.id === activeId) || null

  const filtered = filter === 'all'
    ? conversations
    : conversations.filter(c => c.platform === filter)

  function sendMessage(content: string) {
    if (!active || !content.trim()) return
    const msg = {
      id: `m${Date.now()}`,
      conversation_id: active.id,
      direction: 'outgoing' as const,
      content,
      created_at: new Date().toISOString(),
      platform: active.platform,
    }
    setConversations(prev => prev.map(c =>
      c.id === active.id
        ? { ...c, messages: [...c.messages, msg], last_message: content, last_message_at: msg.created_at }
        : c
    ))
  }

  function markRead(id: string) {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c))
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-background">
      <div className="flex h-screen overflow-hidden">
        <VendorSidebar initials={initials} fullName={fullName} email={email} unreadInbox={totalUnread} />

        {/* Inbox 3-panel layout */}
        <div className="flex-1 md:ml-60 flex overflow-hidden mt-0">

          {/* Left: conversation list */}
          <ConversationList
            conversations={filtered}
            activeId={activeId}
            filter={filter}
            onFilterChange={setFilter}
            onSelect={(id) => { setActiveId(id); markRead(id) }}
          />

          {/* Center: chat window */}
          <ChatWindow
            conversation={active}
            onSend={sendMessage}
            products={products}
          />

          {/* Right: customer panel (desktop only) */}
          {active && (
            <CustomerPanel conversation={active} products={products} />
          )}
        </div>
      </div>
    </div>
  )
}
