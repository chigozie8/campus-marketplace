'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { isNative, getPlatform, getSplashScreen, getStatusBar, getNetwork, getApp } from '@/lib/capacitor'
import { registerNativePush } from '@/lib/native-push'

const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') console.debug('[CapacitorInit]', ...args)
}

export function CapacitorInit() {
  useEffect(() => {
    if (!isNative()) return

    let networkListenerHandle: { remove: () => void } | null = null

    async function init() {
      const platform = getPlatform()
      log('initialising on', platform)

      try {
        if (platform === 'android' || platform === 'ios') {
          const { StatusBar, Style } = await getStatusBar()
          await StatusBar.setStyle({ style: Style.Dark })
          await StatusBar.setBackgroundColor({ color: '#16a34a' })
          log('status bar configured')
        }
      } catch (err) {
        log('status bar init failed', err)
      }

      try {
        const SplashScreen = await getSplashScreen()
        setTimeout(async () => {
          try {
            await SplashScreen.hide({ fadeOutDuration: 400 })
            log('splash screen hidden')
          } catch (err) {
            log('splash hide failed', err)
          }
        }, 1200)
      } catch (err) {
        log('splash screen init failed', err)
      }

      try {
        const Network = await getNetwork()
        const status = await Network.getStatus()
        log('network status', status.connected ? 'online' : 'offline')

        if (!status.connected) {
          toast.warning('No internet connection', {
            description: 'Please check your network and try again.',
            duration: 5000,
          })
        }

        networkListenerHandle = await Network.addListener('networkStatusChange', (netStatus) => {
          log('network changed', netStatus.connected ? 'online' : 'offline')
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
      } catch (err) {
        log('network listener init failed', err)
      }

      try {
        const App = await getApp()
        await App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.minimizeApp()
          } else {
            window.history.back()
          }
        })
        log('back button handler registered')
      } catch (err) {
        log('back button handler init failed', err)
      }

      // Signal service worker to suppress web push — native plugin handles delivery
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SET_NATIVE_MODE' })
          log('SET_NATIVE_MODE sent to service worker')
        }
      } catch (err) {
        log('service worker message failed', err)
      }

      try {
        const pushRegistered = await registerNativePush()
        log('native push registration', pushRegistered ? 'succeeded' : 'skipped/denied')
      } catch (err) {
        log('native push registration failed', err)
      }
    }

    init()

    return () => {
      networkListenerHandle?.remove()
    }
  }, [])

  return null
}
