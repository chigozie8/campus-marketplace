'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Camera, User, Phone, MapPin,
  GraduationCap, ShieldCheck, Bell, Lock, LogOut,
  ChevronRight, Loader2, CheckCircle2, Edit3, Star,
  Package, Heart, BadgeCheck, Save, AtSign, X, KeyRound, Copy,
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
            <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-300 ${loginAlerts ? 'border-blue-200 dark:border-blue-900/40' : 'border-gray-100 dark:border-border'}`}>
              <div className={`flex items-center gap-4 p-4 transition-colors ${loginAlerts ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20' : 'bg-white dark:bg-card'}`}>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 transition-colors ${loginAlerts ? 'bg-blue-500 shadow-blue-200 dark:shadow-blue-900/30' : 'bg-gray-100 dark:bg-muted'}`}>
                  <Bell className={`w-5 h-5 ${loginAlerts ? 'text-white' : 'text-gray-500 dark:text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Login Alerts</p>
                    {loginAlerts && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">ON</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Get an email alert on every new sign-in</p>
                </div>
                <button
                  onClick={toggleLoginAlerts}
                  disabled={loginAlertsLoading}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 disabled:opacity-50 focus:outline-none flex-shrink-0 ${loginAlerts ? 'bg-blue-500' : 'bg-gray-200 dark:bg-muted'}`}
                >
                  {loginAlertsLoading
                    ? <Loader2 className="w-3 h-3 animate-spin absolute top-2 left-2 text-white" />
                    : <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${loginAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                  }
                </button>
              </div>
              {loginAlerts && userEmail && (
                <div className="px-4 py-2.5 bg-blue-50/50 dark:bg-blue-950/10 border-t border-blue-100 dark:border-blue-900/20 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Alerts sent to <span className="font-bold">{userEmail}</span>
                  </p>
                </div>
              )}
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
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Choose what to be notified about</p>
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm divide-y divide-gray-50 dark:divide-border overflow-hidden">
              {([
                { key: 'messages',     label: 'New Messages',   sub: 'When buyers send you a message',  color: 'bg-green-500' },
                { key: 'orders',       label: 'New Orders',     sub: 'When someone places an order',    color: 'bg-blue-500'  },
                { key: 'price_alerts', label: 'Price Alerts',   sub: 'Price drops on items you saved',  color: 'bg-orange-500'},
                { key: 'promotions',   label: 'Promotions',     sub: 'VendoorX offers and updates',     color: 'bg-purple-500'},
                { key: 'weekly_report',label: 'Weekly Report',  sub: 'Your weekly sales summary',       color: 'bg-primary'   },
              ] as const).map(({ key, label, sub, color }) => {
                const on = notifPrefs[key]
                const loading = notifLoading === key
                return (
                  <div key={key} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 dark:hover:bg-muted/30 transition-colors">
                    <div className={`w-2 h-8 rounded-full flex-shrink-0 ${on ? color : 'bg-gray-200 dark:bg-muted'} transition-colors`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                    <button
                      onClick={() => toggleNotif(key)}
                      disabled={!!notifLoading}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-300 disabled:opacity-60 flex-shrink-0 ${on ? color : 'bg-gray-200 dark:bg-muted'}`}
                    >
                      {loading
                        ? <Loader2 className="w-3 h-3 animate-spin absolute top-1.5 left-1.5 text-white" />
                        : <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Your recent activity</p>
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm divide-y divide-gray-50 dark:divide-border overflow-hidden">
              {activityItems.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">No activity yet</p>
                  <p className="text-xs text-gray-400">Your listings and account activity will appear here</p>
                </div>
              ) : activityItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-muted/30 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    item.type === 'sale'    ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                    item.type === 'listing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                    item.type === 'review'  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-500 dark:bg-muted dark:text-muted-foreground'
                  }`}>
                    {item.type === 'sale' ? '₦' : item.type === 'listing' ? '+' : item.type === 'review' ? '★' : '◎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
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
