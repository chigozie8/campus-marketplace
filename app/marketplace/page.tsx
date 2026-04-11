import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, SlidersHorizontal, ShoppingBag, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/marketplace/product-card'
import { MarketplaceFilters } from '@/components/marketplace/filters'
import { SearchAutocomplete } from '@/components/marketplace/search-autocomplete'
import { FlashSalesSection } from '@/components/features/flash-sales-section'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'
import { buildMetadata, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Campus Marketplace — Browse 120,000+ Student Listings',
  description:
    'Shop electronics, textbooks, fashion, food, services and more from verified student sellers across 120+ Nigerian universities. WhatsApp-direct, zero platform fees.',
  path: '/marketplace',
  keywords: [
    'buy electronics campus Nigeria',
    'student listings marketplace',
    'buy textbooks Nigeria',
    'campus fashion deals',
    'buy food campus Nigeria',
    'student seller Nigeria marketplace',
    'second hand goods university Nigeria',
  ],
})

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

const PAGE_SIZE = 24

function buildPageUrl(params: SearchParams, page: number): string {
  const qs = new URLSearchParams()
  if (params.category && params.category !== 'all') qs.set('category', params.category)
  if (params.sort) qs.set('sort', params.sort)
  if (params.q) qs.set('q', params.q)
  if (page > 1) qs.set('page', String(page))
  const str = qs.toString()
  return `/marketplace${str ? `?${str}` : ''}`
}

