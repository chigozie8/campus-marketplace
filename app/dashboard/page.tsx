import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag, Plus, Eye, MessageCircle, Star,
  Package, Settings, LogOut, LayoutDashboard,
  BadgeCheck, Bot, TrendingUp,
  ChevronRight, Zap, BarChart3, Users, Bell, ClipboardList,
} from 'lucide-react'
import { DashboardActions } from '@/components/dashboard-actions'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

export default async function DashboardPage() {
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
    .limit(8)

  const totalViews = (products || []).reduce((s: number, p: Product) => s + (p.views || 0), 0)
  const totalClicks = (products || []).reduce((s: number, p: Product) => s + (p.whatsapp_clicks || 0), 0)
  const activeListings = (products || []).filter((p: Product) => p.is_available).length

  // sign-out handled by POST /api/auth/sign-out

  const initials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    || user.email?.charAt(0).toUpperCase() || '?'

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  const stats = [
    {
      icon: Package, label: 'Active Listings', value: activeListings,
      sub: `${(products || []).length} total`, color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-100 dark:border-violet-900/40',
    },
    {
      icon: Eye, label: 'Total Views', value: totalViews.toLocaleString(),
      sub: 'All time', color: 'text-sky-600',
      bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-100 dark:border-sky-900/40',
    },
    {
      icon: MessageCircle, label: 'WhatsApp Clicks', value: totalClicks.toLocaleString(),
      sub: 'Buyer inquiries', color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100 dark:border-emerald-900/40',
    },
    {
      icon: Star, label: 'Rating', value: profile?.rating ? profile.rating.toFixed(1) : '—',
      sub: profile?.total_sales ? `${profile.total_sales} sales` : 'No sales yet',
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900/40',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-sidebar border-r border-gray-100 dark:border-sidebar-border fixed h-full z-30 shadow-sm">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-sidebar-border">
            <Link href="/" className="group select-none">
              <span className="text-[1.4rem] font-black tracking-tight text-gray-950 dark:text-white leading-none group-hover:opacity-80 transition-opacity">
                Vendoor<span className="text-primary">X</span>
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {[
              { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
              { href: '/dashboard/orders', icon: ClipboardList, label: 'My Orders', active: false },
              { href: '/seller/new', icon: Plus, label: 'New Listing', active: false },
              { href: '/marketplace', icon: ShoppingBag, label: 'Marketplace', active: false },
              { href: '/orders', icon: ClipboardList, label: 'My Orders', active: false },
              { href: '/favorites', icon: ShoppingBag, label: 'Saved Items', active: false },
              { href: '/notifications', icon: Bell, label: 'Notifications', active: false },
              { href: '/assistant', icon: Bot, label: 'AI Assistant', active: false },
              { href: '/profile', icon: Settings, label: 'Profile & Settings', active: false },
            ].map(({ href, icon: Icon, label, active }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 dark:text-sidebar-foreground hover:bg-gray-100 dark:hover:bg-sidebar-accent hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100 dark:border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-sidebar-accent mb-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <form action="/api/auth/sign-out" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-red-600 dark:text-muted-foreground dark:hover:text-red-400 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 font-medium"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* ── Mobile top bar ── */}
        <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-background border-b border-gray-100 dark:border-border h-14 flex items-center justify-between px-4 shadow-sm">
          <Link href="/" className="select-none">
            <span className="text-xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
              Vendoor<span className="text-primary">X</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary text-white h-8 px-3 rounded-lg text-xs font-semibold" asChild>
              <Link href="/seller/new"><Plus className="w-3.5 h-3.5 mr-1" />Sell</Link>
            </Button>
            <form action="/api/auth/sign-out" method="POST">
              <button
                type="submit"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 md:ml-64 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 mt-14 md:mt-0 pb-28 md:pb-8">

            {/* Page header */}
            <div className="flex items-start justify-between mb-8 pt-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
                  {firstName} <span className="text-primary">👋</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                  Here&apos;s an overview of your store performance
                </p>
              </div>
              <Button
                className="hidden sm:flex bg-gray-950 hover:bg-gray-800 text-white rounded-xl h-10 px-4 text-sm font-semibold shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
                asChild
              >
                <Link href="/seller/new"><Plus className="w-4 h-4 mr-2" />New Listing</Link>
              </Button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {stats.map(({ icon: Icon, label, value, sub, color, bg, border }) => (
                <div
                  key={label}
                  className={`bg-white dark:bg-card rounded-2xl p-4 sm:p-5 border ${border} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className={`inline-flex w-10 h-10 rounded-xl ${bg} items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tabular-nums">{value}</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-foreground mt-0.5">{label}</p>
                  <p className="text-xs text-gray-400 dark:text-muted-foreground mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { href: '/seller/new', icon: Plus, label: 'New Listing', color: 'text-primary', bg: 'bg-primary/10' },
                { href: '/marketplace', icon: ShoppingBag, label: 'Browse', color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30' },
                { href: '/assistant', icon: Bot, label: 'AI Help', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
              ].map(({ href, icon: Icon, label, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-foreground">{label}</span>
                </Link>
              ))}
            </div>

            {/* Profile completion banner */}
            {!profile?.whatsapp_number && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Complete your profile</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">Add your WhatsApp number so buyers can reach you</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100" asChild>
                  <Link href="/profile">Update</Link>
                </Button>
              </div>
            )}

            {/* Listings section */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-border">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4.5 h-4.5 text-primary" />
                  <h2 className="text-base font-bold text-gray-950 dark:text-white">Your Listings</h2>
                  {(products || []).length > 0 && (
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                      {(products || []).length}
                    </span>
                  )}
                </div>
                <Link href="/marketplace" className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {!products || products.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No listings yet</h3>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6 max-w-xs mx-auto">
                    List your first item and start receiving WhatsApp inquiries from students on campus
                  </p>
                  <Button className="bg-gray-950 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all" asChild>
                    <Link href="/seller/new"><Plus className="w-4 h-4 mr-2" />Create First Listing</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-border">
                  {(products as Product[]).map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 dark:hover:bg-muted/30 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.title}</p>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
                          ₦{product.price.toLocaleString()} &middot; {product.categories?.name || 'Uncategorised'}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 dark:text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{product.views}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{product.whatsapp_clicks}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          product.is_available
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                            : 'bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground'
                        }`}>
                          {product.is_available ? 'Active' : 'Sold'}
                        </span>
                        <DashboardActions productId={product.id} isAvailable={product.is_available} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verified seller prompt */}
            {!profile?.seller_verified && (profile?.total_sales || 0) >= 5 && (
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-50 dark:from-primary/10 dark:to-emerald-950/20 border border-primary/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-9 h-9 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Get Verified!</p>
                    <p className="text-xs text-gray-600 dark:text-muted-foreground">You qualify for seller verification — boost trust &amp; sales</p>
                  </div>
                </div>
                <Button size="sm" className="bg-primary text-white flex-shrink-0 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20">
                  Apply <TrendingUp className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
