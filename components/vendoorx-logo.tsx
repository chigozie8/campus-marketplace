'use client'

import Link from 'next/link'
import Image from 'next/image'

/**
 * Renders the VendoorX logo PNG.
 * Accepts both `size` (legacy square prop) and `height` for flexibility.
 * The logo is ~3:1 landscape so width is derived from height.
 */
export function VendoorXIcon({
  height,
  size,
}: {
  height?: number
  size?: number
}) {
  const h = height ?? size ?? 40
  const w = Math.round(h * 3)
  return (
    <Image
      src="/logo.png"
      alt="VendoorX"
      width={w}
      height={h}
      className="object-contain"
      priority
      unoptimized={false}
    />
  )
}

export function VendoorXWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <span className="font-black tracking-tight text-gray-950 dark:text-white leading-none">
        Vendoor<span className="text-[#16a34a]">X</span>
      </span>
      <span className="text-[9px] tracking-[0.18em] uppercase text-gray-400 font-semibold mt-0.5">
        Campus Marketplace
      </span>
    </div>
  )
}

export function VendoorXLogo({
  height,
  size,
  href = '/',
}: {
  height?: number
  size?: number
  href?: string
}) {
  const h = height ?? size ?? 44
  return (
    <Link href={href} className="flex items-center flex-shrink-0 group">
      <div className="transition-transform duration-200 group-hover:scale-[1.03]">
        <VendoorXIcon height={h} />
      </div>
    </Link>
  )
}
