'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, BadgeCheck, XCircle, ShoppingBag, MessageCircle, Tag, Star, Loader2, Check, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  verification_approved: { icon: BadgeCheck,     color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  verification_rejected: { icon: XCircle,         color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-950/30' },
  new_order:             { icon: ShoppingBag,     color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/30' },
  new_message:           { icon: MessageCircle,   color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-950/30' },
  new_listing:           { icon: Tag,             color: 'text-sky-600',     bg: 'bg-sky-50 dark:bg-sky-950/30' },
  review:                { icon: Star,            color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30' },
}

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-muted' }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const json = await res.json()
        setNotifications(json.notifications ?? [])
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchNotifications()

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    })

    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markOneRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  async function markAllRead() {
    if (unread === 0) return
    setMarkingAll(true)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await fetch('/api/notifications/mark-all-read', { method: 'POST' }).catch(() => {})
    setMarkingAll(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-black bg-red-500 text-white rounded-full px-0.5 leading-none border border-white dark:border-background shadow">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-card rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/40 border border-gray-100 dark:border-border z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-700 dark:text-white" />
              <span className="font-black text-sm text-gray-900 dark:text-white">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline disabled:opacity-50"
              >
                {markingAll
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <CheckCheck className="w-3 h-3" />
                }
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">All caught up!</p>
                <p className="text-xs text-gray-400">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-border">
                {notifications.map(n => {
                  const cfg = getConfig(n.type)
                  const Icon = cfg.icon
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markOneRead(n.id)}
                      className={`flex gap-3 px-4 py-3.5 transition-colors cursor-pointer group ${
                        n.read
                          ? 'hover:bg-gray-50 dark:hover:bg-muted/30'
                          : 'bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-50/60 dark:hover:bg-blue-950/20'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-[13px] font-bold leading-tight ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        {n.body && (
                          <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-border">
              <p className="text-[11px] text-center text-gray-400">
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
