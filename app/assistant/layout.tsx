import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'VendoorX AI — Your Smart WhatsApp Commerce Assistant',
  description:
    'Ask VendoorX AI anything about buying and selling on WhatsApp. Discover products, find sellers, automate your orders, and get instant answers — powered by AI built for conversational commerce.',
  path: '/assistant',
  keywords: [
    'WhatsApp commerce AI assistant',
    'AI marketplace help Nigeria',
    'smart shopping bot Nigeria',
    'WhatsApp sales AI Nigeria',
    'VendoorX AI chatbot',
    'conversational commerce assistant',
    'AI-powered WhatsApp seller',
  ],
  noIndex: true,
})

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="!pb-0">
      {children}
    </div>
  )
}
