import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag,
  Plus,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Star,
  Package,
  Settings,
  LogOut,
  LayoutDashboard,
  BadgeCheck,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  const totalViews = (products || []).reduce((sum: number, p: Product) => sum + (p.views || 0), 0)
  const totalClicks = (products || []).reduce((sum: number, p: Product) => sum + (p.whatsapp_clicks || 0), 0)

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar + Main layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar fixed h-full z-30">
          <div className="p-5 border-b border-sidebar-border">
            <Link href="/" className="flex items-center select-none group">
              <span className="text-xl font-black tracking-tight text-foreground leading-none group-hover:opacity-80 transition-opacity">
                Vendoor<span className="text-primary">X</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium text-sm">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/seller/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm">
              <Plus className="w-4 h-4" />
              New Listing
            </Link>
            <Link href="/marketplace" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm">
              <Package className="w-4 h-4" />
              Marketplace
            </Link>
            <Link href="/assistant" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm">
              <Bot className="w-4 h-4" />
              AI Assistant
            </Link>
            <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm">
              <Settings className="w-4 h-4" />
              Profile
            </Link>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full hero-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <form action={signOut}>
              <button type="submit" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full px-2 py-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-border/50 h-14 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center select-none group">
            <span className="text-xl font-black tracking-tight text-foreground leading-none group-hover:opacity-80 transition-opacity">
              Vendoor<span className="text-primary">X</span>
            </span>
          </Link>
          <Button size="sm" className="hero-gradient border-0 text-white h-8" asChild>
            <Link href="/seller/new">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Sell
            </Link>
          </Button>
        </div>

        {/* Main content */}
        <main className="flex-1 md:ml-60 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 mt-14 md:mt-0">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">Here&apos;s what&apos;s happening with your listings</p>
              </div>
              <Button className="hero-gradient border-0 text-white hidden sm:flex" asChild>
                <Link href="/seller/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </Link>
              </Button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Package, label: 'Total Listings', value: products?.length || 0, color: 'text-primary', bg: 'bg-primary/10' },
                { icon: Eye, label: 'Total Views', value: totalViews.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                { icon: MessageCircle, label: 'WhatsApp Clicks', value: totalClicks.toLocaleString(), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
                { icon: Star, label: 'Rating', value: profile?.rating ? profile.rating.toFixed(1) : '—', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="p-5 rounded-2xl border border-border/50 bg-card">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Profile completion banner */}
            {!profile?.whatsapp_number && (
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-foreground">Complete your profile</p>
                  <p className="text-xs text-muted-foreground">Add your WhatsApp number so buyers can reach you</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/profile">Update Profile</Link>
                </Button>
              </div>
            )}

            {/* Listings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Your Listings</h2>
                <Link href="/marketplace" className="text-sm text-primary hover:underline">View all</Link>
              </div>

              {!products || products.length === 0 ? (
                <div className="text-center py-14 border border-dashed border-border rounded-2xl">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">No listings yet</h3>
                  <p className="text-sm text-muted-foreground mb-5">List your first item and start receiving WhatsApp inquiries</p>
                  <Button className="hero-gradient border-0 text-white" asChild>
                    <Link href="/seller/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Listing
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(products as Product[]).map(product => (
                    <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/20 transition-colors">
                      <div className="w-14 h-14 rounded-lg bg-secondary/50 flex-shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ₦{product.price.toLocaleString()} · {product.categories?.name || 'Uncategorised'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {product.views}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {product.whatsapp_clicks}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          className={product.is_available
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 text-xs'
                            : 'bg-secondary text-muted-foreground text-xs'
                          }
                        >
                          {product.is_available ? 'Active' : 'Sold'}
                        </Badge>
                        <Link href={`/marketplace/${product.id}`} className="text-xs text-primary hover:underline">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seller badge prompt */}
            {!profile?.seller_verified && (profile?.total_sales || 0) >= 5 && (
              <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Get Verified!</p>
                    <p className="text-xs text-muted-foreground">You qualify for seller verification — boost trust & sales</p>
                  </div>
                </div>
                <Button size="sm" className="hero-gradient border-0 text-white flex-shrink-0">Apply</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
