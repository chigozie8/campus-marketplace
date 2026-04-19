import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { Mail, Users, UserMinus } from 'lucide-react'
import { NewsletterComposer } from '@/components/admin/newsletter-composer'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export const dynamic = 'force-dynamic'

export default async function AdminNewsletterPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const sc = svc()
  const [{ count: total }, { count: active }, { count: unsubbed }, { data: recent }] = await Promise.all([
    sc.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    sc.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('unsubscribed', false),
    sc.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('unsubscribed', true),
    sc.from('newsletter_subscribers')
      .select('email, first_name, source, campus, unsubscribed, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const cards = [
    { label: 'Total subscribers', value: total ?? 0, icon: Mail, tone: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' },
    { label: 'Active',            value: active ?? 0, icon: Users, tone: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' },
    { label: 'Unsubscribed',      value: unsubbed ?? 0, icon: UserMinus, tone: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Newsletter</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Write a newsletter and send it to every subscriber via Mailtrap. Each email is personalised with the subscriber's first name and includes a one-click unsubscribe link.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className="text-xl font-black text-foreground">{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <NewsletterComposer activeCount={active ?? 0} />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground">Latest subscribers</h2>
          <span className="text-xs text-muted-foreground">Showing {recent?.length ?? 0} of {total ?? 0}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">First name</th>
                <th className="px-4 py-2 font-semibold">Source</th>
                <th className="px-4 py-2 font-semibold">Joined</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).map((r) => (
                <tr key={r.email} className="border-t border-border">
                  <td className="px-4 py-2 text-foreground font-medium">{r.email}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.first_name || '—'}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.source}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-2">
                    {r.unsubscribed
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">unsubscribed</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">active</span>}
                  </td>
                </tr>
              ))}
              {(!recent || recent.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No subscribers yet. Once people sign up from the homepage footer, they'll appear here.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
