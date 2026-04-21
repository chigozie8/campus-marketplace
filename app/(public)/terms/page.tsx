import type { Metadata } from 'next'
import { LegalPageTemplate } from '@/components/legal/legal-page-template'
import { getSiteSettings } from '@/lib/site-settings'
import { LEGAL_DOCS, resolveLegalMarkdown } from '@/lib/site-settings-defaults'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Terms of Service | VendoorX',
  description: 'Read the VendoorX Terms of Service — the rules everyone agrees to when using the platform.',
}

export default async function TermsPage() {
  const settings = await getSiteSettings()
  const doc = LEGAL_DOCS.find(d => d.id === 'terms')!
  const md  = resolveLegalMarkdown(doc, settings.legal_terms_md)
  return (
    <LegalPageTemplate
      slug="terms"
      title="Terms of Service"
      intro="These Terms govern your use of VendoorX. Please read them carefully — by using the platform, you agree to be bound by them."
      markdown={md}
      lastUpdated={settings.legal_last_updated}
    />
  )
}
