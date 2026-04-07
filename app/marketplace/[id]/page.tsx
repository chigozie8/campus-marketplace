import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, BadgeCheck, Star,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import { ProductJsonLd } from '@/components/seo/product-jsonld'
import { ProductInteractions } from '@/components/product/product-interactions'
import { ShareButton } from '@/components/product/share-button'
import { ProductGallery } from '@/components/product/product-gallery'
import { ReviewsSection } from '@/components/marketplace/reviews-section'
import { MakeOfferDialog } from '@/components/product/make-offer-dialog'
import { ReportDialog } from '@/components/product/report-dialog'
import { ProductBuyButton } from '@/components/features/product-buy-button'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return { title: 'Product Not Found' }

  const { data: product } = await supabase
    .from('products').select('*, profiles(*), categories(*)')
    .eq('id', id).single()

  if (!product) return { title: 'Product Not Found | VendoorX', robots: { index: false, follow: false } }

  const p = product as Product
  const imageUrl = p.images?.[0] || `${SITE_URL}/og-image.png`
  const sellerName = p.profiles?.full_name || 'Student Seller'
  const conditionMap: Record<string, string> = {
    new: 'Brand new', like_new: 'Like new', good: 'Good condition', fair: 'Fair condition',
  }
  const conditionLabel = conditionMap[p.condition] || 'Good condition'
  const categoryName = p.categories?.name || 'Campus Item'
  const campus = p.campus || p.location || 'Nigerian campus'
  const title = `${p.title} — ₦${p.price.toLocaleString()} | ${categoryName} on VendoorX`
  const description = p.description
    ? `${p.description.slice(0, 140)}… Buy from ${sellerName} on VendoorX — WhatsApp direct, zero fees.`
    : `Buy ${p.title} (${conditionLabel}) for ₦${p.price.toLocaleString()} from ${sellerName} at ${campus}. Contact on WhatsApp.`

  return {
    title,
    description,
    keywords: [p.title, categoryName, campus, 'campus marketplace', 'student seller Nigeria', SITE_NAME],
    authors: [{ name: sellerName }],
    openGraph: {
      title, description, type: 'website',
      url: `${SITE_URL}/marketplace/${id}`, siteName: SITE_NAME, locale: 'en_NG',
      images: [{ url: imageUrl, width: 800, height: 600, alt: p.title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl], site: '@vendoorx' },
    alternates: { canonical: `${SITE_URL}/marketplace/${id}` },
    robots: { index: p.is_available, follow: true, googleBot: { index: p.is_available, follow: true, 'max-image-preview': 'large' } },
  }
}

