import { CreditCard, Lock, Truck, CheckCircle2 } from 'lucide-react'

export type EscrowStep = {
  title: string
  description: string
}

export const DEFAULT_ESCROW_STEPS: EscrowStep[] = [
  { title: 'You pay securely', description: 'Buyer checks out via Paystack — debit card, transfer, or USSD. Funds clear in seconds.' },
  { title: 'We hold the money', description: "VendoorX holds the payment in escrow. The seller can see it, but can't touch it yet." },
  { title: 'Seller delivers', description: 'Seller ships or hands over the item. You get a tracking update at every step.' },
  { title: 'Money releases', description: "Once you confirm delivery (or 24 h pass with no dispute), funds release to the seller's wallet." },
]

const ICONS = [CreditCard, Lock, Truck, CheckCircle2]

/**
 * 4-step "How escrow works" diagram. Sits before the FAQ to address the
 * single biggest objection — "what if the seller takes my money and runs?"
 * Steps are admin-editable via `escrow_steps` in site_settings.
 */
export function EscrowFlowSection({ steps = DEFAULT_ESCROW_STEPS }: { steps?: EscrowStep[] }) {
  if (!steps?.length) return null
  return (
    <section id="escrow" className="py-24 sm:py-28 px-4 sm:px-6 bg-background scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-[0.18em] mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Lock className="w-3.5 h-3.5" />
            Escrow protected
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight text-balance">
            Your money is <span className="text-primary">never at risk</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 leading-relaxed text-pretty">
            Every Paystack-checkout order on VendoorX is held in escrow until you confirm delivery. Seller can&apos;t disappear with your cash. Simple.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {steps.slice(0, 4).map((step, i) => {
            const Icon = ICONS[i] ?? CheckCircle2
            return (
              <li key={i} className="relative">
                {/* Connector arrow on desktop */}
                {i < Math.min(steps.length, 4) - 1 && (
                  <span aria-hidden="true" className="hidden md:block absolute top-8 left-[calc(100%-1.5rem)] w-6 h-px bg-gradient-to-r from-primary/40 to-transparent" />
                )}
                <div className="h-full p-6 rounded-3xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
