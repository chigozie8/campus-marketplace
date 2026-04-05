import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, Eye, MessageCircle, TrendingUp, Users, ShoppingBag } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')

  const [
    { data: topViewed },
    { data: topClicked },
    { data: categoryStats },
    { data: campusStats },
    { data: sellerStats },
  ] = await Promise.all([
    supabase.from('products').select('id, title, views, whatsapp_clicks').order('views', { ascending: false }).limit(10),
    supabase.from('products').select('id, title, views, whatsapp_clicks').order('whatsapp_clicks', { ascending: false }).limit(10),
    supabase.from('products').select('category_id, categories(name, icon), price').not('category_id', 'is', null),
    supabase.from('products').select('campus').not('campus', 'is', null),
    supabase.from('profiles').select('id, full_name, total_sales, rating, is_seller').eq('is_seller', true).order('total_sales', { ascending: false }).limit(10),
  ])

  // Aggregate campus distribution
  const campusMap: Record<string, number> = {}
  for (const p of (campusStats ?? [])) {
    const campus = (p as any).campus
    campusMap[campus] = (campusMap[campus] ?? 0) + 1
  }
  const campusDistribution = Object.entries(campusMap).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Aggregate category distribution
  const catMap: Record<string, { name: string; icon: string; count: number; totalValue: number }> = {}
  for (const p of (categoryStats ?? []) as any[]) {
    const cat = p.categories
    if (!cat) continue
    if (!catMap[cat.name]) catMap[cat.name] = { name: cat.name, icon: cat.icon ?? '', count: 0, totalValue: 0 }
    catMap[cat.name]!.count++
    catMap[cat.name]!.totalValue += Number(p.price)
  }
  const categories = Object.values(catMap).sort((a, b) => b.count - a.count)
  const maxCount = Math.max(...categories.map(c => c.count), 1)

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Top by Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Eye className="w-4 h-4 text-primary" />
            <h2 className="font-black text-sm text-foreground">Most Viewed Listings</h2>
          </div>
          <div className="divide-y divide-border">
            {(topViewed ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (topViewed ?? []).map((p: any, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-5 text-xs font-black text-muted-foreground">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                </div>
                <span className="text-xs font-bold text-muted-foreground tabular-nums">{p.views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <h2 className="font-black text-sm text-foreground">Most WhatsApp Clicks</h2>
          </div>
          <div className="divide-y divide-border">
            {(topClicked ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (topClicked ?? []).map((p: any, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-5 text-xs font-black text-muted-foreground">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                </div>
                <span className="text-xs font-bold text-green-600 dark:text-green-400 tabular-nums">{p.whatsapp_clicks.toLocaleString()} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category distribution */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-black text-sm text-foreground">Listings by Category</h2>
        </div>
        <div className="p-5 space-y-3">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : categories.map(c => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="w-6 text-center flex-shrink-0">{c.icon}</span>
              <p className="w-28 text-sm font-semibold text-foreground flex-shrink-0 truncate">{c.name}</p>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="h-2 bg-primary rounded-full transition-all"
                  style={{ width: `${(c.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-bold text-muted-foreground">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campus distribution + top sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-black text-sm text-foreground">Listings by Campus</h2>
          </div>
          <div className="divide-y divide-border">
            {campusDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : campusDistribution.map(([campus, count]) => (
              <div key={campus} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-semibold text-foreground">{campus}</p>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="font-black text-sm text-foreground">Top Sellers</h2>
          </div>
          <div className="divide-y divide-border">
            {(sellerStats ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sellers yet</p>
            ) : (sellerStats ?? []).map((s: any, i) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-5 text-xs font-black text-muted-foreground">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-black">
                    {(s.full_name ?? 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{s.full_name ?? 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground">Rating: {Number(s.rating).toFixed(1)}</p>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{s.total_sales} sales</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
