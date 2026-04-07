'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Phone, X, Clock, Headphones, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEFAULT_SETTINGS } from '@/lib/site-settings-defaults'

export function FloatingSupport() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [phone, setPhone] = useState(DEFAULT_SETTINGS.support_phone)
  const [whatsappUrl, setWhatsappUrl] = useState(DEFAULT_SETTINGS.support_whatsapp_url)

  const isOnDashboard = pathname.startsWith('/dashboard')

  useEffect(() => {
    if (!isOnDashboard) return
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(d => {
        if (d.support_phone) setPhone(d.support_phone)
        if (d.support_whatsapp_url) setWhatsappUrl(d.support_whatsapp_url)
      })
      .catch(() => {})
    const t = setTimeout(() => setMounted(true), 1200)
    return () => clearTimeout(t)
  }, [isOnDashboard])

  if (!isOnDashboard || !mounted) return null

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end">

      {/* ── Popup card ── */}
      <div
        className={cn(
          'mb-3 w-72 transition-all duration-300 origin-bottom-right',
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        )}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-white/10">

          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 px-5 py-4">
            {/* background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-black/10 rounded-full" />
            </div>

            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <span className="text-white/90 text-[11px] font-semibold tracking-wide uppercase">Online now</span>
                </div>
                <h3 className="text-white text-base font-black leading-tight">Need help?</h3>
                <p className="text-white/80 text-xs mt-0.5">Our team replies in minutes</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1 -mr-1 -mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white dark:bg-card p-4 space-y-2.5">

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl px-4 py-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0 shadow-md shadow-green-500/30">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Chat on WhatsApp</p>
                <p className="text-[11px] text-gray-500 dark:text-muted-foreground">Fastest response</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:text-[#25D366] transition-colors" />
            </a>

            {/* Call */}
            <a
              href={`tel:${phone}`}
              className="group flex items-center gap-3 w-full bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-xl px-4 py-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                <Phone className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Call Us</p>
                <p className="text-[11px] font-mono text-gray-500 dark:text-muted-foreground">{phone}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:text-emerald-600 transition-colors" />
            </a>

            {/* Hours */}
            <div className="flex items-center gap-2 px-1 pt-0.5">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <p className="text-[11px] text-gray-400 dark:text-muted-foreground">
                Mon – Sat &nbsp;·&nbsp; 8 am – 10 pm WAT
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toggle button ── */}
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Contact Support"
          className={cn(
            'relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300',
            'shadow-xl hover:shadow-2xl active:scale-95',
            open
              ? 'bg-gray-800 dark:bg-gray-700 shadow-black/30 rotate-0 scale-100'
              : 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/50 hover:from-emerald-400 hover:to-green-500 hover:scale-105'
          )}
        >
          <div className={cn('transition-all duration-300', open ? 'rotate-180 opacity-100' : 'rotate-0 opacity-100')}>
            {open
              ? <X className="w-5 h-5 text-white" />
              : <Headphones className="w-6 h-6 text-white drop-shadow" />
            }
          </div>
        </button>

        {/* Pulse ring — only when closed */}
        {!open && (
          <>
            <span className="absolute inset-0 rounded-2xl animate-ping bg-emerald-400 opacity-20 pointer-events-none" />
            {/* Badge */}
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-red-500/40 leading-none">
              1
            </span>
          </>
        )}
      </div>
    </div>
  )
}
