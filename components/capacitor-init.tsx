'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { isNative, getPlatform, getSplashScreen, getStatusBar, getNetwork, getApp } from '@/lib/capacitor'
import { registerNativePush } from '@/lib/native-push'

export function CapacitorInit() {
  useEffect(() => {
    if (!isNative()) return

    let networkListenerHandle: { remove: () => void } | null = null

    async function init() {
      const platform = getPlatform()

      try {
        if (platform === 'android' || platform === 'ios') {
          const { StatusBar, Style } = await getStatusBar()
          await StatusBar.setStyle({ style: Style.Dark })
          await StatusBar.setBackgroundColor({ color: '#16a34a' })
        }
      } catch {}

      try {
        const SplashScreen = await getSplashScreen()
        setTimeout(async () => {
          try {
            await SplashScreen.hide({ fadeOutDuration: 400 })
          } catch {}
        }, 1200)
      } catch {}

      try {
        const Network = await getNetwork()
        const status = await Network.getStatus()

        if (!status.connected) {
          toast.warning('No internet connection', {
            description: 'Please check your network and try again.',
            duration: 5000,
          })
        }

        networkListenerHandle = await Network.addListener('networkStatusChange', (netStatus) => {
          if (!netStatus.connected) {
            toast.warning('You are offline', {
              description: 'Check your internet connection.',
              id: 'network-offline',
              duration: Infinity,
            })
          } else {
            toast.dismiss('network-offline')
            toast.success('Back online!', { duration: 2000 })
          }
        })
      } catch {}

      try {
        const App = await getApp()
        await App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.minimizeApp()
          } else {
            window.history.back()
          }
        })
      } catch {}

      try {
        await registerNativePush()
      } catch {}
    }

    init()

    return () => {
      networkListenerHandle?.remove()
    }
  }, [])

  return null
}
