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
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    }
    await Haptics.notification({ type: typeMap[type] })
  } catch {}
}

export async function getCamera() {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
  return { Camera, CameraResultType, CameraSource }
}

export async function getFilesystem() {
  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
  return { Filesystem, Directory, Encoding }
}

/**
 * Take a photo natively on iOS/Android; falls back to file input on web.
 * Returns a base64 data URL or null if cancelled.
 */
export async function takePhoto(): Promise<string | null> {
  if (!isNative()) return null
  try {
    const { Camera, CameraResultType, CameraSource } = await getCamera()
    const image = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      quality: 80,
    })
    return image.dataUrl ?? null
  } catch {
    return null
  }
}

/**
 * Pick a photo from the device gallery natively; falls back to null on web.
 * Returns a base64 data URL or null if cancelled.
 */
export async function pickPhoto(): Promise<string | null> {
  if (!isNative()) return null
  try {
    const { Camera, CameraResultType, CameraSource } = await getCamera()
    const image = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      quality: 80,
    })
    return image.dataUrl ?? null
  } catch {
    return null
  }
}

/**
 * Write a file to the app's cache directory (native only).
 * filename: e.g. "verification.jpg"
 * data: base64-encoded content
 */
export async function writeCacheFile(filename: string, data: string): Promise<string | null> {
  if (!isNative()) return null
  try {
    const { Filesystem, Directory } = await getFilesystem()
    const result = await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Cache,
    })
    return result.uri
  } catch {
    return null
  }
}

/**
 * Listen for deep links opened via URL scheme or universal link.
 * Calls onUrl(url) whenever the app is opened via a link.
 * Returns an unsubscribe function.
 */
export async function listenDeepLinks(onUrl: (url: string) => void): Promise<() => void> {
  if (!isNative()) return () => {}
  try {
    const App = await getApp()
    const handle = await App.addListener('appUrlOpen', ({ url }) => {
      if (url) onUrl(url)
    })
    return () => { handle.remove() }
  } catch {
    return () => {}
  }
}
