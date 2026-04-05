'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            defaultValue={q}
            className="pl-9 h-10"
            onChange={e => {
              const timeout = setTimeout(() => updateParams('q', e.target.value), 400)
              return () => clearTimeout(timeout)
            }}
          />
        </div>

        <Select value={sort} onValueChange={v => updateParams('sort', v)}>
          <SelectTrigger className="w-48 h-10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mobile filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 md:hidden">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Category pills - desktop */}
      <div className="hidden md:flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => updateParams('category', cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === cat.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Active filter badges */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active:</span>
          {activeFilters.map(filter => (
            <Badge key={String(filter)} variant="secondary" className="text-xs">
              {String(filter)}
            </Badge>
          ))}
          <button
            onClick={() => router.push('/marketplace')}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
