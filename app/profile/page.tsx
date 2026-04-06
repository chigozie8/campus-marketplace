'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Camera, User, Mail, Phone, MapPin,
  GraduationCap, ShieldCheck, Bell, Lock, LogOut,
  ChevronRight, Loader2, CheckCircle2, Edit3, Star,
  Package, Heart, BadgeCheck, Save, AtSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { createClient } from '@/lib/supabase/client'

const TABS = ['Profile', 'Security', 'Notifications', 'Activity'] as const
type Tab = typeof TABS[number]

interface ProfileForm {
  full_name: string
  phone: string
  whatsapp_number: string
  instagram_handle: string
  facebook_handle: string
  university: string
  campus: string
  bio: string
  avatar_url: string
}

export default function ProfilePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('Profile')
  const [uploading, setUploading] = useState(false)
  const [saving, startSave] = useTransition()
  const [loading, setLoading] = useState(true)
  const [localAvatar, setLocalAvatar] = useState('')
  const [errors, setErrors] = useState<Partial<ProfileForm>>({})
  const [form, setForm] = useState<ProfileForm>({
    full_name: '', phone: '', whatsapp_number: '',
    instagram_handle: '', facebook_handle: '',
    university: '', campus: '', bio: '', avatar_url: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name || '',
            phone: data.phone || '',
            whatsapp_number: data.whatsapp_number || '',
            instagram_handle: data.instagram_handle || '',
            facebook_handle: data.facebook_handle || '',
            university: data.university || '',
            campus: data.campus || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || '',
          })
          setLocalAvatar(data.avatar_url || '')
        }
        setLoading(false)
      })
    })
  }, [router])

  function setField(key: keyof ProfileForm, value: string) {
    setForm(p => ({ ...p, [key]: value }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  function validate() {
    const e: Partial<ProfileForm> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) e.phone = 'Invalid phone number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setUploading(true)
    setLocalAvatar(URL.createObjectURL(file))
    try {
      const url = await uploadToCloudinary(file)
      setField('avatar_url', url)
      setLocalAvatar(url)
      toast.success('Profile photo updated!')
    } catch {
      toast.error('Photo upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleSave() {
    if (!validate()) { toast.error('Please fix the errors below'); return }
    startSave(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...form, updated_at: new Date().toISOString() })
      if (error) toast.error(error.message)
      else toast.success('Profile saved successfully!')
    })
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const initials = form.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-black text-lg flex-1 tracking-tight">My Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[#0a0a0a] dark:bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-black/10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-32">
        {/* Hero avatar card */}
        <div className="bg-[#0a0a0a] rounded-b-3xl px-6 pt-6 pb-8 mb-4 relative overflow-hidden">
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full ring-4 ring-white/10 overflow-hidden bg-white/10">
                {localAvatar ? (
                  <img src={localAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black">
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <h2 className="text-white font-black text-xl tracking-tight">{form.full_name || 'Your Name'}</h2>
            <p className="text-white/50 text-sm mt-0.5">{form.university || 'Campus Vendor'}</p>

            {/* Mini stats */}
            <div className="flex gap-6 mt-5 pt-5 border-t border-white/10 w-full justify-center">
              {[
                { label: 'Listings', value: '12', icon: Package },
                { label: 'Rating', value: '4.9★', icon: Star },
                { label: 'Saved', value: '38', icon: Heart },
                { label: 'Verified', value: '✓', icon: BadgeCheck },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <span className="text-white font-black text-lg leading-none">{value}</span>
                  <span className="text-white/40 text-[11px] uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-card rounded-2xl p-1 mb-4 border border-gray-100 dark:border-border shadow-sm">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-xs font-bold py-2 rounded-xl transition-all ${
                tab === t
                  ? 'bg-[#0a0a0a] text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'Profile' && (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5 space-y-4">
            {[
              { key: 'full_name', label: 'Full Name', icon: User, placeholder: 'e.g. Chigozie Okonkwo', type: 'text' },
              { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: '+234 800 000 0000', type: 'tel' },
              { key: 'whatsapp_number', label: 'WhatsApp Number', icon: Phone, placeholder: '+234 800 000 0000', type: 'tel' },
              { key: 'instagram_handle', label: 'Instagram Username', icon: AtSign, placeholder: 'e.g. yourname (without @)', type: 'text' },
              { key: 'facebook_handle', label: 'Facebook Username / Page ID', icon: AtSign, placeholder: 'e.g. yourname or page.id', type: 'text' },
              { key: 'university', label: 'University', icon: GraduationCap, placeholder: 'e.g. University of Lagos', type: 'text' },
              { key: 'campus', label: 'Campus / Hostel', icon: MapPin, placeholder: 'e.g. Hall 3, Moremi', type: 'text' },
            ].map(({ key, label, icon: Icon, placeholder, type }) => (
              <div key={key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={type}
                    value={form[key as keyof ProfileForm]}
                    onChange={e => setField(key as keyof ProfileForm, e.target.value)}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all ${
                      errors[key as keyof ProfileForm] ? 'border-red-400' : 'border-gray-200 dark:border-border'
                    }`}
                  />
                </div>
                {errors[key as keyof ProfileForm] && (
                  <p className="text-xs text-red-500 mt-1">{errors[key as keyof ProfileForm]}</p>
                )}
              </div>
            ))}

            {/* Bio */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Bio</label>
              <div className="relative">
                <Edit3 className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <textarea
                  value={form.bio}
                  onChange={e => setField('bio', e.target.value)}
                  rows={3}
                  maxLength={160}
                  placeholder="Tell buyers a little about yourself…"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{form.bio.length}/160</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-white font-bold py-3 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-black/10 mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'Security' && (
          <div className="space-y-3">
            {[
              { icon: Lock, label: 'Change Password', sub: 'Update your login password', href: '/auth/forgot-password' },
              { icon: ShieldCheck, label: 'Two-Factor Auth', sub: 'Add an extra layer of security', href: '#' },
              { icon: Bell, label: 'Login Alerts', sub: 'Get notified of new sign-ins', href: '#' },
            ].map(({ icon: Icon, label, sub, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-700 dark:text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm text-red-600 dark:text-red-400">Sign Out</p>
                <p className="text-xs text-red-400">Sign out of your VendoorX account</p>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'Notifications' && (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm divide-y divide-gray-50 dark:divide-border">
            {[
              { label: 'New Messages', sub: 'When buyers send you a message', on: true },
              { label: 'New Orders', sub: 'When someone places an order', on: true },
              { label: 'Price Alerts', sub: 'Price drops on saved items', on: false },
              { label: 'Promotions', sub: 'VendoorX offers and updates', on: false },
              { label: 'Weekly Report', sub: 'Your weekly sales summary', on: true },
            ].map(({ label, sub, on }) => (
              <div key={label} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
                <button
                  onClick={() => toast.success(`${label} ${on ? 'disabled' : 'enabled'}`)}
                  className={`relative w-11 h-6 rounded-full transition-all ${on ? 'bg-primary' : 'bg-gray-200 dark:bg-muted'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'Activity' && (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm divide-y divide-gray-50 dark:divide-border overflow-hidden">
            {[
              { label: 'Listed: Lenovo ThinkPad', time: '2 hours ago', type: 'listing' },
              { label: 'Profile photo updated', time: 'Yesterday', type: 'profile' },
              { label: 'Received 5-star review', time: '3 days ago', type: 'review' },
              { label: 'Sold: JBL Bluetooth Speaker', time: '1 week ago', type: 'sale' },
              { label: 'Joined VendoorX', time: 'Jan 2025', type: 'join' },
            ].map(({ label, time, type }) => (
              <div key={label} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-muted/30 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  type === 'sale' ? 'bg-green-100 text-green-700' :
                  type === 'review' ? 'bg-yellow-100 text-yellow-700' :
                  type === 'listing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {type === 'sale' ? '₦' : type === 'review' ? '★' : type === 'listing' ? '+' : '◎'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500">{time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
