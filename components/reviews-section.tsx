'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Loader2, Send, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

interface Props {
  productId: string
  sellerId: string
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform active:scale-90"
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              i <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })
}

export function ReviewsSection({ productId, sellerId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const fetchReviews = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    setReviews((data as Review[]) || [])
    setLoading(false)
  }, [productId])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id)
        supabase
          .from('reviews')
          .select('id')
          .eq('product_id', productId)
          .eq('reviewer_id', user.id)
          .maybeSingle()
          .then(({ data }) => setAlreadyReviewed(!!data))
      }
    })
    fetchReviews()
  }, [productId, fetchReviews])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a star rating'); return }
    if (!currentUserId) { toast.error('Sign in to leave a review'); return }
    if (currentUserId === sellerId) { toast.error('You cannot review your own listing'); return }

    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      seller_id: sellerId,
      reviewer_id: currentUserId,
      rating,
      comment: comment.trim() || null,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Review submitted!')
      setRating(0)
      setComment('')
      setAlreadyReviewed(true)
      fetchReviews()
    }
    setSubmitting(false)
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg text-foreground">Reviews</h3>
        {reviews.length > 0 && (
          <span className="text-sm text-muted-foreground">
            ({reviews.length}) &middot; {avgRating.toFixed(1)}
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline ml-0.5 mb-0.5" />
          </span>
        )}
      </div>

      {/* Submit form */}
      {currentUserId && !alreadyReviewed && currentUserId !== sellerId && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5 mb-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Leave a Review</p>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Share your experience with this seller or item… (optional)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{comment.length}/500</span>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex items-center gap-2 bg-[#0a0a0a] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 active:scale-95 disabled:opacity-50 transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {alreadyReviewed && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">You have already reviewed this listing.</p>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          No reviews yet. Be the first to review this listing.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => {
            const initials = review.profiles?.full_name
              ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
            return (
              <div key={review.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 overflow-hidden">
                    {review.profiles?.avatar_url
                      ? <img src={review.profiles.avatar_url} alt={initials} className="w-full h-full object-cover" />
                      : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {review.profiles?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                    </div>
                    <div className="flex gap-0.5 mt-1 mb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-600'}`} />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-muted-foreground leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
