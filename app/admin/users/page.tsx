import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminUsersTable } from '@/components/admin/admin-users-table'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, phone, university, campus, is_seller, seller_verified, rating, total_sales, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">All Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(users ?? []).length} registered {(users ?? []).length === 1 ? 'user' : 'users'}
          </p>
        </div>
      </div>
      <AdminUsersTable users={users ?? []} />
    </div>
  )
}
