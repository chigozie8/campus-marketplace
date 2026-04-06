'use client'

import { useCallback, useRef } from 'react'

export function useNotificationSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!Ctor) return null
        ctxRef.current = new Ctor()
      }
      return ctxRef.current
    } catch {
      return null
    }
  }, [])

  const playTone = useCallback((
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    peak: number,
  ) => {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(peak, startTime + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
    osc.start(startTime)
    osc.stop(startTime + duration + 0.05)
  }, [])

  const playWhatsApp = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    playTone(ctx, 783.99,  now,        0.18, 0.28)
    playTone(ctx, 1046.50, now + 0.13, 0.24, 0.22)
  }, [getCtx, playTone])

  const playNotification = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    playTone(ctx, 1174.66, now,        0.12, 0.2)
    playTone(ctx, 1318.51, now + 0.09, 0.16, 0.16)
    playTone(ctx, 1567.98, now + 0.18, 0.20, 0.12)
  }, [getCtx, playTone])

  return { playWhatsApp, playNotification }
}
