'use client'

import { Capacitor } from '@capacitor/core'

export { Capacitor }

export function isNative(): boolean {
  if (typeof window === 'undefined') return false
  return Capacitor.isNativePlatform()
}

export function getPlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web'
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web'
}

export function isAndroid(): boolean {
  return getPlatform() === 'android'
}

export function isIOS(): boolean {
  return getPlatform() === 'ios'
}

export async function getApp() {
  const { App } = await import('@capacitor/app')
  return App
}

export async function getHaptics() {
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
  return { Haptics, ImpactStyle }
}

export async function getNetwork() {
  const { Network } = await import('@capacitor/network')
  return Network
}

export async function getStatusBar() {
  const { StatusBar, Style } = await import('@capacitor/status-bar')
  return { StatusBar, Style }
}

export async function getSplashScreen() {
  const { SplashScreen } = await import('@capacitor/splash-screen')
  return SplashScreen
}

export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!isNative()) return
  try {
    const { Haptics, ImpactStyle } = await getHaptics()
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    }
    await Haptics.impact({ style: styleMap[style] })
  } catch {}
}

export async function hapticNotification(type: 'success' | 'warning' | 'error' = 'success') {
  if (!isNative()) return
  try {
    const { Haptics } = await getHaptics()
    const { NotificationType } = await import('@capacitor/haptics')
    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    }
    await Haptics.notification({ type: typeMap[type] })
  } catch {}
}
