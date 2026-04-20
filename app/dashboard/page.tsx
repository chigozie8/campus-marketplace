import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, MessageCircle, Star, Package,
  Plus, TrendingUp, ShoppingBag,
  BadgeCheck, Zap, ChevronRight,
  LayoutDashboard, ClipboardList, Bell, Bot, Settings,
  Heart, Wallet, Trophy, ArrowUpRight, AlertCircle, Tag,
} from 'lucide-react'
import { DashboardActions } from '@/components/dashboard-actions'
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner'
import { ProfileCompletion } from '@/components/dashboard/profile-completion'
import { CopyStoreLink } from '@/components/dashboard/copy-store-link'
import { ReferralCard } from '@/components/dashboard/referral-card'
import { DashboardTrustPanel } from '@/components/dashboard/trust-panel'
import { BoostListingButton } from '@/components/dashboard/boost-listing-button'
import { BoostStoreButton } from '@/components/dashboard/boost-store-button'
import { BoostCallbackToast } from '@/components/dashboard/boost-callback-toast'
import { PayoutSetupCard } from '@/components/dashboard/payout-setup-card'
import { DashboardModeToggle } from '@/components/dashboard/mode-toggle'
import { StatCard } from '@/components/dashboard/stat-card'
import { EarningsSparkline } from '@/components/dashboard/earnings-sparkline'
import { HeaderBadges } from '@/components/dashboard/header-badges'
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/activity-feed'
import { InventoryAlerts, type InventoryIssue } from '@/components/dashboard/inventory-alerts'
import { SmartEmptyState } from '@/components/dashboard/smart-empty-state'
import { ShareStoreButton } from '@/components/dashboard/share-store-button'
import { BuyerDashboardView, type BuyerOrder, type WishItem } from '@/components/dashboard/buyer-dashboard-view'
import { VendorShell } from '@/components/vendor/vendor-shell'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import type { Product } from '@/lib/types'

type Mode = 'seller' | 'buyer'

