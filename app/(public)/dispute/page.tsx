import type { Metadata } from 'next'
import { LegalPageTemplate } from '@/components/legal/legal-page-template'
import { getSiteSettings } from '@/lib/site-settings'
import { LEGAL_DOCS, resolveLegalMarkdown } from '@/lib/site-settings-defaults'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Dispute Resolution | VendoorX',
  description: 'How VendoorX mediates buyer/seller disputes — a clear, time-bound process with a final appeal stage.',
}

export default async function DisputePage() {
  const settings = await getSiteSettings()
  const doc = LEGAL_DOCS.find(d => d.id === 'dispute')!
  const md  = resolveLegalMarkdown(doc, settings.legal_dispute_md)
  return (
    <LegalPageTemplate
      slug="dispute"
      title="Dispute Resolution"
      intro="When a transaction goes wrong, our trust & safety team mediates between buyer and seller using a clear, time-bound process."
      markdown={md}
      lastUpdated={settings.legal_last_updated}
    />
  )
}
