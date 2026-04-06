'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Pencil, Trash2, ToggleLeft, ToggleRight,
  Loader2, Eye, MoreVertical, CheckCircle2, XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Props {
  productId: string
  isAvailable: boolean
}

export function DashboardActions({ productId, isAvailable }: Props) {
  const router = useRouter()
  const [available, setAvailable] = useState(isAvailable)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function toggleAvailability() {
    setOpen(false)
    setToggling(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ is_available: !available, updated_at: new Date().toISOString() })
      .eq('id', productId)
    if (error) {
      toast.error(error.message)
    } else {
      setAvailable(prev => !prev)
      toast.success(!available ? 'Marked as active' : 'Marked as sold')
    }
    setToggling(false)
  }

  async function handleDelete() {
    setOpen(false)
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      toast.error(error.message)
      setDeleting(false)
      return
    }
    toast.success('Listing deleted')
    router.refresh()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-gray-400 hover:text-gray-700 transition-colors"
        title="Actions"
        disabled={toggling || deleting}
      >
        {(toggling || deleting)
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <MoreVertical className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl shadow-xl shadow-black/10 z-50 overflow-hidden">
          <Link
            href={`/marketplace/${productId}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-muted transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-400" />
            View listing
          </Link>

          <Link
            href={`/seller/edit/${productId}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-muted transition-colors"
          >
            <Pencil className="w-4 h-4 text-blue-500" />
            Edit listing
          </Link>

          <button
            onClick={toggleAvailability}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-muted transition-colors"
          >
            {available
              ? <><XCircle className="w-4 h-4 text-amber-500" />Mark as sold</>
              : <><CheckCircle2 className="w-4 h-4 text-emerald-500" />Mark as active</>}
          </button>

          <div className="border-t border-gray-100 dark:border-border" />

          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete listing
          </button>
        </div>
      )}
    </div>
  )
}
