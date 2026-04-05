import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminCategoriesManager } from '@/components/admin/admin-categories-manager'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-black text-foreground tracking-tight">Categories</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage the product categories shown in the marketplace
        </p>
      </div>
      <AdminCategoriesManager categories={categories ?? []} />
    </div>
  )
}
