import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Mail, Download, Users } from 'lucide-react'

export const metadata = { title: 'Waitlist — VendoorX Admin' }

interface WaitlistEntry {
  id: string
  email: string
  created_at: string
}

function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function AdminWaitlistPage() {
  const supabase = adminDb()

  const { data: entries } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  const rows: WaitlistEntry[] = entries ?? []

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-NG', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // Build CSV content for copy
  const csvContent = ['Email,Signed Up'].concat(
    rows.map(r => `${r.email},${r.created_at}`)
  ).join('\n')

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">Waitlist Signups</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Emails collected from the Coming Soon page
          </p>
        </div>

        {rows.length > 0 && (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`}
            download="vendoorx-waitlist.csv"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 active:scale-95 font-semibold text-sm px-4 py-2 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        )}
      </div>

      {/* Stats card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{rows.length}</p>
            <p className="text-xs text-muted-foreground">Total signups</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">
              {rows.filter(r => {
                const d = new Date(r.created_at)
                const now = new Date()
                return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
              }).length}
            </p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">No signups yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              When visitors sign up on the Coming Soon page their emails will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry, i) => (
                  <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`mailto:${entry.email}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {entry.email}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
