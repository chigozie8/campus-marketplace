'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, ArrowUpRight } from 'lucide-react'
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

  async function toggleAvailability() {
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
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={toggleAvailability}
        disabled={toggling}
        title={available ? 'Mark as sold' : 'Mark as active'}
        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${available ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-muted'}`}
      >
        {toggling
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
      </button>
      <Link
        href={`/seller/edit/${productId}`}
        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
        title="Edit listing"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Link>
      <Link
        href={`/marketplace/${productId}`}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-muted transition-colors"
        title="View listing"
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete listing"
        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
