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
  instagramHandle?: string | null
  facebookHandle?: string | null
}

export function ProductInteractions({
  productId,
  productTitle,
  initialViews,
  initialLikes,
  initialLiked,
  whatsappUrl,
  instagramHandle,
  facebookHandle,
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
        return
      } catch (err) {
        // User cancelled the share sheet — do nothing
        if (err instanceof Error && err.name === 'AbortError') return
        // Other error — fall through to clipboard copy
      }
    }
    // clipboard.writeText requires document focus; use execCommand as fallback
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch {
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

      {/* Instagram + Facebook CTAs */}
      {(instagramHandle || facebookHandle) && (
        <div className={`grid gap-2 ${instagramHandle && facebookHandle ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {instagramHandle && (
            <a
              href={`https://ig.me/m/${instagramHandle.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-purple-500/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Instagram
            </a>
          )}
          {facebookHandle && (
            <a
              href={`https://m.me/${facebookHandle.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.98] transition-all shadow-md shadow-blue-500/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Messenger
            </a>
          )}
        </div>
      )}

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
      } catch (err) {
        // User cancelled the share sheet — do nothing
        if (err instanceof Error && err.name === 'AbortError') return
        // Other error — fall through to copy
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
