'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Tawk_API?: object
    Tawk_LoadStart?: Date
  }
}

export function TawkToChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID
  const widgetId = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || 'default'

  useEffect(() => {
    if (!propertyId) return

    // Tawk.to cannot store cookies inside an iframed/restricted environment
    // (e.g. Replit preview). Skip loading in that case — works fine on the
    // live site where the page is loaded directly in the browser.
    try {
      if (window.self !== window.top) return
    } catch {
      // Cross-origin iframe — skip
      return
    }

    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    const script = document.createElement('script')
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`
    script.async = true
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [propertyId, widgetId])

  return null
}
