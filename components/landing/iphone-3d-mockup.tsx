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
  Plus
} from 'lucide-react'

interface ProductCard {
  name: string
  price: string
  image: string
}

export function IPhone3DMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)

  const quickActions = [
    { icon: ShoppingBag, label: 'Browse Products', color: '#25D366' },
    { icon: Truck, label: 'Track My Order', color: '#F97316' },
    { icon: CreditCard, label: 'Make Payment', color: '#3B82F6' },
    { icon: Headphones, label: 'Talk to Support', color: '#8B5CF6' },
  ]

  const products: ProductCard[] = [
    { name: 'Canvas Sneaker', price: '₦28,000', image: '👟' },
    { name: 'Urban Runner', price: '₦29,500', image: '👟' },
    { name: 'Street Low Top', price: '₦26,000', image: '👟' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Elegant entrance animation
      gsap.fromTo(
        phoneRef.current,
        {
          opacity: 0,
          y: 40,
          rotateX: 8,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3,
        }
      )

      // Screen elements stagger
      gsap.fromTo(
        '.chat-bubble',
        { opacity: 0, y: 12, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.8,
        }
      )

      gsap.fromTo(
        '.product-card',
        { opacity: 0, x: 15, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 1.2,
        }
      )

      gsap.fromTo(
        '.quick-action',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.05,
          ease: 'back.out(1.4)',
          delay: 1,
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {/* iPhone 15 Pro Container */}
      <div
        ref={phoneRef}
        className="relative"
        style={{
          transform: 'perspective(1500px) rotateY(-6deg) rotateX(1deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phone Frame - Natural Titanium finish */}
        <div
          className="relative"
          style={{
            width: '280px',
            height: '570px',
            borderRadius: '48px',
            background: 'linear-gradient(135deg, #8E8E93 0%, #636366 20%, #48484A 50%, #3A3A3C 80%, #2C2C2E 100%)',
            padding: '2px',
            boxShadow: `
              0 50px 100px -20px rgba(0, 0, 0, 0.35),
              0 30px 60px -15px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.12),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2)
            `,
          }}
        >
          {/* Titanium Edge Highlights */}
          <div
            className="absolute inset-0 rounded-[48px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 10%, transparent 90%, rgba(255,255,255,0.03) 100%)',
            }}
          />

          {/* Volume Buttons - Left */}
          <div
            className="absolute -left-[2.5px] top-[110px] rounded-l-[2px]"
            style={{
              width: '4px',
              height: '24px',
              background: 'linear-gradient(90deg, #636366 0%, #48484A 100%)',
              boxShadow: '-1px 0 2px rgba(0,0,0,0.3)',
            }}
          />
          <div
            className="absolute -left-[2.5px] top-[145px] rounded-l-[2px]"
            style={{
              width: '4px',
              height: '48px',
              background: 'linear-gradient(90deg, #636366 0%, #48484A 100%)',
              boxShadow: '-1px 0 2px rgba(0,0,0,0.3)',
            }}
          />

          {/* Power Button - Right */}
          <div
            className="absolute -right-[2.5px] top-[140px] rounded-r-[2px]"
            style={{
              width: '4px',
              height: '65px',
              background: 'linear-gradient(270deg, #636366 0%, #48484A 100%)',
              boxShadow: '1px 0 2px rgba(0,0,0,0.3)',
            }}
          />

          {/* Inner Bezel */}
          <div
            className="relative w-full h-full rounded-[46px] bg-black overflow-hidden"
          >
            {/* Dynamic Island */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 z-30">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '120px',
                  height: '35px',
                  background: '#000',
                  borderRadius: '20px',
                }}
              >
                {/* Front Camera */}
                <div
                  className="absolute left-[22px]"
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, #1D3D47 0%, #0D1B2A 70%, #000 100%)',
                    boxShadow: 'inset 0 0 2px rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    className="absolute top-[2px] left-[2px]"
                    style={{
                      width: '3px',
                      height: '3px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(100,150,200,0.4) 0%, transparent 70%)',
                    }}
                  />
                </div>
                {/* Face ID Sensors */}
                <div
                  className="absolute right-[22px]"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#0D1B2A',
                    boxShadow: 'inset 0 0 1px rgba(255,255,255,0.05)',
                  }}
                />
              </div>
            </div>

            {/* Screen Content Area */}
            <div className="absolute inset-[3px] rounded-[43px] overflow-hidden bg-white">
              {/* iOS Status Bar */}
              <div 
                className="relative flex items-center justify-between px-8 h-[50px]"
                style={{ backgroundColor: '#075E54' }}
              >
                {/* Time - Left side with notch space */}
                <div className="flex-1 flex justify-start">
                  <span className="text-white text-[16px] font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                    9:41
                  </span>
                </div>

                {/* Center space for Dynamic Island */}
                <div className="w-[130px]" />

                {/* Status Icons - Right side */}
                <div className="flex-1 flex items-center justify-end gap-[5px]">
                  {/* Cellular Signal */}
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" className="text-white">
                    <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
                    <rect x="5" y="5" width="3" height="7" rx="0.5" fill="currentColor" />
                    <rect x="10" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
                    <rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
                  </svg>

                  {/* WiFi Signal */}
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="text-white ml-[2px]">
                    <path d="M8 2.5C10.5 2.5 12.8 3.5 14.5 5.2L15.6 4.1C13.6 2.1 10.9 1 8 1C5.1 1 2.4 2.1 0.4 4.1L1.5 5.2C3.2 3.5 5.5 2.5 8 2.5Z" fill="currentColor"/>
                    <path d="M8 5.5C9.7 5.5 11.2 6.2 12.4 7.3L13.5 6.2C12 4.8 10.1 4 8 4C5.9 4 4 4.8 2.5 6.2L3.6 7.3C4.8 6.2 6.3 5.5 8 5.5Z" fill="currentColor"/>
                    <path d="M8 8.5C8.9 8.5 9.7 8.8 10.3 9.4L11.4 8.3C10.5 7.4 9.3 7 8 7C6.7 7 5.5 7.4 4.6 8.3L5.7 9.4C6.3 8.8 7.1 8.5 8 8.5Z" fill="currentColor"/>
                    <circle cx="8" cy="11" r="1.5" fill="currentColor"/>
                  </svg>

                  {/* Battery */}
                  <div className="flex items-center ml-[3px]">
                    <div
                      className="relative flex items-center justify-start"
                      style={{
                        width: '25px',
                        height: '12px',
                        border: '1.5px solid rgba(255,255,255,0.9)',
                        borderRadius: '4px',
                        padding: '2px',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'white',
                          borderRadius: '1.5px',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: '2px',
                        height: '5px',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '0 1px 1px 0',
                        marginLeft: '1px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Header */}
              <div 
                className="flex items-center gap-[10px] px-3 py-[8px]"
                style={{ backgroundColor: '#075E54' }}
              >
                <ChevronLeft className="w-[24px] h-[24px] text-white flex-shrink-0" strokeWidth={2.5} />
                
                {/* Profile Picture */}
                <div
                  className="w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <ShoppingBag className="w-[20px] h-[20px] text-white" />
                </div>

                {/* Name and Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[5px]">
                    <span className="font-semibold text-white text-[17px] leading-tight">Your Store</span>
                    {/* Verified Badge */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#53BDEB">
                      <path d="M12 2L13.09 4.26L15.5 3.64L14.82 6.18L17 7.5L14.82 8.82L15.5 11.36L13.09 10.74L12 13L10.91 10.74L8.5 11.36L9.18 8.82L7 7.5L9.18 6.18L8.5 3.64L10.91 4.26L12 2Z"/>
                      <path d="M10 15L8 17L10 19L17 12L15 10L10 15Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="text-[13px] text-white/80 leading-tight">+234 803 123 4567</span>
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-[20px] flex-shrink-0">
                  <Video className="w-[22px] h-[22px] text-white" />
                  <Phone className="w-[20px] h-[20px] text-white" />
                  <MoreVertical className="w-[22px] h-[22px] text-white" />
                </div>
              </div>

              {/* Chat Area */}
              <div
                className="relative overflow-y-auto"
                style={{
                  height: 'calc(100% - 165px)',
                  backgroundColor: '#E5DDD5',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cdc4ba' fill-opacity='0.35'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                <div className="px-[12px] py-[12px] space-y-[8px]">
                  {/* Bot Welcome Message */}
                  <div className="chat-bubble flex justify-start">
                    <div
                      className="relative bg-white rounded-[8px] rounded-tl-[0px] px-[12px] py-[8px] max-w-[85%]"
                      style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                    >
                      <p className="text-[14px] text-[#303030] leading-[20px] whitespace-pre-line">
                        {`Hi 👋\nWelcome to Your Store!\nWhat would you like to do today?`}
                      </p>
                      <span className="text-[11px] text-[#667781] float-right mt-[4px] ml-[10px]">9:41 AM</span>
                    </div>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="chat-bubble flex justify-start">
                    <div
                      className="bg-white rounded-[8px] rounded-tl-[0px] px-[10px] py-[10px] max-w-[95%]"
                      style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                    >
                      <div className="grid grid-cols-2 gap-[8px]">
                        {quickActions.map(({ icon: Icon, label, color }) => (
                          <button
                            key={label}
                            className="quick-action flex items-center gap-[8px] px-[10px] py-[8px] rounded-[8px] border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] transition-colors"
                          >
                            <Icon className="w-[16px] h-[16px] flex-shrink-0" style={{ color }} />
                            <span className="text-[12px] font-medium text-[#1F2937]">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="chat-bubble flex justify-end">
                    <div
                      className="relative bg-[#DCF8C6] rounded-[8px] rounded-tr-[0px] px-[12px] py-[8px] max-w-[80%]"
                      style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                    >
                      <p className="text-[14px] text-[#303030] leading-[20px]">Show me shoes under ₦30,000</p>
                      <div className="flex items-center justify-end gap-[4px] mt-[3px]">
                        <span className="text-[11px] text-[#667781]">9:42 AM</span>
                        {/* Double Blue Check */}
                        <svg width="18" height="12" viewBox="0 0 18 12" fill="#53BDEB">
                          <path d="M17.394 2.014a.512.512 0 0 0-.343-.118.56.56 0 0 0-.432.2l-7.018 8.658L6.97 8.185a.523.523 0 0 0-.38-.165.531.531 0 0 0-.39.166l-.352.351a.504.504 0 0 0-.159.382c0 .154.053.283.159.388l3.396 3.396c.16.16.347.24.58.23a.732.732 0 0 0 .562-.23l7.75-9.576a.51.51 0 0 0 .158-.38.566.566 0 0 0-.158-.397l-.646-.336z"/>
                          <path d="M8.18 8.754l.352-.352a.51.51 0 0 0 .159-.381.51.51 0 0 0-.159-.381l-.352-.352a.523.523 0 0 0-.38-.165.531.531 0 0 0-.39.165l-3.395 3.396a.504.504 0 0 0-.159.382c0 .154.053.283.159.388l.352.351a.523.523 0 0 0 .38.166.531.531 0 0 0 .39-.166l3.043-3.051z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="chat-bubble flex justify-start">
                    <div
                      className="bg-white rounded-[8px] rounded-tl-[0px] px-[12px] py-[8px] max-w-[85%]"
                      style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}
                    >
                      <p className="text-[14px] text-[#303030] leading-[20px]">Here are some shoes you&apos;ll love 👇</p>
                      <span className="text-[11px] text-[#667781] float-right mt-[3px]">9:42 AM</span>
                    </div>
                  </div>

                  {/* Product Cards Carousel */}
                  <div className="flex gap-[10px] overflow-x-auto pb-[8px] scrollbar-hide -mx-[2px] px-[2px]">
                    {products.map((product, index) => (
                      <div
                        key={product.name}
                        className="product-card flex-shrink-0 bg-white rounded-[12px] overflow-hidden border border-[#E5E5E5]"
                        style={{
                          width: '120px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                        }}
                      >
                        {/* Product Image */}
                        <div 
                          className="h-[75px] flex items-center justify-center"
                          style={{ 
                            background: index === 0 ? '#F0F9F4' : index === 1 ? '#FEF3E7' : '#F0F4F8',
                          }}
                        >
                          <span className="text-[36px]">{product.image}</span>
                        </div>
                        
                        {/* Product Details */}
                        <div className="p-[10px]">
                          <p className="text-[12px] font-semibold text-[#1F2937] truncate leading-tight">{product.name}</p>
                          <p className="text-[13px] font-bold text-[#25D366] mt-[3px]">{product.price}</p>
                          <button 
                            className="w-full mt-[8px] py-[6px] text-[11px] font-semibold text-[#25D366] border border-[#25D366] rounded-[6px] hover:bg-[#25D366]/5 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Input Bar */}
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center gap-[8px] px-[8px] py-[8px]"
                style={{ backgroundColor: '#F0F0F0' }}
              >
                {/* Plus Button */}
                <button
                  className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                >
                  <Plus className="w-[24px] h-[24px] text-[#54656F]" />
                </button>

                {/* Input Field */}
                <div
                  className="flex items-center gap-[10px] flex-1 bg-white rounded-full px-[14px] py-[10px]"
                  style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                >
                  <Smile className="w-[24px] h-[24px] text-[#54656F] flex-shrink-0" />
                  <span className="flex-1 text-[16px] text-[#8696A0]">Type a message</span>
                  <Camera className="w-[24px] h-[24px] text-[#54656F] flex-shrink-0" />
                </div>

                {/* Mic Button */}
                <button
                  className="w-[44px] h-[44px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: '#00A884',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  <Mic className="w-[22px] h-[22px] text-white" />
                </button>
              </div>
            </div>

            {/* Screen Glass Reflection */}
            <div
              className="absolute inset-[3px] rounded-[43px] pointer-events-none"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, transparent 35%, transparent 100%)',
              }}
            />
          </div>
        </div>

        {/* Ground Shadow - No floating, grounded feel */}
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '220px',
            height: '20px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 40%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      </div>
    </div>
  )
}
