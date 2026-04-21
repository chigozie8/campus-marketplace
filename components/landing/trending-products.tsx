import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'

type TrendingProduct = {
  id: string
  title: string
  price: number
  images: string[] | null
  category: string | null
  views: number | null
  seller_id: string
}

/**
 * "Trending on campus right now" strip — proves there's a real marketplace
 * behind the marketing copy. Pulled server-side via service-role to bypass
 * RLS, capped at 8 items, ordered by views desc + recency. Whole section
 * disappears cleanly if no products exist yet.
 *
 * Uses the parent route's `revalidate = 300` cadence (5-minute cache) to
 * avoid hammering Supabase on every visit.
 */
export async function TrendingProducts() {
  const sc = createServiceClient()
  if (!sc) return null

  const { data } = await sc
    .from('products')
    .select('id, title, price, images, category, views, seller_id')
    .eq('is_available', true)
    .order('views', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(8)

  const products = (data as TrendingProduct[] | null) ?? []
  if (products.length === 0) return null

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-[0.18em] mb-3 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp className="w-3.5 h-3.5" />
              Trending right now
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight text-balance">
              What students are <span className="text-primary">buying today</span>
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all whitespace-nowrap"
          >
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map(p => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className="relative aspect-square bg-muted overflow-hidden">
                {p.images?.[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                  {p.title}
                </p>
                <p className="text-sm sm:text-base font-black text-primary mt-1.5">
                  ₦{Number(p.price ?? 0).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-6 flex justify-center">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20"
          >
            See the full marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
