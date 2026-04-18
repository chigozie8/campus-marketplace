'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, MapPin, Star, BadgeCheck, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import { quickSellerScore } from '@/lib/trust'
import { TrustBadge } from '@/components/TrustBadge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { botWhatsappUrl } from '@/lib/whatsapp-bot'

interface ProductCardProps {
  product: Product
  isFavorited?: boolean
  onToggleFavorite?: (productId: string) => void
  index?: number
}

const conditionLabels = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
}

const conditionColors = {
  new: 'bg-primary/10 text-primary',
  like_new: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40',
  good: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40',
  fair: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40',
}

export function ProductCard({ product, isFavorited = false, onToggleFavorite, index = 0 }: ProductCardProps) {
  const router = useRouter()
  const whatsappMessage = `Hi VendoorX! I'm interested in "${product.title}" (listing #${product.id}) for ₦${product.price.toLocaleString()}. Is it still available?`
  const whatsappUrl = botWhatsappUrl(whatsappMessage)

  function handleWhatsApp(e: React.MouseEvent) {
    e.preventDefault()
    fetch(`/api/products/${product.id}/whatsapp`, { method: 'POST' }).catch(() => {})
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const imageUrl = product.images?.[0] || `/placeholder.svg?height=240&width=320`
  const sellerName = product.profiles?.full_name || 'Unknown Seller'
  const sellerRating = product.profiles?.rating || 0
  const isVerified = product.profiles?.seller_verified || false
  const isStudentVerified = product.profiles?.is_student_verified || false
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const accountAgeDays = product.profiles?.created_at
    ? Math.floor((Date.now() - new Date(product.profiles.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const trustScore = quickSellerScore({
    rating: sellerRating,
    totalSales: product.profiles?.total_sales ?? 0,
    sellerVerified: isVerified,
    accountAgeDays,
  })

  return (
    <LazyMotion features={domAnimation}>
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      className="group rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
        <Link href={`/marketplace/${product.id}`} className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            priority={index === 0}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        {/* Badges overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.is_featured && (
            <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 shadow-sm">⚡ Featured</Badge>
          )}
          {discount >= 10 && (
            <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 shadow-sm">{discount}% off</Badge>
          )}
          <Badge className={cn('text-xs px-2 py-0.5', conditionColors[product.condition])}>
            {conditionLabels[product.condition]}
          </Badge>
        </div>

        {/* Favourite button */}
        <m.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onToggleFavorite?.(product.id)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-colors',
              isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
            )}
          />
        </m.button>

        {/* WhatsApp hover overlay */}
        <div className="absolute inset-0 bg-[#25D366]/0 group-hover:bg-[#25D366]/10 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 gap-1.5">
        <Link href={`/marketplace/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug">{product.title}</h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-black text-foreground">
            ₦{product.price.toLocaleString()}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-[10px] text-muted-foreground line-through">
              ₦{product.original_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Location */}
        {product.campus && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{product.campus}</span>
          </div>
        )}

        {/* Seller row */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold flex-shrink-0">
            {sellerName.charAt(0)}
          </div>
          <span className="truncate max-w-[80px] sm:max-w-none">{sellerName}</span>
          {isVerified && <BadgeCheck className="w-3 h-3 text-primary flex-shrink-0" />}
          {isStudentVerified && <GraduationCap className="w-3 h-3 text-blue-500 flex-shrink-0" title="Verified seller" />}
          <TrustBadge score={trustScore} size="sm" showScore={false} />
          {sellerRating > 0 && (
            <div className="flex items-center gap-0.5 ml-auto">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{sellerRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* WhatsApp CTA */}
        <m.button
          onClick={handleWhatsApp}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-auto flex items-center justify-center gap-1.5 w-full h-8 sm:h-9 rounded-xl bg-[#25D366] text-white text-[10px] sm:text-xs font-bold hover:bg-[#20BA5C] transition-colors shadow-sm shadow-[#25D366]/20"
        >
          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline">Chat on </span>WhatsApp
        </m.button>
      </div>
    </m.div>
    </LazyMotion>
  )
}
