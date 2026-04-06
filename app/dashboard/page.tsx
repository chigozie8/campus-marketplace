import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, MessageCircle, Star, Package,
  Plus, TrendingUp, ShoppingBag,
  BadgeCheck, Zap, ChevronRight,
  LayoutDashboard, ClipboardList, Bell, Bot, Settings,
  Heart, Wallet, Trophy, ArrowUpRight, AlertCircle,
} from 'lucide-react'
import { DashboardActions } from '@/components/dashboard-actions'
import { ProfileCompletion } from '@/components/dashboard/profile-completion'
import { CopyStoreLink } from '@/components/dashboard/copy-store-link'
import { VendorShell } from '@/components/vendor/vendor-shell'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: products }, { data: ordersData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('products').select('*, categories(*)').eq('seller_id', user.id).order('views', { ascending: false }),
    supabase.from('orders').select('amount').eq('seller_id', user.id).in('status', ['paid', 'shipped', 'delivered', 'completed']),
  ])

  const allProducts = (products || []) as Product[]

  const totalViews    = allProducts.reduce((s, p) => s + (p.views || 0), 0)
  const totalClicks   = allProducts.reduce((s, p) => s + (p.whatsapp_clicks || 0), 0)
  const activeCount   = allProducts.filter(p => p.is_available).length
  const totalEarnings = (ordersData || []).reduce((s, o) => s + (o.amount || 0), 0)
  const overallCTR    = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0'

  // Top performer = most views (products are already sorted by views desc)
  const topProduct = allProducts[0] ?? null

  const initials  = profile?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const newListingBtn = (
    <Button
      className="bg-gray-950 hover:bg-gray-800 text-white rounded-xl h-9 px-4 text-xs font-bold shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all"
      asChild
    >
      <Link href="/seller/new"><Plus className="w-3.5 h-3.5 mr-1.5" />New Listing</Link>
    </Button>
  )

  return (
    <VendorShell
      initials={initials}
      fullName={profile?.full_name || 'Vendor'}
      email={user.email || ''}
      pageTitle="Dashboard"
      pageAction={newListingBtn}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 space-y-5">

        {/* ── Greeting ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3 h-3 text-primary" /> {greeting}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
              {firstName}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Here&apos;s your store at a glance</p>
          </div>
          <div className="hidden sm:block">{newListingBtn}</div>
        </div>

        {/* ── 4 Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: Package, label: 'Active Listings', value: activeCount,
              sub: `${allProducts.length} total`,
              color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30',
              border: 'border-violet-100 dark:border-violet-900/40',
            },
            {
              icon: Eye, label: 'Total Views', value: totalViews.toLocaleString(),
              sub: `${overallCTR}% click rate`,
              color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30',
              border: 'border-sky-100 dark:border-sky-900/40',
            },
            {
              icon: MessageCircle, label: 'WA Inquiries', value: totalClicks.toLocaleString(),
              sub: 'Buyer contacts',
              color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30',
              border: 'border-emerald-100 dark:border-emerald-900/40',
            },
            {
              icon: Wallet, label: 'Earnings', value: `₦${totalEarnings.toLocaleString()}`,
              sub: `${(ordersData || []).length} completed order${(ordersData || []).length !== 1 ? 's' : ''}`,
              color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30',
              border: 'border-amber-100 dark:border-amber-900/40',
            },
          ].map(({ icon: Icon, label, value, sub, color, bg, border }) => (
            <div key={label} className={`bg-white dark:bg-card rounded-2xl p-4 border ${border} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
              <div className={`inline-flex w-9 h-9 rounded-xl ${bg} items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-black text-gray-950 dark:text-white tabular-nums leading-none">{value}</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-foreground mt-1">{label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Rating + Store link ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Rating card */}
          <div className="bg-white dark:bg-card rounded-2xl p-4 border border-gray-100 dark:border-border shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-black text-gray-950 dark:text-white tabular-nums leading-none">
                {profile?.rating ? profile.rating.toFixed(1) : '—'}
              </p>
              <p className="text-xs font-semibold text-gray-700 dark:text-foreground mt-0.5">Seller Rating</p>
              <p className="text-[11px] text-gray-400">
                {profile?.total_sales ? `${profile.total_sales} total sale${profile.total_sales !== 1 ? 's' : ''}` : 'No sales yet'}
              </p>
            </div>
            {profile?.rating && profile.rating >= 4.5 && (
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 border border-amber-200 dark:border-amber-800 flex-shrink-0">
                Top Seller
              </span>
            )}
          </div>

          {/* Share store */}
          <div className="bg-white dark:bg-card rounded-2xl p-4 border border-gray-100 dark:border-border shadow-sm flex flex-col justify-between gap-3">
            <div>
              <p className="text-xs font-black text-gray-900 dark:text-white">Share your store</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Send buyers directly to your listings</p>
            </div>
            <CopyStoreLink userId={user.id} />
          </div>
        </div>

        {/* ── Profile Completion ── */}
        <ProfileCompletion
          avatar={!!profile?.avatar_url}
          whatsapp={!!profile?.whatsapp_number}
          instagram={!!profile?.instagram_handle}
          bio={!!profile?.bio}
          university={!!profile?.university}
          campus={!!profile?.campus}
        />

        {/* ── Verification Banner ── */}
        {profile?.seller_verified ? (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
            <BadgeCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Verified Seller</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Your verified badge is live — buyers trust you more</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/8 to-emerald-50 dark:from-primary/10 dark:to-emerald-950/20 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Get Verified</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">Boost buyer trust and rank higher in search</p>
              </div>
            </div>
            <Button size="sm" className="bg-primary text-white rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20 flex-shrink-0 text-xs" asChild>
              <Link href="/profile?tab=verification">Apply <TrendingUp className="w-3 h-3 ml-1" /></Link>
            </Button>
          </div>
        )}

        {/* ── Quick Navigation ── */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Links</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { href: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard',      active: true  },
              { href: '/seller/new',       icon: Plus,            label: 'New Listing',    active: false },
              { href: '/marketplace',      icon: ShoppingBag,     label: 'Marketplace',    active: false },
              { href: '/dashboard/orders', icon: ClipboardList,   label: 'My Orders',      active: false },
              { href: '/notifications',    icon: Bell,            label: 'Notifications',  active: false },
              { href: '/assistant',        icon: Bot,             label: 'AI Assistant',   active: false },
              { href: '/favorites',        icon: Heart,           label: 'Saved Items',    active: false },
              { href: '/profile',          icon: Settings,        label: 'Profile & Settings', active: false },
            ].map(({ href, icon: Icon, label, active }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 dark:text-sidebar-foreground hover:bg-gray-100 dark:hover:bg-sidebar-accent hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-primary/15' : 'bg-gray-100 dark:bg-muted'}`}>
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-gray-500 dark:text-muted-foreground'}`} />
                </div>
                <span className="truncate text-xs">{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Top Performing Listing ── */}
        {topProduct && topProduct.views > 0 && (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-border flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-black text-gray-900 dark:text-white">Top Performing Listing</p>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                {topProduct.images?.[0]
                  ? <img src={topProduct.images[0]} alt={topProduct.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-400" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{topProduct.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">₦{topProduct.price.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="w-3.5 h-3.5 text-sky-500" />
                    {topProduct.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {topProduct.whatsapp_clicks} inquiries
                  </span>
                  {topProduct.views > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {((topProduct.whatsapp_clicks / topProduct.views) * 100).toFixed(1)}% CTR
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link
                  href={`/seller/edit/${topProduct.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Edit <ArrowUpRight className="w-3 h-3" />
                </Link>
                <Link
                  href={`/marketplace/${topProduct.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  View <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            {topProduct.views < 50 && (
              <div className="px-5 pb-4">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    Tip: Share this listing on WhatsApp Status and Instagram Stories to get more views.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── All Listings ── */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-border">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-gray-950 dark:text-white">Your Listings</h2>
              {allProducts.length > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {allProducts.length}
                </span>
              )}
            </div>
            <Link
              href={`/marketplace?seller=${user.id}`}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Public view <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {allProducts.length === 0 ? (
            <div className="text-center py-14 px-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No listings yet</h3>
              <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">
                List your first item and start getting WhatsApp, Instagram, and Facebook inquiries
              </p>
              <Button className="bg-gray-950 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all text-xs" asChild>
                <Link href="/seller/new"><Plus className="w-3.5 h-3.5 mr-1.5" />Create First Listing</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-border">
              {allProducts.map(product => {
                const ctr = product.views > 0 ? ((product.whatsapp_clicks / product.views) * 100).toFixed(1) : '0.0'
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/70 dark:hover:bg-muted/30 transition-colors"
                  >
                    {/* Image */}
                    <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                      {product.images?.[0]
                        ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>}
                    </div>

                    {/* Title + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ₦{product.price.toLocaleString()}
                        {product.categories?.name ? ` · ${product.categories.name}` : ''}
                      </p>
                      {/* Stats row — visible on all sizes */}
                      <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                          <Eye className="w-3 h-3 text-sky-400" />{product.views}
                        </span>
                        <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                          <MessageCircle className="w-3 h-3 text-emerald-400" />{product.whatsapp_clicks}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{ctr}% CTR</span>
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        product.is_available
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground'
                      }`}>
                        {product.is_available ? 'Active' : 'Sold'}
                      </span>
                      <DashboardActions productId={product.id} isAvailable={product.is_available} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </VendorShell>
  )
}
