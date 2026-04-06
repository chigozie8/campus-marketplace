import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, BadgeCheck, Star, Package, MapPin,
  GraduationCap, MessageCircle, ShoppingBag, User,
} from 'lucide-react'
import { InstagramCTA, FacebookCTA } from '@/components/features/social-cta'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return { title: 'Seller Not Found' }
  const { data } = await supabase.from('profiles').select('full_name, university').eq('id', id).single()
  if (!data) return { title: 'Seller Not Found' }
  return {
    title: `${data.full_name} — Seller on VendoorX`,
    description: `Browse listings from ${data.full_name}${data.university ? ` at ${data.university}` : ''} on VendoorX Campus Marketplace.`,
  }
}

const conditionLabels: Record<string, string> = {
  new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair',
}

export default async function SellerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) notFound()

  const [{ data: profile }, { data: products }, { data: reviews }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('products').select('*, categories(*)').eq('seller_id', id).eq('is_available', true).order('created_at', { ascending: false }),
    supabase.from('reviews').select('id, rating, comment, created_at, profiles!reviewer_id(full_name, avatar_url)').eq('seller_id', id).order('created_at', { ascending: false }),
  ])

  if (!profile) notFound()

  const avgRating = reviews && reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const initials = profile.full_name
    ?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '?'

  const whatsappNumber = profile.whatsapp_number?.replace(/\D/g, '') || ''

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/marketplace" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-black text-base tracking-tight flex-1 truncate">{profile.full_name}</span>
          <Link href="/" className="text-xl font-black tracking-tight text-gray-950 dark:text-white select-none">
            Vendoor<span className="text-primary">X</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Seller hero card */}
        <div className="bg-[#0a0a0a] rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl ring-4 ring-white/10 overflow-hidden bg-white/10 flex-shrink-0">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name || 'Seller'} width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black">{initials}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white font-black text-xl tracking-tight">{profile.full_name}</h1>
                {profile.seller_verified && <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />}
              </div>
              {profile.university && (
                <div className="flex items-center gap-1.5 mt-1">
                  <GraduationCap className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-white/60 text-sm">{profile.university}</span>
                </div>
              )}
              {profile.campus && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-white/60 text-sm">{profile.campus}</span>
                </div>
              )}
              {profile.bio && (
                <p className="text-white/50 text-xs mt-2 leading-relaxed line-clamp-2">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="relative z-10 flex gap-6 mt-5 pt-5 border-t border-white/10">
            {[
              { label: 'Listings', value: (products || []).length },
              { label: 'Sales', value: profile.total_sales || 0 },
              { label: 'Rating', value: avgRating > 0 ? `${avgRating.toFixed(1)}★` : '—' },
              { label: 'Reviews', value: reviews?.length || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-white font-black text-lg leading-none">{value}</span>
                <span className="text-white/40 text-[11px] uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social CTAs */}
        <div className="space-y-2 mb-6">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi! I found you on VendoorX and would like to chat.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#25d366] text-white font-bold text-sm hover:bg-[#1ebe5d] active:scale-[0.98] transition-all shadow-lg shadow-green-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          )}
          {(profile.instagram_handle || profile.facebook_handle) && (
            <div className={`grid gap-2 ${profile.instagram_handle && profile.facebook_handle ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {profile.instagram_handle && (
                <InstagramCTA handle={profile.instagram_handle} variant="primary" label="DM on Instagram" />
              )}
              {profile.facebook_handle && (
                <FacebookCTA handle={profile.facebook_handle} variant="primary" label="Message on Facebook" />
              )}
            </div>
          )}
        </div>

        {/* Listings grid */}
        <div className="mb-4 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-base text-gray-900 dark:text-white">Active Listings</h2>
          <span className="ml-auto text-sm text-gray-500">{(products || []).length} items</span>
        </div>

        {!products || products.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-white">No active listings</p>
            <p className="text-xs text-gray-400 mt-1">This seller has no items listed currently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(products as Product[]).map(product => (
              <Link
                key={product.id}
                href={`/marketplace/${product.id}`}
                className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-muted overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px] font-semibold py-0.5 px-1.5 bg-white/90 text-gray-700 border-0">
                      {conditionLabels[product.condition] || product.condition}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{product.title}</p>
                  <p className="text-sm font-black text-gray-950 dark:text-white mt-0.5">₦{product.price.toLocaleString()}</p>
                  {product.categories?.name && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{product.categories.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Reviews section */}
        {reviews && reviews.length > 0 && (
          <div className="mt-8 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <h2 className="font-black text-base text-gray-900 dark:text-white tracking-tight">
                Reviews
              </h2>
              <span className="ml-auto text-sm text-gray-500">{avgRating.toFixed(1)} avg · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Rating breakdown */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-4">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-2 mb-1.5 last:mb-0">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>

            {/* Individual review cards */}
            <div className="space-y-3">
              {(reviews as Array<{
                id: string
                rating: number
                comment: string | null
                created_at: string
                profiles: { full_name: string | null; avatar_url: string | null } | null
              }>).map(review => {
                const reviewer = review.profiles
                const reviewerName = reviewer?.full_name || 'Anonymous'
                const reviewerInitials = reviewerName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                return (
                  <div key={review.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 dark:bg-muted flex-shrink-0 flex items-center justify-center">
                        {reviewer?.avatar_url ? (
                          <Image src={reviewer.avatar_url} alt={reviewerName} width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-black text-gray-500">{reviewerInitials || <User className="w-4 h-4 text-gray-400" />}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Name + stars + date */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{reviewerName}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(review.created_at)}</span>
                        </div>
                        {/* Stars */}
                        <div className="flex gap-0.5 mt-0.5 mb-1.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200 dark:fill-muted dark:text-muted'}`} />
                          ))}
                        </div>
                        {/* Comment */}
                        {review.comment ? (
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No comment left</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
