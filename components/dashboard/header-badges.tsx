import Link from 'next/link'
import { MessageSquare, ClipboardList, Bell } from 'lucide-react'

interface Props {
  unreadInbox: number
  pendingOrders: number
  unreadNotifications: number
}

/**
 * Sub-greeting row of pill badges. Each pill links to the relevant page and
 * is only rendered when its count is > 0, so a pristine inbox stays quiet.
 */
export function HeaderBadges({ unreadInbox, pendingOrders, unreadNotifications }: Props) {
  if (!unreadInbox && !pendingOrders && !unreadNotifications) return null

  const items: Array<{ href: string; icon: React.ElementType; count: number; label: string; tone: string }> = [
    {
      href: '/notifications', icon: Bell, count: unreadNotifications, label: 'unread',
      tone: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-900/40',
    },
    {
      href: '/dashboard/orders', icon: ClipboardList, count: pendingOrders, label: pendingOrders === 1 ? 'pending order' : 'pending orders',
      tone: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40',
    },
    {
      href: '/inbox', icon: MessageSquare, count: unreadInbox, label: unreadInbox === 1 ? 'new message' : 'new messages',
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
    },
  ].filter(it => it.count > 0)

  return (
    <div className="flex items-center gap-2 flex-wrap mt-2.5">
      {items.map(({ href, icon: Icon, count, label, tone }) => (
        <Link
          key={href}
          href={href}
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all hover:-translate-y-0.5 ${tone}`}
        >
          <Icon className="w-3 h-3" />
          {count} {label}
        </Link>
      ))}
    </div>
  )
}
