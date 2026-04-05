import { UserPlus, Camera, Share2, MessageCircle } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create your free account',
    description: 'Sign up in seconds with your email. Complete your seller profile with your campus, WhatsApp number, and what you sell.',
  },
  {
    step: '02',
    icon: Camera,
    title: 'List your products',
    description: 'Upload photos, write a description, set your price, and choose your category. Your listing goes live instantly.',
  },
  {
    step: '03',
    icon: Share2,
    title: 'Share across platforms',
    description: 'Share your listings to WhatsApp Status, Instagram Stories, and Facebook with one click.',
  },
  {
    step: '04',
    icon: MessageCircle,
    title: 'Close deals on WhatsApp',
    description: 'Buyers tap "Chat on WhatsApp" and land directly in your DMs. Negotiate, confirm, and get paid — no platform interference.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-4">
            Selling made simple
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty leading-relaxed">
            From sign-up to first sale in under 5 minutes. No technical skills required.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="relative flex flex-col">
                {/* Connector */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-border" />
                )}

                {/* Card */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
                  {/* Icon with step number */}
                  <div className="relative w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-primary" />
                    <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="font-semibold text-foreground mb-2 text-balance">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
