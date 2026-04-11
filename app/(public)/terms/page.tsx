import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | VendoorX',
  description: 'Read the VendoorX Terms of Service governing your use of the platform.',
}

const LAST_UPDATED = 'April 1, 2026'

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By creating an account, accessing, or using VendoorX (the "Platform"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, do not use VendoorX.

These Terms constitute a legally binding agreement between you and VendoorX Technologies Ltd, a company incorporated under the laws of the Federal Republic of Nigeria.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `To use VendoorX you must:
- Be at least 16 years of age.
- Be a seller, buyer, or business operator in Nigeria.
- Provide accurate, complete, and current registration information.
- Not have been previously banned from VendoorX.

By using the Platform, you represent and warrant that you meet all of the eligibility requirements.`,
  },
  {
    id: 'account',
    title: '3. Your Account',
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must:
- Immediately notify VendoorX of any unauthorised use of your account.
- Not share your credentials with any third party.
- Not create multiple accounts or impersonate another person.

VendoorX reserves the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    id: 'seller-obligations',
    title: '4. Seller Obligations',
    content: `As a seller on VendoorX, you agree to:
- List only items you own or have the legal right to sell.
- Provide accurate, honest, and complete product descriptions.
- Not list counterfeit, stolen, illegal, or prohibited items (including but not limited to weapons, drugs, and pirated content).
- Respond to buyer enquiries within 24 hours.
- Deliver products as described and within agreed timeframes.
- Comply with all applicable Nigerian consumer protection laws.

You understand that VendoorX is a marketplace platform and is not party to transactions between buyers and sellers. VendoorX may, at its discretion, remove any listing that violates these Terms.`,
  },
  {
    id: 'platform-fee',
    title: '5. VAT & Fees',
    content: `VendoorX deducts a flat ₦100 VAT on transactions processed through the Paystack checkout system. This charge:
- Is deducted automatically from the buyer payment before it reaches your wallet.
- Does NOT apply to WhatsApp direct deals conducted outside the VendoorX checkout.
- Is non-refundable once a transaction is complete.

Sellers who use the "Boost" feature pay a separate boost fee (₦500–₦2,000) for promoted listing placement.`,
  },
  {
    id: 'prohibited',
    title: '6. Prohibited Activities',
    content: `You may not use VendoorX to:
- Post false, misleading, or deceptive listings.
- Harass, threaten, or abuse other users.
- Conduct any form of money laundering or fraud.
- Circumvent escrow by pressuring buyers to pay outside the platform.
- Scrape, crawl, or systematically extract platform data without permission.
- Attempt to hack, disrupt, or compromise the platform's security.
- Post adult content, hate speech, or content that violates Nigerian law.

Violation of prohibited activities may result in immediate account termination and reporting to law enforcement.`,
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual Property',
    content: `VendoorX and its original content, features, and functionality are owned by VendoorX Technologies Ltd and are protected by Nigerian intellectual property laws.

When you post content (photos, videos, descriptions) on VendoorX, you grant VendoorX a non-exclusive, royalty-free, worldwide licence to use, display, and distribute that content solely for operating and promoting the platform.

You retain all ownership rights to your content. You represent that you own or have appropriate rights to all content you post.`,
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimer of Warranties',
    content: `VendoorX is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that:
- The Platform will be uninterrupted, timely, secure, or error-free.
- The quality of any products or services purchased through the Platform will meet your expectations.
- Sellers listed on the Platform have been individually vetted beyond email verification.

VendoorX is a marketplace and facilitator only. All transactions are between buyers and sellers directly.`,
  },
  {
    id: 'limitation',
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by Nigerian law, VendoorX shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
- Your use or inability to use the Platform.
- Any goods or services purchased through the Platform.
- Unauthorised access to your account.
- Any third-party conduct on the Platform.

Our total liability to you for any claims arising from these Terms shall not exceed the total fees paid by you to VendoorX in the 12 months preceding the claim.`,
  },
  {
    id: 'termination',
    title: '10. Termination',
    content: `We may suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, third parties, or VendoorX.

You may terminate your account at any time through Account Settings. Upon termination, your right to use the Platform ceases immediately. Sections that by their nature survive termination shall survive.`,
  },
  {
    id: 'governing-law',
    title: '11. Governing Law & Disputes',
    content: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to the Lagos State High Court.`,
  },
  {
    id: 'changes',
    title: '12. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. We will notify registered users of material changes by email at least 14 days before the change takes effect. Continued use of VendoorX after the effective date constitutes acceptance of the updated Terms.`,
  },
]

export default function TermsPage() {
  return (
    <div className="bg-background">

      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 via-background to-background dark:from-gray-900/30 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">
            Please read these Terms of Service carefully before using VendoorX. They set out the rules for using our platform as a buyer, seller, or visitor.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Quick Navigation</p>
            <div className="flex flex-col gap-1.5">
              {SECTIONS.map(({ id, title }) => (
                <a key={id} href={`#${id}`} className="text-sm text-primary hover:underline font-medium">{title}</a>
              ))}
            </div>
          </div>

          {SECTIONS.map(({ id, title, content }) => (
            <div key={id} id={id} className="scroll-mt-24">
              <h2 className="text-xl font-black text-foreground mb-4">{title}</h2>
              <div className="flex flex-col gap-2">
                {content.split('\n').map((line, i) => {
                  if (!line.trim()) return <span key={i} className="h-1" />
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex gap-2">
                        <span className="text-primary shrink-0 mt-1">•</span>
                        <p className="text-sm text-muted-foreground leading-relaxed">{line.slice(2)}</p>
                      </div>
                    )
                  }
                  return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                })}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-muted-foreground">Questions about these terms?</p>
            <div className="flex gap-4">
              <Link href="/contact" className="text-sm font-semibold text-primary hover:underline">Contact Us</Link>
              <Link href="/privacy" className="text-sm font-semibold text-primary hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
