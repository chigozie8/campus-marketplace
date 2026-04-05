import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductsClient } from '@/components/products/products-client'

export default async function ProductsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: products } = await supabase
    .from('products').select('*, categories(*)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const initials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    || user.email?.charAt(0).toUpperCase() || '?'

  return (
    <ProductsClient
      products={products || []}
      initials={initials}
      fullName={profile?.full_name || 'Vendor'}
      email={user.email || ''}
    />
  )
}
