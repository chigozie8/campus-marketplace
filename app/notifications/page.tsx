'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Bell, Loader2, CheckCheck,
  ShoppingBag, Star, MessageCircle, Info, Package,
  BellOff, Sparkles, Tag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LottiePlayer } from '@/components/ui/lottie-player'

// Bundled locally in /public/lottie/ — avoids the LottieFiles CDN's missing
// CORS header. If anything ever goes wrong, the static <BellOff/> fallback
// below renders instead, so the empty state always works.
const EMPTY_BELL_LOTTIE = '/lottie/empty-notifications.json'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  read: boolean
  created_at: string
  data: Record<string, string> | null
}

const TYPE_CONFIG: Record<string, {
  icon: React.ElementType
  color: string
  bg: string
  ring: string
  dot: string
  label: string
}> = {
  order: {
    icon: ShoppingBag,
    color: 'text-sky-600',
    bg: 'bg-sky-500',
    ring: 'ring-sky-200 dark:ring-sky-800',
    dot: 'bg-sky-500',
    label: 'Order',
  },
  review: {
    icon: Star,
    color: 'text-amber-600',
    bg: 'bg-amber-500',
    ring: 'ring-amber-200 dark:ring-amber-800',
    dot: 'bg-amber-500',
    label: 'Review',
  },
  message: {
    icon: MessageCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Message',
  },
  listing: {
    icon: Package,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500',
    ring: 'ring-indigo-200 dark:ring-indigo-800',
    dot: 'bg-indigo-500',
    label: 'Listing',
  },
  offer: {
    icon: Tag,
    color: 'text-blue-600',
    bg: 'bg-blue-500',
    ring: 'ring-blue-200 dark:ring-blue-800',
    dot: 'bg-blue-500',
    label: 'Offer',
  },
  new_offer: {
    icon: Tag,
    color: 'text-blue-600',
    bg: 'bg-blue-500',
    ring: 'ring-blue-200 dark:ring-blue-800',
    dot: 'bg-blue-500',
    label: 'New Offer',
  },
  offer_accepted: {
    icon: Tag,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Offer Accepted',
  },
  offer_declined: {
    icon: Tag,
    color: 'text-red-600',
    bg: 'bg-red-500',
    ring: 'ring-red-200 dark:ring-red-800',
    dot: 'bg-red-500',
    label: 'Offer Declined',
  },
  info: {
    icon: Info,
    color: 'text-gray-500',
    bg: 'bg-gray-500',
    ring: 'ring-gray-200 dark:ring-gray-700',
    dot: 'bg-gray-400',
    label: 'Info',
  },
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
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

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

  async function handleNotificationClick(n: Notification) {
    // Mark as read in the background — don't block navigation
    if (!n.read) {
      const supabase = createClient()
      supabase.from('notifications').update({ read: true }).eq('id', n.id).then(() => {})
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    }

    // Resolve a destination URL: prefer data.url, then fall back to a
    // sensible page based on the notification type so offer/order/etc.
    // notifications always land somewhere useful.
    const explicitUrl = typeof n.data?.url === 'string' ? n.data.url : null
    const fallbackByType: Record<string, string> = {
      offer: '/dashboard/offers',
      new_offer: '/dashboard/offers',
      offer_accepted: '/dashboard/offers',
      offer_declined: '/dashboard/offers',
      order: '/dashboard/orders',
      review: '/dashboard',
      message: '/dashboard',
      listing: '/dashboard',
    }
    const target = explicitUrl || fallbackByType[n.type] || null
    if (target) router.push(target)
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
  const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications

  return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-background">
      {/* ── Hero Header ── */}
      <div className="bg-[#0a0a0a] pt-safe relative overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Green glow */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#16a34a]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/2 w-48 h-48 bg-[#16a34a]/10 rounded-full blur-2xl pointer-events-none -translate-x-1/2" />

        <div className="relative z-10 max-w-2xl mx-auto px-4">
          {/* Top bar */}
          <div className="h-14 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-xs font-bold text-[#4ade80] hover:text-[#22c55e] transition-colors disabled:opacity-50 bg-[#16a34a]/20 px-3 py-1.5 rounded-full"
              >
                {markingAll
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCheck className="w-3.5 h-3.5" />
                }
                Mark all read
              </button>
            )}
          </div>

          {/* Title area */}
          <div className="pb-6 pt-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                  Notifications
                </h1>
                <p className="text-white/40 text-xs mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
              {unreadCount > 0 && (
                <div className="ml-auto">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#16a34a] text-white text-xs font-black shadow-lg shadow-[#16a34a]/40">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 pb-4">
            {(['all', 'unread'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-[#16a34a] text-white shadow-lg shadow-[#16a34a]/30'
                    : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white'
                }`}
              >
                {f === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border flex items-center justify-center shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-[#16a34a]" />
            </div>
            <p className="text-sm text-gray-400">Loading notifications…</p>
          </div>
        ) : displayed.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="relative mb-5">
              <LottiePlayer
                src={EMPTY_BELL_LOTTIE}
                className="w-32 h-32 flex items-center justify-center"
                fallback={
                  <div className="w-20 h-20 rounded-3xl bg-[#0a0a0a] flex items-center justify-center shadow-xl shadow-black/20">
                    <BellOff className="w-9 h-9 text-white/30" />
                  </div>
                }
              />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#16a34a] flex items-center justify-center shadow-md shadow-[#16a34a]/40">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1.5 tracking-tight">
              {filter === 'unread' ? 'No unread notifications' : 'Nothing here yet'}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              {filter === 'unread'
                ? 'You\'ve read all your notifications. Great job staying on top!'
                : 'Activity from your listings, orders, and messages will appear here.'}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white font-bold px-6 py-3 rounded-2xl hover:bg-gray-800 transition-all text-sm shadow-lg shadow-black/10 hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayed.map((notification, index) => {
              const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info
              const Icon = cfg.icon
              const isNew = index === 0 && !notification.read

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left group transition-all duration-200 ${
                    notification.read
                      ? 'opacity-60 hover:opacity-80'
                      : 'hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                    notification.read
                      ? 'bg-white dark:bg-card border-gray-100 dark:border-border'
                      : 'bg-white dark:bg-card border-[#16a34a]/20 shadow-md shadow-[#16a34a]/5'
                  }`}>
                    {/* Unread indicator strip */}
                    {!notification.read && (
                      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-[#16a34a]" />
                    )}

                    {/* Icon */}
                    <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notification.read ? 'bg-gray-100 dark:bg-muted' : `${cfg.bg} shadow-lg`
                    }`}>
                      <Icon className={`w-5 h-5 ${notification.read ? 'text-gray-400' : 'text-white'}`} />
                      {isNew && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#16a34a] border-2 border-white dark:border-card animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={`text-sm font-bold leading-snug ${
                          notification.read
                            ? 'text-gray-600 dark:text-foreground'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </p>
                        <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5 tabular-nums">
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground leading-relaxed">
                        {notification.body}
                      </p>
                      {/* Type badge */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          notification.read
                            ? 'bg-gray-100 dark:bg-muted text-gray-400'
                            : `bg-[#16a34a]/10 text-[#16a34a]`
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-400' : cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-[#16a34a] flex-shrink-0 mt-2 shadow-sm shadow-[#16a34a]/50" />
                    )}
                  </div>
                </button>
              )
            })}

            {/* Footer hint */}
            {displayed.length > 0 && (
              <p className="text-center text-xs text-gray-400 pt-4 pb-2">
                {filter === 'all' ? `Showing all ${displayed.length} notification${displayed.length > 1 ? 's' : ''}` : `${unreadCount} unread`}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
