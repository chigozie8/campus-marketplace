'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/components/ui/confirm-dialog'

export function AdminDeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  const [confirmDialog, confirm] = useConfirm()

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete review?',
      message: 'This review will be permanently deleted and cannot be recovered.',
      confirmText: 'Delete',
      cancelText: 'Keep it',
      variant: 'danger',
    })
    if (!ok) return
    setLoading(true)
    await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId }),
    })
    setLoading(false)
    startTransition(() => router.refresh())
  }

  return (
    <>
      {confirmDialog}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </>
  )
}
