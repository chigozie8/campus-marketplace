'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Props = {
  images: string[]
  title: string
  isFeatured?: boolean
}

export function ProductGallery({ images, title, isFeatured }: Props) {
  const [selected, setSelected] = useState(0)
  const hasImages = images.length > 0
  const mainSrc = hasImages ? images[selected] : '/placeholder.svg?height=500&width=600'

  function prev() { setSelected(i => (i - 1 + images.length) % images.length) }
  function next() { setSelected(i => (i + 1) % images.length) }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-muted">
        <img
          src={mainSrc}
          alt={title}
          className="w-full h-full object-cover"
        />

        {isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-white text-xs">Featured</Badge>
          </div>
        )}

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === selected ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                i === selected
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
