'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ShoppingBag,
  Upload,
  X,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    condition: 'new' as const,
    category_id: '',
    campus: '',
    location: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be signed in to list an item')
      router.push('/auth/login')
      return
    }

    const { error } = await supabase.from('products').insert({
      seller_id: user.id,
      title: form.title,
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      condition: form.condition,
      category_id: form.category_id || null,
      campus: form.campus || null,
      location: form.location || null,
      images: [],
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Listing created! Buyers can now find your item.')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 hero-gradient rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-base">Campus<span className="text-primary">Cart</span></span>
            </Link>
            <span className="text-muted-foreground text-sm hidden sm:block">/ New Listing</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Create a Listing</h1>
          <p className="text-muted-foreground">Fill in the details and start receiving WhatsApp inquiries</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images placeholder */}
          <div>
            <Label className="mb-2 block">Photos</Label>
            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Upload photos</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each (max 6 photos)</p>
              <Button variant="outline" size="sm" className="mt-3" type="button">
                Choose Files
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="What are you selling? (e.g. iPhone 14 Pro Max 256GB)"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              required
              maxLength={100}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground text-right">{form.title.length}/100</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your item — condition, features, reason for selling..."
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Asking Price (₦) <span className="text-destructive">*</span></Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                min="0"
                step="50"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="original_price">Original Price (₦)</Label>
              <Input
                id="original_price"
                type="number"
                placeholder="Optional"
                min="0"
                step="50"
                value={form.original_price}
                onChange={e => handleChange('original_price', e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Category + Condition row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={v => handleChange('category_id', v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Condition</Label>
              <Select value={form.condition} onValueChange={v => handleChange('condition', v)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="campus">Campus / University</Label>
              <Input
                id="campus"
                placeholder="e.g. UNILAG, UI, OAU"
                value={form.campus}
                onChange={e => handleChange('campus', e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location / Hostel</Label>
              <Input
                id="location"
                placeholder="e.g. Moremi Hall, Amina Hall"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your WhatsApp number from your profile will be used for buyer inquiries.{' '}
              <Link href="/profile" className="text-primary hover:underline">Update your profile</Link>{' '}
              to make sure it&apos;s correct.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" asChild className="flex-1">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="flex-1 hero-gradient border-0 text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Publishing...' : 'Publish Listing'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
