import type { Platform } from '@/lib/types'

const CONFIG: Record<Platform, { label: string; short: string; bg: string; text: string; dot: string }> = {
  whatsapp:  { label: 'WhatsApp', short: 'WA', bg: 'bg-[#25D366]', text: 'text-white', dot: 'bg-[#25D366]' },
  instagram: { label: 'Instagram', short: 'IG', bg: 'instagram-gradient', text: 'text-white', dot: 'bg-pink-500' },
  facebook:  { label: 'Facebook', short: 'FB', bg: 'bg-[#1877F2]', text: 'text-white', dot: 'bg-[#1877F2]' },
}

interface BadgeProps {
  platform: Platform
  size?: 'sm' | 'md'
  variant?: 'icon' | 'pill'
}

export function PlatformBadge({ platform, size = 'md', variant = 'icon' }: BadgeProps) {
  const c = CONFIG[platform]

  if (variant === 'pill') {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-white/70`} />
        {c.label}
      </span>
    )
  }

  const sz = size === 'sm' ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[9px]'
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-black ${sz} ${c.bg} ${c.text}`}>
      {c.short}
    </span>
  )
}

export function platformLabel(platform: Platform) {
  return CONFIG[platform].label
}

export function PlatformDot({ platform }: { platform: Platform }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${CONFIG[platform].dot}`} />
}
