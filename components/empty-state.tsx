'use client'

import { LottiePlayer } from './lottie-player'
import emptyBoxAnimation from '@/lib/animations/empty-box.json'
import emptyInboxAnimation from '@/lib/animations/empty-inbox.json'
import emptySearchAnimation from '@/lib/animations/empty-search.json'
import loadingAnimation from '@/lib/animations/loading.json'

type EmptyStateVariant = 'box' | 'inbox' | 'search' | 'loading'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

const animations: Record<EmptyStateVariant, object> = {
  box: emptyBoxAnimation,
  inbox: emptyInboxAnimation,
  search: emptySearchAnimation,
  loading: loadingAnimation,
}

export function EmptyState({
  variant = 'box',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <LottiePlayer
        animationData={animations[variant]}
        className="w-48 h-48"
        loop={variant === 'loading'}
      />
      <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
