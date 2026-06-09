import Link from 'next/link'
import { CheckCircle2, Zap, ShieldCheck, Users, Star } from 'lucide-react'

const LOGIN_FEATURES = [
  { icon: Zap, text: 'Instant WhatsApp buyer connections' },
  { icon: ShieldCheck, text: 'Verified seller badges' },
  { icon: Users, text: '50,000+ active campus sellers' },
]

const SIGNUP_FEATURES = [
  'Free to join, free to list forever',
  'Direct WhatsApp buyer connections',
  'Seller analytics & verified badge',
  'Trusted campus community',
  'Instant buyer notifications',
]

const STATS_LOGIN = [
  { value: '50K+', label: 'Sellers' },
  { value: '120K+', label: 'Listings' },
  { value: '4.9★', label: 'Rating' },
]

const STATS_SIGNUP = [
  { value: '₦0', label: 'Commission' },
  { value: '60s', label: 'To list' },
  { value: '50K+', label: 'Buyers' },
]

type Props = { mode: 'login' | 'signup' }

export function AuthSidePanel({ mode }: Props) {
  const isSignup = mode === 'signup'

  return (
    <aside
      className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col relative overflow-hidden"
      style={{ background: '#0a0a0a' }}
      aria-hidden="true"
    >
      {/* Fine grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* WhatsApp green glow blobs */}
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #25D366 0%, transparent 70%)' }} />
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #25D366 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center w-fit">
          <span className="text-xl font-black tracking-tight text-white leading-none">
            Vendoor<span style={{ color: '#25D366' }}>X</span>
          </span>
        </Link>

        {/* Main copy */}
        <div className="flex-1 flex flex-col justify-center mt-10">

          {/* WhatsApp badge */}
          <div className="flex items-center gap-2 mb-5 w-fit">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#25D366' }}>
              <WhatsAppIcon size={16} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase"
              style={{ color: '#25D366' }}>
              WhatsApp Commerce
            </span>
          </div>

          <h1 className="text-4xl xl:text-[2.6rem] font-black text-white leading-[1.08] tracking-tight mb-4 text-balance">
            {isSignup ? (
              <>Start selling in<br />under <span style={{ color: '#25D366' }}>60 seconds.</span></>
            ) : (
              <>The smarter way<br />to trade <span style={{ color: '#25D366' }}>campus.</span></>
            )}
          </h1>

          <p className="text-white/50 text-[0.9rem] leading-relaxed mb-8 max-w-[280px]">
            {isSignup
              ? 'List items for free, connect buyers directly on WhatsApp, and get paid — zero commissions.'
              : 'Join thousands of Nigerian students buying and selling smarter with WhatsApp-powered listings.'
            }
          </p>

          {/* Features */}
          {isSignup ? (
            <div className="space-y-2.5 mb-10">
              {SIGNUP_FEATURES.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)' }}>
                    <CheckCircle2 className="w-3 h-3" style={{ color: '#25D366' }} />
                  </div>
                  <span className="text-white/70 text-sm">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-10">
              {LOGIN_FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#25D366' }} />
                  </div>
                  <span className="text-white/70 text-sm">{text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-7 pt-7 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {(isSignup ? STATS_SIGNUP : STATS_LOGIN).map(({ value, label }) => (
              <div key={label}>
                <p className="text-[1.6rem] font-black text-white leading-none">{value}</p>
                <p className="text-white/40 text-[11px] mt-1 uppercase tracking-wider font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial card */}
        <div className="rounded-2xl p-4 xl:p-5 mt-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#25D366' }} />
            ))}
          </div>
          {isSignup ? (
            <>
              <p className="text-white/75 text-sm leading-relaxed italic mb-3">
                &quot;I listed my textbooks and got 4 WhatsApp messages in an hour. VendoorX is the real deal!&quot;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(37,211,102,0.25)', border: '1px solid rgba(37,211,102,0.35)', color: '#25D366' }}>
                  AO
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Adaeze O.</p>
                  <p className="text-white/40 text-[10px]">UNN, Enugu</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-white/75 text-sm leading-relaxed italic mb-3">
                &quot;Sold my MacBook in 3 hours. No middleman, no stress — just WhatsApp and done.&quot;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(37,211,102,0.25)', border: '1px solid rgba(37,211,102,0.35)', color: '#25D366' }}>
                  TK
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Tunde K.</p>
                  <p className="text-white/40 text-[10px]">UNILAG, Lagos</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
