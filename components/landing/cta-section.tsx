import Link from 'next/link'
import { ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PERKS = [
  'Free to join, free to list',
  'WhatsApp-first, no middlemen',
  'Verified seller badge',
  'No commission on sales',
]

export function CtaSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 md:p-16">
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '28px 28px',
            }}
          />

          {/* Accent blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, white/10 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, white/10 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-balance mb-4">
                Ready to buy &amp; sell smarter?
              </h2>
              <p className="text-white/75 text-lg max-w-md leading-relaxed text-balance mb-8">
                Join 50,000+ students already trading on CampusCart. It&apos;s free to join and free to list.
              </p>

              {/* Perk list */}
              <ul className="flex flex-col gap-2 mb-8">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-2.5 justify-center lg:justify-start">
                    <CheckCircle2 className="w-4 h-4 text-white/80 flex-shrink-0" />
                    <span className="text-sm text-white/80">{perk}</span>
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg h-12 px-8 text-base font-semibold rounded-xl w-full sm:w-auto"
                  asChild
                >
                  <Link href="/auth/sign-up">
                    Start for Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 h-12 px-8 text-base rounded-xl w-full sm:w-auto bg-transparent"
                  asChild
                >
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            </div>

            {/* Right: stats card */}
            <div className="flex-shrink-0 w-full max-w-xs">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-white/70 text-sm font-medium mb-4 text-center">Live marketplace stats</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '50K+', label: 'Active users' },
                    { value: '120+', label: 'Campuses' },
                    { value: '₦2B+', label: 'Transacted' },
                    { value: '4.9★', label: 'Average rating' },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-white/10">
                      <p className="text-xl font-bold text-white">{value}</p>
                      <p className="text-xs text-white/65 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
