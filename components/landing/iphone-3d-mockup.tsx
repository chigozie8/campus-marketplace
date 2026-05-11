'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { 
  Phone, 
  Video, 
  MoreVertical, 
  ChevronLeft, 
  Smile, 
  Camera, 
  Mic,
  ShoppingBag,
  Truck,
  CreditCard,
  Headphones,
  CheckCircle2,
  Plus
} from 'lucide-react'

interface ProductCard {
  name: string
  price: string
}

export function IPhone3DMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)

  const quickActions = [
    { icon: ShoppingBag, label: 'Browse Products', color: 'text-[#25D366]' },
    { icon: Truck, label: 'Track My Order', color: 'text-orange-500' },
    { icon: CreditCard, label: 'Make Payment', color: 'text-blue-500' },
    { icon: Headphones, label: 'Talk to Support', color: 'text-purple-500' },
  ]

  const products: ProductCard[] = [
    { name: 'Canvas Sneaker', price: '₦28,000' },
    { name: 'Urban Runner', price: '₦29,500' },
    { name: 'Street Low Top', price: '₦26,000' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple entrance animation - no floating
      gsap.fromTo(
        phoneRef.current,
        {
          opacity: 0,
          y: 60,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          delay: 0.2,
        }
      )

      // Screen content stagger animation
      gsap.fromTo(
        '.chat-bubble',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.6,
        }
      )

      gsap.fromTo(
        '.product-card',
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 1,
        }
      )

      gsap.fromTo(
        '.quick-action',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: 'back.out(1.5)',
          delay: 0.8,
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {/* 3D iPhone Container - Static, no floating */}
      <div
        ref={phoneRef}
        className="relative"
        style={{
          transform: 'perspective(1200px) rotateY(-8deg) rotateX(2deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phone Frame - iPhone 15 Pro Style */}
        <div
          className="relative rounded-[50px] p-[2px]"
          style={{
            background: 'linear-gradient(145deg, #3a3a3a 0%, #1f1f1f 50%, #0f0f0f 100%)',
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.4),
              0 12px 24px -8px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.08)
            `,
          }}
        >
          {/* Titanium Side Highlight */}
          <div
            className="absolute inset-0 rounded-[50px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, transparent 15%, transparent 85%, rgba(255,255,255,0.02) 100%)',
            }}
          />

          {/* Inner Bezel - Black edge around screen */}
          <div 
            className="relative rounded-[48px] bg-black overflow-hidden" 
            style={{ width: '290px', height: '600px' }}
          >
            {/* Dynamic Island */}
            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 z-30">
              <div 
                className="w-[90px] h-[28px] bg-black rounded-full flex items-center justify-center gap-3"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)'
                }}
              >
                {/* Front Camera */}
                <div className="w-[8px] h-[8px] rounded-full bg-[#1a1a2e] ring-1 ring-[#2a2a3a]">
                  <div className="w-[4px] h-[4px] rounded-full bg-[#0d1b2a] mx-auto mt-[2px]" />
                </div>
                {/* Face ID sensor */}
                <div className="w-[5px] h-[5px] rounded-full bg-[#1a1a2e]" />
              </div>
            </div>

            {/* Screen Content */}
            <div className="absolute inset-[2px] rounded-[46px] bg-white overflow-hidden">
              {/* iOS Status Bar */}
              <div className="flex items-center justify-between px-7 pt-[14px] pb-[6px] bg-[#075E54]">
                <span className="text-white text-[15px] font-semibold tracking-tight">9:41</span>
                <div className="flex items-center gap-[5px]">
                  {/* Signal Bars */}
                  <div className="flex items-end gap-[2px]">
                    <div className="w-[3px] h-[4px] rounded-[1px] bg-white" />
                    <div className="w-[3px] h-[6px] rounded-[1px] bg-white" />
                    <div className="w-[3px] h-[9px] rounded-[1px] bg-white" />
                    <div className="w-[3px] h-[12px] rounded-[1px] bg-white" />
                  </div>
                  {/* WiFi Icon */}
                  <svg className="w-[17px] h-[12px] text-white ml-[2px]" fill="currentColor" viewBox="0 0 24 18">
                    <path d="M12 18c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4.95-5.05c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zM12 10c-1.93 0-3.68.78-4.95 2.05l1.41 1.41C9.44 12.53 10.67 12 12 12s2.56.53 3.54 1.46l1.41-1.41C15.68 10.78 13.93 10 12 10zm7.07-2.93l-1.41 1.41C16.14 9.97 14.16 11 12 11s-4.14-1.03-5.66-2.52l-1.41 1.41C6.74 11.69 9.24 13 12 13s5.26-1.31 7.07-3.07zM12 4C8.09 4 4.55 5.58 2 8.15l1.42 1.42C5.55 7.42 8.6 6 12 6s6.45 1.42 8.58 3.57L22 8.15C19.45 5.58 15.91 4 12 4z" />
                  </svg>
                  {/* Battery */}
                  <div className="flex items-center ml-[3px]">
                    <div className="w-[25px] h-[12px] rounded-[3px] border-[1.5px] border-white flex items-center p-[2px]">
                      <div className="w-full h-full bg-white rounded-[1px]" />
                    </div>
                    <div className="w-[2px] h-[5px] bg-white rounded-r-[1px] ml-[1px]" />
                  </div>
                </div>
              </div>

              {/* WhatsApp Header */}
              <div className="flex items-center gap-2 px-2 py-[10px] bg-[#075E54]">
                <ChevronLeft className="w-[22px] h-[22px] text-white flex-shrink-0" />
                <div className="w-[38px] h-[38px] rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-[18px] h-[18px] text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[4px]">
                    <span className="font-semibold text-white text-[16px] leading-tight">Your Store</span>
                    <CheckCircle2 className="w-[15px] h-[15px] text-[#53BDEB]" style={{ fill: '#53BDEB' }} />
                  </div>
                  <span className="text-[12px] text-white/75 leading-tight">+234 803 123 4567</span>
                </div>
                <div className="flex items-center gap-[16px] flex-shrink-0 mr-1">
                  <Video className="w-[20px] h-[20px] text-white" />
                  <Phone className="w-[18px] h-[18px] text-white" />
                  <MoreVertical className="w-[20px] h-[20px] text-white" />
                </div>
              </div>

              {/* Chat Area - Realistic WhatsApp Background */}
              <div 
                className="relative overflow-y-auto"
                style={{ 
                  height: 'calc(100% - 155px)',
                  backgroundColor: '#ECE5DD',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4cdc4' fill-opacity='0.4'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                <div className="px-[10px] py-[10px] space-y-[8px]">
                  {/* Bot Welcome Message */}
                  <div className="chat-bubble flex justify-start">
                    <div 
                      className="relative bg-white rounded-lg rounded-tl-none px-[10px] py-[6px] max-w-[85%]"
                      style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                    >
                      <p className="text-[13px] text-[#303030] leading-[18px]">
                        Hi 👋<br />
                        Welcome to Your Store!<br />
                        What would you like to do today?
                      </p>
                      <span className="text-[11px] text-[#667781] float-right mt-[2px] ml-[8px]">9:41 AM</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="chat-bubble flex justify-start">
                    <div 
                      className="bg-white rounded-lg rounded-tl-none px-[8px] py-[8px] max-w-[95%]"
                      style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                    >
                      <div className="grid grid-cols-2 gap-[6px]">
                        {quickActions.map(({ icon: Icon, label, color }) => (
                          <button
                            key={label}
                            className="quick-action flex items-center gap-[6px] px-[8px] py-[6px] rounded-lg border border-[#e0e0e0] bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors"
                          >
                            <Icon className={`w-[14px] h-[14px] flex-shrink-0 ${color}`} />
                            <span className="text-[11px] font-medium text-[#1f2937] whitespace-nowrap">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="chat-bubble flex justify-end">
                    <div 
                      className="relative bg-[#D9FDD3] rounded-lg rounded-tr-none px-[10px] py-[6px] max-w-[80%]"
                      style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                    >
                      <p className="text-[13px] text-[#303030] leading-[18px]">Show me shoes under ₦30,000</p>
                      <div className="flex items-center justify-end gap-[3px] mt-[2px]">
                        <span className="text-[11px] text-[#667781]">9:42 AM</span>
                        {/* Double check mark */}
                        <svg className="w-[16px] h-[11px] text-[#53BDEB]" viewBox="0 0 16 11" fill="currentColor">
                          <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 0 0 .512.203.646.646 0 0 0 .496-.203l6.836-8.453a.45.45 0 0 0 .14-.336.498.498 0 0 0-.14-.35l-.57-.287z" />
                          <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.2-1.134-.612.762 1.533 1.533a.724.724 0 0 0 .512.203.646.646 0 0 0 .496-.203l6.836-8.453a.45.45 0 0 0 .14-.336.498.498 0 0 0-.14-.35l-.69-.734z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="chat-bubble flex justify-start">
                    <div 
                      className="bg-white rounded-lg rounded-tl-none px-[10px] py-[6px] max-w-[85%]"
                      style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                    >
                      <p className="text-[13px] text-[#303030] leading-[18px]">Here are some shoes you&apos;ll love 👇</p>
                      <span className="text-[11px] text-[#667781] float-right mt-[2px]">9:42 AM</span>
                    </div>
                  </div>

                  {/* Product Cards */}
                  <div className="flex gap-[8px] overflow-x-auto pb-[6px] scrollbar-hide">
                    {products.map((product) => (
                      <div 
                        key={product.name} 
                        className="product-card flex-shrink-0 w-[115px] bg-white rounded-xl overflow-hidden border border-[#e5e5e5]"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                      >
                        <div className="h-[70px] bg-gradient-to-br from-[#f8f8f8] to-[#efefef] flex items-center justify-center">
                          <div className="w-[50px] h-[35px] bg-[#e0e0e0] rounded-md flex items-center justify-center">
                            <ShoppingBag className="w-[20px] h-[20px] text-[#9ca3af]" />
                          </div>
                        </div>
                        <div className="p-[8px]">
                          <p className="text-[11px] font-medium text-[#1f2937] truncate leading-tight">{product.name}</p>
                          <p className="text-[12px] font-bold text-[#25D366] mt-[2px]">{product.price}</p>
                          <button className="w-full mt-[6px] py-[4px] text-[10px] font-semibold text-[#25D366] border border-[#25D366]/40 rounded-md hover:bg-[#25D366]/5 transition-colors">
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Input Bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-[6px] px-[6px] py-[6px] bg-[#F0F0F0]">
                <button className="w-[36px] h-[36px] rounded-full bg-white flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.06)' }}>
                  <Plus className="w-[22px] h-[22px] text-[#54656F]" />
                </button>
                <div 
                  className="flex items-center gap-[8px] flex-1 bg-white rounded-full px-[12px] py-[8px]"
                  style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.06)' }}
                >
                  <Smile className="w-[22px] h-[22px] text-[#54656F] flex-shrink-0" />
                  <span className="flex-1 text-[15px] text-[#8696A0]">Type a message</span>
                  <Camera className="w-[22px] h-[22px] text-[#54656F] flex-shrink-0" />
                </div>
                <button className="w-[42px] h-[42px] rounded-full bg-[#00A884] flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                  <Mic className="w-[20px] h-[20px] text-white" />
                </button>
              </div>
            </div>

            {/* Screen Glass Reflection */}
            <div
              className="absolute inset-[2px] rounded-[46px] pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%)',
              }}
            />
          </div>

          {/* Side Buttons - Volume */}
          <div 
            className="absolute left-[-2px] top-[120px] w-[3px] h-[28px] rounded-l-sm"
            style={{ background: 'linear-gradient(90deg, #2a2a2a, #3a3a3a)' }}
          />
          <div 
            className="absolute left-[-2px] top-[158px] w-[3px] h-[55px] rounded-l-sm"
            style={{ background: 'linear-gradient(90deg, #2a2a2a, #3a3a3a)' }}
          />
          {/* Side Button - Power */}
          <div 
            className="absolute right-[-2px] top-[145px] w-[3px] h-[70px] rounded-r-sm"
            style={{ background: 'linear-gradient(270deg, #2a2a2a, #3a3a3a)' }}
          />
        </div>

        {/* Subtle shadow beneath phone */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[200px] h-[12px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
      </div>
    </div>
  )
}
