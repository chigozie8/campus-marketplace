'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdminBlogActions({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete post.')
      }
    } catch {}
    setLoading(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '...' : 'Delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1 rounded-lg bg-muted text-xs font-bold hover:bg-muted/80"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-muted-foreground hover:text-red-500"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
