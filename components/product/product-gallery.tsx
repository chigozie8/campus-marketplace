'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type MediaItem = { src: string; type: 'image' | 'video' }

type Props = {
  images: string[]
  title: string
  isFeatured?: boolean
}

function isVideo(src: string) {
  return /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(src)
}

function buildMediaItems(images: string[]): MediaItem[] {
  return images.map(src => ({ src, type: isVideo(src) ? 'video' : 'image' }))
}

export function ProductGallery({ images, title, isFeatured }: Props) {
  const [selected, setSelected] = useState(0)
  const items: MediaItem[] = images.length > 0
    ? buildMediaItems(images)
    : [{ src: '/placeholder.svg?height=500&width=600', type: 'image' }]

  const current = items[selected]

  function prev() { setSelected(i => (i - 1 + items.length) % items.length) }
  function next() { setSelected(i => (i + 1) % items.length) }

  return (
    <div className="space-y-3">
      {/* Main media */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-muted">
        {current.type === 'video' ? (
          <video
            key={current.src}
            src={current.src}
            controls
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <img
            src={current.src}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}

        {isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-white text-xs">⚡ Featured</Badge>
          </div>
        )}

        {/* Prev / Next arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`h-1.5 rounded-full transition-all ${i === selected ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
                  aria-label={`Go to media ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                i === selected
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
              aria-label={`Media ${i + 1}`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
              ) : (
                <img src={item.src} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
