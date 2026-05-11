'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { TrendingUp, ChevronDown, Package } from 'lucide-react'

interface OrderItem {
  id: string
  product: string
  price: string
  status: 'Processing' | 'Shipped' | 'Delivered'
  time: string
}

export function FloatingDashboardCards() {
  const salesCardRef = useRef<HTMLDivElement>(null)
  const ordersCardRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const recentOrders: OrderItem[] = [
    { id: '#VX-2456', product: 'Sneakers', price: '₦28,000', status: 'Processing', time: 'Today, 10:24 AM' },
    { id: '#VX-2455', product: 'Handbag', price: '₦45,000', status: 'Shipped', time: 'Today, 9:15 AM' },
    { id: '#VX-2454', product: 'Watch', price: '₦32,500', status: 'Delivered', time: 'Yesterday, 6:45 PM' },
  ]

  const statusColors = {
    Processing: 'text-orange-500 bg-orange-50',
    Shipped: 'text-blue-500 bg-blue-50',
    Delivered: 'text-primary bg-primary/10',
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sales card entrance - no floating, just entrance
      gsap.fromTo(
        salesCardRef.current,
        { opacity: 0, x: 30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.4,
        }
      )

      // Orders card entrance - no floating
      gsap.fromTo(
        ordersCardRef.current,
        { opacity: 0, x: 30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.6,
        }
      )

      // Chart line animation
      gsap.fromTo(
        '.chart-line',
        { strokeDashoffset: 300 },
        {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.8,
        }
      )

      // Order rows stagger
      gsap.fromTo(
        '.order-row',
        { opacity: 0, x: 15 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 1,
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col gap-4">
      {/* Total Sales Card */}
      <div
        ref={salesCardRef}
        className="w-full bg-card rounded-2xl shadow-xl shadow-black/8 border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Total Sales</span>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            This Month
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-black text-foreground">₦12,458,000</span>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="flex items-center gap-0.5 text-xs font-semibold text-primary">
              <TrendingUp className="w-3 h-3" />
              +23.4%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>

          {/* Mini Chart */}
          <div className="relative h-[50px]">
            <svg className="w-full h-full" viewBox="0 0 300 50" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="12" x2="300" y2="12" stroke="currentColor" className="text-border" strokeWidth="1" />
              <line x1="0" y1="25" x2="300" y2="25" stroke="currentColor" className="text-border" strokeWidth="1" />
              <line x1="0" y1="38" x2="300" y2="38" stroke="currentColor" className="text-border" strokeWidth="1" />
              
              {/* Area fill */}
              <path
                d="M0,42 L50,38 L100,30 L150,34 L200,22 L250,26 L300,14 L300,50 L0,50 Z"
                fill="url(#salesGradient)"
              />
              
              {/* Line */}
              <path
                className="chart-line"
                d="M0,42 L50,38 L100,30 L150,34 L200,22 L250,26 L300,14"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="300"
              />
              
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>May 5</span>
              <span>May 12</span>
              <span>May 19</span>
              <span>May 26</span>
              <span>Jun 2</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">342</p>
              <p className="text-[10px] text-muted-foreground">Orders</p>
              <p className="text-[10px] font-semibold text-primary">+18.7%</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">1,254</p>
              <p className="text-[10px] text-muted-foreground">Customers</p>
              <p className="text-[10px] font-semibold text-primary">+21.5%</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">24.6%</p>
              <p className="text-[10px] text-muted-foreground">Conversion</p>
              <p className="text-[10px] font-semibold text-primary">+16.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Card */}
      <div
        ref={ordersCardRef}
        className="w-full bg-card rounded-2xl shadow-xl shadow-black/8 border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Recent Orders</span>
          <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            View all
          </button>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-border">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="order-row flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{order.id}</span>
                  <span className="text-sm font-bold text-foreground">{order.price}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    Paid &bull; {order.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{order.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
