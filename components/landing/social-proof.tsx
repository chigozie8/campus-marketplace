import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Tolu Adeyemi',
    role: 'Student, UNILAG',
    avatar: 'T',
    color: '#16a34a',
    rating: 5,
    text: "I sold my old laptop in 2 hours! The WhatsApp integration is genius — the buyer messaged me directly and we closed the deal on campus.",
  },
  {
    name: 'Chisom Okafor',
    role: 'Business owner, UI',
    avatar: 'C',
    color: '#0891b2',
    rating: 5,
    text: "CampusCart doubled my customer base. I now sell hair products to 3 campuses and manage everything from the seller dashboard.",
  },
  {
    name: 'Emeka Nwosu',
    role: 'Student, OAU',
    avatar: 'E',
    color: '#7c3aed',
    rating: 5,
    text: "Found a 70% cheaper textbook from a final-year student. This platform literally saved me ₦25,000 in one semester!",
  },
  {
    name: 'Amina Garba',
    role: 'Seller, ABU',
    avatar: 'A',
    color: '#dc2626',
    rating: 5,
    text: "The verified seller badge gave my customers confidence. My sales tripled after I got verified. Best platform for campus business.",
  },
]

export function SocialProof() {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">
            Loved by students & sellers
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-balance leading-relaxed">
            Join thousands of students and entrepreneurs across Nigerian campuses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map(({ name, role, avatar, color, rating, text }) => (
            <div key={name} className="p-6 rounded-2xl bg-card border border-border/50 card-hover flex flex-col gap-4">
              <div className="flex">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
