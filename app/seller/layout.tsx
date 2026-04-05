import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Sell on Campus — Start Listing in 60 Seconds',
  description:
    'List your items on VendoorX for free. Set up your student store, upload photos, set your price, and start receiving WhatsApp orders — zero commission, always.',
  path: '/seller',
  keywords: [
    'sell on campus Nigeria',
    'list item student marketplace',
    'create seller account VendoorX',
    'sell textbook Nigeria',
    'sell phone campus Nigeria',
    'student store Nigeria',
  ],
})

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
