'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, Edit2, Trash2, Package, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

type Props = { product: Product }

export function ListingCard({ product }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [isAvailable, setIsAvailable] = useState(product.is_available)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  async function handleDelete() {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    if (!userId) { toast.error('Sign in required'); return }
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Delete failed')
      toast.success('Listing deleted')
      router.refresh()
    } catch (err) {
      toast.error('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setDeleting(false)
    }
  }

  async function handleToggleAvailability() {
    if (!userId) { toast.error('Sign in required'); return }
    setToggling(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_available: !isAvailable }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Update failed')
      setIsAvailable(v => !v)
      toast.success(isAvailable ? 'Marked as sold' : 'Marked as available')
      router.refresh()
    } catch (err) {
      toast.error('Failed to update: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 dark:hover:bg-muted/30 transition-colors relative ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>

      {/* Thumbnail */}
      <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Title + price */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{product.title}</p>
        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
          ₦{product.price.toLocaleString()}
        </p>
        {/* Availability toggle — tap to switch */}
        {toggling ? (
          <Loader2 className="w-3 h-3 animate-spin text-primary mt-1" />
        ) : (
          <button
            onClick={handleToggleAvailability}
            className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground'
            }`}
          >
            {isAvailable ? '● Active' : '○ Sold'}
          </button>
        )}
      </div>

      {/* Inline action buttons — always visible */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={`/marketplace/${product.id}`}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-muted dark:hover:text-white transition-colors"
          title="View listing"
        >
          <Eye className="w-4 h-4" />
        </Link>

        <Link
          href={`/seller/${product.id}/edit`}
          className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
          title="Edit listing"
        >
          <Edit2 className="w-4 h-4" />
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-40"
          title="Delete listing"
        >
          {deleting
            ? <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            : <Trash2 className="w-4 h-4" />
          }
        </button>
      </div>
    </div>
  )
}
