import Link from 'next/link'
import { Laptop, Shirt, BookOpen, UtensilsCrossed, Briefcase, Home, Dumbbell, Sparkles } from 'lucide-react'

const categories = [
  { icon: Laptop, name: 'Electronics', count: '12.4K', slug: 'electronics', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
  { icon: Shirt, name: 'Fashion', count: '18.2K', slug: 'fashion', color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40' },
  { icon: BookOpen, name: 'Books', count: '9.7K', slug: 'books', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  { icon: UtensilsCrossed, name: 'Food & Drinks', count: '5.1K', slug: 'food-drinks', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
  { icon: Briefcase, name: 'Services', count: '3.8K', slug: 'services', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
  { icon: Home, name: 'Housing', count: '2.3K', slug: 'housing', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  { icon: Dumbbell, name: 'Sports', count: '4.5K', slug: 'sports', color: 'text-green-600 bg-green-50 dark:bg-green-950/40' },
  { icon: Sparkles, name: 'Beauty', count: '6.9K', slug: 'beauty', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
]

export function CategoriesSection() {
  return (
    <section id="categories" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Browse by Category</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">
            Find what you need, fast
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-balance leading-relaxed">
            From textbooks to tech, fashion to food — everything a student needs is right here.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(({ icon: Icon, name, count, slug, color }) => (
            <Link
              key={slug}
              href={`/marketplace?category=${slug}`}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/8 transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
