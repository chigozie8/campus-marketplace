import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Fashion Seller, UNILAG',
    avatar: 'AO',
    avatarColor: 'bg-pink-500',
    rating: 5,
    quote: 'I made ₦180,000 in my first month selling clothes on CampusCart. The WhatsApp button is genius — buyers just chat me directly and we close the deal in minutes.',
  },
  {
    name: 'Chukwuemeka Eze',
    role: 'Electronics Reseller, UI Ibadan',
    avatar: 'CE',
    avatarColor: 'bg-blue-500',
    rating: 5,
    quote: 'Sold 3 laptops in one week just from listing them here. The platform is clean, fast, and the seller dashboard shows me exactly how many people viewed my listings.',
  },
  {
    name: 'Fatimah Al-Hassan',
    role: 'Food Vendor, ABU Zaria',
    avatar: 'FA',
    avatarColor: 'bg-orange-500',
    rating: 5,
    quote: 'My jollof rice business blew up after I listed on CampusCart. I get daily orders from students across campus now. It\'s literally the best business decision I made.',
  },
  {
    name: 'Oluwafemi Adeyemi',
    role: 'Textbook Seller, OAU',
    avatar: 'OA',
    avatarColor: 'bg-primary',
    rating: 5,
    quote: 'Made back my school fees selling used textbooks! Students are always looking for affordable books and CampusCart puts me right in front of them.',
  },
  {
    name: 'Blessing Nwosu',
    role: 'Beauty Entrepreneur, FUTA',
    avatar: 'BN',
    avatarColor: 'bg-rose-500',
    rating: 5,
    quote: 'The verified seller badge gives buyers confidence. My sales tripled once I got verified. CampusCart is the real deal for serious campus entrepreneurs.',
  },
  {
    name: 'Ibrahim Musa',
    role: 'Service Provider, BUK',
    avatar: 'IM',
    avatarColor: 'bg-indigo-500',
    rating: 5,
    quote: 'I offer laptop repairs and CampusCart has been sending me steady clients. The AI assistant even helped me write better service descriptions. Amazing platform!',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-4">
            Loved by campus entrepreneurs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty leading-relaxed">
            Join thousands of students and young entrepreneurs already making money on CampusCart.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <Quote className="w-6 h-6 text-primary/30" />
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 text-pretty">{t.quote}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <StarRating rating={t.rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
