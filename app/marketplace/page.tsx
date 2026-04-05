import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, SlidersHorizontal, ShoppingBag, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/marketplace/product-card'
import { MarketplaceFilters } from '@/components/marketplace/filters'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace — VendoorX',
  description: 'Discover amazing deals from fellow students. Electronics, fashion, books, food and more from verified campus sellers.',
}

interface SearchParams {
  category?: string
  sort?: string
  q?: string
  page?: string
}

const CATEGORY_PILLS = [
  { label: 'All', slug: 'all', emoji: '🛍️' },
  { label: 'Electronics', slug: 'electronics', emoji: '💻' },
  { label: 'Fashion', slug: 'fashion', emoji: '👗' },
  { label: 'Books', slug: 'books', emoji: '📚' },
  { label: 'Food', slug: 'food', emoji: '🍔' },
  { label: 'Furniture', slug: 'furniture', emoji: '🛋️' },
  { label: 'Services', slug: 'services', emoji: '⚡' },
  { label: 'Sports', slug: 'sports', emoji: '🏋️' },
]

async function ProductGrid({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, profiles(*), categories(*)')
    .eq('is_available', true)

  if (searchParams.category && searchParams.category !== 'all') {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('slug', searchParams.category).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)

  if (searchParams.sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (searchParams.sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (searchParams.sort === 'popular') query = query.order('views', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  query = query.limit(24)

  const { data: products, error } = await query

  if (error || !products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-muted flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-muted-foreground" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No listings found</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
          {searchParams.q
            ? `No results for "${searchParams.q}". Try a different search.`
            : 'Be the first to list something in this category!'}
        </p>
        <Link
          href="/seller/new"
          className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-black/10"
        >
          <Plus className="w-4 h-4" />
          List an Item
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {(products as Product[]).map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card overflow-hidden animate-pulse shadow-sm">
          <div className="aspect-[4/3] bg-gray-100 dark:bg-muted" />
          <div className="p-3 space-y-2">
            <div className="h-3.5 bg-gray-100 dark:bg-muted rounded w-3/4" />
            <div className="h-5 bg-gray-100 dark:bg-muted rounded w-1/2" />
            <div className="h-9 bg-gray-100 dark:bg-muted rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const activeCategory = params.category || 'all'

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/"
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-foreground" />
              </Link>
              <Link href="/" className="text-xl font-black tracking-tight text-gray-950 dark:text-white select-none">
                Vendoor<span className="text-primary">X</span>
              </Link>
            </div>

            {/* Search bar — desktop */}
            <div className="hidden sm:flex flex-1 max-w-md relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <form method="GET" action="/marketplace" className="w-full">
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Search listings…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </form>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:block text-sm font-semibold text-gray-600 dark:text-foreground hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-all"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/seller/new"
                    className="flex items-center gap-1.5 bg-[#0a0a0a] text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10 hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:block">Sell</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-semibold text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="flex items-center gap-1.5 bg-[#0a0a0a] text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Start Selling
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-block bg-primary/20 text-green-400 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-primary/30 mb-3">
                Campus Marketplace
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Find great deals<br /><span className="text-primary">near you</span>
              </h1>
              <p className="text-white/50 text-sm mt-2">
                Thousands of listings from verified campus sellers
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { value: '120K+', label: 'Listings' },
                { value: '50K+', label: 'Sellers' },
                { value: '4.9★', label: 'Rating' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-white font-black text-xl">{value}</p>
                  <p className="text-white/40 text-xs uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 py-3 bg-white dark:bg-card border-b border-gray-100 dark:border-border">
        <form method="GET" action="/marketplace" className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search listings…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </form>
      </div>

      {/* Category pills */}
      <div className="bg-white dark:bg-card border-b border-gray-100 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORY_PILLS.map(({ label, slug, emoji }) => (
              <Link
                key={slug}
                href={`/marketplace?category=${slug}${params.q ? `&q=${params.q}` : ''}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === slug
                    ? 'bg-[#0a0a0a] text-white shadow-lg shadow-black/10'
                    : 'bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/80'
                }`}
              >
                <span>{emoji}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {/* Filters row */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <div>
            <h2 className="font-black text-gray-900 dark:text-white text-lg">
              {params.q ? `Results for "${params.q}"` : 'Latest Listings'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Sorted by newest first</p>
          </div>
          <div className="flex items-center gap-2">
            <Suspense>
              <MarketplaceFilters />
            </Suspense>
            <Link
              href="/seller/new"
              className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Sell
            </Link>
          </div>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={params} />
        </Suspense>
      </main>
    </div>
  )
}
