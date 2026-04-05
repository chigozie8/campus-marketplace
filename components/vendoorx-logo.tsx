import Link from 'next/link'

export function VendoorXIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="44" height="44" rx="12" fill="#16a34a" />
      <rect
        x="3" y="3" width="38" height="38" rx="10"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
      {/* V letterform */}
      <path
        d="M10 13l8 18h8l8-18"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* X badge */}
      <rect x="27" y="27" width="13" height="13" rx="4" fill="white" />
      <path
        d="M30 30l7 7M37 30l-7 7"
        stroke="#16a34a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
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

export function VendoorXLogo({ size = 40, href = '/' }: { size?: number; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 group flex-shrink-0">
      <div className="transition-transform duration-200 group-hover:scale-105">
        <VendoorXIcon size={size} />
      </div>
      <VendoorXWordmark />
    </Link>
  )
}
