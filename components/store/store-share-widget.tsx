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
  const [resolvedUrl, setResolvedUrl] = useState(storeUrl)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResolvedUrl(window.location.href)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function copyLink() {
    navigator.clipboard.writeText(resolvedUrl).catch(() => {
      const input = document.createElement('input')
      input.value = resolvedUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    })
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${storeName} on VendoorX`,
          text: `Check out ${storeName}'s store on VendoorX — Nigeria's #1 WhatsApp marketplace!`,
          url: resolvedUrl,
        })
        setOpen(false)
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') { setOpen(false); return }
      }
    }
    setOpen(true)
  }

  const waText = encodeURIComponent(`Check out ${storeName}'s store on VendoorX! 🛍️\n${resolvedUrl}`)
  const twText = encodeURIComponent(`Shopping ${storeName}'s store on VendoorX — Nigeria's #1 WhatsApp marketplace!`)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={nativeShare}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white dark:bg-card hover:bg-muted/50 text-sm font-bold text-foreground transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share Store
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-white dark:bg-card shadow-2xl shadow-black/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-black text-foreground uppercase tracking-wide">Share store</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 flex flex-col gap-1">
            <a
              href={`https://api.whatsapp.com/send?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#25D366]/10 text-[#25D366] text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z" />
              </svg>
              Share on WhatsApp
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${twText}&url=${encodeURIComponent(resolvedUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground text-sm font-semibold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              Post on X
            </a>

            <div className="h-px bg-border mx-1 my-0.5" />

            <button
              onClick={copyLink}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted text-foreground text-sm font-semibold transition-colors w-full text-left"
            >
              {copied
                ? <Check className="w-4 h-4 text-primary shrink-0" />
                : <Link2 className="w-4 h-4 shrink-0 text-muted-foreground" />
              }
              {copied ? 'Link copied!' : 'Copy store link'}
            </button>
          </div>

          {!copied && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 border border-border">
                <span className="text-[10px] text-muted-foreground font-mono truncate flex-1">{resolvedUrl.replace('https://', '')}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