const conditionConfig = {
  new:      { label: 'Brand New',  color: 'bg-green-50 text-green-700 border-green-200' },
  like_new: { label: 'Like New',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  good:     { label: 'Good',       color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  fair:     { label: 'Fair',       color: 'bg-orange-50 text-orange-700 border-orange-200' },
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) notFound()

  const [{ data: product, error }, sessionResult, { data: reviewsData }] = await Promise.all([
    supabase.from('products').select('*, profiles(*), categories(*)').eq('id', id).single(),
    supabase.auth.getUser(),
    supabase
      .from('reviews')
      .select('*, profiles!reviews_reviewer_id_fkey(full_name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (error || !product) notFound()

  const p = product as Product
  const userId = sessionResult.data.user?.id ?? null
  const initialReviews = (reviewsData ?? []) as import('@/lib/types').Review[]

  // Get likes count and whether the current user liked it
  const { count: likesCount } = await supabase
    .from('favorites').select('*', { count: 'exact', head: true }).eq('product_id', id)

  let initialLiked = false
  if (userId) {
    const { data: fav } = await supabase
      .from('favorites').select('id').eq('product_id', id).eq('user_id', userId).maybeSingle()
    initialLiked = !!fav
  }

  const whatsappNumber = p.profiles?.whatsapp_number?.replace(/\D/g, '') || ''
  const whatsappMessage = `Hi! I'm interested in "${p.title}" listed on VendoorX for ₦${p.price.toLocaleString()}`
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : '#'

  const sellerName = p.profiles?.full_name || 'Unknown Seller'
  const sellerRating = p.profiles?.rating || 0
  const isVerified = p.profiles?.seller_verified || false
  const cond = conditionConfig[p.condition] || conditionConfig.good

  return (
    <>
      <ProductJsonLd product={p} />
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link href="/marketplace"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="text-sm font-semibold text-gray-600 dark:text-muted-foreground hidden sm:block truncate max-w-[240px]">
                {p.title}
              </span>
            </div>
            <Link href="/" className="text-xl font-black tracking-tight text-gray-950 dark:text-white select-none">
              Vendoor<span className="text-primary">X</span>
            </Link>
            <ShareButton title={p.title} />
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Left: Gallery ── */}
            <div className="lg:col-span-3 space-y-3">
              <ProductGallery images={p.images ?? []} title={p.title} isFeatured={p.is_featured} />
            </div>

            {/* ── Right: Info + Actions ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {p.categories?.name && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {p.categories.name}
                  </span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cond.color}`}>
                  {cond.label}
                </span>
                {!p.is_available && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-muted text-gray-500 dark:text-muted-foreground">
                    Sold
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white leading-tight">
                  {p.title}
                </h1>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
                    ₦{p.price.toLocaleString()}
                  </span>
                  {p.original_price && p.original_price > p.price && (
                    <>
                      <span className="text-base text-gray-400 dark:text-muted-foreground line-through">
                        ₦{p.original_price.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                        {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Location */}
              {(p.campus || p.location) && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{[p.campus, p.location].filter(Boolean).join(' · ')}</span>
                </div>
              )}

              {/* Delivery fee badge */}
              {p.is_available && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground">
                  <span>🚚</span>
                  {(p as any).delivery_fee
                    ? <span>Delivery: <strong className="text-gray-900 dark:text-white">₦{Number((p as any).delivery_fee).toLocaleString()}</strong></span>
                    : <span className="text-emerald-600 font-semibold">Free delivery</span>
                  }
                  <span className="text-gray-300 dark:text-gray-600 mx-1">·</span>
                  <span>₦100 platform fee</span>
                </div>
              )}

              {/* ── Primary CTA: Buy Now ── */}
              {p.is_available && (
                <div className="space-y-2">
                  <ProductBuyButton
                    product={{ id: p.id, title: p.title, price: p.price, images: p.images, delivery_fee: (p as any).delivery_fee ?? null }}
                    className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
                  />
                  <p className="text-xs text-center text-gray-400 dark:text-muted-foreground">
                    Secure checkout · Pay with card, transfer or USSD
                  </p>
                </div>
              )}

              {/* Dynamic: views, likes, WhatsApp, Instagram, Facebook, save button */}
              <ProductInteractions
                productId={p.id}
                productTitle={p.title}
                initialViews={p.views ?? 0}
                initialLikes={likesCount ?? 0}
                initialLiked={initialLiked}
                whatsappUrl={whatsappUrl}
                whatsappMessage={whatsappMessage}
                instagramHandle={p.profiles?.instagram_handle ?? null}
                facebookHandle={p.profiles?.facebook_handle ?? null}
              />

              {/* Description */}
              {p.description && (
                <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-4">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-gray-700 dark:text-muted-foreground leading-relaxed whitespace-pre-line">
                    {p.description}
                  </p>
                </div>
              )}

              {/* Seller card */}
              <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-4">
                <h3 className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-3">Seller</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{sellerName}</span>
                      {isVerified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {sellerRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-gray-500">{sellerRating.toFixed(1)}</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-400">
                        {p.profiles?.total_sales || 0} sales
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Make an Offer */}
              {p.is_available && (
                <MakeOfferDialog
                  productId={p.id}
                  productTitle={p.title}
                  listingPrice={p.price}
                  sellerId={p.seller_id}
                  currentUserId={userId}
                />
              )}

              {/* Safety tip */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30">
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  <span className="font-bold">Stay safe:</span> Always meet in a public place on campus and inspect items before paying. Never send money without seeing the item first.
                </p>
              </div>

              {/* Report listing */}
              <div className="flex justify-center">
                <ReportDialog
                  productId={p.id}
                  productTitle={p.title}
                  currentUserId={userId}
                />
              </div>

            </div>
          </div>

          {/* Reviews section — full width below the grid */}
          <div className="mt-10 max-w-2xl">
            <ReviewsSection
              productId={p.id}
              sellerId={p.seller_id}
              initialReviews={initialReviews}
              currentUserId={userId}
            />
          </div>
        </main>
      </div>
    </>
  )
}
