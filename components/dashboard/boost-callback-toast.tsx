'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function BoostCallbackToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const boost = searchParams.get('boost')
    const type = searchParams.get('type')

    if (!boost) return

    if (boost === 'success') {
      if (type === 'store') {
        toast.success('🎉 Your store is now featured for 7 days! Buyers will see it highlighted across the platform.')
      } else {
        toast.success('🎉 Listing boosted for 7 days! It will appear at the top of search results with a Featured badge.')
      }
    } else if (boost === 'failed') {
      toast.error('Boost payment could not be confirmed. If you were charged, please contact support.')
    }

    // Remove query params from URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.delete('boost')
    url.searchParams.delete('type')
    url.searchParams.delete('reason')
    router.replace(url.pathname, { scroll: false })
  }, [searchParams, router])

  return null
}
