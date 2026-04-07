'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, X, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUPPORT_PHONE = '07082039250'
const SUPPORT_WHATSAPP = 'https://wa.me/2347082039250?text=Hi%20VendoorX%20Support%2C%20I%20need%20help%20with...'

export function FloatingSupport() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">

      {/* Expanded options */}
      <div
        className={cn(
          'flex flex-col gap-2 transition-all duration-200',
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
        )}
      >
        {/* Label */}
        <div className="text-right mb-1">
          <p className="text-xs font-bold text-foreground bg-background/90 backdrop-blur border border-border rounded-full px-3 py-1 shadow-sm">
            Customer Support
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 pr-1">Mon–Sat 8am–10pm WAT</p>
        </div>

        {/* Call button */}
        <a
          href={`tel:${SUPPORT_PHONE}`}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <Phone className="w-4 h-4 shrink-0" />
          <span>{SUPPORT_PHONE}</span>
        </a>

        {/* WhatsApp button */}
        <a
          href={SUPPORT_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span>WhatsApp Us</span>
        </a>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95',
          open
            ? 'bg-foreground text-background'
            : 'bg-emerald-600 text-white shadow-emerald-500/40 hover:bg-emerald-700'
        )}
        aria-label="Contact Support"
      >
        {open ? <X className="w-5 h-5" /> : <Headphones className="w-6 h-6" />}
      </button>

      {/* Pulse indicator when closed */}
      {!open && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
      )}
    </div>
  )
}
