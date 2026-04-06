'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Camera, User, Phone, MapPin,
  GraduationCap, ShieldCheck, Bell, Lock, LogOut,
  ChevronRight, Loader2, CheckCircle2, Edit3, Star,
  Package, Heart, BadgeCheck, Save, AtSign, X, KeyRound, Copy,
  MessageCircle, ShoppingBag, TrendingDown, Sparkles, BarChart2,
  Banknote, UserPlus, Tag, ShieldAlert,
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

  // 2FA state
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaLoading, setMfaLoading] = useState(false)
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [mfaStep, setMfaStep] = useState<'qr' | 'verify'>('qr')
  const [mfaQrCode, setMfaQrCode] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaVerifying, setMfaVerifying] = useState(false)

  // Login alerts state
  const [loginAlerts, setLoginAlerts] = useState(false)
  const [loginAlertsLoading, setLoginAlertsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userCreatedAt, setUserCreatedAt] = useState('')

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    messages: true, orders: true, price_alerts: false,
    promotions: false, weekly_report: true,
  })
  const [notifLoading, setNotifLoading] = useState<string | null>(null)

  // Activity state
  const [activityItems, setActivityItems] = useState<{ label: string; time: string; type: string }[]>([])

  const [form, setForm] = useState<ProfileForm>({
    full_name: '', phone: '', whatsapp_number: '',
    instagram_handle: '', facebook_handle: '',
    university: '', campus: '', bio: '', avatar_url: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }

      // Load profile
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
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

      // Load 2FA status
      try {
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const verified = factors?.totp?.find(f => f.status === 'verified')
        if (verified) { setMfaEnabled(true); setMfaFactorId(verified.id) }
      } catch {}

      // Load login alerts & email
      setLoginAlerts(user.user_metadata?.login_alerts === true)
      setUserEmail(user.email || '')
      setUserCreatedAt(user.created_at || '')

      // Load notification preferences
      const savedNotifs = user.user_metadata?.notifications
      if (savedNotifs) setNotifPrefs(p => ({ ...p, ...savedNotifs }))

      // Load real activity from products
      const { data: products } = await supabase
        .from('products')
        .select('id, title, created_at, is_available')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      const items: { label: string; time: string; type: string }[] = []
      if (products) {
        for (const p of products) {
          items.push({ label: `Listed: ${p.title}`, time: formatRelative(p.created_at), type: 'listing' })
          if (!p.is_available) items.push({ label: `Marked sold: ${p.title}`, time: formatRelative(p.created_at), type: 'sale' })
        }
      }
      if (user.created_at) items.push({ label: 'Joined VendoorX', time: formatRelative(user.created_at), type: 'join' })
      setActivityItems(items)

      setLoading(false)
    })
  }, [router])

  function formatRelative(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} minutes ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return days === 1 ? 'Yesterday' : `${days} days ago`
    const wks = Math.floor(days / 7)
    if (wks < 5) return wks === 1 ? '1 week ago' : `${wks} weeks ago`
    return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })
  }

  async function toggleNotif(key: string) {
    setNotifLoading(key)
    const newPrefs = { ...notifPrefs, [key]: !notifPrefs[key as keyof typeof notifPrefs] }
    setNotifPrefs(newPrefs)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { notifications: newPrefs } })
    if (error) { toast.error(error.message); setNotifPrefs(notifPrefs) }
    setNotifLoading(null)
  }

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

  // ── 2FA handlers ──
  async function handleEnable2FA() {
    setMfaLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'VendoorX' })
    if (error) { toast.error(error.message); setMfaLoading(false); return }
    setMfaQrCode(data.totp.qr_code)
    setMfaSecret(data.totp.secret)
    setMfaFactorId(data.id)
    setMfaStep('qr')
    setMfaCode('')
    setShowMfaSetup(true)
    setMfaLoading(false)
  }

  async function handleVerify2FA() {
    if (mfaCode.length !== 6) { toast.error('Enter a 6-digit code from your authenticator app'); return }
    setMfaVerifying(true)
    const supabase = createClient()
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId })
    if (cErr || !challenge) { toast.error(cErr?.message || 'Challenge failed'); setMfaVerifying(false); return }
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: mfaCode })
    if (error) { toast.error('Incorrect code — try again'); setMfaVerifying(false); return }
    setMfaEnabled(true)
    setShowMfaSetup(false)
    setMfaCode('')
    toast.success('Two-factor authentication is now enabled!')
    setMfaVerifying(false)
  }

  function handleDisable2FA() {
    toast.custom((id) => (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-black/10 p-4 w-[320px]">
        <div className="flex gap-3 items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Disable 2FA?</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">This will remove the extra layer of security from your account.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.dismiss(id)} className="flex-1 px-3 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={() => { toast.dismiss(id); performDisable2FA() }} className="flex-1 px-3 py-2.5 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Yes, disable</button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' })
  }

  async function performDisable2FA() {
    setMfaLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId })
    if (error) { toast.error(error.message); setMfaLoading(false); return }
    setMfaEnabled(false)
    setMfaFactorId('')
    toast.success('Two-factor authentication disabled')
    setMfaLoading(false)
  }

  // ── Login alerts handler ──
  async function toggleLoginAlerts() {
    setLoginAlertsLoading(true)
    const supabase = createClient()
    const newVal = !loginAlerts
    const { error } = await supabase.auth.updateUser({ data: { login_alerts: newVal } })
    if (error) { toast.error(error.message); setLoginAlertsLoading(false); return }
    setLoginAlerts(newVal)
    toast.success(newVal ? 'Login alerts enabled — you\'ll be notified of new sign-ins' : 'Login alerts disabled')
    setLoginAlertsLoading(false)
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
            {/* Change Password */}
            <Link
              href="/auth/forgot-password"
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-700 dark:text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white">Change Password</p>
                <p className="text-xs text-gray-500">Update your login password</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Two-Factor Auth */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mfaEnabled ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-gray-100 dark:bg-muted'}`}>
                <ShieldCheck className={`w-5 h-5 ${mfaEnabled ? 'text-emerald-600' : 'text-gray-700 dark:text-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Two-Factor Auth</p>
                  {mfaEnabled && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">ON</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{mfaEnabled ? 'Your account is protected with TOTP' : 'Add an extra layer of security'}</p>
              </div>
              <button
                onClick={mfaEnabled ? handleDisable2FA : handleEnable2FA}
                disabled={mfaLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  mfaEnabled
                    ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40'
                    : 'bg-[#0a0a0a] text-white hover:bg-gray-800 dark:bg-primary dark:hover:bg-primary/90'
                } disabled:opacity-50`}
              >
                {mfaLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : mfaEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            {/* Login Alerts */}
            <div className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${
              loginAlerts
                ? 'shadow-xl shadow-[#16a34a]/20'
                : 'shadow-sm shadow-gray-100 dark:shadow-black/20'
            }`}>
              {/* Background */}
              <div className={`relative p-5 transition-all duration-500 ${
                loginAlerts
                  ? 'bg-[#0a0a0a]'
                  : 'bg-white dark:bg-card border border-gray-100 dark:border-border'
              }`}>
                {/* Dot grid (active state) */}
                {loginAlerts && (
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                )}
                {/* Green glow blob */}
                {loginAlerts && (
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#16a34a]/20 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    loginAlerts
                      ? 'bg-[#16a34a]/20 border border-[#16a34a]/30'
                      : 'bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border'
                  }`}>
                    {loginAlerts
                      ? <ShieldCheck className="w-7 h-7 text-[#4ade80]" />
                      : <ShieldAlert className="w-7 h-7 text-gray-500 dark:text-muted-foreground" />
                    }
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-black text-base tracking-tight ${loginAlerts ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        Login Alerts
                      </p>
                      {loginAlerts && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#16a34a]/25 text-[#4ade80] tracking-widest border border-[#16a34a]/30 uppercase">
                          <span className="w-1 h-1 rounded-full bg-[#4ade80] animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${loginAlerts ? 'text-white/50' : 'text-gray-500'}`}>
                      {loginAlerts
                        ? "Instant email alert on every new sign-in to your account."
                        : 'Get notified instantly when someone logs into your account.'}
                    </p>
                    {loginAlerts && userEmail && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse flex-shrink-0" />
                        <p className="text-xs text-white/70 font-medium truncate">{userEmail}</p>
                      </div>
                    )}
                  </div>

                  {/* Enable / Disable button */}
                  <button
                    onClick={toggleLoginAlerts}
                    disabled={loginAlertsLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex-shrink-0 mt-1 disabled:opacity-50 ${
                      loginAlerts
                        ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40'
                        : 'bg-[#0a0a0a] text-white hover:bg-gray-800 dark:bg-primary dark:hover:bg-primary/90'
                    }`}
                  >
                    {loginAlertsLoading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : loginAlerts ? 'Disable' : 'Enable'
                    }
                  </button>
                </div>
              </div>
            </div>

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
          <div className="space-y-4">
            {/* Header card */}
            <div className="relative rounded-3xl overflow-hidden bg-[#0a0a0a] p-5 shadow-xl shadow-black/20">
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="absolute bottom-0 right-0 w-36 h-36 bg-[#16a34a]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-[#4ade80]" />
                </div>
                <div>
                  <p className="font-black text-white text-base tracking-tight">Notifications</p>
                  <p className="text-white/40 text-xs mt-0.5">Control what updates you receive</p>
                </div>
              </div>
            </div>

            {/* Notification cards */}
            <div className="space-y-3">
              {([
                { key: 'messages',      label: 'New Messages',   sub: 'When a buyer sends you a message',   Icon: MessageCircle, from: 'from-emerald-400', to: 'to-green-500',   glow: 'shadow-green-200/60 dark:shadow-green-900/30',   bg: 'bg-emerald-50 dark:bg-emerald-950/20',   border: 'border-emerald-200 dark:border-emerald-900/40' },
                { key: 'orders',        label: 'New Orders',     sub: 'When someone places an order',        Icon: ShoppingBag,   from: 'from-blue-400',    to: 'to-indigo-500',  glow: 'shadow-blue-200/60 dark:shadow-blue-900/30',     bg: 'bg-blue-50 dark:bg-blue-950/20',         border: 'border-blue-200 dark:border-blue-900/40' },
                { key: 'price_alerts',  label: 'Price Alerts',   sub: 'Price drops on items you saved',      Icon: TrendingDown,  from: 'from-orange-400',  to: 'to-amber-500',   glow: 'shadow-orange-200/60 dark:shadow-orange-900/30', bg: 'bg-orange-50 dark:bg-orange-950/20',     border: 'border-orange-200 dark:border-orange-900/40' },
                { key: 'promotions',    label: 'Promotions',     sub: 'VendoorX special offers & deals',     Icon: Sparkles,      from: 'from-pink-400',    to: 'to-rose-500',    glow: 'shadow-pink-200/60 dark:shadow-pink-900/30',     bg: 'bg-pink-50 dark:bg-pink-950/20',         border: 'border-pink-200 dark:border-pink-900/40' },
                { key: 'weekly_report', label: 'Weekly Report',  sub: 'Your weekly earnings summary',        Icon: BarChart2,     from: 'from-violet-400',  to: 'to-purple-500',  glow: 'shadow-purple-200/60 dark:shadow-purple-900/30', bg: 'bg-violet-50 dark:bg-violet-950/20',     border: 'border-violet-200 dark:border-violet-900/40' },
              ] as const).map(({ key, label, sub, Icon, from, to, glow, bg, border }) => {
                const on = notifPrefs[key]
                const loading = notifLoading === key
                return (
                  <div key={key} className={`relative rounded-2xl border p-4 flex items-center gap-4 transition-all duration-300 shadow-sm ${on ? `${bg} ${border} ${glow} shadow-md` : 'bg-white dark:bg-card border-gray-100 dark:border-border'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${on ? `${from} ${to} shadow-sm` : 'from-gray-100 to-gray-200 dark:from-muted dark:to-muted'}`}>
                      <Icon className={`w-5 h-5 ${on ? 'text-white' : 'text-gray-400 dark:text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${on ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sub}</p>
                    </div>
                    <button
                      onClick={() => toggleNotif(key)}
                      disabled={!!notifLoading}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex-shrink-0 disabled:opacity-50 ${
                        on
                          ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40'
                          : 'bg-[#0a0a0a] text-white hover:bg-gray-800 dark:bg-primary dark:hover:bg-primary/90'
                      }`}
                    >
                      {loading
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : on ? 'Disable' : 'Enable'
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'Activity' && (
          <div className="space-y-3">
            {/* Header — dark card with green accent */}
            <div className="relative rounded-3xl overflow-hidden bg-[#0a0a0a] p-5 shadow-xl shadow-black/20">
              {/* Dot grid */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#16a34a]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-6 h-6 text-[#4ade80]" />
                </div>
                <div>
                  <p className="font-black text-white text-base tracking-tight">Recent Activity</p>
                  <p className="text-white/40 text-xs mt-0.5">Your listings and account history</p>
                </div>
                {activityItems.length > 0 && (
                  <div className="ml-auto">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/30 text-[#4ade80] text-xs font-black">
                      {activityItems.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {activityItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 dark:border-border bg-white dark:bg-card text-center py-14 px-6 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-[#0a0a0a] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-black/20">
                  <Package className="w-7 h-7 text-white/30" />
                </div>
                <p className="text-base font-black text-gray-900 dark:text-white mb-1.5 tracking-tight">Nothing here yet</p>
                <p className="text-xs text-gray-400 leading-relaxed">Your listings, sales, and account<br />activity will show up here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-border">
                  {activityItems.map((item, i) => {
                    const isSale    = item.type === 'sale'
                    const isListing = item.type === 'listing'
                    const isReview  = item.type === 'review'
                    const Icon = isSale ? Banknote : isListing ? Tag : isReview ? Star : UserPlus

                    const iconBg    = isSale    ? 'bg-emerald-500'
                                    : isListing ? 'bg-sky-500'
                                    : isReview  ? 'bg-amber-500'
                                    : 'bg-[#16a34a]'
                    const labelColor = isSale    ? 'text-emerald-600 dark:text-emerald-400'
                                     : isListing ? 'text-sky-600 dark:text-sky-400'
                                     : isReview  ? 'text-amber-600 dark:text-amber-400'
                                     : 'text-[#16a34a]'
                    const typeName  = isSale ? 'Sale' : isListing ? 'Listing' : isReview ? 'Review' : 'Account'

                    return (
                      <div key={i} className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50/70 dark:hover:bg-muted/30 ${i === 0 ? '' : ''}`}>
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.label}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${labelColor}`}>{typeName}</span>
                            <span className="text-gray-300 dark:text-border text-xs">·</span>
                            <span className="text-xs text-gray-400">{item.time}</span>
                          </div>
                        </div>
                        {/* Latest badge */}
                        {i === 0 && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20 uppercase tracking-wider flex-shrink-0">
                            Latest
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2FA Setup Modal ── */}
      {showMfaSetup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card w-full max-w-sm rounded-3xl shadow-2xl shadow-black/20 overflow-y-auto max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900 dark:text-white">Set up Two-Factor Auth</p>
                  <p className="text-[11px] text-gray-400">{mfaStep === 'qr' ? 'Step 1 of 2 — Scan QR code' : 'Step 2 of 2 — Verify code'}</p>
                </div>
              </div>
              <button onClick={() => setShowMfaSetup(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-5">
              {mfaStep === 'qr' ? (
                <>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Scan this QR code with <span className="font-bold text-gray-900 dark:text-white">Google Authenticator</span>, <span className="font-bold text-gray-900 dark:text-white">Authy</span>, or any TOTP app. Then tap Continue.
                  </p>
                  {/* QR Code */}
                  <div className="flex justify-center mb-4">
                    <div className="w-44 h-44 rounded-2xl bg-white border-2 border-gray-100 dark:border-border flex items-center justify-center overflow-hidden shadow-sm">
                      {mfaQrCode
                        ? <img src={mfaQrCode} alt="2FA QR Code" className="w-full h-full object-contain p-1" />
                        : <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                      }
                    </div>
                  </div>
                  {/* Manual secret */}
                  <div className="bg-gray-50 dark:bg-muted rounded-xl p-3 mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Or enter manually</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs text-gray-700 dark:text-white font-mono break-all flex-1">{mfaSecret}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(mfaSecret); toast.success('Secret copied!') }}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-muted/60 transition-colors flex-shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setMfaStep('verify')}
                    className="w-full py-3 bg-[#0a0a0a] dark:bg-primary text-white text-sm font-bold rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Open your authenticator app and enter the <span className="font-bold text-gray-900 dark:text-white">6-digit code</span> for VendoorX.
                  </p>
                  <div className="relative mb-4">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-center text-2xl font-black tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMfaStep('qr')}
                      className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 dark:bg-muted rounded-xl hover:bg-gray-200 dark:hover:bg-muted/60 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerify2FA}
                      disabled={mfaVerifying || mfaCode.length !== 6}
                      className="flex-1 py-3 bg-[#0a0a0a] dark:bg-primary text-white text-sm font-bold rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {mfaVerifying ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</> : 'Activate 2FA'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
