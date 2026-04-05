'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Heart, Eye, MessageCircle, Share2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type Props = {
  productId: string
  productTitle: string
  initialViews: number
  initialLikes: number
  initialLiked: boolean
  whatsappUrl: string
  whatsappMessage: string
}

export function ProductInteractions({
  productId,
  productTitle,
  initialViews,
  initialLikes,
  initialLiked,
  whatsappUrl,
}: Props) {
  const [views, setViews] = useState(initialViews)
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initialLiked)
  const [likeLoading, setLikeLoading] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const viewedRef = useRef(false)

  // Resolve auth once on mount
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setAuthReady(true)
    })
  }, [])

  // Increment view count once
  useEffect(() => {
    if (viewedRef.current) return
    viewedRef.current = true
    fetch(`/api/products/${productId}/view`, { method: 'POST' })
      .then(() => setViews(v => v + 1))
      .catch(() => {})
  }, [productId])

  const handleLike = useCallback(async () => {
    if (likeLoading || !authReady) return

    if (!userId) {
      toast.error('Sign in to save to your wishlist', {
        action: { label: 'Sign in', onClick: () => window.location.href = '/auth/login' },
      })
      return
    }

    setLikeLoading(true)
    const wasLiked = liked
    // Optimistic update
    setLiked(!wasLiked)
    setLikes(l => wasLiked ? l - 1 : l + 1)

    try {
      const res = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Request failed')
      setLiked(json.liked)
      setLikes(json.count)
      toast.success(json.liked ? '❤️ Added to wishlist' : 'Removed from wishlist')
    } catch (err) {
      // Revert
      setLiked(wasLiked)
      setLikes(l => wasLiked ? l + 1 : l - 1)
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Couldn't update wishlist: ${msg}`)
    } finally {
      setLikeLoading(false)
    }
  }, [liked, likeLoading, authReady, productId, userId])

  function handleWhatsApp() {
    if (!whatsappUrl || whatsappUrl === '#') {
      toast.error("This seller hasn't added their WhatsApp number yet")
      return
    }
    fetch(`/api/products/${productId}/whatsapp`, { method: 'POST' }).catch(() => {})
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: productTitle, text: `Check out this listing on VendoorX: ${productTitle}`, url })
      } catch {
        // User cancelled or share failed — fall through to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url)
          toast.success('Link copied to clipboard!')
        }
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } else {
      // Last resort fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      toast.success('Link copied!')
    }
  }

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" />
          <span className="tabular-nums font-medium">{views.toLocaleString()}</span>
          <span>{views === 1 ? 'view' : 'views'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="tabular-nums font-medium">{likes.toLocaleString()}</span>
          <span>{likes === 1 ? 'save' : 'saves'}</span>
        </span>
      </div>

      {/* WhatsApp CTA */}
      <button
        onClick={handleWhatsApp}
        className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20c05c] active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
      >
        <MessageCircle className="w-5 h-5" />
        Chat on WhatsApp
      </button>

      {/* Save + Share row */}
      <div className="grid grid-cols-2 gap-2">
        {/* Save / Wishlist */}
        <button
          onClick={handleLike}
          disabled={likeLoading || !authReady}
          className={`h-11 rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 ${
            liked
              ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400'
              : 'border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:border-red-200 hover:bg-red-50/50 hover:text-red-500'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              liked ? 'fill-red-500 text-red-500 scale-110' : ''
            } ${likeLoading ? 'animate-pulse' : ''}`}
          />
          {liked ? 'Saved' : 'Wishlist'}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="h-11 rounded-xl border-2 border-gray-200 dark:border-border text-sm font-semibold text-gray-700 dark:text-foreground flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98]"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  )
}

// ─── Standalone share button for product page header ───────────────────────
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Check this out on VendoorX: ${title}`, url })
        return
      } catch {
        // cancelled or unsupported — fall through
      }
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors text-gray-500 hover:text-primary"
      aria-label="Share"
    >
      {copied
        ? <Check className="w-4 h-4 text-green-500" />
        : <Share2 className="w-4 h-4" />
      }
    </button>
  )
}

// ─── Standalone like button for marketplace grid cards ─────────────────────
export function LikeButton({ productId, size = 'sm' }: { productId: string; size?: 'sm' | 'md' }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      const url = uid
        ? `/api/products/${productId}/like?userId=${uid}`
        : `/api/products/${productId}/like`
      fetch(url).then(r => r.json()).then(j => {
        if (uid) setLiked(j.liked)
        setLikes(j.count)
      }).catch(() => {})
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
