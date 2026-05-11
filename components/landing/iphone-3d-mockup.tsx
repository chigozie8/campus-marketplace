'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  Phone, 
  Video, 
  MoreVertical, 
  ChevronLeft, 
  Plus, 
  Smile, 
  Camera, 
  Mic,
  ShoppingBag,
  Truck,
  CreditCard,
  Headphones,
  CheckCircle2
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface ChatMessage {
  type: 'sent' | 'received'
  content: string
  time: string
  isBot?: boolean
}

interface ProductCard {
  name: string
  price: string
  image: string
}

export function IPhone3DMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const quickActions = [
    { icon: ShoppingBag, label: 'Browse Products', color: 'text-primary' },
    { icon: Truck, label: 'Track My Order', color: 'text-orange-500' },
    { icon: CreditCard, label: 'Make Payment', color: 'text-blue-500' },
    { icon: Headphones, label: 'Talk to Support', color: 'text-purple-500' },
  ]

  const products: ProductCard[] = [
    { name: 'Canvas Sneaker', price: '₦28,000', image: '/placeholder-shoe-1.jpg' },
    { name: 'Urban Runner', price: '₦29,500', image: '/placeholder-shoe-2.jpg' },
    { name: 'Street Low Top', price: '₦26,000', image: '/placeholder-shoe-3.jpg' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial entrance animation
      gsap.fromTo(
        phoneRef.current,
        {
          opacity: 0,
          y: 100,
          rotateX: 25,
          rotateY: -15,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 8,
          rotateY: -5,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3,
        }
      )

      // Glow pulse animation
      gsap.to(glowRef.current, {
        opacity: 0.6,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // Floating animation
      gsap.to(phoneRef.current, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      })

      // Screen content stagger animation
      gsap.fromTo(
        '.chat-bubble',
        { opacity: 0, y: 20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: 'back.out(1.7)',
          delay: 0.8,
        }
      )

      gsap.fromTo(
        '.product-card',
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 1.2,
        }
      )

      gsap.fromTo(
        '.quick-action',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.7)',
          delay: 0.6,
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
      {/* Ambient glow behind phone */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(37, 211, 102, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 3D iPhone Container */}
      <div
        ref={phoneRef}
        className="relative transform-gpu"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phone Frame - iPhone 15 Pro Style */}
        <div
          className="relative rounded-[3rem] p-[3px] shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            boxShadow: `
              0 50px 100px -20px rgba(0, 0, 0, 0.5),
              0 30px 60px -10px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3)
            `,
          }}
        >
          {/* Titanium Side Frame Effect */}
          <div
            className="absolute inset-0 rounded-[3rem] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.03) 100%)',
            }}
          />

          {/* Inner Bezel */}
          <div className="relative rounded-[2.75rem] bg-black overflow-hidden" style={{ width: '320px', height: '660px' }}>
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
              <div className="w-[100px] h-[32px] bg-black rounded-full flex items-center justify-center gap-2 shadow-inner">
                <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a1a] ring-1 ring-gray-800" />
                <div className="w-[6px] h-[6px] rounded-full bg-[#0d47a1]" />
              </div>
            </div>

            {/* Screen Content */}
            <div ref={screenRef} className="absolute inset-0 bg-white overflow-hidden">
              {/* Status Bar */}
              <div className="flex items-center justify-between px-6 pt-4 pb-2 bg-[#075E54]">
                <span className="text-white text-sm font-semibold">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-[3px] rounded-full bg-white" style={{ height: `${8 + i * 2}px` }} />
                    ))}
                  </div>
                  <svg className="w-4 h-4 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                  </svg>
                  <div className="flex items-center ml-1">
                    <div className="w-6 h-3 rounded-sm border border-white flex items-end p-[1px]">
                      <div className="w-full h-full bg-white rounded-[1px]" />
                    </div>
                    <div className="w-[2px] h-[5px] bg-white rounded-r-sm ml-[1px]" />
                  </div>
                </div>
              </div>

              {/* WhatsApp Header */}
              <div className="flex items-center gap-3 px-3 py-2 bg-[#075E54]">
                <ChevronLeft className="w-6 h-6 text-white" />
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white text-[15px]">Your Store</span>
                    <CheckCircle2 className="w-4 h-4 text-[#53bdeb] fill-[#53bdeb]" />
                  </div>
                  <span className="text-[12px] text-white/80">+234 803 123 4567</span>
                </div>
                <Video className="w-5 h-5 text-white" />
                <Phone className="w-5 h-5 text-white" />
                <MoreVertical className="w-5 h-5 text-white" />
              </div>

              {/* Chat Area */}
              <div 
                className="flex-1 px-3 py-3 space-y-3 overflow-y-auto"
                style={{ 
                  height: 'calc(100% - 180px)',
                  background: 'linear-gradient(to bottom, #ece5dd 0%, #d9d2c5 100%)',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c3bb' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                {/* Bot Welcome Message */}
                <div className="chat-bubble flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 max-w-[85%] shadow-sm">
                    <p className="text-[13px] text-gray-800 leading-relaxed">
                      Hi 👋<br />
                      Welcome to Your Store!<br />
                      What would you like to do today?
                    </p>
                    <span className="text-[10px] text-gray-500 float-right mt-1">9:41 AM</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="chat-bubble flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-md px-3 py-3 max-w-[90%] shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map(({ icon: Icon, label, color }, i) => (
                        <button
                          key={label}
                          className="quick-action flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <Icon className={`w-4 h-4 ${color}`} />
                          <span className="text-[11px] font-medium text-gray-700">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* User Message */}
                <div className="chat-bubble flex justify-end">
                  <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-md px-3 py-2 max-w-[80%] shadow-sm">
                    <p className="text-[13px] text-gray-800">Show me shoes under ₦30,000</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">9:42 AM</span>
                      <svg className="w-4 h-3 text-[#53bdeb]" viewBox="0 0 16 11" fill="currentColor">
                        <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 0 0 .512.203.646.646 0 0 0 .496-.203l6.836-8.453a.45.45 0 0 0 .14-.336.498.498 0 0 0-.14-.35l-.57-.287z" />
                        <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.2-1.134-.612.762 1.533 1.533a.724.724 0 0 0 .512.203.646.646 0 0 0 .496-.203l6.836-8.453a.45.45 0 0 0 .14-.336.498.498 0 0 0-.14-.35l-.69-.734z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bot Response with Products */}
                <div className="chat-bubble flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 max-w-[90%] shadow-sm">
                    <p className="text-[13px] text-gray-800 mb-2">Here are some shoes you&apos;ll love 👇</p>
                    <span className="text-[10px] text-gray-500">9:42 AM</span>
                  </div>
                </div>

                {/* Product Cards Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                  {products.map((product, i) => (
                    <div 
                      key={product.name} 
                      className="product-card flex-shrink-0 w-[140px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                    >
                      <div className="h-[90px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-[12px] font-bold text-primary">{product.price}</p>
                        <button className="w-full mt-1.5 py-1 text-[10px] font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-2 py-2 bg-[#f0f0f0]">
                <div className="flex items-center gap-2 flex-1 bg-white rounded-full px-3 py-2 shadow-sm">
                  <Smile className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Type a message"
                    className="flex-1 text-[14px] bg-transparent outline-none placeholder:text-gray-400"
                    readOnly
                  />
                  <Camera className="w-5 h-5 text-gray-500" />
                </div>
                <button className="w-10 h-10 rounded-full bg-[#075E54] flex items-center justify-center shadow-md">
                  <Mic className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Screen Reflection */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
              }}
            />
          </div>
        </div>

        {/* Shadow beneath phone */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[250px] h-[20px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }}
        />
      </div>
    </div>
  )
}
