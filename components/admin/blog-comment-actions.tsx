'use client'

import { useState } from 'react'
import { Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdminCommentActions({ commentId, isApproved }: { commentId: string; isApproved: boolean }) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  async function toggleApproval() {
    setLoading(true)
    await fetch(`/api/admin/blog/comments?id=${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: !isApproved }),
    })
    router.refresh()
    setLoading(false)
  }

  async function deleteComment() {
    setLoading(true)
    await fetch(`/api/admin/blog/comments?id=${commentId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={deleteComment}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '...' : 'Delete'}
        </button>
        <button onClick={() => setConfirming(false)} className="px-2.5 py-1 rounded-lg bg-muted text-xs font-bold">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={toggleApproval}
        disabled={loading}
        title={isApproved ? 'Unapprove' : 'Approve'}
        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
          isApproved
            ? 'text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-500'
            : 'text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500'
        }`}
      >
        {isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      </button>
      <button
        onClick={() => setConfirming(true)}
        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-muted-foreground hover:text-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
