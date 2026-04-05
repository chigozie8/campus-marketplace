import { create } from 'zustand'
import type { Profile } from '@/lib/types'

interface ProfileErrors {
  fullName?: string
  phone?: string
  whatsapp?: string
  university?: string
  bio?: string
}

interface ProfileStore {
  profile: Partial<Profile>
  errors: ProfileErrors
  isDirty: boolean
  isSaving: boolean
  avatarUploading: boolean
  setField: (key: keyof Profile, value: string | boolean) => void
  setProfile: (profile: Partial<Profile>) => void
  setErrors: (errors: ProfileErrors) => void
  clearErrors: () => void
  setSaving: (v: boolean) => void
  setAvatarUploading: (v: boolean) => void
  validate: () => boolean
  reset: () => void
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: {},
  errors: {},
  isDirty: false,
  isSaving: false,
  avatarUploading: false,

  setField: (key, value) =>
    set(s => ({
      profile: { ...s.profile, [key]: value },
      isDirty: true,
      errors: { ...s.errors, [key]: undefined },
    })),

  setProfile: (profile) => set({ profile, isDirty: false, errors: {} }),
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
  setSaving: (v) => set({ isSaving: v }),
  setAvatarUploading: (v) => set({ avatarUploading: v }),

  validate: () => {
    const { full_name, phone, whatsapp_number, bio } = get().profile
    const errors: ProfileErrors = {}
    if (!full_name || full_name.trim().length < 2)
      errors.fullName = 'Full name must be at least 2 characters'
    if (phone && !/^(\+?234|0)[789][01]\d{8}$/.test(phone.replace(/\s/g, '')))
      errors.phone = 'Enter a valid Nigerian phone number'
    if (whatsapp_number && !/^(\+?234|0)[789][01]\d{8}$/.test(whatsapp_number.replace(/\s/g, '')))
      errors.whatsapp = 'Enter a valid WhatsApp number'
    if (bio && bio.length > 300)
      errors.bio = 'Bio must be under 300 characters'
    set({ errors })
    return Object.keys(errors).length === 0
  },

  reset: () => set({ profile: {}, errors: {}, isDirty: false, isSaving: false }),
}))
