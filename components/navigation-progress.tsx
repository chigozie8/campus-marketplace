'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: true, trickleSpeed: 200, minimum: 0.1 })

function ProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevUrl = useRef<string>('')

  useEffect(() => {
    const currentUrl = pathname + searchParams.toString()
    if (prevUrl.current && prevUrl.current !== currentUrl) {
      NProgress.start()
      const timer = setTimeout(() => NProgress.done(), 400)
      return () => {
        clearTimeout(timer)
        NProgress.done()
      }
    }
    prevUrl.current = currentUrl
  }, [pathname, searchParams])

  return null
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
      <style>{`
        #nprogress .bar {
          background: #0a0a0a !important;
          height: 3px !important;
        }
        #nprogress .peg {
          box-shadow: 0 0 8px #0a0a0a, 0 0 4px #0a0a0a !important;
        }
        #nprogress .spinner-icon {
          border-top-color: #0a0a0a !important;
          border-left-color: #0a0a0a !important;
        }
      `}</style>
    </Suspense>
  )
}
