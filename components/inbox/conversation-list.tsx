'use client'

import type { Conversation, Platform } from '@/lib/types'
import { PlatformBadge, platformLabel } from './platform-badge'

const FILTERS: { value: Platform | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
]

function timeShort(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

interface Props {
  conversations: Conversation[]
  activeId: string | null
  filter: Platform | 'all'
  onFilterChange: (f: Platform | 'all') => void
  onSelect: (id: string) => void
  loading?: boolean
}

export function ConversationList({ conversations, activeId, filter, onFilterChange, onSelect, loading }: Props) {
  return (
    <div className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-white dark:bg-card border-r border-gray-100 dark:border-border flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-base text-gray-950 dark:text-white tracking-tight">Inbox</h2>
          {conversations.reduce((s, c) => s + c.unread_count, 0) > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {conversations.reduce((s, c) => s + c.unread_count, 0)} unread
            </span>
          )}
        </div>
        {/* Platform filter pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all border ${
                filter === value
                  ? 'bg-gray-950 text-white border-gray-950'
                  : 'bg-white dark:bg-muted text-gray-500 border-gray-200 dark:border-border hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-border/50">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-2.5 bg-gray-100 dark:bg-muted rounded animate-pulse w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
            <p className="font-semibold">No conversations yet</p>
            <p className="text-xs text-gray-300 text-center px-4">Messages from WhatsApp, Instagram & Facebook will appear here</p>
          </div>
        ) : (
          conversations.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-border/50 hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors text-left ${
                activeId === c.id ? 'bg-primary/5 dark:bg-primary/10' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-muted flex items-center justify-center font-bold text-sm text-gray-700 dark:text-gray-300">
                  {c.customer_name.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5">
                  <PlatformBadge platform={c.platform} size="sm" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${c.unread_count > 0 ? 'font-bold text-gray-950 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                    {c.customer_name}
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{timeShort(c.last_message_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className={`text-xs truncate ${c.unread_count > 0 ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
                    {c.last_message}
                  </p>
                  {c.unread_count > 0 && (
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
                      {c.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
