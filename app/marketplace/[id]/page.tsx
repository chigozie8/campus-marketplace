import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  MessageCircle,
  Instagram,
  Facebook,
  MapPin,
  Eye,
  BadgeCheck,
  Star,
  ShoppingBag,
  Heart,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'
import { ProductJsonLd } from '@/components/seo/product-jsonld'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*, profiles(*), categories(*)')
    .eq('id', id)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const p = product as Product
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vendoorx.com'
  const imageUrl = p.images?.[0] || `${siteUrl}/og-image.png`

  return {
    title: `${p.title} - ₦${p.price.toLocaleString()}`,
    description: p.description || `Buy ${p.title} for ₦${p.price.toLocaleString()} from a verified student seller on VendoorX. ${p.condition === 'new' ? 'Brand new condition.' : ''} Contact directly on WhatsApp.`,
    keywords: [p.title, p.categories?.name || '', 'campus marketplace', 'student seller', 'buy on campus'],
    openGraph: {
      title: `${p.title} - ₦${p.price.toLocaleString()} | VendoorX`,
      description: p.description || `Buy ${p.title} from a verified student seller`,
      type: 'website',
      url: `${siteUrl}/marketplace/${id}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: p.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${p.title} - ₦${p.price.toLocaleString()}`,
      description: p.description || `Buy from a student seller on VendoorX`,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${siteUrl}/marketplace/${id}`,
    },
  }
}

const conditionLabels = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, profiles(*), categories(*)')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  const p = product as Product

  const whatsappNumber = p.profiles?.whatsapp_number?.replace(/\D/g, '') || ''
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi! I'm interested in "${p.title}" listed on CampusCart for ₦${p.price.toLocaleString()}`
    : '#'

  const sellerName = p.profiles?.full_name || 'Unknown Seller'
  const sellerRating = p.profiles?.rating || 0
  const isVerified = p.profiles?.seller_verified || false

  const imageUrl = p.images?.[0] || `/placeholder.svg?height=500&width=600`

  return (
    <>
      <ProductJsonLd product={p} />
      <div className="min-h-screen bg-background">
        {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/marketplace">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 hero-gradient rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-base hidden sm:block">Campus<span className="text-primary">Cart</span></span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary/30">
              <Image
                src={imageUrl}
                alt={p.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {p.is_featured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                </div>
              )}
            </div>

            {/* Thumbnail strip if multiple images */}
            {p.images && p.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {p.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                    <Image src={img} alt={`${p.title} ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {p.categories?.name && (
                  <Badge variant="secondary" className="text-xs">{p.categories.name}</Badge>
                )}
                <Badge className="text-xs bg-secondary text-secondary-foreground">
                  {conditionLabels[p.condition]}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{p.views} views</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance leading-tight mb-3">
                {p.title}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">₦{p.price.toLocaleString()}</span>
                {p.original_price && p.original_price > p.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">₦{p.original_price.toLocaleString()}</span>
                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950/30 text-xs">
                      {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% off
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Location */}
            {(p.campus || p.location) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{[p.campus, p.location].filter(Boolean).join(' · ')}</span>
              </div>
            )}

            {/* Description */}
            {p.description && (
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            )}

            {/* Seller info */}
            <div className="p-4 rounded-xl border border-border bg-secondary/30">
              <h3 className="font-semibold text-sm text-foreground mb-3">Seller</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {sellerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm text-foreground">{sellerName}</span>
                    {isVerified && <BadgeCheck className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {sellerRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-muted-foreground">{sellerRating.toFixed(1)}</span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {p.profiles?.total_sales || 0} sales
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social CTAs */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full whatsapp-green border-0 h-12 text-base font-semibold"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </a>
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-10 instagram-gradient border-0"
                  asChild
                >
                  <a href={`https://instagram.com`} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 facebook-blue border-0"
                  asChild
                >
                  <a href={`https://facebook.com`} target="_blank" rel="noopener noreferrer">
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  )
}
