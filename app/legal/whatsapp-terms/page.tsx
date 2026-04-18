import Link from 'next/link'
import { ArrowLeft, ShieldCheck, MessageCircle, Lock, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'WhatsApp Terms of Service — VendoorX',
  description: 'How VendoorX uses WhatsApp to communicate with customers, and your rights.',
}

export default function WhatsAppTermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <div className="w-16 h-16 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center justify-center mb-6">
          <MessageCircle className="w-8 h-8 text-[#16a34a]" />
        </div>

        <h1 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight mb-3">
          WhatsApp Terms of Service
        </h1>
        <p className="text-gray-500 dark:text-muted-foreground text-sm mb-12">
          Last updated: April 2026
        </p>

        <div className="prose prose-sm max-w-none dark:prose-invert space-y-6 text-gray-700 dark:text-foreground/90 leading-relaxed">
          <p>
            VendoorX (“we”, “us”, “our”) operates a WhatsApp bot to help users discover
            products, place orders, track deliveries and resolve disputes on the VendoorX
            marketplace. By messaging our WhatsApp number, you agree to the terms below.
          </p>

          <Section icon={ShieldCheck} title="1. How we use WhatsApp">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We <strong>only reply to messages you send first</strong>. We never cold-message anyone.</li>
              <li>Our bot may answer your questions automatically and connect you to a human agent on request.</li>
              <li>We may send you transactional updates about orders you placed (e.g. payment confirmation, delivery status, dispute resolution).</li>
              <li>We will <strong>never</strong> send promotional broadcasts unless you have explicitly opted in.</li>
            </ul>
          </Section>

          <Section icon={Lock} title="2. Privacy & your data">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We store your WhatsApp number to deliver our service. We do <strong>not</strong> sell or share it with third parties.</li>
              <li>Message contents are processed only to respond to you and improve the service.</li>
              <li>Standard WhatsApp data charges from your carrier may apply.</li>
              <li>Read our full <Link href="/legal/privacy" className="text-[#16a34a] hover:underline">Privacy Policy</Link> for details.</li>
            </ul>
          </Section>

          <Section icon={MessageCircle} title="3. Opting out">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Reply <strong>STOP</strong> at any time to opt out. We will stop messaging you immediately.</li>
              <li>Reply <strong>START</strong> to opt back in.</li>
              <li>Other accepted opt-out keywords: <em>UNSUBSCRIBE, CANCEL, QUIT, OPT-OUT, END</em>.</li>
            </ul>
          </Section>

          <Section icon={AlertTriangle} title="4. Acceptable use">
            <p>
              Do not use our WhatsApp service to send spam, threats, illegal content,
              or attempts to compromise the platform. We reserve the right to block
              numbers that violate these terms or WhatsApp&apos;s own
              <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noopener" className="text-[#16a34a] hover:underline ml-1">
                Business Policy
              </a>.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="5. Service availability">
            <p>
              The WhatsApp bot runs on third-party infrastructure and may experience
              downtime. For urgent matters, email us at{' '}
              <a href="mailto:support@vendoorx.ng" className="text-[#16a34a] hover:underline">
                support@vendoorx.ng
              </a>.
            </p>
          </Section>

          <Section icon={MessageCircle} title="6. Changes">
            <p>
              We may update these terms from time to time. The current version is
              always available at <code className="text-xs bg-gray-100 dark:bg-muted px-1.5 py-0.5 rounded">/legal/whatsapp-terms</code>.
              Continued use after changes means you accept the updated terms.
            </p>
          </Section>

          <div className="mt-10 p-5 rounded-2xl bg-[#0a0a0a] text-white">
            <p className="text-sm leading-relaxed">
              💚 <strong>Questions?</strong> Email{' '}
              <a href="mailto:support@vendoorx.ng" className="text-[#4ade80] hover:underline">
                support@vendoorx.ng
              </a>{' '}
              or visit{' '}
              <Link href="/help" className="text-[#4ade80] hover:underline">
                vendoorx.ng/help
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-black text-gray-950 dark:text-white tracking-tight mb-3 flex items-center gap-2">
        <Icon className="w-5 h-5 text-[#16a34a]" />
        {title}
      </h2>
      <div className="text-sm">{children}</div>
    </section>
  )
}
