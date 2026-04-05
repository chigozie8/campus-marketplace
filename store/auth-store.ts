import { create } from 'zustand'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

interface SignUpForm {
  fullName: string
  email: string
  password: string
  whatsapp: string
  university: string
  role: 'buyer' | 'seller'
  agreeTerms: boolean
}

interface AuthErrors {
  email?: string
  password?: string
  fullName?: string
  whatsapp?: string
  general?: string
}

interface AuthStore {
  loginForm: LoginForm
  signUpForm: SignUpForm
  errors: AuthErrors
  isLoading: boolean
  setLoginField: (key: keyof LoginForm, value: string | boolean) => void
  setSignUpField: (key: keyof SignUpForm, value: string | boolean) => void
  setErrors: (errors: AuthErrors) => void
  clearErrors: () => void
  setLoading: (v: boolean) => void
  resetLogin: () => void
  resetSignUp: () => void
  validateLogin: () => boolean
  validateSignUp: () => boolean
}

const defaultLogin: LoginForm = { email: '', password: '', rememberMe: false }
const defaultSignUp: SignUpForm = {
  fullName: '', email: '', password: '', whatsapp: '',
  university: '', role: 'buyer', agreeTerms: false,
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  loginForm: defaultLogin,
  signUpForm: defaultSignUp,
  errors: {},
  isLoading: false,

  setLoginField: (key, value) =>
    set(s => ({ loginForm: { ...s.loginForm, [key]: value }, errors: { ...s.errors, [key]: undefined } })),

  setSignUpField: (key, value) =>
    set(s => ({ signUpForm: { ...s.signUpForm, [key]: value }, errors: { ...s.errors, [key]: undefined } })),

  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
  setLoading: (v) => set({ isLoading: v }),
  resetLogin: () => set({ loginForm: defaultLogin, errors: {} }),
  resetSignUp: () => set({ signUpForm: defaultSignUp, errors: {} }),

  validateLogin: () => {
    const { email, password } = get().loginForm
    const errors: AuthErrors = {}
    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address'
    if (!password) errors.password = 'Password is required'
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters'
    set({ errors })
    return Object.keys(errors).length === 0
  },

  validateSignUp: () => {
    const { fullName, email, password, whatsapp, agreeTerms } = get().signUpForm
    const errors: AuthErrors = {}
    if (!fullName || fullName.trim().length < 2) errors.fullName = 'Full name must be at least 2 characters'
    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address'
    if (!password) errors.password = 'Password is required'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (whatsapp && !/^(\+?234|0)[789][01]\d{8}$/.test(whatsapp.replace(/\s/g, '')))
      errors.whatsapp = 'Enter a valid Nigerian phone number'
    if (!agreeTerms) errors.general = 'You must agree to the Terms & Privacy Policy'
    set({ errors })
    return Object.keys(errors).length === 0
  },
}))
