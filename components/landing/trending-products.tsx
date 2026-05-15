import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { getTrendingProducts, type TrendingProduct } from '@/lib/cached-data'

/**
 * "Trending on campus right now" strip — proves there's a real marketplace
 * behind the marketing copy. Uses cached data fetching to ensure the section
 * keeps working even when the database is temporarily unavailable.
 *
 * Capped at 8 items, ordered by views desc + recency. Whole section
 * disappears cleanly if no products exist yet.
 */
export async function TrendingProducts() {
  const products = await getTrendingProducts(8)
  if (products.length === 0) return null

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-background">
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
              href={`/marketplace/${p.id}`}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-square bg-muted overflow-hidden">
                {p.images?.[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
                {/* Price badge overlaid on image */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm border border-border shadow-sm">
                  <p className="text-xs sm:text-sm font-black text-primary leading-none">
                    ₦{Number(p.price ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {p.title}
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
