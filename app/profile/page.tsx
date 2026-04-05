'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Partial<Profile>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setProfile(data)
        setLoading(false)
      })
    })
    setLoading(true)
  }, [router])

  function handleChange(key: keyof Profile, value: string | boolean) {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      whatsapp_number: profile.whatsapp_number,
      university: profile.university,
      campus: profile.campus,
      bio: profile.bio,
      is_seller: profile.is_seller,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated successfully!')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 hero-gradient rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-base">Campus<span className="text-primary">Cart</span></span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Profile Settings</h1>
          <p className="text-muted-foreground">Keep your details up to date so buyers can reach you</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card">
            <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {profile?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.full_name || 'Your Name'}</p>
              <p className="text-sm text-muted-foreground">{profile?.university || 'No university set'}</p>
              {profile?.is_seller && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">Seller</span>
              )}
            </div>
          </div>

          {/* Personal details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                placeholder="Your full name"
                value={profile?.full_name || ''}
                onChange={e => handleChange('full_name', e.target.value)}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+234 800 000 0000"
                  value={profile?.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp Number</Label>
                <Input
                  placeholder="+234 800 000 0000"
                  value={profile?.whatsapp_number || ''}
                  onChange={e => handleChange('whatsapp_number', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell buyers a bit about yourself..."
                value={profile?.bio || ''}
                onChange={e => handleChange('bio', e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Campus details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Campus Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>University</Label>
                <Input
                  placeholder="e.g. University of Lagos"
                  value={profile?.university || ''}
                  onChange={e => handleChange('university', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Campus</Label>
                <Input
                  placeholder="e.g. UNILAG, UI, OAU"
                  value={profile?.campus || ''}
                  onChange={e => handleChange('campus', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Seller toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div>
              <p className="font-medium text-sm text-foreground">Seller Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">Enable to list and sell products on CampusCart</p>
            </div>
            <Switch
              checked={profile?.is_seller || false}
              onCheckedChange={v => handleChange('is_seller', v)}
            />
          </div>

          <Button
            type="submit"
            className="w-full hero-gradient border-0 text-white h-11"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </main>
    </div>
  )
}
