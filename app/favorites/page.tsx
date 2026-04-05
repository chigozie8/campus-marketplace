'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Package, Loader2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { FavoriteButton } from '@/components/favorite-button'
import type { Product } from '@/lib/types'

export default function FavoritesPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase
        .from('favorites')
        .select('product_id, products(*, categories(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          const favProducts = (data || [])
            .map((f: { products: Product | null }) => f.products)
            .filter(Boolean) as Product[]
          setProducts(favProducts)
          setLoading(false)
        })
    })
  }, [router])

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-black text-lg tracking-tight flex-1">Saved Items</h1>
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No saved items yet</h3>
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6 max-w-xs mx-auto">
              Tap the heart icon on any listing to save it here for later.
            </p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all text-sm">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => (
              <div key={product.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all">
                <Link href={`/marketplace/${product.id}`} className="block">
                  <div className="relative aspect-square bg-gray-100 dark:bg-muted overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    {!product.is_available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-full">Sold</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.title}</p>
                    <p className="text-base font-black text-gray-950 dark:text-white mt-0.5">₦{product.price.toLocaleString()}</p>
                    {(product.campus || product.location) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {product.campus || product.location}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="px-3 pb-3 flex justify-end">
                  <FavoriteButton productId={product.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
