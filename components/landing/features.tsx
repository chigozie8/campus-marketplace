import {
  MessageCircle,
  LayoutDashboard,
  CreditCard,
  Package,
  Share2,
  TrendingUp,
  Users,
  ShieldCheck,
} from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Order Links',
    description:
      'Generate smart wa.me links with pre-filled messages. Buyers tap once and land directly in your DMs ready to order — no app download needed.',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    icon: LayoutDashboard,
    title: 'Vendor Dashboard',
    description:
      'Manage all your products, orders, and customers from one clean dashboard. See what\'s selling and what needs attention at a glance.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Package,
    title: 'Order Management',
    description:
      'Track every order through its full lifecycle — pending, paid, processing, delivered. No more losing track of orders in your chats.',
    color: 'text-primary',
    bg: 'bg-primary/8 dark:bg-primary/10',
  },
  {
    icon: CreditCard,
    title: 'Paystack Payments',
    description:
      'Accept payments seamlessly with Paystack integration. Automatic webhook verification means you always know when you\'ve been paid.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: TrendingUp,
    title: 'Sales Analytics',
    description:
      'Track your revenue, top products, and customer behaviour with real-time analytics. Make data-driven decisions to grow your business.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    icon: Share2,
    title: 'Multi-Platform Sharing',
    description:
      'Share your listings to WhatsApp Status, Instagram Stories, and Facebook with one click. Your store, everywhere your customers are.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    icon: Users,
    title: 'Customer Records',
    description:
      'Every buyer is saved automatically — name, phone, and full order history. Build a real customer base, not just a contacts list.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Vendor Badge',
    description:
      'Get verified and earn a trust badge that gives buyers confidence. Verified vendors consistently close more deals and earn more.',
    color: 'text-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Why VendoorX</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">
            Everything you need to run a real business
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance leading-relaxed">
            Built for vendors who sell via WhatsApp, Instagram, and Facebook. Replace messy chats with a system that scales.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
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
