import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BroadcastTool } from '@/components/admin/broadcast-tool'

export default async function AdminBroadcastPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalVerified },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('seller_verified', true),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Broadcast Notification</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Send an in-app notification to all users, sellers, or verified sellers
        </p>
      </div>
      <BroadcastTool
        totalUsers={totalUsers ?? 0}
        totalSellers={totalSellers ?? 0}
        totalVerified={totalVerified ?? 0}
      />
    </div>
  )
}
