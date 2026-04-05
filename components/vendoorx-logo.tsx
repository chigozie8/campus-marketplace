import Link from 'next/link'
import Image from 'next/image'

/** Renders the full VendoorX logo PNG (bag + wordmark) at a given height.
 *  The logo image is approximately 3:1 landscape, so width = height * 3.
 */
export function VendoorXIcon({ height = 36 }: { height?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="VendoorX"
      width={height * 3}
      height={height}
      className="object-contain"
      priority
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

export function VendoorXLogo({ height = 36, href = '/' }: { height?: number; href?: string }) {
  return (
    <Link href={href} className="flex items-center flex-shrink-0 group">
      <div className="transition-transform duration-200 group-hover:scale-105">
        <VendoorXIcon height={height} />
      </div>
    </Link>
  )
}
