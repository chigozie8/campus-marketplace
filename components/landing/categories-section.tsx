'use client'

import Link from 'next/link'
import { Laptop, Shirt, BookOpen, UtensilsCrossed, Briefcase, Home, Dumbbell, Sparkles, ArrowRight } from 'lucide-react'

const categories = [
  { icon: Laptop, name: 'Electronics', count: '12.4K', slug: 'electronics', gradient: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40' },
  { icon: Shirt, name: 'Fashion', count: '18.2K', slug: 'fashion', gradient: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-50 dark:bg-pink-950/40' },
  { icon: BookOpen, name: 'Books', count: '9.7K', slug: 'books', gradient: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50 dark:bg-amber-950/40' },
  { icon: UtensilsCrossed, name: 'Food & Drinks', count: '5.1K', slug: 'food-drinks', gradient: 'from-orange-500 to-red-600', bgColor: 'bg-orange-50 dark:bg-orange-950/40' },
  { icon: Briefcase, name: 'Services', count: '3.8K', slug: 'services', gradient: 'from-violet-500 to-purple-600', bgColor: 'bg-violet-50 dark:bg-violet-950/40' },
  { icon: Home, name: 'Housing', count: '2.3K', slug: 'housing', gradient: 'from-indigo-500 to-blue-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/40' },
  { icon: Dumbbell, name: 'Sports', count: '4.5K', slug: 'sports', gradient: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50 dark:bg-green-950/40' },
  { icon: Sparkles, name: 'Beauty', count: '6.9K', slug: 'beauty', gradient: 'from-rose-500 to-pink-600', bgColor: 'bg-rose-50 dark:bg-rose-950/40' },
]

export function CategoriesSection() {
  return (
    <section id="categories" className="py-24 sm:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            Browse by Category
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mt-4 mb-5">
            Find what you need, <span className="text-primary">fast</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto text-balance leading-relaxed">
            From textbooks to tech, fashion to food — everything a student needs is right here.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map(({ icon: Icon, name, count, slug, gradient, bgColor }) => (
            <Link
              key={slug}
              href={`/marketplace?category=${slug}`}
              className="group relative flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon container */}
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${bgColor} flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 relative z-10 text-current group-hover:text-white transition-colors duration-500" />
              </div>

              <div className="text-center relative z-10">
                <p className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                  {name}
                </p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  {count} items
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
