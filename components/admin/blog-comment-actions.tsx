'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react'

export function BlogCommentActions({ commentId, isApproved }: { commentId: string; isApproved: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    try {
      await fetch('/api/admin/blog/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, is_approved: !isApproved }),
      })
      router.refresh()
    } finally { setLoading(false) }
  }

  async function remove() {
    if (!confirm('Delete this comment?')) return
    setLoading(true)
    try {
      await fetch('/api/admin/blog/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId }),
      })
      router.refresh()
    } finally { setLoading(false) }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={toggle}
        disabled={loading}
        title={isApproved ? 'Unapprove' : 'Approve'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 ${
          isApproved
            ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
            : 'bg-primary/10 hover:bg-primary/20 text-primary'
        }`}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
          isApproved ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        {isApproved ? 'Unapprove' : 'Approve'}
      </button>
      <button
        onClick={remove}
        disabled={loading}
        title="Delete comment"
        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-60"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
