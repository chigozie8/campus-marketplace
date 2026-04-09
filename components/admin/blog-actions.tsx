'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { useConfirm } from '@/components/ui/confirm-dialog'

export function BlogActions({ postId, postTitle }: { postId: string; postTitle: string }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const [confirmDialog, confirm] = useConfirm()

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete post?',
      message: `"${postTitle}" will be permanently deleted and cannot be recovered.`,
      confirmText: 'Delete',
      cancelText: 'Keep it',
      variant: 'danger',
    })
    if (!ok) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally { setDeleting(false) }
  }

  return (
    <>
      {confirmDialog}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete post"
        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-60"
      >
        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </>
  )
}
