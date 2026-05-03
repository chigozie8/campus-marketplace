import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm flex items-center justify-center mb-6">
        <ShoppingBag className="w-9 h-9 text-[#16a34a]" strokeWidth={1.5} />
      </div>

      <p className="text-sm font-black tracking-tight text-gray-950 dark:text-foreground mb-6 select-none">
        Vendoor<span className="text-[#16a34a]">X</span>
      </p>

      <h1 className="text-2xl font-black text-gray-950 dark:text-foreground tracking-tight mb-3">
        Listing not found
      </h1>

      <p className="text-gray-500 dark:text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
        This product has been removed, sold, or the link may be incorrect. Browse the marketplace to find similar items.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/marketplace"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-950 dark:bg-foreground text-white dark:text-background text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-foreground/90 active:scale-95 transition-all shadow-lg shadow-black/10"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse Marketplace
        </Link>
        <Link
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground text-sm font-bold px-5 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-muted active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  )
}
