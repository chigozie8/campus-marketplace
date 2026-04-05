'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, Edit2, Trash2, MoreVertical, CheckCircle,
  XCircle, Package, MessageCircle, Loader2, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

type Props = { product: Product }

export function ListingCard({ product }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
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
    setOpen(false)
    await new Promise(r => setTimeout(r, 150))
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    if (!userId) { toast.error('You must be signed in to delete a listing'); return }
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
    if (!userId) { toast.error('You must be signed in'); return }
    setOpen(false)
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
    <>
      <div className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 dark:hover:bg-muted/30 transition-colors group relative ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Title + price */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.title}</p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
            ₦{product.price.toLocaleString()} · {(product as any).categories?.name || 'Uncategorised'}
          </p>
        </div>

        {/* Stats — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{product.views ?? 0}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{product.whatsapp_clicks ?? 0}</span>
        </div>

        {/* Status badge */}
        <div className="flex flex-col items-end gap-1.5">
          {toggling ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground'
            }`}>
              {isAvailable ? 'Active' : 'Sold'}
            </span>
          )}
        </div>

        {/* ⋮ trigger */}
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-muted text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors flex-shrink-0"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {deleting && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 dark:bg-background/60">
            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          {/* Sheet */}
          <div
            className="relative bg-white dark:bg-card rounded-t-2xl shadow-2xl w-full max-w-lg mx-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle + header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-border">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">₦{product.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-gray-400 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="px-3 py-3 space-y-1">
              <Link
                href={`/marketplace/${product.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-400 flex-shrink-0" />
                View listing
              </Link>

              <Link
                href={`/seller/${product.id}/edit`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                <Edit2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                Edit listing
              </Link>

              <button
                onClick={handleToggleAvailability}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                {isAvailable
                  ? <><XCircle className="w-5 h-5 text-orange-400 flex-shrink-0" /><span>Mark as sold</span></>
                  : <><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>Mark as available</span></>
                }
              </button>

              <div className="border-t border-gray-100 dark:border-border mx-1 my-1" />

              <button
                onClick={handleDelete}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <Trash2 className="w-5 h-5 flex-shrink-0" />
                Delete listing
              </button>
            </div>

            {/* Safe area spacer for phones with home bar */}
            <div className="h-6" />
          </div>
        </div>
      )}
    </>
  )
}
