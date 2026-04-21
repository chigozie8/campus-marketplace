import type { Metadata } from 'next'
import { LegalPageTemplate } from '@/components/legal/legal-page-template'
import { getSiteSettings } from '@/lib/site-settings'
import { LEGAL_DOCS, resolveLegalMarkdown } from '@/lib/site-settings-defaults'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Privacy Policy | VendoorX',
  description: 'Read the VendoorX Privacy Policy to understand how we collect, use, and protect your personal data.',
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings()
  const doc = LEGAL_DOCS.find(d => d.id === 'privacy')!
  const md  = resolveLegalMarkdown(doc, settings.legal_privacy_md)
  return (
    <LegalPageTemplate
      slug="privacy"
      title="Privacy Policy"
      intro="At VendoorX, your privacy is foundational to how we build and operate the platform. This policy explains what data we collect, why we collect it, and how you can control it."
      markdown={md}
      lastUpdated={settings.legal_last_updated}
    />
  )
}
