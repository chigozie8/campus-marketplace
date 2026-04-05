'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useOrder, useInitializePayment } from '@/hooks/use-orders'
import { toast } from 'sonner'

export default function PayOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: order, isLoading } = useOrder(id)
  const initPayment = useInitializePayment()

  useEffect(() => {
    if (!order) return

    if (order.status !== 'pending') {
      toast.info('This order has already been paid.')
      router.replace('/dashboard/orders')
      return
    }

    initPayment.mutateAsync(id)
      .then(result => {
        window.location.href = result.data.authorization_url
      })
      .catch(() => {
        router.replace('/dashboard/orders')
      })
  }, [order, id])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">
        {isLoading ? 'Loading order…' : 'Redirecting to payment…'}
      </p>
    </div>
  )
}
