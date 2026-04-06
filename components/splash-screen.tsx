'use client'

import { useEffect } from 'react'

/**
 * This component is responsible only for cleaning up the
 * splash overlay that was already injected by the inline <script>
 * in layout.tsx. The script runs synchronously before React,
 * so the splash is visible from the very first paint.
 */
export function SplashScreen() {
  useEffect(() => {
    // The inline script already handles the full animation + fade-out.
    // Nothing to do here — it's all handled before React even mounts.
  }, [])

  return null
}
