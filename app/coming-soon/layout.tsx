import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VendoorX — Coming Soon',
  description: 'Nigeria\'s #1 WhatsApp vendor marketplace is almost here. Get notified when we launch.',
  robots: { index: false, follow: false },
}

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return children
}
