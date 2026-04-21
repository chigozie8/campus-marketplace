'use client'

import Image from 'next/image'
import { useState } from 'react'

export type AvatarMeta = {
  src: string
  alt: string
  fallback: string
  color: string
}

/**
 * Five overlapping circular avatars used in the hero's social-proof row.
 * Only the first image is `priority` (it's part of LCP). The rest lazy-load.
 * On image load failure we swap to a coloured initials chip — done client-side
 * so the parent can stay a server component.
 */
export function HeroAvatarStack({ avatars }: { avatars: AvatarMeta[] }) {
  return (
    <div className="flex -space-x-3" aria-label="Recently active sellers">
      {avatars.map((a, i) => (
        <Avatar key={a.fallback + i} avatar={a} index={i} total={avatars.length} />
      ))}
    </div>
  )
}

function Avatar({ avatar, index, total }: { avatar: AvatarMeta; index: number; total: number }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div
        className={`w-10 h-10 rounded-full ring-3 ring-background shadow-lg flex items-center justify-center text-white text-xs font-bold ${avatar.color}`}
        style={{ zIndex: total - index }}
        aria-hidden="true"
      >
        {avatar.fallback}
      </div>
    )
  }
  return (
    <div
      className="w-10 h-10 rounded-full ring-3 ring-background shadow-lg overflow-hidden bg-muted"
      style={{ zIndex: total - index }}
    >
      <Image
        src={avatar.src}
        alt={avatar.alt}
        width={40}
        height={40}
        priority={index === 0}
        loading={index === 0 ? undefined : 'lazy'}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
