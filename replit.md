# Campus Marketplace / VendorX

## Architecture

This project has two services running side-by-side:

### Frontend — Next.js 16 (App Router)
- **Port**: 5000
- **Workflow**: `Start application` → `npm run dev`
- **Framework**: Next.js 16 with React 19, Tailwind CSS v4, shadcn/ui components
- **Auth**: Supabase SSR (`@supabase/ssr`) with middleware session refresh
- **Key directories**:
  - `app/` — App Router pages and layouts
  - `components/` — Shared UI components (shadcn/ui)
  - `lib/` — Supabase client helpers, utilities
  - `hooks/` — Custom React hooks
  - `store/` — Zustand state management
  - `styles/` — Global CSS

### Backend — Express.js API v2 (VendorX) — TypeScript
- **Port**: 3001
- **Workflow**: `Backend API` → `cd backend && npx tsx src/server.ts`
- **Language**: TypeScript (runs via tsx — no build step needed)
- **Architecture**: Controller → Service → Repository → Supabase
- **Key directories**:
  - `backend/src/controllers/` — Thin HTTP handlers
  - `backend/src/services/` — Business logic (auth, product, order, payment, WhatsApp)
  - `backend/src/repositories/` — DB abstraction layer (Supabase queries)
  - `backend/src/queues/` — BullMQ async jobs (messages, payments, notifications)
  - `backend/src/bots/` — WhatsApp bot engine (intent detection, response builder)
  - `backend/src/config/` — Supabase, Redis, Paystack, Meilisearch, Swagger
  - `backend/src/middleware/` — Auth JWT, error handler, rate limiter, request logger
  - `backend/src/validators/` — Zod schemas
  - `backend/src/types/` — Shared TypeScript types
  - `backend/src/utils/` — Logger (Winston), helpers, Redis cache wrapper
- **API Docs**: http://localhost:3001/api/docs (Swagger UI)

## Required Environment Variables (Secrets)

| Variable | Used By | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend + Backend | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend + Backend | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only | Bypasses RLS — keep secret |
| `PAYSTACK_SECRET_KEY` | Backend only | Payment processing (optional for dev) |
| `PAYSTACK_WEBHOOK_SECRET` | Backend only | Webhook signature verification |
| `WHATSAPP_TOKEN` | Backend only | WhatsApp messaging |
| `WHATSAPP_PHONE_NUMBER_ID` | Backend only | WhatsApp phone number ID |
| `WHATSAPP_VERIFY_TOKEN` | Backend only | Webhook verification token |

## Replit Migration Notes

- Dev/start scripts updated to bind on `0.0.0.0:5000` for Replit preview compatibility
- Vercel-specific www redirect removed from `next.config.ts`
- Backend port changed from 5000 → 3001 to avoid conflict with Next.js
- Backend Supabase config falls back to `NEXT_PUBLIC_SUPABASE_*` env vars if `SUPABASE_*` are not set separately
- Paystack config warns instead of crashing if key is missing (so dev server can start without payment keys)
