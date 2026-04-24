'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  Bell, BadgeCheck, XCircle, ShoppingBag, MessageCircle,
  Tag, Star, Loader2, CheckCheck, X, ArrowRight, Info,
  Package, Truck, CheckCircle2, RefreshCcw, Shield,
  AlertTriangle, Wallet, Crown, MapPin, Zap, Flag,
  Award, ThumbsUp, Gift,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotificationSound } from '@/hooks/use-notification-sound'
import { formatDistanceToNow } from 'date-fns'
import { m, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion'

interface Notification {
  id: string; type: string; title: string; body: string | null
  read: boolean; data: Record<string, unknown> | null; created_at: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; dot: string }> = {
  /* ── Verification ── */
  verification_approved:  { icon: BadgeCheck,    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/50', dot: 'bg-emerald-500' },
  verification_rejected:  { icon: XCircle,        color: 'text-red-500 dark:text-red-400',         bg: 'bg-red-100 dark:bg-red-950/50',         dot: 'bg-red-500' },
  /* ── Orders ── */
  new_order:              { icon: ShoppingBag,    color: 'text-blue-600 dark:text-blue-400',        bg: 'bg-blue-100 dark:bg-blue-950/50',        dot: 'bg-blue-500' },
  order_paid:             { icon: CheckCircle2,   color: 'text-emerald-600 dark:text-emerald-400',  bg: 'bg-emerald-100 dark:bg-emerald-950/50',  dot: 'bg-emerald-500' },
  order_shipped:          { icon: Truck,          color: 'text-sky-600 dark:text-sky-400',          bg: 'bg-sky-100 dark:bg-sky-950/50',          dot: 'bg-sky-500' },
  order_delivered:        { icon: Package,        color: 'text-violet-600 dark:text-violet-400',    bg: 'bg-violet-100 dark:bg-violet-950/50',    dot: 'bg-violet-500' },
  order_completed:        { icon: CheckCircle2,   color: 'text-emerald-600 dark:text-emerald-400',  bg: 'bg-emerald-100 dark:bg-emerald-950/50',  dot: 'bg-emerald-500' },
  order_cancelled:        { icon: XCircle,        color: 'text-red-500 dark:text-red-400',          bg: 'bg-red-100 dark:bg-red-950/50',          dot: 'bg-red-500' },
  /* ── Messages ── */
  new_message:            { icon: MessageCircle,  color: 'text-violet-600 dark:text-violet-400',    bg: 'bg-violet-100 dark:bg-violet-950/50',    dot: 'bg-violet-500' },
  new_chat_message:       { icon: MessageCircle,  color: 'text-violet-600 dark:text-violet-400',    bg: 'bg-violet-100 dark:bg-violet-950/50',    dot: 'bg-violet-500' },
  /* ── Disputes ── */
  dispute_opened:         { icon: AlertTriangle,  color: 'text-amber-600 dark:text-amber-400',      bg: 'bg-amber-100 dark:bg-amber-950/50',      dot: 'bg-amber-500' },
  dispute_resolved:       { icon: Shield,         color: 'text-blue-600 dark:text-blue-400',        bg: 'bg-blue-100 dark:bg-blue-950/50',        dot: 'bg-blue-500' },
  /* ── Financial ── */
  refund_processed:       { icon: RefreshCcw,     color: 'text-teal-600 dark:text-teal-400',        bg: 'bg-teal-100 dark:bg-teal-950/50',        dot: 'bg-teal-500' },
  wallet_credit:          { icon: Wallet,         color: 'text-emerald-600 dark:text-emerald-400',  bg: 'bg-emerald-100 dark:bg-emerald-950/50',  dot: 'bg-emerald-500' },
  wallet_debit:           { icon: Wallet,         color: 'text-orange-600 dark:text-orange-400',    bg: 'bg-orange-100 dark:bg-orange-950/50',    dot: 'bg-orange-500' },
  /* ── Trust & Badges ── */
  system:                 { icon: Flag,           color: 'text-red-500 dark:text-red-400',          bg: 'bg-red-100 dark:bg-red-950/50',          dot: 'bg-red-500' },
  badge_assigned:         { icon: Award,          color: 'text-amber-600 dark:text-amber-400',      bg: 'bg-amber-100 dark:bg-amber-950/50',      dot: 'bg-amber-500' },
  /* ── Offers ── */
  offer:                  { icon: ThumbsUp,       color: 'text-blue-600 dark:text-blue-400',        bg: 'bg-blue-100 dark:bg-blue-950/50',        dot: 'bg-blue-500' },
  new_offer:              { icon: ThumbsUp,       color: 'text-blue-600 dark:text-blue-400',        bg: 'bg-blue-100 dark:bg-blue-950/50',        dot: 'bg-blue-500' },
  offer_accepted:         { icon: CheckCircle2,   color: 'text-emerald-600 dark:text-emerald-400',  bg: 'bg-emerald-100 dark:bg-emerald-950/50',  dot: 'bg-emerald-500' },
  offer_declined:         { icon: XCircle,        color: 'text-red-500 dark:text-red-400',          bg: 'bg-red-100 dark:bg-red-950/50',          dot: 'bg-red-500' },
  /* ── Listings & Promotions ── */
  new_listing:            { icon: Tag,            color: 'text-sky-600 dark:text-sky-400',          bg: 'bg-sky-100 dark:bg-sky-950/50',          dot: 'bg-sky-500' },
  flash_sale:             { icon: Zap,            color: 'text-amber-600 dark:text-amber-400',      bg: 'bg-amber-100 dark:bg-amber-950/50',      dot: 'bg-amber-500' },
  /* ── Loyalty & Rewards ── */
  loyalty:                { icon: Gift,           color: 'text-purple-600 dark:text-purple-400',    bg: 'bg-purple-100 dark:bg-purple-950/50',    dot: 'bg-purple-500' },
  loyalty_points:         { icon: Gift,           color: 'text-purple-600 dark:text-purple-400',    bg: 'bg-purple-100 dark:bg-purple-950/50',    dot: 'bg-purple-500' },
  /* ── Reviews ── */
  review:                 { icon: Star,           color: 'text-amber-500 dark:text-amber-400',      bg: 'bg-amber-100 dark:bg-amber-950/50',      dot: 'bg-amber-500' },
  /* ── Delivery ── */
  delivery_otp_sent:      { icon: Package,        color: 'text-violet-600 dark:text-violet-400',    bg: 'bg-violet-100 dark:bg-violet-950/50',    dot: 'bg-violet-500' },
  location_update:        { icon: MapPin,         color: 'text-sky-600 dark:text-sky-400',          bg: 'bg-sky-100 dark:bg-sky-950/50',          dot: 'bg-sky-500' },
  /* ── VIP & Admin ── */
  vip:                    { icon: Crown,          color: 'text-amber-600 dark:text-amber-400',      bg: 'bg-amber-100 dark:bg-amber-950/50',      dot: 'bg-amber-500' },
  /* ── Generic ── */
  info:                   { icon: Info,           color: 'text-gray-500 dark:text-gray-400',        bg: 'bg-gray-100 dark:bg-muted',              dot: 'bg-gray-400' },
}

function getConfig(type: string) { return TYPE_CONFIG[type] ?? TYPE_CONFIG.info }
function timeAgo(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }) } catch { return '' }
}

