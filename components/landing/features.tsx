import {
  MessageCircle,
  Search,
  Shield,
  Zap,
  TrendingUp,
  Bell,
  MapPin,
  Heart,
} from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Direct Connect',
    description:
      'Chat with sellers instantly on WhatsApp. No middleman, no delays — just real conversations that close deals.',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    icon: Search,
    title: 'Smart Search & Filters',
    description:
      'Find exactly what you need with powerful filters by campus, category, price range, and condition.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Shield,
    title: 'Verified Sellers',
    description:
      'Shop with confidence. Verified student sellers with ratings, reviews, and campus credentials.',
    color: 'text-primary',
    bg: 'bg-primary/8 dark:bg-primary/10',
  },
  {
    icon: Zap,
    title: 'Instant Listings',
    description:
      'List your item in under 60 seconds. Add photos, set price, and start receiving WhatsApp inquiries.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: TrendingUp,
    title: 'Seller Dashboard',
    description:
      'Track your views, inquiries, and sales performance. Grow your campus business with real insights.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    icon: Bell,
    title: 'Price Alerts',
    description:
      'Set alerts for items you want. Get notified the moment matching products are listed on campus.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    icon: MapPin,
    title: 'Campus-Specific',
    description:
      'Browse listings from your specific campus or university. Hyper-local commerce at its best.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    icon: Heart,
    title: 'Save Favourites',
    description:
      'Save items you love and come back to them later. Never miss a great deal again.',
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Why CampusCart</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">
            Everything you need to buy & sell smarter
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance leading-relaxed">
            Built specifically for campus life. Fast, safe, and connected to the social apps you already use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-border/50 bg-card card-hover group"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
