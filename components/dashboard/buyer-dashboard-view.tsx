'use client'

import Link from 'next/link'
import {
  ShoppingBag, Truck, Heart, Wallet, Package, ChevronRight, TrendingDown,
  Clock, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { AnimatedSection } from '@/components/dashboard/animated-section'

export type BuyerOrder = {
  id: string
  status: string
  amount: number
  quantity: number | null
  created_at: string
  product_title?: string
  product_image?: string | null
}

export type WishItem = {
  id: string
  product_id: string
  title: string
  image: string | null
  price: number
  last_seen_price: number | null
}

interface Props {
  activeOrdersCount: number
  deliveredCount: number
  wishlistCount: number
  totalSpent: number
  inTransitOrders: BuyerOrder[]
  recentOrders: BuyerOrder[]
  wishlistDrops: WishItem[]
}

const STATUS_LABEL: Record<string, { label: string; tone: string; icon: React.ElementType }> = {
  pending:   { label: 'Awaiting payment', tone: 'bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground',  icon: Clock },
  paid:      { label: 'Preparing',         tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300', icon: Package },
  shipped:   { label: 'In transit',        tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',           icon: Truck },
  delivered: { label: 'Delivered',         tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300', icon: CheckCircle2 },
  completed: { label: 'Completed',         tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled',         tone: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300',          icon: AlertCircle },
}

export function BuyerDashboardView({
  activeOrdersCount, deliveredCount, wishlistCount, totalSpent,
  inTransitOrders, recentOrders, wishlistDrops,
}: Props) {
  return (
    <div className="space-y-5">

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 [&>*]:min-w-0">
        <StatCard
          index={0}
          icon={Truck} label="Active orders" value={activeOrdersCount}
          sub={activeOrdersCount === 0 ? 'Browse the marketplace' : 'Pending or in transit'}
          color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/30"
          border="border-violet-100 dark:border-violet-900/40"
        />
        <StatCard
          index={1}
          icon={CheckCircle2} label="Delivered" value={deliveredCount}
          sub={deliveredCount === 1 ? 'Order received' : 'Orders received'}
          color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30"
          border="border-emerald-100 dark:border-emerald-900/40"
        />
        <StatCard
          index={2}
          icon={Heart} label="Wishlist" value={wishlistCount}
          sub={wishlistDrops.length > 0 ? `${wishlistDrops.length} just dropped in price` : 'Saved items'}
          color="text-rose-600" bg="bg-rose-50 dark:bg-rose-950/30"
          border="border-rose-100 dark:border-rose-900/40"
        />
        <StatCard
          index={3}
          icon={Wallet} label="Total spent" value={`₦${totalSpent.toLocaleString()}`}
          sub="Lifetime"
          color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30"
          border="border-amber-100 dark:border-amber-900/40"
        />
      </div>

      {/* In-transit orders */}
      <AnimatedSection delay={0.5}>
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-border">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-500" />
            <p className="text-sm font-black text-gray-900 dark:text-white">In transit</p>
            {inTransitOrders.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full"
              >
                {inTransitOrders.length}
              </motion.span>
            )}
          </div>
          <Link href="/orders" className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80">
            All orders <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {inTransitOrders.length === 0 ? (
          <div className="text-center py-10 px-5">
            <p className="text-xs text-gray-400">Nothing on its way right now.</p>
            <Button asChild size="sm" variant="outline" className="mt-4 rounded-xl text-xs">
              <Link href="/marketplace"><ShoppingBag className="w-3.5 h-3.5 mr-1.5" />Browse marketplace</Link>
            </Button>
          </div>
        ) : (
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3,
                },
              },
            }}
            className="divide-y divide-gray-50 dark:divide-border"
          >
            {inTransitOrders.map((order, idx) => {
              const status = STATUS_LABEL[order.status] || STATUS_LABEL.pending
              const StatusIcon = status.icon
              return (
                <motion.li
                  key={order.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                >
                  <Link href={`/orders/${order.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/70 dark:hover:bg-muted/30 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                      {order.product_image
                        ? <img src={order.product_image} alt={order.product_title || 'Product'} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{order.product_title || 'Order'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        ₦{order.amount.toLocaleString()} · #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${status.tone}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </Link>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </div>
      </AnimatedSection>

      {/* Wishlist price drops */}
      {wishlistDrops.length > 0 && (
        <AnimatedSection delay={0.6}>
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-rose-200/70 dark:border-rose-900/30 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <p className="text-sm font-black text-rose-900 dark:text-rose-200">Price drops on your wishlist</p>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300">
              {wishlistDrops.length}
            </span>
          </div>
          <ul className="divide-y divide-rose-200/50 dark:divide-rose-900/20">
            {wishlistDrops.slice(0, 5).map(item => {
              const drop = item.last_seen_price && item.last_seen_price > item.price
                ? Math.round(((item.last_seen_price - item.price) / item.last_seen_price) * 100)
                : null
              return (
                <li key={item.id}>
                  <Link href={`/marketplace/${item.product_id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-rose-100/40 dark:hover:bg-rose-900/15 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-card flex-shrink-0 overflow-hidden border border-rose-200/50 dark:border-rose-900/30">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-rose-900 dark:text-rose-100 truncate">{item.title}</p>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                        ₦{item.price.toLocaleString()}
                        {item.last_seen_price && item.last_seen_price > item.price && (
                          <> · was <span className="line-through">₦{item.last_seen_price.toLocaleString()}</span></>
                        )}
                      </p>
                    </div>
                    {drop !== null && drop > 0 && (
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-rose-600 text-white">
                        −{drop}%
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      </AnimatedSection>

      {/* Recent orders */}
      <AnimatedSection delay={0.7}>
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <p className="text-sm font-black text-gray-900 dark:text-white">Recent orders</p>
          </div>
          <Link href="/orders" className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 px-5">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">No orders yet.</p>
            <Button asChild size="sm" className="mt-4 bg-gray-950 hover:bg-gray-800 text-white rounded-xl text-xs">
              <Link href="/marketplace">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-border">
            {recentOrders.slice(0, 6).map(order => {
              const status = STATUS_LABEL[order.status] || STATUS_LABEL.pending
              return (
                <motion.li key={order.id}>
                  <Link href={`/orders/${order.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/70 dark:hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                      {order.product_image
                        ? <img src={order.product_image} alt={order.product_title || 'Product'} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-400" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{order.product_title || 'Order'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        ₦{order.amount.toLocaleString()} · {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status.tone}`}>
                      {status.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      </AnimatedSection>

    </div>
  )
}
