import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | VendoorX',
  description: 'Read the VendoorX Privacy Policy to understand how we collect, use, and protect your personal data.',
}

const LAST_UPDATED = 'April 1, 2026'

const SECTIONS = [
  {
    id: 'information-collected',
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us and information generated as you use VendoorX.

**Information you provide:**
- Account information: full name, email address, password, university affiliation, phone number, and profile photo.
- Listing information: product title, description, photos/videos, price, location, and category.
- Payment information: bank account details for payouts (stored by Paystack, not VendoorX). Card details are never stored by VendoorX.
- Communications: messages you send to our support team, dispute submissions, and review content.

**Information collected automatically:**
- Device data: browser type, operating system, device identifiers.
- Usage data: pages visited, search queries, click patterns, listing views.
- Location data: approximate location (city/campus) when you enable location features.
- Cookies and similar tracking technologies as described in our Cookie Policy.`,
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    content: `We use collected information to:
- Operate, maintain, and improve VendoorX services.
- Process transactions and send related information including purchase confirmations and invoices.
- Verify seller identity and university affiliation.
- Send promotional communications, weekly deal digests, and platform updates (opt-out available at any time).
- Detect and prevent fraudulent activity and enforce our Terms of Service.
- Respond to customer support requests and dispute resolution.
- Comply with legal obligations under Nigerian law.
- Personalise your experience by surfacing relevant listings and recommendations.`,
  },
  {
    id: 'sharing',
    title: '3. Information Sharing',
    content: `We do not sell your personal data. We share information only in the following circumstances:

- **Other users:** Your public profile (name, university, seller rating, listings) is visible to all VendoorX users. Your WhatsApp number is shared with buyers who click "Contact Seller" only if you have enabled it.
- **Payment processors:** Paystack receives payment and payout information necessary to process transactions.
- **Service providers:** We use third-party services (hosting, analytics, email) who process data on our behalf under confidentiality agreements.
- **Legal requirements:** We may disclose information when required by Nigerian law, court order, or to protect the rights, property, or safety of VendoorX, our users, or the public.
- **Business transfers:** In the event of a merger or acquisition, user data may be transferred as part of that transaction.`,
  },
  {
    id: 'data-retention',
    title: '4. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by going to Settings → Account → Delete Account, or by emailing privacy@vendoorx.ng.

Upon deletion:
- Your listings are removed from the marketplace immediately.
- Your personal data is deleted within 30 days, except where retention is required by law (e.g., transaction records required for tax purposes — retained for 7 years).
- Anonymised, aggregated data may be retained indefinitely.`,
  },
  {
    id: 'security',
    title: '5. Security',
    content: `We implement industry-standard security measures to protect your information:
- All data in transit is encrypted with TLS 1.3.
- Passwords are hashed with bcrypt before storage.
- Payment data is processed exclusively by Paystack (PCI-DSS Level 1 certified).
- Access to production systems is restricted to authorised personnel only.
- We conduct regular security reviews and penetration tests.

No method of internet transmission is 100% secure. If you suspect your account has been compromised, change your password immediately and contact us at security@vendoorx.ng.`,
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    content: `Under the Nigeria Data Protection Act (NDPA) 2023, you have the right to:
- **Access:** Request a copy of the personal data we hold about you.
- **Correction:** Request correction of inaccurate or incomplete data.
- **Deletion:** Request deletion of your personal data (subject to legal retention requirements).
- **Portability:** Receive your data in a machine-readable format.
- **Objection:** Object to processing based on legitimate interests.
- **Withdraw Consent:** Withdraw consent for marketing communications at any time.

To exercise these rights, email privacy@vendoorx.ng or use the controls in your Account Settings.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies',
    content: `We use cookies and similar technologies to operate VendoorX effectively. See our full Cookie Policy at vendoorx.ng/cookies for details on what cookies we use and how to manage them.`,
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    content: `VendoorX is not directed to children under 16 years of age. We do not knowingly collect personal information from children under 16. If you believe a child under 16 has provided us with personal data, please contact us immediately at privacy@vendoorx.ng and we will delete that information.`,
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email and by posting a notice on VendoorX at least 14 days before the change takes effect. Your continued use of VendoorX after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: `For privacy-related questions or to exercise your rights, contact our Data Protection Officer:

Email: privacy@vendoorx.ng
Address: VendoorX Technologies Ltd, Victoria Island, Lagos, Nigeria.

We aim to respond to all privacy requests within 5 business days.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="bg-background">

      {/* Header */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-background to-background dark:from-blue-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Shield className="w-3.5 h-3.5" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">
            At VendoorX, your privacy is not an afterthought — it&apos;s foundational to how we build and operate the platform. This policy explains exactly what data we collect, why we collect it, and how you can control it.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          {/* Quick nav */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Quick Navigation</p>
            <div className="flex flex-col gap-1.5">
              {SECTIONS.map(({ id, title }) => (
                <a key={id} href={`#${id}`} className="text-sm text-primary hover:underline font-medium">{title}</a>
              ))}
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map(({ id, title, content }) => (
            <div key={id} id={id} className="scroll-mt-24">
              <h2 className="text-xl font-black text-foreground mb-4">{title}</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {content.split('\n').map((line, i) => {
                  if (!line.trim()) return <br key={i} />
                  if (line.startsWith('**') && line.endsWith('**')) {
                    const text = line.slice(2, -2)
                    return <p key={i} className="font-bold text-foreground text-sm mb-1">{text}</p>
                  }
                  if (line.startsWith('- **')) {
                    const colonIdx = line.indexOf(':**')
                    const boldPart = line.slice(4, colonIdx)
                    const rest = line.slice(colonIdx + 3)
                    return (
                      <div key={i} className="flex gap-2 mb-1.5">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        <p className="text-sm text-muted-foreground leading-relaxed"><span className="font-bold text-foreground">{boldPart}:</span>{rest}</p>
                      </div>
                    )
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex gap-2 mb-1.5">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        <p className="text-sm text-muted-foreground leading-relaxed">{line.slice(2)}</p>
                      </div>
                    )
                  }
                  return <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">{line}</p>
                })}
              </div>
            </div>
          ))}

          {/* Links to other policies */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-muted-foreground">Also read our related policies:</p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-sm font-semibold text-primary hover:underline">Terms of Service</Link>
              <Link href="/cookies" className="text-sm font-semibold text-primary hover:underline">Cookie Policy</Link>
              <Link href="/refund" className="text-sm font-semibold text-primary hover:underline">Refund Policy</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
