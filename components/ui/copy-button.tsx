'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
  size?: 'xs' | 'sm' | 'md'
}

export function CopyButton({ value, label, className, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const padding = size === 'xs' ? 'p-1' : size === 'sm' ? 'p-1.5' : 'p-2'

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy ${label || 'to clipboard'}`}
      aria-label={copied ? 'Copied' : `Copy ${label || 'to clipboard'}`}
      className={cn(
        'inline-flex items-center gap-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
        padding,
        className,
      )}
    >
      {copied
        ? <Check className={cn(iconSize, 'text-emerald-500')} />
        : <Copy className={iconSize} />
      }
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {copied ? 'Copied' : label}
        </span>
      )}
    </button>
  )
}
