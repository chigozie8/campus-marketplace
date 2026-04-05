'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, Eye, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type Props = {
  productId: string
  initialViews: number
  initialLikes: number
  initialLiked: boolean
  whatsappUrl: string
  whatsappMessage: string
}

export function ProductInteractions({
  productId,
  initialViews,
  initialLikes,
  initialLiked,
  whatsappUrl,
  whatsappMessage,
}: Props) {
  const [views, setViews] = useState(initialViews)
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initialLiked)
  const [likeLoading, setLikeLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [viewCounted, setViewCounted] = useState(false)

  // Get current user
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // Increment view once on mount
  useEffect(() => {
    if (viewCounted) return
    setViewCounted(true)
    fetch(`/api/products/${productId}/view`, { method: 'POST' })
      .then(() => setViews(v => v + 1))
      .catch(() => {/* silent */})
  }, [productId, viewCounted])

  const handleLike = useCallback(async () => {
    if (likeLoading) return
    if (!userId) {
      toast.error('Sign in to save favourites')
      return
    }

    setLikeLoading(true)
    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikes(l => wasLiked ? l - 1 : l + 1)

    try {
      const res = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      // Sync with server response
      setLiked(json.liked)
      setLikes(json.count)
    } catch {
      // Revert optimistic update
      setLiked(wasLiked)
      setLikes(l => wasLiked ? l + 1 : l - 1)
      toast.error('Could not update favourite. Try again.')
    } finally {
      setLikeLoading(false)
    }
  }, [liked, likeLoading, productId, userId])

  function handleWhatsApp() {
    // Track click in background
    fetch(`/api/products/${productId}/whatsapp`, { method: 'POST' }).catch(() => {})
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" />
          <span className="tabular-nums">{views.toLocaleString()}</span>
          <span>view{views !== 1 ? 's' : ''}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="tabular-nums">{likes.toLocaleString()}</span>
          <span>save{likes !== 1 ? 's' : ''}</span>
        </span>
      </div>

      {/* WhatsApp CTA */}
      <button
        onClick={handleWhatsApp}
        className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20c05c] active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/25 transition-all hover:-translate-y-0.5"
      >
        <MessageCircle className="w-5 h-5" />
        Chat on WhatsApp
      </button>

      {/* Like / Save button */}
      <button
        onClick={handleLike}
        disabled={likeLoading}
        className={`w-full h-11 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
          liked
            ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400'
            : 'border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:border-red-200 hover:bg-red-50/50 hover:text-red-500'
        }`}
      >
        <Heart
          className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : ''} ${likeLoading ? 'animate-pulse' : ''}`}
        />
        {liked ? 'Saved to favourites' : 'Save to favourites'}
      </button>
    </div>
  )
}

// Standalone like button for use in listing cards / marketplace grid
export function LikeButton({ productId, size = 'sm' }: { productId: string; size?: 'sm' | 'md' }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid) {
        fetch(`/api/products/${productId}/like?userId=${uid}`)
          .then(r => r.json())
          .then(j => { setLiked(j.liked); setLikes(j.count) })
          .catch(() => {})
      } else {
        fetch(`/api/products/${productId}/like`)
          .then(r => r.json())
          .then(j => setLikes(j.count))
          .catch(() => {})
      }
    })
  }, [productId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    if (!userId) { toast.error('Sign in to save'); return }
    setLoading(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikes(l => wasLiked ? l - 1 : l + 1)
    try {
      const res = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const json = await res.json()
      setLiked(json.liked)
      setLikes(json.count)
    } catch {
      setLiked(wasLiked)
      setLikes(l => wasLiked ? l + 1 : l - 1)
    } finally {
      setLoading(false)
    }
  }

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1 rounded-full px-2 py-1 transition-all ${
        liked
          ? 'bg-red-50 text-red-500 dark:bg-red-950/30'
          : 'bg-black/20 text-white hover:bg-red-50 hover:text-red-500'
      }`}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <Heart className={`${iconSize} ${liked ? 'fill-red-500' : ''} ${loading ? 'animate-pulse' : ''}`} />
      {likes > 0 && <span className={`${size === 'sm' ? 'text-[10px]' : 'text-xs'} font-semibold`}>{likes}</span>}
    </button>
  )
}
