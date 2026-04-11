'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Zap, Clock } from 'lucide-react'

interface FlashSaleProduct {
  id: string
  title: string
  price: number
  images?: string[] | null
}

interface FlashSale {
  id: string
  product_id: string
  sale_price: number
  start_at: string
  end_at: string
  products: FlashSaleProduct
}

function useCountdown(endAt: string) {
  const calc = () => {
    const diff = new Date(endAt).getTime() - Date.now()
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true }
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { h, m, s, expired: false }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(t)
  }, [endAt])
  return time
}

function SaleCard({ sale }: { sale: FlashSale }) {
  const { h, m, s, expired } = useCountdown(sale.end_at)
  const product = sale.products
  const discount = Math.round(((product.price - sale.sale_price) / product.price) * 100)
  const pad = (n: number) => String(n).padStart(2, '0')

  if (expired) return null

  return (
    <Link
      href={`/marketplace/${product.id}`}
      className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-800 bg-white dark:bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
    >
      <div className="relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-32 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
        )}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-red-500 text-white text-xs font-black">
          -{discount}%
        </div>
      </div>
      <div className="p-2.5 space-y-1.5">
        <p className="text-xs font-semibold line-clamp-2 leading-tight">{product.title}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black text-primary">₦{sale.sale_price.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground line-through">₦{product.price.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
          <Clock className="w-3 h-3" />
          <span>{pad(h)}:{pad(m)}:{pad(s)}</span>
        </div>
      </div>
    </Link>
  )
}

export function FlashSalesSection() {
  const [sales, setSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/flash-sales')
      .then(r => r.json())
      .then(d => setSales(d.sales ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || sales.length === 0) return null

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground leading-none">Flash Deals</h2>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Limited time offers</p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">{sales.length} deal{sales.length !== 1 ? 's' : ''}</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
      >
        {sales.map(sale => (
          <div key={sale.id} className="snap-start">
            <SaleCard sale={sale} />
          </div>
        ))}
      </div>
    </section>
  )
}
