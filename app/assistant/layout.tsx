import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'VendoorX AI — Your Smart Campus Shopping Assistant',
  description:
    'Ask VendoorX AI anything about buying and selling on campus. Find deals, discover sellers near you, learn how to list items, and get instant answers — powered by GPT-4o via puter.js.',
  path: '/assistant',
  keywords: [
    'campus shopping AI assistant',
    'AI marketplace help Nigeria',
    'smart shopping bot Nigeria',
    'campus deal finder AI',
    'VendoorX AI chatbot',
  ],
})

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    // Override the global pb-24 on mobile so the chat fills the full viewport
    <div className="!pb-0">
      {children}
    </div>
  )
}
