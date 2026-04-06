'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Pencil, Trash2, Loader2, Eye,
  MoreVertical, CheckCircle2, XCircle, Copy,
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
  const [toggling, setToggling]   = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [duping, setDuping]       = useState(false)
  const [open, setOpen]           = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
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
      toast.success(!available ? 'Listing marked as active' : 'Listing marked as sold')
      router.refresh()
    }
    setToggling(false)
  }

  async function duplicateListing() {
    setOpen(false)
    setDuping(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setDuping(false); return }

    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (fetchErr || !product) {
      toast.error('Could not fetch listing to duplicate')
      setDuping(false)
      return
    }

    const { id: _id, created_at: _ca, updated_at: _ua, views: _v, whatsapp_clicks: _wc, is_featured: _if, ...rest } = product

    const { data: newProduct, error: insertErr } = await supabase
      .from('products')
      .insert({ ...rest, title: `${product.title} (Copy)`, is_available: false, views: 0, whatsapp_clicks: 0 })
      .select('id')
      .single()

    if (insertErr || !newProduct) {
      toast.error('Failed to duplicate listing')
      setDuping(false)
      return
    }

    toast.success('Listing duplicated — edit it before making it active')
    router.push(`/seller/edit/${newProduct.id}`)
  }

  async function performDelete() {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      toast.error(error.message)
      setDeleting(false)
      return
    }
    toast.success('Listing deleted successfully')
    router.refresh()
  }

  function handleDelete() {
    setOpen(false)
    toast.custom(
      (id) => (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-black/10 p-4 w-[320px]">
          <div className="flex gap-3 items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Delete listing?</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                This will permanently remove your listing. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(id)}
              className="flex-1 px-3 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { toast.dismiss(id); performDelete() }}
              className="flex-1 px-3 py-2.5 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
            >
              Yes, delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    )
  }

  const busy = toggling || deleting || duping

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-gray-400 hover:text-gray-700 transition-colors"
        title="Actions"
        disabled={busy}
      >
        {busy
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <MoreVertical className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 w-52 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl shadow-xl shadow-black/10 z-50 overflow-hidden">
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
            onClick={duplicateListing}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-muted transition-colors"
          >
            <Copy className="w-4 h-4 text-indigo-500" />
            Duplicate listing
          </button>

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
