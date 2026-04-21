import type { Metadata } from 'next'
import { LegalPageTemplate } from '@/components/legal/legal-page-template'
import { getSiteSettings } from '@/lib/site-settings'
import { LEGAL_DOCS, resolveLegalMarkdown } from '@/lib/site-settings-defaults'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Refund Policy | VendoorX',
  description: 'When and how VendoorX issues refunds for orders made via Paystack escrow.',
}

export default async function RefundPage() {
  const settings = await getSiteSettings()
  const doc = LEGAL_DOCS.find(d => d.id === 'refund')!
  const md  = resolveLegalMarkdown(doc, settings.legal_refund_md)
  return (
    <LegalPageTemplate
      slug="refund"
      title="Refund Policy"
      intro="Our promise is simple: if an order goes wrong, we make it right. This page explains exactly when and how refunds are issued on VendoorX."
      markdown={md}
      lastUpdated={settings.legal_last_updated}
    />
  )
}
