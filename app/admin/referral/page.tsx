import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReferralSettingsEditor } from '@/components/admin/referral-settings-editor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Referral Program' }

export default async function AdminReferralPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminRole } = await supabase
    .from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) redirect('/')

  // Fetch referral settings
  const { data: settingsRows } = await supabase
    .from('site_settings')
    .select('key, value, label')
    .eq('group_name', 'referral')
    .order('key')

  const settings: Record<string, string> = {}
  for (const row of settingsRows ?? []) settings[row.key] = row.value

  // Fetch top referrers
  const { data: topReferrers } = await supabase
    .from('profiles')
    .select('id, full_name, referral_count, university')
    .gt('referral_count', 0)
    .order('referral_count', { ascending: false })
    .limit(20)

  // Fetch total referred users
  const { count: totalReferred } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('referred_by', 'is', null)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Referral Program</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure badges, future reward amounts, and monitor referral performance
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Referred Users', value: (totalReferred ?? 0).toLocaleString() },
          { label: 'Active Referrers', value: (topReferrers?.length ?? 0).toLocaleString() },
          {
            label: 'Program Status',
            value: settings['referral_enabled'] === 'true' ? 'Active' : 'Paused',
            green: settings['referral_enabled'] === 'true',
          },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.green ? 'text-primary' : 'text-foreground'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Settings editor */}
      <ReferralSettingsEditor initialSettings={settings} />

      {/* Top referrers table */}
      <div>
        <h3 className="text-sm font-black text-foreground mb-4">Top Referrers</h3>
        {!topReferrers || topReferrers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
            No referrals recorded yet. Referral counts update when a referred user completes their first purchase.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-black text-muted-foreground">#</th>
                  <th className="text-left px-5 py-3 text-xs font-black text-muted-foreground">User</th>
                  <th className="text-left px-5 py-3 text-xs font-black text-muted-foreground hidden sm:table-cell">University</th>
                  <th className="text-right px-5 py-3 text-xs font-black text-muted-foreground">Referrals</th>
                  <th className="text-right px-5 py-3 text-xs font-black text-muted-foreground">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topReferrers.map((r, i) => {
                  const badge =
                    r.referral_count >= 25 ? '👑 Legend' :
                    r.referral_count >= 10 ? '🏆 Champion' :
                    r.referral_count >= 5  ? '⚡ Pro' :
                    r.referral_count >= 1  ? '🌱 Starter' : '—'
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">
                        {r.full_name || 'Unknown'}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                        {r.university || '—'}
                      </td>
                      <td className="px-5 py-3 text-right font-black text-primary">{r.referral_count}</td>
                      <td className="px-5 py-3 text-right text-xs">{badge}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
