'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, MapPin, Star, BadgeCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  isFavorited?: boolean
  onToggleFavorite?: (productId: string) => void
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

export function ProductCard({ product, isFavorited = false, onToggleFavorite }: ProductCardProps) {
  const whatsappNumber = product.profiles?.whatsapp_number?.replace(/\D/g, '') || ''
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=Hi! I'm interested in "${product.title}" listed on CampusCart for ₦${product.price.toLocaleString()}`
    : '#'

  const imageUrl = product.images?.[0] || `/placeholder.svg?height=240&width=320`
  const sellerName = product.profiles?.full_name || 'Unknown Seller'
  const sellerRating = product.profiles?.rating || 0
  const isVerified = product.profiles?.seller_verified || false

  return (
    <div className="group rounded-2xl border border-border/50 bg-card overflow-hidden card-hover flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
        <Link href={`/marketplace/${product.id}`}>
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        {/* Badges overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.is_featured && (
            <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">Featured</Badge>
          )}
          <Badge className={cn('text-xs px-2 py-0.5', conditionColors[product.condition])}>
            {conditionLabels[product.condition]}
          </Badge>
        </div>

        {/* Favourite button */}
        <button
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
        </button>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 gap-1.5">
        <Link href={`/marketplace/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug">{product.title}</h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-foreground">
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

        {/* Seller row — compact on mobile */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold flex-shrink-0">
            {sellerName.charAt(0)}
          </div>
          <span className="truncate max-w-[80px] sm:max-w-none">{sellerName}</span>
          {isVerified && <BadgeCheck className="w-3 h-3 text-primary flex-shrink-0" />}
          {sellerRating > 0 && (
            <div className="flex items-center gap-0.5 ml-auto">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{sellerRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* WhatsApp CTA */}
        <Button
          size="sm"
          className="w-full mt-auto whatsapp-green border-0 h-8 sm:h-9 text-[10px] sm:text-xs font-semibold"
          asChild
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
            <span className="hidden xs:inline">Chat on </span>WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}
