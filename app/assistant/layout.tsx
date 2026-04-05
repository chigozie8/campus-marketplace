import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VendoorX AI — Campus Shopping Assistant',
  description:
    'Chat with VendoorX AI to find the best campus deals, discover sellers, and get marketplace help — powered by puter.js.',
}

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    // Override the global pb-24 on mobile so the chat fills the full viewport
    <div className="!pb-0">
      {children}
    </div>
  )
}
