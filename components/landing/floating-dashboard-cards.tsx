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
      // Sales card entrance
      gsap.fromTo(
        salesCardRef.current,
        { opacity: 0, x: 50, y: -30, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.6,
        }
      )

      // Orders card entrance
      gsap.fromTo(
        ordersCardRef.current,
        { opacity: 0, x: 50, y: 30, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.8,
        }
      )

      // Floating animation for sales card
      gsap.to(salesCardRef.current, {
        y: -8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      })

      // Floating animation for orders card (offset)
      gsap.to(ordersCardRef.current, {
        y: 8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2,
      })

      // Chart line animation
      gsap.fromTo(
        '.chart-line',
        { strokeDashoffset: 300 },
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.out',
          delay: 1,
        }
      )

      // Counter animation
      gsap.fromTo(
        '.counter-value',
        { innerText: 0 },
        {
          innerText: 12458000,
          duration: 2,
          ease: 'power2.out',
          delay: 0.8,
          snap: { innerText: 1000 },
          onUpdate: function() {
            const el = document.querySelector('.counter-value')
            if (el) {
              const val = parseInt(el.textContent || '0')
              el.textContent = '₦' + val.toLocaleString()
            }
          }
        }
      )

      // Order rows stagger
      gsap.fromTo(
        '.order-row',
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 1.2,
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="absolute top-0 right-0 w-full h-full pointer-events-none hidden lg:block">
      {/* Total Sales Card */}
      <div
        ref={salesCardRef}
        className="absolute top-4 right-4 w-[320px] bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Total Sales</span>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            This Month
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="counter-value text-2xl font-black text-gray-900">₦0</span>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="flex items-center gap-0.5 text-xs font-semibold text-primary">
              <TrendingUp className="w-3 h-3" />
              +23.4%
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>

          {/* Mini Chart */}
          <div className="relative h-[60px]">
            <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="15" x2="300" y2="15" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="30" x2="300" y2="30" stroke="#f0f0f0" strokeWidth="1" />
              <line x1="0" y1="45" x2="300" y2="45" stroke="#f0f0f0" strokeWidth="1" />
              
              {/* Area fill */}
              <path
                d="M0,50 L50,45 L100,35 L150,40 L200,25 L250,30 L300,15 L300,60 L0,60 Z"
                fill="url(#salesGradient)"
              />
              
              {/* Line */}
              <path
                className="chart-line"
                d="M0,50 L50,45 L100,35 L150,40 L200,25 L250,30 L300,15"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="300"
              />
              
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>May 5</span>
              <span>May 12</span>
              <span>May 19</span>
              <span>May 26</span>
              <span>Jun 2</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">342</p>
              <p className="text-[10px] text-gray-500">Orders</p>
              <p className="text-[10px] font-semibold text-primary">+18.7%</p>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">1,254</p>
              <p className="text-[10px] text-gray-500">Customers</p>
              <p className="text-[10px] font-semibold text-primary">+21.5%</p>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">24.6%</p>
              <p className="text-[10px] text-gray-500">Conversion Rate</p>
              <p className="text-[10px] font-semibold text-primary">+16.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Card */}
      <div
        ref={ordersCardRef}
        className="absolute bottom-24 right-4 w-[320px] bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Recent Orders</span>
          <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            View all
          </button>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-50">
          {recentOrders.map((order, i) => (
            <div
              key={order.id}
              className="order-row flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-800">{order.id}</span>
                  <span className="text-sm font-bold text-gray-900">{order.price}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    Paid • {order.status}
                  </span>
                  <span className="text-[10px] text-gray-400">{order.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
