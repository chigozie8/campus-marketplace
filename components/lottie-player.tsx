'use client'

import dynamic from 'next/dynamic'
import type { LottieComponentProps } from 'lottie-react'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface LottiePlayerProps {
  animationData: object
  className?: string
  loop?: boolean
  autoplay?: boolean
  style?: React.CSSProperties
}

export function LottiePlayer({
  animationData,
  className,
  loop = true,
  autoplay = true,
  style,
}: LottiePlayerProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  )
}
