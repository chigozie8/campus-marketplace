'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, CreateOrderPayload, OrderStatus } from '@/lib/api'
import { toast } from 'sonner'

export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: ['orders', 'me', page],
    queryFn: () => ordersApi.getMyOrders(page),
    select: (d) => d,
  })
}

export function useVendorOrders(page = 1) {
  return useQuery({
    queryKey: ['orders', 'vendor', page],
    queryFn: () => ordersApi.getVendorOrders(page),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
    select: (d) => d.data,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrderPayload) => ordersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order placed successfully!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useInitializePayment() {
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.initializePayment(orderId),
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order status updated.')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
