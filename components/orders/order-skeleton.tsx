export function OrderRowSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 flex items-start gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 rounded bg-muted w-3/4" />
        <div className="h-3 rounded bg-muted w-1/2" />
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
    </div>
  )
}

export function OrderTableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 dark:border-border animate-pulse">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-2.5 w-16 rounded bg-muted" />
          </div>
        </div>
      </td>
      <td className="px-3 py-3 hidden sm:table-cell"><div className="h-3 w-20 rounded bg-muted" /></td>
      <td className="px-3 py-3"><div className="h-3 w-16 rounded bg-muted" /></td>
      <td className="px-3 py-3"><div className="h-5 w-16 rounded-full bg-muted" /></td>
      <td className="px-3 py-3 hidden md:table-cell"><div className="h-3 w-14 rounded bg-muted" /></td>
      <td className="px-3 py-3" />
    </tr>
  )
}

export function OrderListSkeleton({ count = 4, variant = 'card' }: { count?: number; variant?: 'card' | 'table' }) {
  if (variant === 'table') {
    return (
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-border">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order</th>
              <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Seller</th>
              <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }).map((_, i) => <OrderTableRowSkeleton key={i} />)}
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <OrderRowSkeleton key={i} />)}
    </div>
  )
}
