'use client'

import { useState, useTransition } from 'react'
import { Star, ThumbsUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Review } from '@/lib/types'

// ─── Star display ──────────────────────────────────────────────────────────────
function StarRow({
  rating,
  size = 16,
  interactive = false,
  onRate,
}: {
  rating: number
  size?: number
  interactive?: boolean
  onRate?: (n: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const display = interactive ? (hovered || rating) : rating

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={`transition-colors duration-100 ${
            n <= display
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted-foreground/30'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => interactive && onRate?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
        />
      ))}
    </div>
  )
}

// ─── Rating bar ────────────────────────────────────────────────────────────────
function RatingBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-muted-foreground text-right">{label}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-muted-foreground">{Math.round(pct)}%</span>
    </div>
  )
}

// ─── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const name = review.profiles?.full_name || 'Anonymous'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const date = new Date(review.created_at).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground break-words min-w-0">{name}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{date}</span>
        </div>
        <StarRow rating={review.rating} size={13} />
        {review.comment && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────
interface ReviewsSectionProps {
  productId: string
  sellerId: string
  initialReviews: Review[]
  currentUserId?: string | null
}

export function ReviewsSection({
  productId,
  sellerId,
  initialReviews,
  currentUserId,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total = reviews.length
  const avg = total
    ? reviews.reduce((s, r) => s + r.rating, 0) / total
    : 0

  const counts = [5, 4, 3, 2, 1].map((n) => ({
    label: String(n),
    pct: total ? (reviews.filter((r) => r.rating === n).length / total) * 100 : 0,
  }))

  const hasReviewed = currentUserId
    ? reviews.some((r) => r.reviewer_id === currentUserId)
    : false

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!currentUserId) {
      toast.error('Please sign in to leave a review')
      return
    }
    if (rating === 0) {
      toast.error('Please select a star rating')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          seller_id: sellerId,
          reviewer_id: currentUserId,
          rating,
          comment: comment.trim() || null,
        })
        .select('*, profiles(*)')
        .single()

      if (error) {
        toast.error('Could not submit review. Please try again.')
        return
      }

      setReviews((prev) => [data as Review, ...prev])
      setRating(0)
      setComment('')
      toast.success('Review submitted — thank you!')
    })
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-6">
        Reviews {total > 0 && <span className="text-muted-foreground font-normal text-base">({total})</span>}
      </h2>

      {/* ── Summary ──────────────────────────────────────────────────── */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 rounded-2xl border border-border bg-secondary/30">
          {/* Big score */}
          <div className="flex flex-col items-center justify-center sm:border-r border-border sm:pr-6 gap-1.5 min-w-[100px]">
            <span className="text-5xl font-black text-foreground">{avg.toFixed(1)}</span>
            <StarRow rating={Math.round(avg)} size={16} />
            <span className="text-xs text-muted-foreground">{total} {total === 1 ? 'review' : 'reviews'}</span>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {counts.map((c) => (
              <RatingBar key={c.label} label={c.label} pct={c.pct} />
            ))}
          </div>
        </div>
      )}

      {/* ── Write a review ───────────────────────────────────────────── */}
      {!hasReviewed && currentUserId !== sellerId && (
        <div className="mb-8 p-5 rounded-2xl border border-border bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {currentUserId ? 'Leave a review' : 'Sign in to leave a review'}
          </h3>

          {currentUserId ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StarRow rating={rating} size={28} interactive onRate={setRating} />
                {rating > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                  </span>
                )}
              </div>
              <Textarea
                placeholder="Share your experience with this product or seller (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none min-h-[90px] text-sm"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{comment.length}/500</span>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending || rating === 0}
                  className="gap-2"
                  size="sm"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-3.5 h-3.5" />
                  )}
                  Submit Review
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              <a href="/auth/login" className="text-primary underline underline-offset-2 font-medium">Sign in</a>
              {' '}to share your experience with this product.
            </p>
          )}
        </div>
      )}

      {hasReviewed && (
        <div className="mb-6 flex items-center gap-2 text-sm text-primary bg-primary/8 px-4 py-2.5 rounded-xl">
          <ThumbsUp className="w-4 h-4" />
          You&apos;ve already reviewed this product.
        </div>
      )}

      {/* ── Review list ──────────────────────────────────────────────── */}
      {total === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium">No reviews yet</p>
          <p className="text-xs mt-1">Be the first to review this product.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  )
}
