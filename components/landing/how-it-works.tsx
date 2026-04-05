import { UserPlus, Search, MessageCircle, CheckCircle } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up with your email and set up your campus profile in seconds. Add your university, campus, and WhatsApp number.',
  },
  {
    step: '02',
    icon: Search,
    title: 'Browse or List',
    description: 'Search thousands of listings from students on your campus, or list your own item with photos in under a minute.',
  },
  {
    step: '03',
    icon: MessageCircle,
    title: 'Connect via WhatsApp',
    description: 'Found something you like? Hit the WhatsApp button and chat directly with the seller. No escrow, no fees.',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Close the Deal',
    description: 'Agree on a price, meet on campus or arrange delivery. Leave a review to help the community.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">
            Get started in 4 easy steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-balance leading-relaxed">
            From sign-up to your first deal in under 5 minutes. No complicated setup required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ step, icon: Icon, title, description }, index) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px bg-border z-0" />
              )}

              {/* Icon circle */}
              <div className="relative z-10 w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
                <Icon className="w-7 h-7 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
              </div>

              <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
