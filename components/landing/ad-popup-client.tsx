'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type { AdPopup as AdPopupType } from './ad-popup'

// `ssr: false` is only allowed inside Client Components, so this thin wrapper
// owns the dynamic import and is used by the Server Component page instead.
const AdPopupLazy = dynamic(
  () => import('./ad-popup').then(m => ({ default: m.AdPopup })),
  { ssr: false },
)

type Props = ComponentProps<typeof AdPopupType>

export function AdPopupClient(props: Props) {
  return <AdPopupLazy {...props} />
}
