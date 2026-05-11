'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ShoppingBag, Package, CreditCard, HeadphonesIcon } from 'lucide-react'

// Reusable WhatsApp chat bubble with proper timestamp inside
function IncomingBubble({
  children,
  time,
  noBubble = false,
}: {
  children: React.ReactNode
  time: string
  noBubble?: boolean
}) {
  return (
    <div className="self-start max-w-[88%]">
      {noBubble ? (
        children
      ) : (
        <div className="bg-white rounded-[18px] rounded-tl-[4px] shadow-sm overflow-hidden">
          <div className="px-3 pt-2 pb-1">
            {children}
          </div>
          {/* Timestamp row — always inside bubble, right-aligned */}
          <div className="flex justify-end px-2 pb-1.5">
            <span className="text-[9px] text-gray-400 leading-none">{time}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function OutgoingBubble({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="self-end max-w-[80%]">
      <div className="bg-[#D9FDD3] rounded-[18px] rounded-tr-[4px] shadow-sm overflow-hidden">
        <div className="px-3 pt-2 pb-1">{children}</div>
        <div className="flex justify-end items-center gap-1 px-2 pb-1.5">
          <span className="text-[9px] text-gray-500 leading-none">{time}</span>
          {/* Double tick */}
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-[#53bdeb]">
            <path d="M1 4l3 3L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { icon: ShoppingBag, label: 'Browse Products', color: '#25D366' },
  { icon: Package, label: 'Track My Order', color: '#F97316' },
  { icon: CreditCard, label: 'Make Payment', color: '#3B82F6' },
  { icon: HeadphonesIcon, label: 'Talk to Support', color: '#E91E63' },
]

const PRODUCTS = [
  { name: 'Canvas Sneaker', price: '₦28,000' },
  { name: 'Urban Runner', price: '₦29,500' },
  { name: 'Street Low Top', price: '₦26,000' },
]

export function IPhone3DMockup() {
  const phoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!phoneRef.current) return

    const ctx = gsap.context(() => {
      // Elegant entrance animation
      gsap.fromTo(
        phoneRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )

      // Chat bubbles stagger animation
      gsap.fromTo(
        '.chat-bubble',
        { opacity: 0, y: 10, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.5,
        }
      )
    }, phoneRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="relative">
      {/* Ambient glow behind phone */}
      <div className="absolute inset-0 blur-3xl rounded-full scale-75 bg-primary/20" />

      {/* Outer phone chassis - VendoorX style */}
      <div
        ref={phoneRef}
        className="relative mx-auto transition-transform duration-500 hover:scale-[1.02]"
        style={{
          width: 300,
          background: 'linear-gradient(160deg, #2a2a2a 0%, #111 40%, #1c1c1c 100%)',
          borderRadius: '52px',
          padding: '3px',
          boxShadow: [
            '0 60px 120px rgba(0,0,0,0.55)',
            '0 0 0 0.5px rgba(255,255,255,0.12)',
            'inset 0 0 0 1px rgba(255,255,255,0.05)',
          ].join(', '),
        }}
      >
        {/* Side buttons — volume up */}
        <div
          style={{
            position: 'absolute',
            left: -4,
            top: 110,
            width: 3,
            height: 32,
            background: 'linear-gradient(180deg, #3a3a3a, #222)',
            borderRadius: '2px 0 0 2px',
            boxShadow: '-1px 0 2px rgba(0,0,0,0.6)',
          }}
        />
        {/* Volume down */}
        <div
          style={{
            position: 'absolute',
            left: -4,
            top: 152,
            width: 3,
            height: 32,
            background: 'linear-gradient(180deg, #3a3a3a, #222)',
            borderRadius: '2px 0 0 2px',
            boxShadow: '-1px 0 2px rgba(0,0,0,0.6)',
          }}
        />
        {/* Silent switch */}
        <div
          style={{
            position: 'absolute',
            left: -4,
            top: 78,
            width: 3,
            height: 24,
            background: 'linear-gradient(180deg, #3a3a3a, #222)',
            borderRadius: '2px 0 0 2px',
            boxShadow: '-1px 0 2px rgba(0,0,0,0.6)',
          }}
        />
        {/* Power / lock button — right side */}
        <div
          style={{
            position: 'absolute',
            right: -4,
            top: 120,
            width: 3,
            height: 52,
            background: 'linear-gradient(180deg, #3a3a3a, #222)',
            borderRadius: '0 2px 2px 0',
            boxShadow: '1px 0 2px rgba(0,0,0,0.6)',
          }}
        />

        {/* Screen glass */}
        <div
          style={{
            borderRadius: '50px',
            overflow: 'hidden',
            background: '#ECE5DD',
            position: 'relative',
          }}
        >
          {/* Screen glare reflection */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
              zIndex: 10,
              borderRadius: '50px 50px 0 0',
              pointerEvents: 'none',
            }}
          />

          {/* Status bar (WhatsApp green) */}
          <div
            style={{
              background: '#075E54',
              padding: '14px 20px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            {/* Time — left */}
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.01em', minWidth: 34 }}>
              9:41
            </span>

            {/* Dynamic Island — center */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: 10,
                width: 88,
                height: 26,
                background: '#000',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 8,
                gap: 4,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a1a', border: '1.5px solid #2a2a2a' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#141414', border: '1.5px solid #252525' }} />
            </div>

            {/* Status icons — right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 34, justifyContent: 'flex-end' }}>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
                <rect x="0" y="7" width="2.5" height="3" rx="0.5" />
                <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" />
                <rect x="7" y="3" width="2.5" height="7" rx="0.5" />
                <rect x="10.5" y="0.5" width="2.5" height="9.5" rx="0.5" />
              </svg>
              <svg width="13" height="10" viewBox="0 0 13 10" fill="white">
                <path d="M6.5 8a1 1 0 110 2 1 1 0 010-2z" />
                <path d="M3.2 6.2A4.7 4.7 0 016.5 5c1.2 0 2.4.4 3.3 1.2" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                <path d="M1 4A7.5 7.5 0 016.5 2c2 0 3.8.8 5.2 2" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              </svg>
              <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <div style={{ width: 19, height: 10, border: '1.2px solid rgba(255,255,255,0.7)', borderRadius: 2.5, padding: 1.5, position: 'relative' }}>
                  <div style={{ width: '80%', height: '100%', background: 'white', borderRadius: 1 }} />
                </div>
                <div style={{ width: 2, height: 5, background: 'rgba(255,255,255,0.6)', borderRadius: '0 1px 1px 0' }} />
              </div>
            </div>
          </div>

          {/* WhatsApp chat header */}
          <div
            style={{
              background: '#075E54',
              padding: '8px 14px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                <path d="M7 1L1 6.5 7 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: 'white',
                border: '2px solid rgba(255,255,255,0.2)',
                flexShrink: 0,
                letterSpacing: '-0.5px',
              }}
            >
              <ShoppingBag style={{ width: 16, height: 16, color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                  Your Store
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#53bdeb">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 1 }}>
                +234 803 123 4567
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
                <path d="M23 7l-7 5 7 5V7z"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8">
                <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
              </svg>
            </div>
          </div>

          {/* Chat body */}
          <div
            style={{
              background: '#ECE5DD',
              height: 430,
              padding: '10px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              overflow: 'hidden',
            }}
          >
            {/* Date chip */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <span style={{ background: 'rgba(225,200,165,0.9)', color: '#6b5a4e', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 12 }}>
                Today
              </span>
            </div>

            {/* Welcome message bubble */}
            <div className="chat-bubble">
              <IncomingBubble time="9:41 AM">
                <p style={{ fontSize: 12.5, color: '#111', lineHeight: 1.45, margin: 0 }}>
                  Hi 👋<br />
                  Welcome to Your Store!<br />
                  What would you like to do today?
                </p>
              </IncomingBubble>
            </div>

            {/* Quick actions menu */}
            <div className="chat-bubble">
              <IncomingBubble time="9:41 AM" noBubble>
                <div className="bg-white rounded-[18px] rounded-tl-[4px] shadow-sm overflow-hidden">
                  <div style={{ padding: '6px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {QUICK_ACTIONS.map(({ icon: Icon, label, color }) => (
                      <button
                        key={label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#f0f2f5',
                          border: '1px solid rgba(0,0,0,0.06)',
                          borderRadius: 12,
                          padding: '7px 10px',
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#1a1a1a',
                          cursor: 'default',
                          textAlign: 'left',
                        }}
                      >
                        <Icon style={{ width: 12, height: 12, color, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </IncomingBubble>
            </div>

            {/* User message */}
            <div className="chat-bubble">
              <OutgoingBubble time="9:42 AM">
                <p style={{ fontSize: 12.5, color: '#111', margin: 0 }}>Show me shoes under ₦30,000</p>
              </OutgoingBubble>
            </div>

            {/* Bot response */}
            <div className="chat-bubble">
              <IncomingBubble time="9:42 AM">
                <p style={{ fontSize: 12.5, color: '#111', lineHeight: 1.45, margin: 0 }}>
                  Here are some shoes you&apos;ll love 👇
                </p>
              </IncomingBubble>
            </div>

            {/* Product cards */}
            <div className="chat-bubble">
              <IncomingBubble time="9:42 AM" noBubble>
                <div className="bg-white rounded-[18px] rounded-tl-[4px] shadow-sm overflow-hidden p-2">
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {PRODUCTS.map((product, index) => (
                      <div
                        key={product.name}
                        style={{
                          minWidth: 80,
                          background: index === 0 ? '#F0F9F4' : index === 1 ? '#FEF3E7' : '#F0F4F8',
                          borderRadius: 10,
                          padding: 8,
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            background: 'white',
                            borderRadius: 8,
                            margin: '0 auto 6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                          }}
                        >
                          👟
                        </div>
                        <p style={{ fontSize: 9, fontWeight: 600, color: '#111', margin: 0, lineHeight: 1.2 }}>{product.name}</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#25D366', margin: '3px 0 6px' }}>{product.price}</p>
                        <button
                          style={{
                            background: '#25D366',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontSize: 9,
                            fontWeight: 600,
                            cursor: 'default',
                          }}
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </IncomingBubble>
            </div>
          </div>

          {/* Chat input bar */}
          <div
            style={{
              background: '#f0f2f5',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderTop: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div style={{ flex: 1, background: 'white', borderRadius: 20, padding: '6px 12px', fontSize: 11, color: '#aaa', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
              Type a message
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2" strokeLinecap="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(37,211,102,0.45)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Home indicator bar */}
          <div style={{ background: '#f0f2f5', padding: '8px 0 10px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 100, height: 4, background: '#333', borderRadius: 3, opacity: 0.3 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