function deltaLabel(current: number, prior: number, suffix = 'this week'): { value: number; label: string } | null {
  const diff = current - prior
  if (diff === 0 && current === 0) return null
  if (diff === 0) return { value: 0, label: `0 ${suffix}` }
  const sign = diff > 0 ? '+' : ''
  return { value: diff, label: `${sign}${diff} ${suffix}` }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()
  if (!supabase) redirect('/auth/login')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // ── Load profile first so we can decide the default view based on role.
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const role = (profile?.role as string) || 'vendor'
  const isBuyerOnly = role === 'buyer'
  const requestedView = sp?.view === 'buyer' || sp?.view === 'seller' ? (sp.view as Mode) : null
  const view: Mode = requestedView ?? (isBuyerOnly ? 'buyer' : 'seller')

  // ── Date windows for delta math.
  const now = new Date()
  const weekAgoIso     = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString()
  const twoWeekAgoIso  = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const dayAgoIso      = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  // Hard caps on the heavier queries: anything above these is rolled up at
  // the DB and not pulled into the request. Keeps TTFB stable as accounts grow.
  const PRODUCT_LIMIT = 200
  const ORDERS_LIMIT  = 500

  // ── Shared queries that run for both views.
  const [
    inboxUnreadRes,
    notifUnreadRes,
    pendingSellerOrdersRes,
  ] = await Promise.all([
    supabase
      .from('order_chats').select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false),

    supabase
      .from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false),

    supabase
      .from('orders').select('id', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .in('status', ['pending', 'paid']),
  ])

  // ── Per-view fetches: only run the queries we'll actually render.
  type OrdersRes          = { data: Array<{ amount: number; created_at: string }> | null }
  type ActivityOrdersRes  = { data: Array<{ id: string; status: string; amount: number; created_at: string; product_id: string; products?: { title?: string } | null }> | null }
  type InboxRes           = { data: Array<{ id: string; message: string; created_at: string; order_id: string; sender_id: string }> | null }
  type BuyerOrdersRes     = { data: Array<{ id: string; status: string; amount: number; quantity: number | null; created_at: string; product_id: string; products?: { title?: string; images?: string[] } | null }> | null }
  type FavoritesRes       = { data: Array<{ id: string; product_id: string; last_seen_price: number | null; products?: { title?: string; price?: number; images?: string[] } | null }> | null }

  let productsRes: { data: Product[] | null } = { data: null }
  let sellerOrdersRes: OrdersRes = { data: null }
  let sellerOrdersWeekRes: OrdersRes = { data: null }
  let recentSellerOrdersRes: ActivityOrdersRes = { data: null }
  let recentInboxRes: InboxRes = { data: null }
  let buyerOrdersAllRes: BuyerOrdersRes = { data: null }
  let buyerOrdersInTransitRes: BuyerOrdersRes = { data: null }
  let buyerOrdersRecentRes: BuyerOrdersRes = { data: null }
  let favoritesRes: FavoritesRes = { data: null }

  if (view === 'seller') {
    const results = await Promise.all([
      // Seller's products (capped)
      supabase
        .from('products').select('*, categories(*)')
        .eq('seller_id', user.id)
        .order('views', { ascending: false })
        .limit(PRODUCT_LIMIT),

      // Lifetime earning orders for totals + 7-day sparkline series.
      // Capped to the most recent ORDERS_LIMIT rows; this is the same data
      // the previous implementation pulled, just bounded.
      supabase
        .from('orders').select('amount, created_at')
        .eq('seller_id', user.id)
        .in('status', ['paid', 'shipped', 'delivered', 'completed'])
        .order('created_at', { ascending: false })
        .limit(ORDERS_LIMIT),

      // Last-14-day earning orders for week-vs-week delta math.
      supabase
        .from('orders').select('amount, created_at')
        .eq('seller_id', user.id)
        .in('status', ['paid', 'shipped', 'delivered', 'completed'])
        .gte('created_at', twoWeekAgoIso)
        .limit(ORDERS_LIMIT),

      // Recent seller orders for the activity feed.
      supabase
        .from('orders').select('id, status, amount, created_at, product_id, products(title)')
        .eq('seller_id', user.id)
        .gte('created_at', dayAgoIso)
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent inbox messages for the activity feed.
      supabase
        .from('order_chats').select('id, message, created_at, order_id, sender_id')
        .eq('receiver_id', user.id)
        .gte('created_at', dayAgoIso)
        .order('created_at', { ascending: false })
        .limit(3),
    ])
    productsRes           = results[0] as unknown as { data: Product[] | null }
    sellerOrdersRes       = results[1] as unknown as OrdersRes
    sellerOrdersWeekRes   = results[2] as unknown as OrdersRes
    recentSellerOrdersRes = results[3] as unknown as ActivityOrdersRes
    recentInboxRes        = results[4] as unknown as InboxRes
  } else {
    const results = await Promise.all([
      // Lifetime buyer orders (paid+) for totals — capped.
      supabase
        .from('orders').select('id, status, amount, quantity, created_at, product_id, products(title, images)')
        .eq('buyer_id', user.id)
        .in('status', ['paid', 'shipped', 'delivered', 'completed'])
        .order('created_at', { ascending: false })
        .limit(ORDERS_LIMIT),

      // In-transit orders.
      supabase
        .from('orders').select('id, status, amount, quantity, created_at, product_id, products(title, images)')
        .eq('buyer_id', user.id)
        .in('status', ['paid', 'shipped'])
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent orders (any status).
      supabase
        .from('orders').select('id, status, amount, quantity, created_at, product_id, products(title, images)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8),

      // Favourites with current product price for price-drop detection.
      supabase
        .from('favorites').select('id, product_id, last_seen_price, products(title, price, images)')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })
        .limit(50),
    ])
    buyerOrdersAllRes       = results[0] as unknown as BuyerOrdersRes
    buyerOrdersInTransitRes = results[1] as unknown as BuyerOrdersRes
    buyerOrdersRecentRes    = results[2] as unknown as BuyerOrdersRes
    favoritesRes            = results[3] as unknown as FavoritesRes
  }

  // ── Seller-side derived numbers.
  const allProducts = (productsRes.data || []) as Product[]
  const sellerOrders = sellerOrdersRes.data || []
  const sellerOrdersWeek = sellerOrdersWeekRes.data || []

  const totalViews    = allProducts.reduce((s, p) => s + (p.views || 0), 0)
  const totalClicks   = allProducts.reduce((s, p) => s + (p.whatsapp_clicks || 0), 0)
  const activeCount   = allProducts.filter(p => p.is_available).length
  const totalEarnings = sellerOrders.reduce((s, o) => s + (o.amount || 0), 0)

  // Listings created this/last week for the listings delta
  const listingsThisWeek = allProducts.filter(p => p.created_at && p.created_at >= weekAgoIso).length
  const listingsPriorWeek = allProducts.filter(p =>
    p.created_at && p.created_at >= twoWeekAgoIso && p.created_at < weekAgoIso,
  ).length

  // Earnings this week vs prior week
  const earningsThisWeek = sellerOrdersWeek
    .filter(o => o.created_at >= weekAgoIso)
    .reduce((s, o) => s + (o.amount || 0), 0)
  const earningsPriorWeek = sellerOrdersWeek
    .filter(o => o.created_at < weekAgoIso)
    .reduce((s, o) => s + (o.amount || 0), 0)

  // 7-day earnings series for sparkline (oldest first).
  const dailyEarnings: number[] = Array.from({ length: 7 }, () => 0)
  for (const o of sellerOrdersWeek) {
    const ts = new Date(o.created_at).getTime()
    const daysAgo = Math.floor((now.getTime() - ts) / (24 * 60 * 60 * 1000))
    if (daysAgo >= 0 && daysAgo < 7) {
      dailyEarnings[6 - daysAgo] += o.amount || 0
    }
  }

  // Inventory alerts
  const inventoryIssues: InventoryIssue[] = []
  for (const p of allProducts) {
    if (!p.is_available) continue
    const stock = (p as Product & { stock_quantity?: number | null }).stock_quantity
    if (typeof stock === 'number') {
      if (stock === 0) {
        inventoryIssues.push({
          id: p.id, title: p.title,
          reason: 'out_of_stock_visible',
          detail: 'Listing is live but quantity is 0 — buyers can still see it.',
        })
      } else if (stock <= 2) {
        inventoryIssues.push({
          id: p.id, title: p.title,
          reason: 'low_stock',
          detail: `Only ${stock} left in stock.`,
        })
      }
    }
  }

  // Activity feed (combine + sort)
  const orderEvents: ActivityItem[] = (recentSellerOrdersRes.data || []).map(o => {
    const kind: ActivityItem['kind'] =
      o.status === 'shipped' ? 'order_shipped'
      : o.status === 'delivered' || o.status === 'completed' ? 'order_delivered'
      : o.status === 'paid' ? 'order_paid'
      : 'order_new'
    const title = kind === 'order_new' ? 'New order received'
      : kind === 'order_paid' ? 'Order paid'
      : kind === 'order_shipped' ? 'You marked an order as shipped'
      : 'Order delivered'
    // Supabase typings for nested selects vary; cast to any for safe access.
    const product = (o as { products?: { title?: string } | null }).products
    return {
      id: `o:${o.id}`,
      kind,
      title,
      subtitle: `${product?.title || 'Order'} · ₦${(o.amount || 0).toLocaleString()}`,
      href: `/dashboard/orders/${o.id}`,
      at: o.created_at,
    }
  })
  const inboxEvents: ActivityItem[] = (recentInboxRes.data || []).map(m => ({
    id: `m:${m.id}`,
    kind: 'inbox_message',
    title: 'New message from a buyer',
    subtitle: (m.message || '').slice(0, 60) || 'Tap to reply',
    href: m.order_id ? `/dashboard/orders/${m.order_id}` : '/inbox',
    at: m.created_at,
  }))
  const activityItems: ActivityItem[] = [...orderEvents, ...inboxEvents]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6)

  // ── Buyer-side derived numbers.
  const buyerOrdersAll = buyerOrdersAllRes.data || []
  const buyerInTransit = buyerOrdersInTransitRes.data || []
  const buyerRecent = buyerOrdersRecentRes.data || []
  const favorites = favoritesRes.data || []

  const totalSpent = buyerOrdersAll.reduce((s, o) => s + (o.amount || 0), 0)
  const deliveredCount = buyerOrdersAll.filter(o => o.status === 'delivered' || o.status === 'completed').length
  const activeOrdersCount = buyerOrdersAll.filter(o => o.status === 'paid' || o.status === 'shipped').length

  function mapBuyerOrder(o: typeof buyerInTransit[number]): BuyerOrder {
    const product = (o as { products?: { title?: string; images?: string[] } | null }).products
    return {
      id: o.id, status: o.status, amount: o.amount || 0, quantity: o.quantity ?? null,
      created_at: o.created_at,
      product_title: product?.title || undefined,
      product_image: product?.images?.[0] || null,
    }
  }

  const wishlistDrops: WishItem[] = favorites
    .map(f => {
      const product = (f as { products?: { title?: string; price?: number; images?: string[] } | null }).products
      if (!product) return null
      const last = f.last_seen_price ? Number(f.last_seen_price) : null
      const cur = Number(product.price ?? 0)
      const dropped = last !== null && cur < last
      if (!dropped) return null
      return {
        id: f.id,
        product_id: f.product_id,
        title: product.title || 'Saved item',
        image: product.images?.[0] || null,
        price: cur,
        last_seen_price: last,
      } as WishItem
    })
    .filter((x): x is WishItem => x !== null)

  // ── Onboarding & misc.
  const hasListings   = allProducts.length > 0
  const isVerified    = !!profile?.is_verified
  const hasOrders     = sellerOrders.length > 0
  const profileComplete = !!(profile?.full_name && profile?.phone && profile?.university)
  const overallCTR    = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0'

  const topProduct = allProducts[0] ?? null

  const initials  = profile?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hour      = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' })).getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const unreadInbox = inboxUnreadRes.count || 0
  const unreadNotifications = notifUnreadRes.count || 0
  const pendingOrders = pendingSellerOrdersRes.count || 0

  const newListingBtn = (
    <Button
      className="bg-gray-950 hover:bg-gray-800 text-white rounded-xl h-9 px-4 text-xs font-bold shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all"
      asChild
    >
      <Link href="/seller/new"><Plus className="w-3.5 h-3.5 mr-1.5" />New Listing</Link>
    </Button>
  )

  const browseBtn = (
    <Button
      className="bg-gray-950 hover:bg-gray-800 text-white rounded-xl h-9 px-4 text-xs font-bold shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all"
      asChild
    >
      <Link href="/marketplace"><ShoppingBag className="w-3.5 h-3.5 mr-1.5" />Browse</Link>
    </Button>
  )

  const headerAction = view === 'buyer' ? browseBtn : newListingBtn

  const storeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/marketplace?seller=${user.id}`

  return (
    <VendorShell
      initials={initials}
      fullName={profile?.full_name || 'Vendor'}
      email={user.email || ''}
      pageTitle="Dashboard"
      pageAction={headerAction}
    >
      <Suspense fallback={null}>
        <BoostCallbackToast />
      </Suspense>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-10 space-y-5">

        {/* ── Greeting + view toggle ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-0.5">
              <Zap className="w-3 h-3 text-primary" /> {greeting}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
              {firstName}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {view === 'buyer' ? 'Here\u2019s what you\u2019re shopping for' : 'Here\u2019s your store at a glance'}
            </p>
            <HeaderBadges
              unreadInbox={unreadInbox}
              pendingOrders={view === 'buyer' ? activeOrdersCount : pendingOrders}
              unreadNotifications={unreadNotifications}
            />
          </div>
          <div className="hidden sm:block flex-shrink-0">{headerAction}</div>
        </div>

        {/* Mode toggle row */}
        <div className="flex items-center justify-between gap-3">
          <DashboardModeToggle currentMode={view} />
          {view === 'seller' && (
            <p className="hidden sm:block text-[11px] text-gray-400">
              Switch to <span className="font-bold text-gray-600 dark:text-foreground">Buying</span> to see your orders & wishlist
            </p>
          )}
        </div>

        {/* ── BUYER VIEW ── */}
        {view === 'buyer' && (
          <BuyerDashboardView
            activeOrdersCount={activeOrdersCount}
            deliveredCount={deliveredCount}
            wishlistCount={favorites.length}
            totalSpent={totalSpent}
            inTransitOrders={buyerInTransit.map(mapBuyerOrder)}
            recentOrders={buyerRecent.map(mapBuyerOrder)}
            wishlistDrops={wishlistDrops}
          />
        )}

        {/* ── SELLER VIEW ── */}
        {view === 'seller' && (
          <>
            {/* Onboarding (first-time users) */}
            <OnboardingBanner
              hasListings={hasListings}
              isVerified={isVerified}
              hasOrders={hasOrders}
              profileComplete={profileComplete}
            />

            {/* 4 Stat Cards (now with deltas + sparkline) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 [&>*]:min-w-0">
              <StatCard
                icon={Package} label="Active Listings" value={activeCount}
                sub={`${allProducts.length} total`}
                delta={deltaLabel(listingsThisWeek, listingsPriorWeek, 'this week')}
                color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/30"
                border="border-violet-100 dark:border-violet-900/40"
              />
              <StatCard
                icon={Eye} label="Total Views" value={totalViews.toLocaleString()}
                sub={`${overallCTR}% click rate`}
                color="text-sky-600" bg="bg-sky-50 dark:bg-sky-950/30"
                border="border-sky-100 dark:border-sky-900/40"
              />
              <StatCard
                icon={MessageCircle} label="WA Inquiries" value={totalClicks.toLocaleString()}
                sub="Buyer contacts"
                color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30"
                border="border-emerald-100 dark:border-emerald-900/40"
              />
              <StatCard
                icon={Wallet} label="Earnings" value={`₦${totalEarnings.toLocaleString()}`}
                sub={`${sellerOrders.length} completed order${sellerOrders.length !== 1 ? 's' : ''}`}
                delta={
                  earningsThisWeek > 0 || earningsPriorWeek > 0
                    ? { value: earningsThisWeek - earningsPriorWeek, label: `₦${earningsThisWeek.toLocaleString()} this wk` }
                    : null
                }
                color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30"
                border="border-amber-100 dark:border-amber-900/40"
                visual={<EarningsSparkline data={dailyEarnings} className="w-full h-6" />}
              />
            </div>

            {/* Inventory alerts (only when there are issues) */}
            <InventoryAlerts issues={inventoryIssues} />

            {/* Activity feed */}
            <ActivityFeed items={activityItems} />

            {/* Rating + Store link */}
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
                <CopyStoreLink userId={user.id} fullName={profile?.full_name} />
                <ShareStoreButton
                  userId={user.id}
                  storeName={profile?.full_name || 'My VendoorX Store'}
                  storeUrl={storeUrl}
                />
                <div className="pt-1 border-t border-gray-100 dark:border-border">
                  <p className="text-[10px] text-gray-400 mb-1.5 uppercase font-bold tracking-wide">Feature your store</p>
                  <BoostStoreButton storeBoostExpiresAt={user.user_metadata?.store_boost_expires_at as string | undefined} />
                </div>
              </div>
            </div>

            {/* Payout Setup */}
            <PayoutSetupCard
              hasSubaccount={!!(user.user_metadata?.paystack_subaccount_code)}
              accountName={user.user_metadata?.payout_account_name as string | undefined}
              savedBankCode={user.user_metadata?.payout_bank_code as string | undefined}
              savedBankName={user.user_metadata?.payout_bank_name as string | undefined}
              savedAccountNumber={user.user_metadata?.payout_account_number as string | undefined}
            />

            {/* Referral Card */}
            <ReferralCard />

            {/* Trust Score Panel */}
            <DashboardTrustPanel userId={user.id} isSeller={profile?.is_seller ?? false} />

            {/* Profile Completion */}
            <ProfileCompletion
              avatar={!!profile?.avatar_url}
              whatsapp={!!profile?.whatsapp_number}
              instagram={!!profile?.instagram_handle}
              bio={!!profile?.bio}
              university={!!profile?.university}
              campus={!!profile?.campus}
            />

            {/* Verification Banner */}
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

            {/* Top Performing Listing */}
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

            {/* All Listings (or smart empty state) */}
            {allProducts.length === 0 ? (
              <SmartEmptyState university={profile?.university || null} />
            ) : (
              <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-border">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold text-gray-950 dark:text-white">Your Listings</h2>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {allProducts.length}
                    </span>
                  </div>
                  <Link
                    href={`/marketplace?seller=${user.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Public view <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-gray-50 dark:divide-border">
                  {allProducts.map(product => {
                    const ctr = product.views > 0 ? ((product.whatsapp_clicks / product.views) * 100).toFixed(1) : '0.0'
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/70 dark:hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ₦{product.price.toLocaleString()}
                            {product.categories?.name ? ` · ${product.categories.name}` : ''}
                          </p>
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

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            product.is_available
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground'
                          }`}>
                            {product.is_available ? 'Active' : 'Sold'}
                          </span>
                          <BoostListingButton
                            productId={product.id}
                            productTitle={product.title}
                            isBoosted={product.is_featured}
                          />
                          <DashboardActions productId={product.id} isAvailable={product.is_available} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Quick Navigation (shared between both views, mobile-friendly) ── */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Links</p>
          {/* Mobile: horizontal scroll, sm+: 4-col grid */}
          <div className="flex sm:grid sm:grid-cols-4 gap-2 overflow-x-auto sm:overflow-visible -mx-1 px-1 snap-x snap-mandatory sm:snap-none scrollbar-none">
            {[
              { href: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard',           active: true  },
              { href: view === 'buyer' ? '/marketplace' : '/seller/new', icon: view === 'buyer' ? ShoppingBag : Plus, label: view === 'buyer' ? 'Browse' : 'New Listing', active: false },
              { href: '/marketplace',       icon: ShoppingBag,     label: 'Marketplace',         active: false },
              { href: view === 'buyer' ? '/orders' : '/dashboard/orders', icon: ClipboardList, label: view === 'buyer' ? 'My Orders' : 'Orders Received', active: false },
              { href: '/dashboard/wallet',  icon: Wallet,          label: 'My Wallet',           active: false },
              { href: '/notifications',     icon: Bell,            label: 'Notifications',       active: false },
              { href: '/assistant',         icon: Bot,             label: 'AI Assistant',        active: false },
              { href: '/favorites',         icon: Heart,           label: 'Saved Items',         active: false },
              { href: '/profile',           icon: Settings,        label: 'Profile & Settings',  active: false },
              { href: '/dashboard/offers',  icon: Tag,             label: 'My Offers',           active: false },
            ].map(({ href, icon: Icon, label, active }) => (
              <Link
                key={`${href}-${label}`}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 flex-shrink-0 snap-start min-w-[10rem] sm:min-w-0 ${
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

        {/* ── Customer Support (shared) ── */}
        <div className="bg-gradient-to-br from-[#25D366]/10 via-emerald-50/60 to-teal-50/40 dark:from-[#25D366]/10 dark:via-emerald-950/20 dark:to-teal-950/10 rounded-2xl border border-[#25D366]/25 dark:border-[#25D366]/20 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/25">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-white">Need help? Chat with us</p>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">Our support team replies in minutes on WhatsApp</p>
            </div>
          </div>
          <a
            href="https://wa.me/2347082039150"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/30"
          >
            Message Us
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z" />
            </svg>
          </a>
        </div>

      </div>
    </VendorShell>
  )
}
