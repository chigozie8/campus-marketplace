'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SubscriptionCallbackToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const subscription = searchParams.get('subscription')
    const plan = searchParams.get('plan')

    if (!subscription) return

    if (subscription === 'success') {
      const planName = plan
        ? plan.charAt(0).toUpperCase() + plan.slice(1)
        : 'Your'
      toast.success(`${planName} plan activated! Welcome aboard.`)
    } else if (subscription === 'failed') {
      toast.error('Subscription payment could not be confirmed. If you were charged, please contact support.')
    }

    // Remove query params without a page reload
    const url = new URL(window.location.href)
    url.searchParams.delete('subscription')
    url.searchParams.delete('plan')
    router.replace(url.pathname, { scroll: false })
  }, [searchParams, router])

  return null
}
