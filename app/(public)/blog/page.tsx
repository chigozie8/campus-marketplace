import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Zap, TrendingUp, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog & Updates | VendoorX',
  description: 'Read the latest VendoorX news, seller tips, campus commerce insights, and platform updates.',
}

const POSTS = [
  {
    tag: 'Seller Tips',
    tagColor: 'text-emerald-600',
    tagBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    title: 'How to Make Your First ₦50,000 on VendoorX in 30 Days',
    excerpt: 'A step-by-step guide for new campus sellers — from choosing the right products to crafting listings that convert.',
    date: 'March 28, 2026',
    readTime: '7 min read',
    icon: TrendingUp,
    color: 'from-emerald-500 to-green-600',
  },
  {
    tag: 'Platform Update',
    tagColor: 'text-blue-600',
    tagBg: 'bg-blue-50 dark:bg-blue-950/30',
    title: 'Introducing Store Boost: Get 3x More Visibility for Your Listings',
    excerpt: 'The new Boost feature lets sellers promote their store for 7 days with guaranteed placement at the top of marketplace search results.',
    date: 'March 15, 2026',
    readTime: '4 min read',
    icon: Zap,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    tag: 'Success Story',
    tagColor: 'text-rose-600',
    tagBg: 'bg-rose-50 dark:bg-rose-950/30',
    title: 'From ₦0 to ₦500,000: How Fatimah Built a Food Business at ABU',
    excerpt: 'Fatimah Al-Hassan turned her campus jollof rice side hustle into a ₦500K/month operation using VendoorX. Here\'s exactly how she did it.',
    date: 'March 5, 2026',
    readTime: '10 min read',
    icon: Users,
    color: 'from-rose-500 to-pink-600',
  },
  {
    tag: 'Commerce Insights',
    tagColor: 'text-amber-600',
    tagBg: 'bg-amber-50 dark:bg-amber-950/30',
    title: 'The 5 Best-Selling Product Categories on Nigerian Campuses in 2026',
    excerpt: 'Data from 50,000+ VendoorX sellers reveals what students are buying most. Use this to find your next best-selling product.',
    date: 'February 20, 2026',
    readTime: '6 min read',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
  },
]

export default function BlogPage() {
  return (
    <div className="bg-background">

      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-background to-background dark:from-purple-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Blog & Updates
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">The VendoorX Blog</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Seller tips, success stories, platform updates, and everything you need to thrive on campus.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {POSTS.map(({ tag, tagColor, tagBg, title, excerpt, date, readTime, icon: Icon, color }) => (
              <div
                key={title}
                className="group rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className={`h-24 bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="w-10 h-10 text-white/80" />
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${tagBg} ${tagColor} w-fit`}>{tag}</span>
                  <h2 className="text-base font-black text-foreground leading-snug group-hover:text-primary transition-colors">{title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{excerpt}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{date}</span>
                      <span>·</span>
                      <span>{readTime}</span>
                    </div>
                    <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center rounded-2xl border border-border bg-muted/30 py-12 px-6">
            <p className="text-lg font-black text-foreground mb-3">More articles coming soon</p>
            <p className="text-muted-foreground text-sm mb-6">Subscribe to get new posts delivered to your inbox every week.</p>
            <Link
              href="/#footer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all"
            >
              Subscribe to Newsletter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
