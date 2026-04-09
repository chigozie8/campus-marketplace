import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { BroadcastTool } from '@/components/admin/broadcast-tool'

function svc() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export default async function AdminBroadcastPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const inactiveCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalVerified },
    { count: totalBuyers },
    { count: totalFlagged },
    { count: totalInactive },
  ] = await Promise.all([
    svc().from('profiles').select('*', { count: 'exact', head: true }),
    svc().from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', true),
    svc().from('profiles').select('*', { count: 'exact', head: true }).eq('seller_verified', true),
    svc().from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', false),
    svc().from('profiles').select('*', { count: 'exact', head: true }).eq('is_flagged', true),
    svc().from('profiles').select('*', { count: 'exact', head: true }).lt('updated_at', inactiveCutoff),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Broadcast Notification</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Send an in-app notification to targeted user segments
        </p>
      </div>
      <BroadcastTool
        totalUsers={totalUsers ?? 0}
        totalSellers={totalSellers ?? 0}
        totalVerified={totalVerified ?? 0}
        totalBuyers={totalBuyers ?? 0}
        totalFlagged={totalFlagged ?? 0}
        totalInactive={totalInactive ?? 0}
      />
    </div>
  )
}