function PaginationNav({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number
  totalPages: number
  searchParams: SearchParams
}) {
  if (totalPages <= 1) return null

  const MAX_VISIBLE = 5
  let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE / 2))
  let endPage = startPage + MAX_VISIBLE - 1
  if (endPage > totalPages) {
    endPage = totalPages
    startPage = Math.max(1, endPage - MAX_VISIBLE + 1)
  }
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-10 mb-2 flex-wrap"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(searchParams, currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-muted-foreground bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 dark:text-muted bg-white dark:bg-card border border-gray-100 dark:border-border cursor-not-allowed">
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </span>
      )}

      {/* First page + ellipsis */}
      {startPage > 1 && (
        <>
          <Link
            href={buildPageUrl(searchParams, 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold text-gray-600 dark:text-muted-foreground bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
          >
            1
          </Link>
          {startPage > 2 && (
            <span className="w-9 h-9 flex items-center justify-center text-xs text-gray-400">…</span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pageNumbers.map(page => (
        <Link
          key={page}
          href={buildPageUrl(searchParams, page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-sm ${
            page === currentPage
              ? 'bg-[#0a0a0a] dark:bg-white text-white dark:text-gray-950 border border-transparent'
              : 'bg-white dark:bg-card text-gray-600 dark:text-muted-foreground border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {page}
        </Link>
      ))}

      {/* Last page + ellipsis */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="w-9 h-9 flex items-center justify-center text-xs text-gray-400">…</span>
          )}
          <Link
            href={buildPageUrl(searchParams, totalPages)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold text-gray-600 dark:text-muted-foreground bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(searchParams, currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-muted-foreground bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 dark:text-muted bg-white dark:bg-card border border-gray-100 dark:border-border cursor-not-allowed">
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </nav>
  )
}

async function ProductGrid({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()

  if (!supabase) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-muted flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-muted-foreground" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Service unavailable</h3>
        <p className="text-gray-500 dark:text-muted-foreground text-sm max-w-xs leading-relaxed">
          Database connection is not configured. Please check your environment variables.
        </p>
      </div>
    )
  }

  const currentPage = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Resolve category filter
  let categoryId: string | null = null
  if (searchParams.category && searchParams.category !== 'all') {
    const { data: cat } = await supabase
      .from('categories').select('id').eq('slug', searchParams.category).single()
    categoryId = cat?.id ?? null
  }

  // Count query (head-only, no data transfer)
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_available', true)
  if (categoryId) countQuery = countQuery.eq('category_id', categoryId)
  if (searchParams.q) countQuery = countQuery.ilike('title', `%${searchParams.q}%`)
  const { count: totalCount } = await countQuery
  const total = totalCount ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Data query with sort + range
  let dataQuery = supabase
    .from('products')
    .select('*, profiles(*), categories(*)')
    .eq('is_available', true)
  if (categoryId) dataQuery = dataQuery.eq('category_id', categoryId)
  if (searchParams.q) dataQuery = dataQuery.ilike('title', `%${searchParams.q}%`)
  if (searchParams.sort === 'price_asc') dataQuery = dataQuery.order('price', { ascending: true })
  else if (searchParams.sort === 'price_desc') dataQuery = dataQuery.order('price', { ascending: false })
  else if (searchParams.sort === 'popular') dataQuery = dataQuery.order('views', { ascending: false })
  else dataQuery = dataQuery.order('created_at', { ascending: false })

  dataQuery = dataQuery.range(from, to)

  const { data: products, error } = await dataQuery

  if (error || !products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-muted flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-muted-foreground" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No listings found</h3>
        <p className="text-gray-500 dark:text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
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

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Campus Marketplace Listings',
    description: 'Buy and sell items from verified student sellers across Nigerian universities',
    url: `${SITE_URL}/marketplace`,
    numberOfItems: total,
    itemListElement: (products as Product[]).map((product, index) => ({
      '@type': 'ListItem',
      position: from + index + 1,
      url: `${SITE_URL}/marketplace/${product.id}`,
      name: product.title,
      image: product.images?.[0] || `${SITE_URL}/og-image.png`,
      description: product.description?.slice(0, 100) || product.title,
    })),
  }

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'VendoorX Campus Marketplace',
    description: 'Browse thousands of listings from student sellers across Nigeria',
    url: `${SITE_URL}/marketplace`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Marketplace', item: `${SITE_URL}/marketplace` },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {(products as Product[]).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <PaginationNav
        currentPage={currentPage}
        totalPages={totalPages}
        searchParams={searchParams}
      />
      {total > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-muted-foreground mt-3">
          Showing {from + 1}–{Math.min(to + 1, total)} of {total.toLocaleString()} listings
        </p>
      )}
    </>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card overflow-hidden animate-pulse shadow-sm">
          <div className="aspect-[4/3] bg-gray-100 dark:bg-muted" />
          <div className="p-2.5 sm:p-3.5 space-y-2">
            <div className="h-3 bg-gray-100 dark:bg-muted rounded w-full" />
            <div className="h-3 bg-gray-100 dark:bg-muted rounded w-2/3" />
            <div className="h-4 bg-gray-100 dark:bg-muted rounded w-1/2" />
            <div className="h-8 sm:h-9 bg-gray-100 dark:bg-muted rounded-xl" />
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
  const user = supabase ? (await supabase.auth.getUser()).data.user : null
  const activeCategory = params.category || 'all'
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Left: back + logo */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Link
                href="/"
                className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-foreground" />
              </Link>
              <Link href="/" className="text-lg sm:text-xl font-black tracking-tight text-gray-950 dark:text-white select-none">
                Vendoor<span className="text-primary">X</span>
              </Link>
            </div>

            {/* Center: Search bar — desktop only */}
            <div className="hidden sm:flex flex-1 max-w-md mx-2">
              <SearchAutocomplete
                defaultValue={params.q}
                className="w-full"
                placeholder="Search listings…"
              />
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
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
                    className="flex items-center gap-1.5 bg-[#0a0a0a] text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Sell</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="hidden xs:block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 px-2 sm:px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="flex items-center gap-1 sm:gap-1.5 bg-[#0a0a0a] text-white text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-2 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                  >
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Start Selling</span>
                    <span className="xs:hidden">Join</span>
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-4">
            <div>
              <span className="inline-block bg-primary/20 text-green-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-primary/30 mb-2 sm:mb-3">
                Campus Marketplace
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Find great deals <span className="text-primary">near you</span>
              </h1>
              <p className="text-white/50 text-xs sm:text-sm mt-1.5">
                Thousands of listings from verified campus sellers
              </p>
            </div>
            <div className="flex gap-5 sm:gap-6">
              {[
                { value: '120K+', label: 'Listings' },
                { value: '50K+', label: 'Sellers' },
                { value: '4.9★', label: 'Rating' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-white font-black text-base sm:text-xl">{value}</p>
                  <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 py-3 bg-white dark:bg-card border-b border-gray-100 dark:border-border">
        <SearchAutocomplete
          defaultValue={params.q}
          className="w-full"
          placeholder="Search listings…"
        />
      </div>

      {/* Category pills */}
      <div className="bg-white dark:bg-card border-b border-gray-100 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-3 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
            {CATEGORY_PILLS.map(({ label, slug, emoji }) => (
              <Link
                key={slug}
                href={`/marketplace?category=${slug}${params.q ? `&q=${params.q}` : ''}`}
                className={`flex-shrink-0 flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                  activeCategory === slug
                    ? 'bg-[#0a0a0a] text-white shadow-lg shadow-black/10'
                    : 'bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/80'
                }`}
              >
                <span className="text-sm">{emoji}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {/* Flash Sales */}
        <FlashSalesSection />

        {/* Filters row */}
        <div className="flex flex-wrap items-center justify-between mb-5 gap-y-3 gap-x-2">
          <div className="min-w-0">
            <h2 className="font-black text-gray-900 dark:text-white text-base sm:text-lg truncate">
              {params.q ? `Results for "${params.q}"` : 'Latest Listings'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
              {currentPage > 1 ? `Page ${currentPage}` : 'Sorted by newest first'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Suspense>
              <MarketplaceFilters />
            </Suspense>
            <Link
              href="/seller/new"
              className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sell</span>
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
