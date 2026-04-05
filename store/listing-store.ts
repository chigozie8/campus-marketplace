import { create } from 'zustand'

export interface ListingForm {
  title: string
  description: string
  price: string
  original_price: string
  condition: 'new' | 'like_new' | 'good' | 'fair'
  category_id: string
  campus: string
  location: string
  images: string[]
}

interface ListingErrors {
  title?: string
  price?: string
  condition?: string
  images?: string
}

interface ListingStore {
  form: ListingForm
  errors: ListingErrors
  isSubmitting: boolean
  uploadingImages: boolean
  setField: (key: keyof ListingForm, value: string | string[]) => void
  addImage: (url: string) => void
  removeImage: (index: number) => void
  setErrors: (errors: ListingErrors) => void
  setSubmitting: (v: boolean) => void
  setUploadingImages: (v: boolean) => void
  validate: () => boolean
  reset: () => void
}

const defaultForm: ListingForm = {
  title: '', description: '', price: '', original_price: '',
  condition: 'new', category_id: '', campus: '', location: '', images: [],
}

export const useListingStore = create<ListingStore>((set, get) => ({
  form: defaultForm,
  errors: {},
  isSubmitting: false,
  uploadingImages: false,

  setField: (key, value) =>
    set(s => ({
      form: { ...s.form, [key]: value },
      errors: { ...s.errors, [key]: undefined },
    })),

  addImage: (url) =>
    set(s => ({
      form: { ...s.form, images: [...s.form.images, url] },
      errors: { ...s.errors, images: undefined },
    })),

  removeImage: (index) =>
    set(s => ({
      form: { ...s.form, images: s.form.images.filter((_, i) => i !== index) },
    })),

  setErrors: (errors) => set({ errors }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setUploadingImages: (v) => set({ uploadingImages: v }),

  validate: () => {
    const { title, price, condition } = get().form
    const errors: ListingErrors = {}
    if (!title || title.trim().length < 5) errors.title = 'Title must be at least 5 characters'
    else if (title.length > 100) errors.title = 'Title must be under 100 characters'
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      errors.price = 'Enter a valid price greater than 0'
    if (!condition) errors.condition = 'Select a condition'
    set({ errors })
    return Object.keys(errors).length === 0
  },

  reset: () => set({ form: defaultForm, errors: {}, isSubmitting: false }),
}))
