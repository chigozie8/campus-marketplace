'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Subscribe to live `orders` row changes for the current user and
 * invalidate the React Query cache for `['orders']` whenever something
 * changes. Buyer pages should pass `column='buyer_id'` and seller pages
 * should pass `column='seller_id'` so we don't get cross-talk.
 *
 * Requires migration `scripts/037_realtime_orders.sql` to be run once
 * (it adds the `orders` table to the supabase_realtime publication).
 * Without that, this hook is a silent no-op — the page still works,
 * the user just has to refresh manually.
 */
export function useOrdersRealtime(
  userId: string | undefined,
  column: 'buyer_id' | 'seller_id',
) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`orders-${column}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `${column}=eq.${userId}`,
        },
        () => {
          // Any insert/update/delete on this user's orders → refetch the list.
          qc.invalidateQueries({ queryKey: ['orders'] })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, column, qc])
}
