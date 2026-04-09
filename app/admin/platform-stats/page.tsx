import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSiteSettings } from '@/lib/site-settings'
import { PlatformStatsEditor } from '@/components/admin/platform-stats-editor'

export const dynamic = 'force-dynamic'

export default async function AdminPlatformStatsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: admin } = await supabase
    .from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!admin) redirect('/')

  const settings = await getSiteSettings()

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Platform Stats</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Control the figures displayed on the homepage, About page, and Newsroom. Changes appear instantly with no cache.
        </p>
      </div>
      <PlatformStatsEditor initialSettings={settings} />
    </div>
  )
}
