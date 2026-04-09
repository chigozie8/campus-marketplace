'use client'

import { useState, useCallback } from 'react'
import { AlertTriangle, Info } from 'lucide-react'

interface ConfirmOptions {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void
}

export function useConfirm(): [React.ReactNode, (opts: ConfirmOptions) => Promise<boolean>] {
  const [state, setState] = useState<ConfirmState | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      setState({ ...opts, resolve })
    })
  }, [])

  const handleConfirm = () => {
    state?.resolve(true)
    setState(null)
  }

  const handleCancel = () => {
    state?.resolve(false)
    setState(null)
  }

  const dialog = state ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          {/* Icon */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
            state.variant === 'danger'
              ? 'bg-destructive/10'
              : 'bg-primary/10'
          }`}>
            {state.variant === 'danger'
              ? <AlertTriangle className="w-5 h-5 text-destructive" />
              : <Info className="w-5 h-5 text-primary" />
            }
          </div>

          {/* Title */}
          <h2
            id="confirm-title"
            className="text-base font-black text-foreground mb-1.5"
          >
            {state.title}
          </h2>

          {/* Message */}
          {state.message && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {state.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-accent transition-colors"
          >
            {state.cancelText ?? 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              state.variant === 'danger'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {state.confirmText ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return [dialog, confirm]
}
