'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const TECH_STACK = {
  Frontend: [
    { name: 'Next.js', version: '^16.2.3', description: 'React framework with App Router' },
    { name: 'React', version: '^19.2.5', description: 'JavaScript library for UI' },
    { name: 'React DOM', version: '^19.2.5', description: 'React package for DOM rendering' },
    { name: 'TypeScript', version: '^5.9.3', description: 'Type-safe JavaScript' },
    { name: 'Tailwind CSS', version: '^4.2.2', description: 'Utility-first CSS framework' },
    { name: '@tailwindcss/postcss', version: '^4.2.2', description: 'Tailwind CSS PostCSS plugin' },
    { name: 'next-themes', version: '^0.4.6', description: 'Theme management for Next.js' },
  ],
  'UI Components': [
    { name: '@radix-ui/*', version: 'latest', description: 'Unstyled, accessible components (30+ packages)' },
    { name: 'lucide-react', version: '^0.564.0', description: 'Icon library' },
    { name: 'cmdk', version: '^1.1.1', description: 'Command menu component' },
    { name: 'vaul', version: '^1.1.2', description: 'Drawer component' },
    { name: 'embla-carousel-react', version: '^8.6.0', description: 'Carousel component' },
    { name: 'react-day-picker', version: '^9.14.0', description: 'Date picker component' },
    { name: 'input-otp', version: '^1.4.2', description: 'OTP input component' },
    { name: 'sonner', version: '^1.7.4', description: 'Toast notifications' },
  ],
  'Forms & Validation': [
    { name: 'react-hook-form', version: '^7.72.1', description: 'Efficient form handling' },
    { name: '@hookform/resolvers', version: '^3.10.0', description: 'Validation resolvers for react-hook-form' },
    { name: 'zod', version: '^3.25.76', description: 'TypeScript-first schema validation' },
    { name: 'joi', version: '^18.1.2', description: 'Data validation library' },
  ],
  'Backend & Database': [
    { name: '@supabase/supabase-js', version: '^2.102.1', description: 'Supabase JavaScript client' },
    { name: '@supabase/ssr', version: '^0.6.1', description: 'Supabase SSR utilities' },
    { name: '@upstash/redis', version: '^1.37.0', description: 'Serverless Redis client' },
    { name: 'axios', version: '^1.15.0', description: 'HTTP client' },
  ],
  'Job Queue & Caching': [
    { name: 'bullmq', version: '^5.73.1', description: 'Job queue library for Redis' },
    { name: 'ioredis', version: '^5.10.1', description: 'Redis client' },
  ],
  'Mobile Development': [
    { name: '@capacitor/core', version: '^8.3.0', description: 'Capacitor core for hybrid apps' },
    { name: '@capacitor/cli', version: '^8.3.0', description: 'Capacitor CLI' },
    { name: '@capacitor/android', version: '^8.3.0', description: 'Android platform' },
    { name: '@capacitor/ios', version: '^8.3.0', description: 'iOS platform' },
    { name: '@capacitor/camera', version: '^8.0.2', description: 'Camera plugin' },
    { name: '@capacitor/filesystem', version: '^8.1.2', description: 'File system plugin' },
    { name: '@capacitor/network', version: '^8.0.1', description: 'Network info plugin' },
    { name: '@capacitor/push-notifications', version: '^8.0.3', description: 'Push notifications' },
    { name: '@capacitor/haptics', version: '^8.0.2', description: 'Haptic feedback' },
    { name: '@capacitor/splash-screen', version: '^8.0.1', description: 'Splash screen plugin' },
    { name: '@capacitor/status-bar', version: '^8.0.2', description: 'Status bar plugin' },
  ],
  'Payment & E-Commerce': [
    { name: 'react-paystack', version: '^6.0.0', description: 'Paystack payment integration' },
  ],
  'Maps & Location': [
    { name: 'leaflet', version: '^1.9.4', description: 'JavaScript mapping library' },
    { name: 'react-leaflet', version: '^5.0.0', description: 'React bindings for Leaflet' },
    { name: '@types/leaflet', version: '^1.9.21', description: 'TypeScript definitions for Leaflet' },
  ],
  'Charts & Visualizations': [
    { name: 'recharts', version: '^2.15.4', description: 'React charting library' },
    { name: 'lottie-react', version: '^2.4.1', description: 'Lottie animation library' },
  ],
  'Content & Markdown': [
    { name: 'react-markdown', version: '^10.1.0', description: 'Markdown renderer' },
    { name: 'remark-gfm', version: '^4.0.1', description: 'GitHub flavored markdown support' },
    { name: 'rehype-raw', version: '^7.0.0', description: 'Raw HTML support in markdown' },
    { name: '@tailwindcss/typography', version: '^0.5.19', description: 'Typography plugin for Tailwind' },
  ],
  'Web3 & Crypto': [
    { name: 'ethers', version: '^6.16.0', description: 'Ethereum web3 library' },
    { name: 'tweetnacl', version: '^1.0.3', description: 'NaCl crypto library' },
    { name: 'bs58', version: '^6.0.0', description: 'Base58 encoding' },
  ],
  'Notifications & Messaging': [
    { name: 'web-push', version: '^3.6.7', description: 'Web push notifications' },
    { name: '@types/web-push', version: '^3.6.4', description: 'TypeScript definitions for web-push' },
  ],
  'Server & Backend Stack': [
    { name: 'express', version: '^5.2.1', description: 'Node.js web framework' },
    { name: '@types/express', version: '^5.0.6', description: 'TypeScript definitions for Express' },
    { name: 'cors', version: '^2.8.6', description: 'CORS middleware' },
    { name: '@types/cors', version: '^2.8.19', description: 'TypeScript definitions for CORS' },
    { name: 'express-rate-limit', version: '^8.3.2', description: 'Rate limiting middleware' },
    { name: 'helmet', version: '^8.1.0', description: 'Security middleware' },
  ],
  'Database Tools': [
    { name: 'sharp', version: '^0.34.5', description: 'Image processing library' },
  ],
  'Logging & Monitoring': [
    { name: 'winston', version: '^3.19.0', description: 'Logging library' },
    { name: '@sentry/nextjs', version: '^10.47.0', description: 'Sentry error tracking' },
    { name: '@vercel/analytics', version: '^1.6.1', description: 'Vercel web analytics' },
  ],
  'API Documentation': [
    { name: 'swagger-ui-express', version: '^5.0.1', description: 'Swagger UI for API docs' },
    { name: '@types/swagger-ui-express', version: '^4.1.8', description: 'TypeScript definitions' },
  ],
  'Data Management': [
    { name: '@tanstack/react-query', version: '^5.96.2', description: 'Data fetching & caching' },
    { name: '@tanstack/react-query-devtools', version: '^5.96.2', description: 'React Query DevTools' },
    { name: 'zustand', version: '^5.0.12', description: 'State management' },
  ],
  'Utilities': [
    { name: 'date-fns', version: '^4.1.0', description: 'Date utilities' },
    { name: 'clsx', version: '^2.1.1', description: 'Conditional class names' },
    { name: 'tailwind-merge', version: '^3.5.0', description: 'Merge Tailwind classes' },
    { name: 'class-variance-authority', version: '^0.7.1', description: 'Variant management' },
    { name: 'dotenv', version: '^17.4.1', description: 'Environment variables' },
  ],
  'Animation': [
    { name: 'framer-motion', version: '^12.38.0', description: 'Animation library' },
  ],
  'Firebase': [
    { name: 'firebase-admin', version: '^13.7.0', description: 'Firebase Admin SDK' },
  ],
  'Dev Tools': [
    { name: 'tsx', version: '^4.21.0', description: 'TypeScript executor' },
    { name: 'autoprefixer', version: '^10.4.27', description: 'PostCSS autoprefixer' },
    { name: 'postcss', version: '^8.5.9', description: 'CSS transformation' },
  ],
}

export default function TechStackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tech Stack</h1>
        <p className="text-muted-foreground mt-2">
          Complete list of technologies and dependencies used in Campus Marketplace
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(TECH_STACK).map(([category, items]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{category}</CardTitle>
              <CardDescription>{items.length} dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {item.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Total Categories:</strong> {Object.keys(TECH_STACK).length}
          </p>
          <p className="text-sm">
            <strong>Total Dependencies:</strong>{' '}
            {Object.values(TECH_STACK).reduce((sum, items) => sum + items.length, 0)}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            The stack is built for scalability, performance, and developer experience. It combines
            modern frontend frameworks with robust backend infrastructure and supports both web and
            mobile platforms through Capacitor.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
