import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Star, BadgeCheck, MessageCircle, Package, Zap, GraduationCap } from 'lucide-react'
import type { Product, Profile } from '@/lib/types'
import { ShareButton } from '@/components/product/product-interactions'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getSellerBySlug(slug: string) {
  const supabase = await createClient()
  if (!supabase) return null

  const idPrefix = slug.slice(-6)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .ilike('id', `${idPrefix}%`)
    .limit(1)

  const seller = profiles?.[0] as Profile | undefined
  if (!seller) return null

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('seller_id', seller.id)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  return { seller, products: (products || []) as Product[] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getSellerBySlug(slug)
  if (!result) return { title: 'Store not found — VendoorX' }

  const { seller } = result
  const name = seller.full_name || 'Seller'
  const location = seller.campus || seller.university || 'Nigeria'
  const description = seller.bio
    || `Shop ${name}'s listings on VendoorX — verified seller in ${location}.`
  const storeUrl = `https://vendoorx.ng/store/${slug}`

  return {
    title: `${name}'s Store — VendoorX`,
    description,
    alternates: { canonical: storeUrl },
    openGraph: {
      title: `${name}'s Store on VendoorX`,
      description,
      url: storeUrl,
      type: 'website',
      siteName: 'VendoorX',
      locale: 'en_NG',
      images: seller.avatar_url
        ? [{ url: seller.avatar_url, width: 400, height: 400, alt: `${name} on VendoorX` }]
        : [{ url: 'https://vendoorx.ng/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary',
      title: `${name}'s Store on VendoorX`,
      description,
      site: '@vendoorx',
    },
  }
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params
  const result = await getSellerBySlug(slug)
  if (!result) notFound()

  const { seller, products } = result
  const name = seller.full_name || 'Seller'
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  const whatsappNumber = seller.whatsapp_number?.replace(/\D/g, '') || ''

  const storeSchemaUrl = `https://vendoorx.ng/store/${slug}`
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${storeSchemaUrl}#page`,
        url: storeSchemaUrl,
        name: `${name}'s Store on VendoorX`,
        description: seller.bio || `Verified seller on VendoorX`,
        inLanguage: 'en-NG',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vendoorx.ng' },
            { '@type': 'ListItem', position: 2, name: 'Marketplace', item: 'https://vendoorx.ng/marketplace' },
            { '@type': 'ListItem', position: 3, name: `${name}'s Store`, item: storeSchemaUrl },
          ],
        },
      },
      {
        '@type': 'Person',
        '@id': `${storeSchemaUrl}#seller`,
        name,
        url: storeSchemaUrl,
        image: seller.avatar_url || undefined,
        description: seller.bio || undefined,
        worksFor: {
          '@type': 'Organization',
          name: 'VendoorX',
          url: 'https://vendoorx.ng',
        },
      },
    ],
  }

  const storeBoostExpiry = (seller as Record<string, unknown>).store_boost_expires_at as string | undefined
  const isStoreFeatured = !!storeBoostExpiry && new Date(storeBoostExpiry) > new Date()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
        {/* Top nav */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/marketplace" className="text-xl font-black tracking-tight">
              Vendoor<span className="text-primary">X</span>
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Join for free
            </Link>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

          {/* Featured Store banner */}
          {isStoreFeatured && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary/10 to-emerald-50 dark:from-primary/15 dark:to-emerald-950/20 border border-primary/20">
              <Zap className="w-4 h-4 text-primary flex-shrink-0 fill-primary" />
              <p className="text-xs font-bold text-primary">Featured Store — verified top seller on VendoorX</p>
            </div>
          )}

          {/* Seller profile card */}
          <div className={`bg-white dark:bg-card rounded-2xl border p-5 ${isStoreFeatured ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'}`}>
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-primary">{initials}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-lg font-black text-foreground">{name}</h1>
                  {seller.seller_verified && (
                    <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                  {seller.is_student_verified && (
                    <span
                      title={`Verified ${seller.university || 'seller'}`}
                      className="flex items-center gap-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 px-1.5 py-0.5 rounded-full"
                    >
                      <GraduationCap className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  {isStoreFeatured && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
                      <Zap className="w-2.5 h-2.5 fill-white" /> Featured
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {seller.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold">{seller.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {(seller.campus || seller.university) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {seller.campus || seller.university}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="w-3 h-3" />
                    {products.length} listing{products.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {seller.bio && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{seller.bio}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat
                  </a>
                )}
                <ShareButton title={`${name}'s Store on VendoorX`} />
              </div>
            </div>
          </div>

          {/* Listings */}
          <div>
            <h2 className="text-sm font-black text-foreground mb-3">
              {products.length > 0 ? `Available (${products.length})` : 'No listings yet'}
            </h2>

            {products.length === 0 ? (
              <div className="bg-white dark:bg-card rounded-2xl border border-border p-10 text-center">
                <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No items listed yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((product) => {
                  const image = product.images?.[0]
                  const discount = product.original_price && product.original_price > product.price
                    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                    : 0
                  return (
                    <Link
                      key={product.id}
                      href={`/marketplace/${product.id}`}
                      className="bg-white dark:bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                        {image ? (
                          <img src={image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                        {discount > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg">
                            -{discount}%
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{product.title}</p>
                        <p className="text-sm font-black text-foreground">₦{product.price.toLocaleString()}</p>
                        {product.original_price && product.original_price > product.price && (
                          <p className="text-[10px] text-muted-foreground line-through">₦{product.original_price.toLocaleString()}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-3">
              Want to start selling? It's 100% free.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Start selling on VendoorX →
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}