export function NotificationBell() {
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(true)
  const [markingAll, setMarkingAll]       = useState(false)
  const [mounted, setMounted]             = useState(false)
  const [dropTop, setDropTop]             = useState(0)
  const [dropRight, setDropRight]         = useState(16)
  const [dropWidth, setDropWidth]         = useState(368)
  // Bumps every time a brand-new notification arrives, used to (re)trigger
  // the bell-shake + badge-pop animations.
  const [pulseKey, setPulseKey]           = useState(0)
  const { playNotification }             = useNotificationSound()

  const buttonRef = useRef<HTMLButtonElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => setMounted(true), [])

  const calcPos = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const vw   = window.innerWidth
    setDropTop(rect.bottom + 8)
    setDropRight(Math.max(16, vw - rect.right))
    setDropWidth(Math.min(368, vw - 32))
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setNotifications((await res.json()).notifications ?? [])
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const supabase    = createClient()
    const channelName = `notifications-bell-${crypto.randomUUID()}`
    let channelRef: ReturnType<typeof supabase.channel> | null = null
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active || !session?.user) return
      const userId = session.user.id
      channelRef = supabase.channel(channelName)
        // New notification arrives → prepend, ping sound, trigger pop animation.
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${userId}`,
        }, payload => {
          if (!active) return
          const incoming = payload.new as Notification
          // Only pulse + sound when this is a genuinely new row (not a
          // duplicate delivery from a websocket reconnect).
          setNotifications(p => {
            if (p.some(n => n.id === incoming.id)) return p
            if (!incoming.read) {
              setPulseKey(k => k + 1)
              playNotification()
            }
            return [incoming, ...p]
          })
        })
        // Notification updated (e.g. marked read in another tab) → sync row.
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${userId}`,
        }, payload => {
          if (!active) return
          const updated = payload.new as Notification
          setNotifications(p => p.map(n => n.id === updated.id ? { ...n, ...updated } : n))
        })
        // Notification deleted elsewhere → drop it.
        .on('postgres_changes', {
          event: 'DELETE', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${userId}`,
        }, payload => {
          if (!active) return
          const old = payload.old as { id?: string }
          if (old?.id) setNotifications(p => p.filter(n => n.id !== old.id))
        })
        .subscribe()
    }).catch(() => {})

    // Resync whenever the user comes back to the tab. Fixes "stale count
    // after a delay" — websockets can sleep on backgrounded tabs and we
    // want the badge to be accurate the moment focus returns.
    const onVisible = () => { if (document.visibilityState === 'visible') fetchNotifications() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', fetchNotifications)
    window.addEventListener('online', fetchNotifications)

    // Safety-net polling, faster than before so the count never drifts.
    const iv = setInterval(fetchNotifications, 15_000)
    return () => {
      active = false
      clearInterval(iv)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', fetchNotifications)
      window.removeEventListener('online', fetchNotifications)
      if (channelRef) supabase.removeChannel(channelRef)
    }
  }, [fetchNotifications, playNotification])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.closest('[data-notif-root]')?.contains(e.target as Node)) {
        const overlay = document.getElementById('notif-overlay')
        if (overlay && overlay.contains(e.target as Node)) return
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    calcPos()
    window.addEventListener('resize', calcPos)
    window.addEventListener('scroll', calcPos, { passive: true })
    return () => { window.removeEventListener('resize', calcPos); window.removeEventListener('scroll', calcPos) }
  }, [open, calcPos])

  useEffect(() => {
    if (open && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function markOneRead(id: string) {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))
    await fetch('/api/notifications/mark-read', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  async function markAllRead() {
    if (!unread) return
    setMarkingAll(true)
    setNotifications(p => p.map(n => ({ ...n, read: true })))
    await fetch('/api/notifications/mark-all-read', { method: 'POST' }).catch(() => {})
    setMarkingAll(false)
  }

  const sharedProps = { notifications, loading, unread, markingAll, markAllRead, markOneRead, onClose: () => setOpen(false) }

  return (
    <LazyMotion features={domAnimation}>
    <div data-notif-root="" className="relative">

      <button
        ref={buttonRef}
        onClick={() => { calcPos(); setOpen(o => !o) }}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        {/* Bell — gently shakes whenever a fresh, unread notification lands. */}
        <m.span
          key={`bell-${pulseKey}`}
          animate={pulseKey > 0 ? {
            rotate: [0, -18, 14, -10, 6, -3, 0],
            transition: { duration: 0.7, ease: 'easeInOut' },
          } : { rotate: 0 }}
          style={{ transformOrigin: '50% 10%', display: 'inline-block' }}
        >
          <Bell className={`w-5 h-5 transition-colors ${
            unread > 0
              ? 'text-[#16a34a] dark:text-[#22c55e]'
              : 'text-gray-500 dark:text-gray-400'
          }`} />
        </m.span>

        {/* Outward expanding pulse ring on new notification. */}
        <AnimatePresence>
          {pulseKey > 0 && (
            <m.span
              key={`ring-${pulseKey}`}
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 m-auto w-5 h-5 rounded-full bg-red-500/40"
              style={{ filter: 'blur(0.5px)' }}
            />
          )}
        </AnimatePresence>

        {/* Badge — pops/bounces in & morphs as the count changes. */}
        <AnimatePresence>
          {unread > 0 && (
            <m.span
              key="badge"
              initial={{ scale: 0, rotate: -120, opacity: 0 }}
              animate={{
                scale: pulseKey > 0
                  ? [1.6, 0.85, 1.15, 1]
                  : 1,
                rotate: 0,
                opacity: 1,
              }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.18 } }}
              transition={{
                type: 'spring',
                stiffness: 520,
                damping: 18,
                duration: pulseKey > 0 ? 0.55 : undefined,
              }}
              className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-black bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full px-1 leading-none border-2 border-white dark:border-background shadow-lg shadow-red-500/40"
            >
              <m.span
                key={`count-${unread}`}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.22 }}
              >
                {unread > 9 ? '9+' : unread}
              </m.span>
            </m.span>
          )}
        </AnimatePresence>
      </button>

      {mounted && open && createPortal(
        <div id="notif-overlay">
          <div className="sm:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              style={{ zIndex: 99998 }}
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '85svh', zIndex: 99999 }}
            >
              <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-muted" />
              </div>
              <PanelContent {...sharedProps} />
            </div>
          </div>

          <div className="hidden sm:block">
            <div
              className="fixed flex flex-col bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden"
              style={{ top: dropTop, right: dropRight, width: dropWidth, maxHeight: 520, zIndex: 99999 }}
            >
              <PanelContent {...sharedProps} />
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
    </LazyMotion>
  )
}

interface PanelProps {
  notifications: Notification[]; loading: boolean; unread: number; markingAll: boolean
  markAllRead: () => void; markOneRead: (id: string) => void; onClose: () => void
}

function PanelContent({ notifications, loading, unread, markingAll, markAllRead, markOneRead, onClose }: PanelProps) {
  return (
    <>
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-700 dark:text-white" />
          <span className="font-black text-sm text-gray-900 dark:text-white">Notifications</span>
          {unread > 0 && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#16a34a]/10 text-[#16a34a]">
              {unread} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} disabled={markingAll}
              className="flex items-center gap-1 text-[11px] font-bold text-[#16a34a] hover:underline disabled:opacity-50">
              {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
              Mark all read
            </button>
          )}
          <button onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-muted text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">All caught up!</p>
            <p className="text-xs text-gray-400">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-border">
            {notifications.map(n => {
              const cfg = getConfig(n.type)
              const Icon = cfg.icon
              const href = typeof n.data?.url === 'string' ? n.data.url : null

              const inner = (
                <div
                  className={`flex gap-3 px-4 py-3.5 transition-colors ${
                    n.read
                      ? 'hover:bg-gray-50 dark:hover:bg-muted/20'
                      : 'bg-[#16a34a]/5 dark:bg-[#16a34a]/10 hover:bg-[#16a34a]/8 dark:hover:bg-[#16a34a]/15'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className={`text-[13px] font-bold leading-snug flex-1 min-w-0 ${
                        n.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                      }`}>{n.title}</p>
                      {!n.read && <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />}
                    </div>
                    {n.body && (
                      <p className={`text-[12px] leading-relaxed mt-0.5 break-words ${
                        n.read ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>{n.body}</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1.5 tabular-nums">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              )

              return href ? (
                <Link
                  key={n.id}
                  href={href}
                  onClick={() => { if (!n.read) markOneRead(n.id); onClose() }}
                  className="block cursor-pointer"
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={n.id}
                  onClick={() => { if (!n.read) markOneRead(n.id) }}
                  className="cursor-default"
                >
                  {inner}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 dark:border-border">
          <Link href="/notifications" onClick={onClose}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-[#16a34a] hover:bg-[#16a34a]/10 transition-colors">
            View all notifications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </>
  )
}
