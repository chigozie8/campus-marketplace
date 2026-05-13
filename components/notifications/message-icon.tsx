'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { MessageCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { m, AnimatePresence } from 'framer-motion'

export function MessageIcon() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const prevCountRef = useRef(0)

  useEffect(() => setMounted(true), [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/chats/unread')
      if (res.ok) {
        const data = await res.json()
        const newCount = data.unreadCount ?? 0
        
        // Only trigger animation if count actually increased
        if (newCount > prevCountRef.current) {
          setPulseKey(k => k + 1)
        }
        prevCountRef.current = newCount
        setUnreadCount(newCount)
      }
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    const supabase = createClient()
    const channelName = `message-icon-${crypto.randomUUID()}`
    let channelRef: ReturnType<typeof supabase.channel> | null = null
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active || !session?.user) return
      const userId = session.user.id
      
      channelRef = supabase.channel(channelName)
        // New message inserted
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'order_chats',
          filter: `receiver_id=eq.${userId}`,
        }, () => {
          if (!active) return
          fetchUnreadCount()
        })
        // Message marked as read
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_chats',
          filter: `receiver_id=eq.${userId}`,
        }, () => {
          if (!active) return
          fetchUnreadCount()
        })
        .subscribe()
    }).catch(() => {})

    // Resync when tab visibility changes
    const onVisible = () => { 
      if (document.visibilityState === 'visible') fetchUnreadCount() 
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', fetchUnreadCount)
    window.addEventListener('online', fetchUnreadCount)

    // Safety-net polling
    const iv = setInterval(fetchUnreadCount, 15_000)
    
    return () => {
      active = false
      clearInterval(iv)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', fetchUnreadCount)
      window.removeEventListener('online', fetchUnreadCount)
      if (channelRef) supabase.removeChannel(channelRef)
    }
  }, [fetchUnreadCount])

  return (
    <Link href="/dashboard/orders" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-muted transition-colors">
      {/* Message Icon — changes color when there are unread messages */}
      <m.span
        key={`icon-${pulseKey}`}
        animate={pulseKey > 0 ? {
          scale: [1, 1.2, 1],
          transition: { duration: 0.5, ease: 'easeInOut' },
        } : { scale: 1 }}
      >
        <MessageCircle className={`w-5 h-5 transition-colors ${
          unreadCount > 0
            ? 'text-[#16a34a] dark:text-[#22c55e]'
            : 'text-gray-600 dark:text-gray-400'
        }`} />
      </m.span>

      {/* Badge — shows unread count with animation */}
      <AnimatePresence>
        {unreadCount > 0 && (
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
              key={`count-${unreadCount}`}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.22 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </m.span>
          </m.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
