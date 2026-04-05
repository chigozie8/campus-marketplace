'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, Edit2, Trash2, MoreVertical, CheckCircle,
  XCircle, Package, MessageCircle, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

type Props = { product: Product }

export function ListingCard({ product }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
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
    if (!userId) { toast.error('You must be signed in to delete a listing'); return }
    setDeleting(true)
    setOpen(false)
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
    setToggling(true)
    setOpen(false)
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
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-pointer select-none ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground'
          }`}
            onClick={handleToggleAvailability}
            title="Click to toggle availability"
          >
            {isAvailable ? 'Active' : 'Sold'}
          </span>
        )}
      </div>

      {/* Action menu */}
      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => {
            if (!open && btnRef.current) {
              const rect = btnRef.current.getBoundingClientRect()
              setMenuPos({
                top: rect.bottom + 6,
                right: window.innerWidth - rect.right,
              })
            }
            setOpen(v => !v)
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-muted text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="fixed z-50 w-48 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl shadow-black/10 overflow-hidden"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <Link
                href={`/marketplace/${product.id}`}
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                onClick={() => setOpen(false)}
              >
                <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                View listing
              </Link>
              <Link
                href={`/seller/${product.id}/edit`}
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                onClick={() => setOpen(false)}
              >
                <Edit2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                Edit listing
              </Link>
              <button
                onClick={handleToggleAvailability}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors"
              >
                {isAvailable
                  ? <><XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" /><span>Mark as sold</span></>
                  : <><CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /><span>Mark as available</span></>
                }
              </button>
              <div className="border-t border-gray-100 dark:border-border" />
              <button
                onClick={handleDelete}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                Delete listing
              </button>
            </div>
          </>
        )}
      </div>

      {deleting && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60 dark:bg-background/60">
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
        </div>
      )}
    </div>
  )
}
