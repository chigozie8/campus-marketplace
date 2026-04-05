import type { Metadata } from 'next'
import { OfflineContent } from './offline-content'

export const metadata: Metadata = {
  title: 'You are offline — VendoorX',
  description: 'No internet connection detected. Please check your connection.',
  robots: { index: false },
}

export default function OfflinePage() {
  return <OfflineContent />
}
