'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

interface Props {
  avatar: boolean
  whatsapp: boolean
  instagram: boolean
  bio: boolean
  university: boolean
  campus: boolean
}

const STEPS = [
  { key: 'avatar',     label: 'Profile photo',      tip: 'Buyers trust sellers with a face' },
  { key: 'whatsapp',   label: 'WhatsApp number',     tip: 'Essential for receiving inquiries' },
  { key: 'instagram',  label: 'Instagram handle',    tip: 'Show your social credibility' },
  { key: 'bio',        label: 'Write a short bio',   tip: 'Tell buyers who you are' },
  { key: 'university', label: 'Business / Organisation',  tip: 'Help buyers know more about you' },
  { key: 'campus',     label: 'City / Location',           tip: 'Help buyers in your area find you' },
] as const

export function ProfileCompletion(props: Props) {
  const done  = STEPS.filter(s => props[s.key]).length
  const total = STEPS.length
  const pct   = Math.round((done / total) * 100)
  const complete = done === total

  if (complete) return null

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden mb-5">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black text-gray-900 dark:text-white">Complete your profile</p>
          <span className="text-xs font-black text-primary">{pct}%</span>
        </div>
        {/* Bar */}
        <div className="h-2 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          {done} of {total} steps done — a complete profile gets more buyer trust
        </p>
      </div>

      {/* Steps */}
      <div className="px-5 pb-4 space-y-2">
        {STEPS.map(step => {
          const isDone = props[step.key]
          return (
            <div key={step.key} className="flex items-center gap-2.5">
              {isDone
                ? <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                : <Circle className="w-4 h-4 text-gray-300 dark:text-muted-foreground flex-shrink-0" />}
              <span className={`text-xs ${isDone ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                {step.label}
              </span>
              {!isDone && (
                <span className="text-[10px] text-gray-400 ml-auto hidden sm:block">{step.tip}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="px-5 pb-4">
        <Link
          href="/profile"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/15 transition-colors"
        >
          Complete profile <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
