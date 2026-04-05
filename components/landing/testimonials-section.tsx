import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Fashion Seller, UNILAG',
    avatar: 'AO',
    rating: 5,
    quote: 'I made ₦180,000 in my first month selling clothes on CampusCart. The WhatsApp button is genius — buyers just chat me directly and we close the deal in minutes.',
  },
  {
    name: 'Chukwuemeka Eze',
    role: 'Electronics Reseller, UI Ibadan',
    avatar: 'CE',
    rating: 5,
    quote: 'Sold 3 laptops in one week just from listing them here. The platform is clean, fast, and the seller dashboard shows me exactly how many people viewed my listings.',
  },
  {
    name: 'Fatimah Al-Hassan',
    role: 'Food Vendor, ABU Zaria',
    avatar: 'FA',
    rating: 5,
    quote: 'My jollof rice business blew up after I listed on CampusCart. I get daily orders from students across campus now. It\'s literally the best business decision I made.',
  },
  {
    name: 'Oluwafemi Adeyemi',
    role: 'Textbook Seller, OAU',
    avatar: 'OA',
    rating: 5,
    quote: 'Made back my school fees selling used textbooks! Students are always looking for affordable books and CampusCart puts me right in front of them.',
  },
  {
    name: 'Blessing Nwosu',
    role: 'Beauty Entrepreneur, FUTA',
    avatar: 'BN',
    rating: 5,
    quote: 'The verified seller badge gives buyers confidence. My sales tripled once I got verified. CampusCart is the real deal for serious campus entrepreneurs.',
  },
  {
    name: 'Ibrahim Musa',
    role: 'Service Provider, BUK',
    avatar: 'IM',
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
    <section className="py-24 px-4 sm:px-6 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mb-4">
            Loved by campus entrepreneurs
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty leading-relaxed">
            Join thousands of students and young entrepreneurs already making money on CampusCart.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 card-hover">
              <Quote className="w-6 h-6 text-primary/40" />
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t.quote}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
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
