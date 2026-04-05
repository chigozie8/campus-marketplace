import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'My Dashboard — Manage Listings & Sales',
  description:
    'Manage your VendoorX listings, track sales, view analytics, and connect with buyers — all from your seller dashboard.',
  path: '/dashboard',
  noIndex: true,
})

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
