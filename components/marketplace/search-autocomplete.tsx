'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  title: string
  price: number
  images: string[]
  campus: string | null
}

interface Props {
  defaultValue?: string
  className?: string
  placeholder?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function SearchAutocomplete({ defaultValue = '', className, placeholder = 'Search listings…' }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 220)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('id, title, price, images, campus')
        .eq('is_available', true)
        .ilike('title', `%${q}%`)
        .order('views', { ascending: false })
        .limit(6)
      setSuggestions(data || [])
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (focused) fetchSuggestions(debouncedQuery)
  }, [debouncedQuery, focused, fetchSuggestions])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      router.push(`/marketplace?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleSelect(item: Suggestion) {
    setOpen(false)
    router.push(`/marketplace/${item.id}`)
  }

  function handleClear() {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (query.length >= 2) setOpen(true) }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
          {!loading && query && (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {suggestions.map(item => (
              <button
                key={item.id}
                type="button"
                onMouseDown={() => handleSelect(item)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-muted transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-muted flex-shrink-0 relative">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Search className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-black text-primary">₦{item.price.toLocaleString()}</span>
                    {item.campus && (
                      <span className="text-[10px] text-gray-400 truncate">{item.campus}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-border px-3 py-2">
            <button
              type="button"
              onMouseDown={handleSubmit as unknown as React.MouseEventHandler}
              className="text-xs text-primary font-semibold hover:underline"
            >
              See all results for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
