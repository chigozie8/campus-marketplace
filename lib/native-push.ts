'use client'

import { isNative, getPlatform } from './capacitor'

export interface NativePushHandler {
  onRegistration?: (token: string) => void
  onNotification?: (notification: Record<string, unknown>) => void
  onError?: (error: Error) => void
}

export async function registerNativePush(handlers: NativePushHandler = {}) {
  if (!isNative()) return false

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    const permResult = await PushNotifications.requestPermissions()
    if (permResult.receive !== 'granted') {
      handlers.onError?.(new Error('Push notification permission denied'))
      return false
    }

    await PushNotifications.register()

    await PushNotifications.addListener('registration', (token) => {
      handlers.onRegistration?.(token.value)
      sendTokenToServer(token.value)
    })

    await PushNotifications.addListener('registrationError', (err) => {
      handlers.onError?.(new Error(err.error))
    })

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      handlers.onNotification?.(notification as Record<string, unknown>)
    })

    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const url = action.notification.data?.url
      if (url && typeof window !== 'undefined') {
        window.location.href = url
      }
    })

    return true
  } catch (err) {
    handlers.onError?.(err instanceof Error ? err : new Error(String(err)))
    return false
  }
}

async function sendTokenToServer(token: string) {
  try {
    const platform = getPlatform()
    await fetch('/api/push/native-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform }),
    })
  } catch {}
}

export async function clearNativePushListeners() {
  if (!isNative()) return
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    await PushNotifications.removeAllListeners()
  } catch {}
}

export async function getNativePushDeliveredNotifications() {
  if (!isNative()) return []
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const result = await PushNotifications.getDeliveredNotifications()
    return result.notifications
  } catch {
    return []
  }
}
