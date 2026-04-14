'use client'

import { useState, useEffect, useRef } from 'react'
import { Share2, Check, Link2, X } from 'lucide-react'

interface StoreShareWidgetProps {
  storeName: string
  storeUrl: string
}

export function StoreShareWidget({ storeName, storeUrl }: StoreShareWidgetProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function copyLink() {
    navigator.clipboard.writeText(storeUrl).catch(() => {
      const el = document.createElement('input')
      el.value = storeUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }

  function handleShareClick() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${storeName} on VendoorX`,
        text: `Check out ${storeName}'s store on VendoorX — Nigeria's #1 WhatsApp marketplace!`,
        url: storeUrl,
      }).catch((err) => {
        if (err?.name !== 'AbortError') setOpen(true)
      })
    } else {
      setOpen(prev => !prev)
    }
  }

  const waText = encodeURIComponent(
    `Check out ${storeName}'s store on VendoorX! 🛍️\n${storeUrl}`
  )
  const twText = encodeURIComponent(
    `Shopping ${storeName}'s store on VendoorX — Nigeria's #1 WhatsApp marketplace!`
  )
  const displayUrl = storeUrl.replace('https://', '').replace('http://', '')

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleShareClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-muted/50 text-sm font-bold text-foreground transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share Store
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-border bg-white dark:bg-card shadow-2xl z-50 overflow-hidden"
          style={{ animation: 'fadeSlideIn 0.15s ease-out' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-black text-foreground uppercase tracking-wide">Share Store</span>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 flex flex-col gap-0.5">
            <a
              href={`https://api.whatsapp.com/send?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#25D366]/8 hover:bg-[#25D366]/15 text-[#25D366] text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z" />
              </svg>
              Share on WhatsApp
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${twText}&url=${encodeURIComponent(storeUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-foreground text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              Post on X
            </a>

            <div className="h-px bg-border mx-1 my-1" />

            <button
              onClick={copyLink}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-muted text-foreground text-sm font-semibold transition-colors w-full text-left"
            >
              {copied
                ? <Check className="w-4 h-4 text-primary shrink-0" />
                : <Link2 className="w-4 h-4 shrink-0 text-muted-foreground" />
              }
              {copied ? 'Link copied!' : 'Copy store link'}
            </button>
          </div>

          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-muted border border-border">
              <span className="text-[10px] text-muted-foreground font-mono truncate">{displayUrl}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
