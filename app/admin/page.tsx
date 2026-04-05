import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Users, ShoppingBag, Eye, Heart,
  TrendingUp, Star, MessageSquare, Tag,
  ArrowUpRight, Clock,
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  // Parallel fetches for all stats
  const [
    { count: totalUsers },
    { count: totalProducts },
    { count: totalFavorites },
    { count: totalReviews },
    { count: totalCategories },
    { count: totalMessages },
    { data: recentProducts },
    { data: recentUsers },
    { data: topProducts },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('favorites').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('products')
      .select('id, title, price, created_at, is_available, images, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('profiles')
      .select('id, full_name, created_at, is_seller, university')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('products')
      .select('id, title, views, whatsapp_clicks, price, images')
      .order('views', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Total Users',    value: totalUsers ?? 0,    icon: Users,       href: '/admin/users',     color: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' },
    { label: 'Total Listings', value: totalProducts ?? 0, icon: ShoppingBag, href: '/admin/listings',  color: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400' },
    { label: 'Total Saves',    value: totalFavorites ?? 0,icon: Heart,       href: '/admin/listings',  color: 'bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400' },
    { label: 'Reviews',        value: totalReviews ?? 0,  icon: Star,        href: '/admin/reviews',   color: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400' },
    { label: 'Categories',     value: totalCategories ?? 0, icon: Tag,       href: '/admin/categories',color: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400' },
    { label: 'AI Messages',    value: totalMessages ?? 0, icon: MessageSquare,href: '/admin/messages', color: 'bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-foreground tabular-nums">
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
              {label}
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent listings */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-foreground">Recent Listings</h2>
            </div>
            <Link href="/admin/listings" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(recentProducts ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No listings yet</p>
            ) : (recentProducts ?? []).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    by {(p.profiles as any)?.full_name ?? 'Unknown'} &bull; ₦{Number(p.price).toLocaleString()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.is_available
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {p.is_available ? 'Active' : 'Sold'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-foreground">New Members</h2>
            </div>
            <Link href="/admin/users" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(recentUsers ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
            ) : (recentUsers ?? []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-sm font-black">
                    {(u.full_name ?? 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {u.full_name ?? 'Unnamed User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.university ?? 'No university'} &bull; {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>
                {u.is_seller && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    Seller
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top listings by views */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-foreground">Top Listings by Views</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Listing</th>
                  <th className="text-right px-5 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-right px-5 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5 inline mr-1" />Views
                  </th>
                  <th className="text-right px-5 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">WA Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(topProducts ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-muted-foreground text-xs">No data yet</td></tr>
                ) : (topProducts ?? []).map((p: any, i: number) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-[200px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      ₦{Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground font-medium">
                      {p.views.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground font-medium">
                      {p.whatsapp_clicks.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
