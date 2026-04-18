import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { AdminUsersTable } from '@/components/admin/admin-users-table'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, phone, university, campus, is_seller, seller_verified, rating, total_sales, created_at, is_blocked')
    .order('created_at', { ascending: false })

  // Hydrate auth-level ban status from supabase.auth using the service-role
  // client so the admin table reflects real state on first paint instead of
  // showing every user as un-banned until an action is taken.
  let bannedIds: string[] = []
  try {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: authUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const now = Date.now()
    bannedIds = (authUsers?.users ?? [])
      .filter(u => u.banned_until && new Date(u.banned_until).getTime() > now)
      .map(u => u.id)
  } catch {
    // Non-fatal: table will fall back to "not banned" until an action is taken.
  }

  const enriched = (users ?? []).map(u => ({
    ...u,
    is_banned: bannedIds.includes(u.id),
    is_blocked: !!u.is_blocked,
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">All Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {enriched.length} registered {enriched.length === 1 ? 'user' : 'users'}
          </p>
        </div>
      </div>
      <AdminUsersTable users={enriched} />
    </div>
  )
}
