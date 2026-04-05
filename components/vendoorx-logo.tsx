import Link from 'next/link'
import Image from 'next/image'

export function VendoorXIcon({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="VendoorX"
      width={size}
      height={size}
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

export function VendoorXLogo({ size = 140, href = '/' }: { size?: number; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 group flex-shrink-0">
      <div className="transition-transform duration-200 group-hover:scale-105">
        <VendoorXIcon size={size} />
      </div>
    </Link>
  )
}
