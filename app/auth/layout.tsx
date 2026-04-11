import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Sign In or Create Account',
  description:
    'Sign in to your VendoorX account or create a free account in under 60 seconds. Buy and sell on VendoorX with zero commission fees.',
  path: '/auth/login',
  keywords: ['VendoorX sign in', 'VendoorX create account', 'WhatsApp commerce platform login', 'seller signup Nigeria'],
  noIndex: false,
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
