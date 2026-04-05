'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Bell, Loader2, CheckCheck,
  ShoppingBag, Star, MessageCircle, Info, Package,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  read: boolean
  created_at: string
  data: Record<string, string> | null
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  order:   { icon: ShoppingBag, color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
  review:  { icon: Star,        color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/30' },
  message: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  listing: { icon: Package,     color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  info:    { icon: Info,        color: 'text-gray-600',   bg: 'bg-gray-100 dark:bg-muted' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setNotifications((data as Notification[]) || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  async function markAsRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    setMarkingAll(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMarkingAll(false); return }
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <h1 className="font-black text-lg tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
              Mark all read
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No notifications yet</h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6 max-w-xs mx-auto">
              Activity on your listings and orders will appear here.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all text-sm">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info
              const Icon = cfg.icon
              return (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm ${
                    notification.read
                      ? 'bg-white dark:bg-card border-gray-100 dark:border-border opacity-70'
                      : 'bg-white dark:bg-card border-primary/20 shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notification.read ? 'text-gray-700 dark:text-foreground' : 'text-gray-900 dark:text-white'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notification.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 leading-relaxed">
                      {notification.body}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
