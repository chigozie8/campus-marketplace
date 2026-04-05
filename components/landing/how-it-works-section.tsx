'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserPlus, Camera, Share2, MessageCircle, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create your free account',
    description: 'Sign up in seconds with your email. Complete your seller profile with your campus, WhatsApp number, and what you sell.',
    color: 'from-emerald-500 to-green-600',
  },
  {
    step: '02',
    icon: Camera,
    title: 'List your products',
    description: 'Upload photos, write a description, set your price, and choose your category. Your listing goes live instantly.',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    step: '03',
    icon: Share2,
    title: 'Share across platforms',
    description: 'Share your listings to WhatsApp Status, Instagram Stories, and Facebook with one click.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    step: '04',
    icon: MessageCircle,
    title: 'Close deals on WhatsApp',
    description: 'Buyers tap "Chat on WhatsApp" and land directly in your DMs. Negotiate, confirm, and get paid — no platform interference.',
    color: 'from-green-500 to-emerald-600',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-widest mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            How it works
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-5">
            Selling made{' '}
            <span className="text-primary">ridiculously simple</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
            From sign-up to first sale in under 5 minutes. No technical skills required.
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="relative flex flex-col group"
              >
                {/* Connector line for desktop */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-[2px]">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                      className="h-full bg-gradient-to-r from-primary/50 to-primary/20 origin-left"
                    />
                  </div>
                )}

                {/* Card */}
                <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group-hover:-translate-y-2">
                  {/* Icon with gradient background */}
                  <div className="relative mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-9 h-9 text-white" />
                    </motion.div>
                    {/* Step number badge */}
                    <motion.span
                      whileHover={{ scale: 1.2 }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary text-sm font-bold flex items-center justify-center shadow-lg"
                    >
                      {index + 1}
                    </motion.span>
                  </div>

                  <h3 className="font-bold text-lg text-foreground mb-3 text-balance group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
