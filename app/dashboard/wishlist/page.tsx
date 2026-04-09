'use client'

import { useEffect, useState } from 'react'
import { Heart, Bell, BellOff, ShoppingCart, Loader2, AlertCircle, Package, ArrowUpRight, X } from 'lucide-react'
import Link from 'next/link'

type WishlistItem = {
  id: string
  product_id: string
  last_seen_price: number | null
  added_at: string
  products: {
    id: string
    title: string
    price: number
    images: string[]
    stock_quantity: number | null
    is_active: boolean
    seller_id: string
    profiles: { full_name: string; avatar_url: string | null }
  } | null
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [restockSubs, setRestockSubs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [restock, setRestock] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [wishRes, restockRes] = await Promise.all([
      fetch('/api/wishlist'),
      fetch('/api/restock-notify'),
    ])
    const { wishlist: items } = await wishRes.json()
    const { subscribed } = await restockRes.json()
    setWishlist(items ?? [])
    setRestockSubs(new Set(subscribed ?? []))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function removeFromWishlist(productId: string) {
    setRemoving(productId)
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
    setWishlist(prev => prev.filter(i => i.product_id !== productId))
    setRemoving(null)
  }

  async function toggleRestock(productId: string) {
    setRestock(productId)
    const res = await fetch('/api/restock-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
    const { subscribed } = await res.json()
    setRestockSubs(prev => {
      const next = new Set(prev)
      if (subscribed) next.add(productId)
      else next.delete(productId)
      return next
    })
    setRestock(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
        <div>
          <h1 className="text-lg font-black text-foreground">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''} · get notified on price drops &amp; restocks</p>
        </div>
      </div>

      {wishlist.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-base font-bold text-muted-foreground">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">Tap the heart on any listing to save it here</p>
          <Link href="/" className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90">
            Browse Listings
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {wishlist.map(item => {
          const p = item.products
          if (!p) return null
          const isOutOfStock = p.stock_quantity !== null && p.stock_quantity <= 0
          const isRestockSubbed = restockSubs.has(item.product_id)
          const priceDrop = item.last_seen_price !== null && Number(p.price) < Number(item.last_seen_price)
          const image = p.images?.[0]

          return (
            <div
              key={item.id}
              className={`flex gap-4 p-4 rounded-2xl border ${isOutOfStock ? 'border-muted bg-muted/20' : 'border-border bg-card'}`}
            >
              <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                {image ? (
                  <img src={image} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-bold text-foreground text-sm leading-tight line-clamp-2">{p.title}</p>
                <p className="text-xs text-muted-foreground">by {p.profiles?.full_name ?? 'Unknown Seller'}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-black ${priceDrop ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    ₦{Number(p.price).toLocaleString()}
                  </p>
                  {priceDrop && item.last_seen_price && (
                    <p className="text-xs text-muted-foreground line-through">
                      ₦{Number(item.last_seen_price).toLocaleString()}
                    </p>
                  )}
                  {priceDrop && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                      Price Drop!
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {!isOutOfStock && p.is_active && (
                    <Link
                      href={`/product/${p.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Buy Now
                    </Link>
                  )}
                  {isOutOfStock && (
                    <button
                      onClick={() => toggleRestock(item.product_id)}
                      disabled={restock === item.product_id}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isRestockSubbed
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70'
                      }`}
                    >
                      {restock === item.product_id ? <Loader2 className="w-3 h-3 animate-spin" /> : isRestockSubbed ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                      {isRestockSubbed ? 'Unsubscribe' : 'Notify Me'}
                    </button>
                  )}
                  <Link href={`/product/${p.id}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <button
                onClick={() => removeFromWishlist(item.product_id)}
                disabled={removing === item.product_id}
                className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors self-start"
              >
                {removing === item.product_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
