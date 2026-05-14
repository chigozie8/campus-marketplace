'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Tag, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { m, AnimatePresence } from 'framer-motion'

export function OffersBadge() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    setMounted(true)
    fetchUnreadOffers()
    setupRealtimeListener()

    const handleVisibility = () => {
      if (!document.hidden) {
        fetchUnreadOffers()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  async function fetchUnreadOffers() {
    try {
      const supabase = supabaseRef.current
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('read', false)
        .in('type', ['offer', 'new_offer'])

      if (!error) {
        setUnreadCount(data?.length || 0)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  function setupRealtimeListener() {
    const supabase = supabaseRef.current
    const channel = supabase
      .channel('offers-badge')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `type=in.(offer,new_offer)`,
        },
        () => {
          fetchUnreadOffers()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  if (!mounted) return null

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  return (
    <Link
      href="/dashboard/offers"
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-muted transition-colors group"
    >
      <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors" />

      <AnimatePresence>
        {unreadCount > 0 && (
          <m.div
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {displayCount}
          </m.div>
        )}
      </AnimatePresence>
    </Link>
  )
}
