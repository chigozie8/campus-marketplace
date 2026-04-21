import type { Metadata } from 'next'
import { LegalPageTemplate } from '@/components/legal/legal-page-template'
import { getSiteSettings } from '@/lib/site-settings'
import { LEGAL_DOCS, resolveLegalMarkdown } from '@/lib/site-settings-defaults'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Trust & Safety | VendoorX',
  description: 'Learn how VendoorX keeps buying and selling on Nigerian campuses safe — escrow, verified sellers, and 24/7 support.',
}

export default async function TrustPage() {
  const settings = await getSiteSettings()
  const doc = LEGAL_DOCS.find(d => d.id === 'trust')!
  const md  = resolveLegalMarkdown(doc, settings.legal_trust_md)
  return (
    <LegalPageTemplate
      slug="trust"
      title="Trust & Safety"
      intro="Trust is the foundation of VendoorX. Every feature — from verified sellers to escrow — exists to make buying and selling on Nigerian campuses safe."
      markdown={md}
      lastUpdated={settings.legal_last_updated}
    />
  )
}
