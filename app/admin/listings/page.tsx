import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminListingsTable } from '@/components/admin/admin-listings-table'

export default async function AdminListingsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: products } = await supabase
    .from('products')
    .select(`
      id, title, price, original_price, condition, images, campus,
      is_available, is_featured, views, whatsapp_clicks, created_at,
      profiles(full_name),
      categories(name, slug)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">All Listings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {(products ?? []).length} total {(products ?? []).length === 1 ? 'listing' : 'listings'}
        </p>
      </div>
      <AdminListingsTable products={products ?? []} />
    </div>
  )
}
