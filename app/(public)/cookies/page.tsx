import type { Metadata } from 'next'
import { LegalPageTemplate } from '@/components/legal/legal-page-template'
import { getSiteSettings } from '@/lib/site-settings'
import { LEGAL_DOCS, resolveLegalMarkdown } from '@/lib/site-settings-defaults'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Cookie Policy | VendoorX',
  description: 'How VendoorX uses cookies and similar technologies — and how you can manage them.',
}

export default async function CookiesPage() {
  const settings = await getSiteSettings()
  const doc = LEGAL_DOCS.find(d => d.id === 'cookies')!
  const md  = resolveLegalMarkdown(doc, settings.legal_cookies_md)
  return (
    <LegalPageTemplate
      slug="cookies"
      title="Cookie Policy"
      intro="This page explains what cookies are, how VendoorX uses them, and how you can control them in your browser."
      markdown={md}
      lastUpdated={settings.legal_last_updated}
    />
  )
}
