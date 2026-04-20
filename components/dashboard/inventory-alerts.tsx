import Link from 'next/link'
import { AlertTriangle, ChevronRight } from 'lucide-react'

export type InventoryIssue = {
  id: string
  title: string
  reason: 'low_stock' | 'out_of_stock_visible'
  detail: string
}

interface Props {
  issues: InventoryIssue[]
}

const REASON_LABEL: Record<InventoryIssue['reason'], string> = {
  low_stock: 'Low stock',
  out_of_stock_visible: 'Sold out but still live',
}

/**
 * Compact warning card listing listings that need the seller's attention.
 * Hidden completely when there are no issues — never just a "0 issues" tile.
 */
export function InventoryAlerts({ issues }: Props) {
  if (!issues.length) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-amber-200/70 dark:border-amber-900/30 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <p className="text-sm font-black text-amber-900 dark:text-amber-200">Listings needing attention</p>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
          {issues.length}
        </span>
      </div>
      <ul className="divide-y divide-amber-200/50 dark:divide-amber-900/20">
        {issues.slice(0, 5).map(issue => (
          <li key={issue.id}>
            <Link
              href={`/seller/edit/${issue.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-amber-100/40 dark:hover:bg-amber-900/15 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 truncate">{issue.title}</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  <span className="font-bold">{REASON_LABEL[issue.reason]}</span> · {issue.detail}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      {issues.length > 5 && (
        <div className="px-5 py-2 text-center bg-amber-100/40 dark:bg-amber-900/15">
          <Link href="/dashboard/listings" className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline">
            View all {issues.length} issues
          </Link>
        </div>
      )}
    </div>
  )
}
