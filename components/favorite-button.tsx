'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Props {
  productId: string
}

export function FavoriteButton({ productId }: Props) {
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setChecked(true); return }
      supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()
        .then(({ data }) => {
          setFavorited(!!data)
          setChecked(true)
        })
    })
  }, [productId])

  async function toggle() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Sign in to save favorites'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      const data = await res.json()
      setFavorited(data.favorited)
      toast.success(data.favorited ? 'Saved to favorites' : 'Removed from favorites')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!checked) return null

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      className={`p-2 rounded-xl transition-all active:scale-90 ${
        favorited
          ? 'bg-red-50 dark:bg-red-950/30 text-red-500'
          : 'hover:bg-gray-100 dark:hover:bg-muted text-gray-500 dark:text-muted-foreground'
      }`}
    >
      <Heart className={`w-5 h-5 transition-all ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
    </button>
  )
}
