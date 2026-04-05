import { Suspense } from 'react'
import Link from 'next/link'
import { Zap, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/marketplace/product-card'
import { MarketplaceFilters } from '@/components/marketplace/filters'
import type { Product } from '@/lib/types'

interface SearchParams {
  category?: string
  sort?: string
  q?: string
  page?: string
}

async function ProductGrid({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, profiles(*), categories(*)')
    .eq('is_available', true)

  if (searchParams.category && searchParams.category !== 'all') {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  if (searchParams.sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (searchParams.sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (searchParams.sort === 'popular') query = query.order('views', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  query = query.limit(24)

  const { data: products, error } = await query

  if (error || !products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
        <p className="text-muted-foreground mb-6">Be the first to list something in this category!</p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green-sm font-semibold">
          <Link href="/seller/new">
            <Plus className="w-4 h-4 mr-2" />
            List an Item
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {(products as Product[]).map(product => (
        <ProductCard key={product.id} product={product} />
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-green-sm">
                <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-lg tracking-tight">Vendoor<span className="text-primary">X</span></span>
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="border-border" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold glow-green-sm" asChild>
                    <Link href="/seller/new">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Sell
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" asChild>
                    <Link href="/auth/sign-up">Start Selling</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Marketplace</h1>
          <p className="text-muted-foreground">Discover deals from students on your campus</p>
        </div>

        <div className="mb-8">
          <Suspense>
            <MarketplaceFilters />
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 bg-card overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-secondary" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-5 bg-secondary rounded w-1/2" />
                    <div className="h-8 bg-secondary rounded" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <ProductGrid searchParams={params} />
        </Suspense>
      </main>
    </div>
  )
}
