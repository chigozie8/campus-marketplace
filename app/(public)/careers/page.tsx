import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Bell, Briefcase, MapPin, Sparkles, Users, Zap, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Careers | VendoorX',
  description: 'Join the VendoorX team. We\'re building Africa\'s most loved campus marketplace — roles opening soon.',
}

const PHOTOS = [
  { id: 'p1', src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=480&h=640&fit=crop&crop=faces&q=85', alt: 'Nigerian university students collaborating' },
  { id: 'p2', src: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=480&h=640&fit=crop&crop=faces&q=85', alt: 'Student at Nigerian campus' },
  { id: 'p3', src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&h=640&fit=crop&crop=faces&q=85', alt: 'Students working on laptops' },
  { id: 'p4', src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=480&h=640&fit=crop&crop=faces&q=85', alt: 'University students studying together' },
  { id: 'p5', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=480&h=640&fit=crop&crop=faces&q=85', alt: 'Student with laptop on campus' },
  { id: 'p6', src: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=480&h=640&fit=crop&crop=faces&q=85', alt: 'Students in university library' },
]

const STATUS_LABELS: Record<string, string> = {
  active: 'Apply Now',
  soon: 'Soon',
  closed: 'Closed',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-[#16a34a]/20 border-[#16a34a]/40 text-[#4ade80]',
  soon: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  closed: 'bg-zinc-700/30 border-zinc-600/30 text-zinc-500',
}

type Job = {
  id: string
  title: string
  team: string
  location: string
  description: string
  employment_type: string
  status: 'active' | 'soon' | 'closed'
}

async function getJobs(): Promise<Job[]> {
  try {
    const supabase = await createClient()
    if (!supabase) return []
    const { data } = await supabase
      .from('job_listings')
      .select('id, title, team, location, description, employment_type, status')
      .in('status', ['active', 'soon'])
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    return (data ?? []) as Job[]
  } catch {
    return []
  }
}

export default async function CareersPage() {
  const jobs = await getJobs()
  const hasActive = jobs.some(j => j.status === 'active')

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 grid grid-cols-3 sm:grid-cols-6 grid-rows-2 gap-1 pointer-events-none select-none">
          {PHOTOS.map((photo, i) => (
            <div
              key={photo.id}
              className={`relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2' : i === 5 ? 'col-span-2 row-span-1' : ''}`}
            >
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 640px) 33vw, 17vw" unoptimized />
              <div className="absolute inset-0 bg-zinc-950/70" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/50 to-zinc-950" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/40 text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            {hasActive ? 'We\'re hiring' : 'Roles opening soon'}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight mb-6 max-w-4xl">
            Build what{' '}
            <span className="text-[#16a34a]">
              50,000+<br className="sm:hidden" /> students
            </span>{' '}
            depend on.
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-2xl mb-10">
            We&apos;re assembling the team that will power campus commerce across every university in Nigeria.
            {hasActive ? ' Open roles listed below.' : ' Roles are opening soon — be first in line.'}
          </p>

          {!hasActive && (
            <form action="/api/newsletter" method="POST" className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <input
                type="email"
                name="email"
                placeholder="your@university.edu.ng"
                required
                className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 focus:border-[#16a34a] text-white placeholder:text-zinc-500 outline-none transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-6 py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-95 font-bold text-sm text-white flex items-center justify-center gap-2 shrink-0 transition-all shadow-lg shadow-[#16a34a]/30"
              >
                <Bell className="w-4 h-4" />
                Notify Me
              </button>
            </form>
          )}
          {!hasActive && <p className="text-zinc-600 text-xs mt-3">No spam. We&apos;ll only email when roles go live.</p>}

          {hasActive && (
            <a href="#roles" className="px-8 py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-95 font-bold text-white text-base transition-all shadow-xl shadow-[#16a34a]/20 flex items-center gap-2">
              See open roles <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="relative z-10 flex justify-center pb-10 animate-bounce">
          <div className="w-px h-10 bg-gradient-to-b from-zinc-600 to-transparent" />
        </div>
      </section>

      {/* ── ROLES ── */}
      {jobs.length > 0 && (
        <section id="roles" className="px-4 py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-10">
              <Briefcase className="w-5 h-5 text-[#16a34a]" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                {hasActive ? 'Open positions' : 'Roles we\'re building towards'}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="px-6 py-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#16a34a]/40 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-white font-bold text-base group-hover:text-[#4ade80] transition-colors">{job.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 flex-wrap">
                        <span>{job.team}</span>
                        <span>·</span>
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{job.location}</span>
                        <span>·</span>
                        <span>{job.employment_type}</span>
                      </div>
                      {job.description && (
                        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{job.description}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {job.status === 'active' ? (
                        <Link
                          href={`/contact?subject=Application — ${encodeURIComponent(job.title)}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-all whitespace-nowrap"
                        >
                          Apply <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-full border text-xs font-bold ${STATUS_COLORS[job.status]}`}>
                          {STATUS_LABELS[job.status]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY JOIN ── */}
      <section className="px-4 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <Zap className="w-5 h-5 text-[#16a34a]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Why this matters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '50K+', label: 'students on the platform' },
              { stat: '120+', label: 'campuses across Nigeria' },
              { stat: '₦0', label: 'fee to sell on WhatsApp' },
            ].map(({ stat, label }) => (
              <div key={stat} className="rounded-2xl bg-white/5 border border-white/10 p-8">
                <p className="text-4xl font-black text-[#4ade80] mb-2">{stat}</p>
                <p className="text-zinc-400 text-sm leading-snug">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 text-base leading-relaxed mt-10 text-center max-w-xl mx-auto">
            VendoorX is how Nigerian students buy and sell — textbooks, food, fashion, electronics — all on WhatsApp, with real payments and real trust built in.
            <br /><br />
            When you join us, your code, designs, and ideas are used by real students every single day.
          </p>
        </div>
      </section>

      {/* ── OPEN APPLICATION CTA ── */}
      <section className="px-4 py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <Users className="w-8 h-8 text-[#16a34a] mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
            Don&apos;t wait for a posting.
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed mb-8">
            If you&apos;re exceptional and believe in what we&apos;re building, send us a message now. We read every application.
          </p>
          <Link
            href="/contact?subject=Open Application — Careers"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-95 font-bold text-white text-base transition-all shadow-xl shadow-[#16a34a]/20"
          >
            Send open application <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-zinc-600 text-xs mt-5">
            Email us directly at{' '}
            <a href="mailto:team@vendoorx.com" className="text-[#4ade80] hover:underline">
              team@vendoorx.com
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
