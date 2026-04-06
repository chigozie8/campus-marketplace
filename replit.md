# Campus Marketplace / VendorX

## Architecture

This project has two services running side-by-side:

### Frontend — Next.js 16 (App Router)
- **Port**: 5000
- **Workflow**: `Start application` → `npm run dev`
- **Framework**: Next.js 16 with React 19, Tailwind CSS v4, shadcn/ui components
- **Auth**: Supabase SSR (`@supabase/ssr`) with middleware session refresh
- **State**: Zustand (auth, listing, profile) + TanStack Query (API data fetching)
- **Animations**: Framer Motion on product cards and order expansion
- **Key directories**:
  - `app/` — App Router pages and layouts
    - `app/dashboard/orders/` — Order history with status tracking
    - `app/payment/callback/` — Paystack payment result page
  - `components/` — Shared UI components (shadcn/ui)
    - `components/features/` — Integration components (checkout, WhatsApp CTA, order tracker, buy button)
    - `components/marketplace/` — Product card (enhanced with Framer Motion)
    - `components/providers.tsx` — TanStack Query provider wrapper
  - `lib/api.ts` — Backend REST API client (all endpoints)
  - `lib/query-client.ts` — TanStack Query client singleton
  - `hooks/use-orders.ts` — Order CRUD hooks (useMyOrders, useCreateOrder, useInitializePayment, etc.)
  - `store/` — Zustand state management
- **Backend URL**: Set via `NEXT_PUBLIC_BACKEND_URL` env var → backend on port 3001 (only used for non-verification operations; verification now uses Next.js API routes)
- **Verification API routes**: `app/api/verification/status/route.ts` (GET) and `app/api/verification/submit/route.ts` (POST) use Supabase service role directly — avoids unreachable backend port

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
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | URL to the Express API (e.g. `https://domain:3001`) |
| `FRONTEND_URL` | Backend | Paystack payment callback redirects here |
| `PAYSTACK_SECRET_KEY` | Backend only | Payment processing (optional for dev) |
| `PAYSTACK_WEBHOOK_SECRET` | Backend only | Webhook signature verification |
| `WHATSAPP_TOKEN` | Backend only | WhatsApp messaging |
| `WHATSAPP_PHONE_NUMBER_ID` | Backend only | WhatsApp phone number ID |
| `WHATSAPP_VERIFY_TOKEN` | Backend only | Webhook verification token |

## Features Added (Post-Migration)

### Critical Fixes
- **Next.js 16 proxy.ts**: Renamed `middleware.ts` → `proxy.ts` and updated export to `proxy()` per Next.js 16 deprecation requirement
- **Image position bug**: Fixed `<Link>` wrapper around `<Image fill>` in product card — Link now uses `absolute inset-0` so it's the positioned parent for the Image
- **LCP optimization**: First product card image gets `priority` prop for eager loading

### New Components
| Component | Path | Description |
|---|---|---|
| SearchAutocomplete | `components/marketplace/search-autocomplete.tsx` | Debounced real-time search dropdown with product previews |
| MakeOfferDialog | `components/product/make-offer-dialog.tsx` | Buyer offer submission dialog |
| ReportDialog | `components/product/report-dialog.tsx` | Dispute/report filing dialog |
| BoostListingButton | `components/dashboard/boost-listing-button.tsx` | Paystack-powered 7-day listing boost (₦1,500) |
| ReferralCard | `components/dashboard/referral-card.tsx` | Referral code display + share functionality |

### New API Routes
| Route | Method | Description |
|---|---|---|
| `/api/offers` | POST | Submit price offer from buyer to seller |
| `/api/disputes` | POST | File a dispute/report against a listing |
| `/api/referral` | GET/POST | Get referral code, track referral conversions |
| `/api/boost` | POST | Initiate Paystack payment to boost a listing |

### New Libraries
- `lib/universities.ts` — 80+ Nigerian university email domain map for student verification

### Feature Details
- **University email verification**: Auto-detects .edu.ng domains on sign-up, sets `is_student_verified: true` in auth metadata
- **Referral program**: Codes derived from first 8 chars of user UUID; tracked via `?ref=` query param on sign-up URL
- **Promoted listings**: Paystack payment (₦1,500 / 150,000 kobo) for 7-day featured listing; relies on `is_featured` + `boost_expires_at` DB columns
- **Video support**: Upload route accepts MP4/WebM/MOV (max 50 MB); ProductGallery detects video URLs and renders `<video>` player; seller form accepts video files
- **Reviews integration**: ReviewsSection component integrated into product detail page
- **Dark mode**: Comprehensive dark mode classes audited and added to auth pages (login, sign-up), product detail page, and all new components

## Replit Migration Notes

- Dev/start scripts updated to bind on `0.0.0.0:5000` for Replit preview compatibility
- Vercel-specific www redirect removed from `next.config.ts`
- Backend port changed from 5000 → 3001 to avoid conflict with Next.js
- Backend Supabase config falls back to `NEXT_PUBLIC_SUPABASE_*` env vars if `SUPABASE_*` are not set separately
- Paystack config warns instead of crashing if key is missing (so dev server can start without payment keys)
