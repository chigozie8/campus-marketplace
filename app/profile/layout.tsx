import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'My Profile — Account Settings',
  description:
    'Update your VendoorX profile, WhatsApp number, university, and account preferences.',
  path: '/profile',
  noIndex: true,
})

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
