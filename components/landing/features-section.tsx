import { MessageCircle, Instagram, Facebook, Zap, ShieldCheck, BarChart3, Search, Star, Globe } from 'lucide-react'

const FEATURES = [
  {
    icon: MessageCircle,
    color: '#25D366',
    bgColor: '#25D366',
    title: 'WhatsApp Commerce',
    description: 'Buyers reach you directly on WhatsApp with one tap. No middlemen, no platform fees, just pure direct sales.',
    isSocial: true,
  },
  {
    icon: Instagram,
    color: '#E1306C',
    bgColor: '#E1306C',
    title: 'Instagram Integration',
    description: 'Sync your listings with Instagram. Let your followers discover your products and DM you to buy.',
    isSocial: true,
  },
  {
    icon: Facebook,
    color: '#1877F2',
    bgColor: '#1877F2',
    title: 'Facebook Marketplace',
    description: 'Cross-post to Facebook Marketplace automatically and reach millions of potential buyers.',
    isSocial: true,
  },
  {
    icon: Zap,
    title: 'Instant Listing',
    description: 'List any product in under 60 seconds. Add photos, set your price, and go live immediately.',
    isSocial: false,
  },
  {
    icon: ShieldCheck,
    title: 'Verified Sellers',
    description: 'Build trust with a verified seller badge. Buyers know they\'re dealing with real, vetted sellers.',
    isSocial: false,
  },
  {
    icon: BarChart3,
    title: 'Sales Analytics',
    description: 'Track views, WhatsApp clicks, and conversion rates from your personal seller dashboard.',
    isSocial: false,
  },
  {
    icon: Search,
    title: 'Smart Discovery',
    description: 'AI-powered search helps buyers find exactly what they need on your campus and nearby.',
    isSocial: false,
  },
  {
    icon: Star,
    title: 'Ratings & Reviews',
    description: 'Build your reputation with buyer reviews. Top-rated sellers get featured placement.',
    isSocial: false,
  },
  {
    icon: Globe,
    title: 'Multi-campus Reach',
    description: 'Sell across multiple campuses. Expand your reach beyond your own school effortlessly.',
    isSocial: false,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section label + header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-4">
            Everything you need to sell smarter
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty leading-relaxed">
            From listing to closing, CampusCart gives you the tools to run a successful campus business — powered by the apps your buyers already use.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-default"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={
                    feature.isSocial
                      ? { backgroundColor: feature.bgColor }
                      : { backgroundColor: 'oklch(0.52 0.18 152 / 0.12)' }
                  }
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: feature.isSocial ? 'white' : 'oklch(0.52 0.18 152)' }}
                  />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
