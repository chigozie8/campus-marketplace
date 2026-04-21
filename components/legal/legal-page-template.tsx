import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { MarkdownContent } from '@/components/blog/markdown-content'

interface Props {
  title: string
  intro?: string
  markdown: string
  lastUpdated?: string
  /** Slug of THIS page, so it's excluded from the related-links footer. */
  slug: 'privacy' | 'terms' | 'cookies' | 'refund' | 'dispute' | 'trust'
}

const RELATED = [
  { slug: 'trust',    label: 'Trust & Safety',     href: '/trust' },
  { slug: 'privacy',  label: 'Privacy Policy',     href: '/privacy' },
  { slug: 'terms',    label: 'Terms of Service',   href: '/terms' },
  { slug: 'cookies',  label: 'Cookie Policy',      href: '/cookies' },
  { slug: 'refund',   label: 'Refund Policy',      href: '/refund' },
  { slug: 'dispute',  label: 'Dispute Resolution', href: '/dispute' },
] as const

/**
 * Shared layout for every legal / policy page. Renders admin-managed
 * markdown via <MarkdownContent />. Used by privacy, terms, cookies,
 * refund, dispute and trust & safety pages.
 */
export function LegalPageTemplate({ title, intro, markdown, lastUpdated, slug }: Props) {
  const others = RELATED.filter(r => r.slug !== slug)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-4">
              Last updated · {lastUpdated}
            </p>
          )}
          {intro && (
            <p className="text-base text-muted-foreground leading-relaxed mt-6">
              {intro}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          <MarkdownContent content={markdown} />

          {/* Related */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-muted-foreground">Also read our related policies:</p>
            <div className="flex gap-4 flex-wrap justify-center">
              {others.slice(0, 3).map(o => (
                <Link
                  key={o.slug}
                  href={o.href}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {o.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
