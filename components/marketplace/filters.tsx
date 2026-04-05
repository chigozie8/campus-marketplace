'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'books', label: 'Books' },
  { value: 'food-drinks', label: 'Food & Drinks' },
  { value: 'services', label: 'Services' },
  { value: 'housing', label: 'Housing' },
  { value: 'sports', label: 'Sports' },
  { value: 'beauty', label: 'Beauty' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Viewed' },
]

export function MarketplaceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get('category') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const q = searchParams.get('q') || ''

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/marketplace?${params.toString()}`)
    },
    [router, searchParams],
  )

  const activeFilters = [
    category !== 'all' && categories.find(c => c.value === category)?.label,
    sort !== 'newest' && sortOptions.find(s => s.value === sort)?.label,
  ].filter(Boolean)

  return (
    <div className="flex items-center gap-2">
      {/* Sort — compact select, visible on all sizes */}
      <Select value={sort} onValueChange={v => updateParams('sort', v)}>
        <SelectTrigger className="h-9 w-[130px] sm:w-44 text-xs sm:text-sm">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter sheet — icon button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilters.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] text-white font-bold flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-5">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={v => updateParams('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select value={sort} onValueChange={v => updateParams('sort', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {activeFilters.length > 0 && (
              <button
                onClick={() => router.push('/marketplace')}
                className="w-full text-sm text-destructive font-semibold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
