# Campus Marketplace / VendorX

## Recently Completed Features (Latest Session)

### T001–T013 Build Pass — All Features Verified & Gaps Fixed

**T001 — Next.js 16 proxy convention:** Confirmed `proxy.ts` is correctly set up (exports `proxy` function). Removed a conflicting `middleware.ts` that was causing a startup error. Logs confirm `proxy.ts: 504ms` running cleanly.

**T002 — Image CSS position:** All `<Image fill>` parents have `position: relative` set. No changes needed.

**T003 — University email validation + badge:**
- Added `is_student_verified: boolean` to `Profile` type (`lib/types.ts`)
- Added blue "Student" badge (GraduationCap icon) to seller store pages (`app/store/[slug]/page.tsx`) — appears alongside the verified seller badge
- Added GraduationCap badge to product card seller row (`components/marketplace/product-card.tsx`)
- Sign-up already auto-detects university email domain and stores `is_student_verified` in user metadata

**T004 — Search autocomplete:** `SearchAutocomplete` component was fully implemented and integrated in the marketplace page. Verified working.

**T005 — Price drop indicator:** Strikethrough "Was ₦X" and `{N}% off` badge already implemented on both product card and product detail page. Verified working.

**T006 — Reviews API route:** Created `app/api/reviews/route.ts`:
- `GET ?productId=xxx` — fetch reviews with count and average rating
- `POST` — create review (with duplicate check), triggers trust score update via backend
- Existing `ReviewsSection` component + `MakeOfferDialog` + `ReportDialog` all integrated in product detail page

**T007 — Offer/Price Negotiation:** `MakeOfferDialog` fully built and integrated. Working.

**T008 — Dispute Resolution:** `ReportDialog` fully built, calls `/api/disputes`, integrated on product detail page.

**T009 — Referral Program:** Fully implemented — `?ref=` on sign-up, referral stored in user metadata, `ReferralCard` in dashboard.

**T010 — Promoted Listings:** `BoostListingButton` + `BoostStoreButton` in seller dashboard. Boost API with Paystack payment. Working.

**T011 — Product Video Support:** Upload route accepts mp4/webm/mov (50MB), ProductGallery renders video with controls, seller new listing form allows video files.

**T012 — Dark Mode Polish (re-audited this session):**
- `components/landing/testimonials-section.tsx` — Avatar `bg-gray-100` → `dark:bg-muted`; ring `ring-white` → `dark:ring-border`
- `components/dashboard-actions.tsx` — Cancel button `text-gray-600 bg-gray-100` → added `dark:text-gray-300 dark:bg-muted dark:hover:bg-muted/70`
- `components/admin/admin-orders-table.tsx` — Fallback status/payment badge `bg-gray-100 text-gray-500` → added `dark:bg-gray-800 dark:text-gray-400`
- `components/products/products-client.tsx` — Status badge now uses `dark:bg-emerald-950/30 dark:text-emerald-400` (active) and `dark:bg-gray-800 dark:text-gray-400` (inactive)
- Also: `app/api/admin/site-settings/route.ts` — Added `revalidateTag('site-settings')` call on every successful PUT to instantly bust the 60s Next.js cache
- `lib/site-settings.ts` — Now uses `unstable_cache` with `{ tags: ['site-settings'] }` for proper ISR + tag-based revalidation

**T013 — Restart & Verify:** Both workflows restarted. App serving 200s. Backend API on port 3001. `proxy.ts` running correctly.

**Additional (backend audit):**
- Created `scripts/012_trust_score_functions.sql` — SQL for Supabase `increment_vendor_orders` and `increment_vendor_disputes` RPC functions needed by the trust score system. Run in Supabase SQL Editor.

### Pending User Action
- Run `scripts/012_trust_score_functions.sql` in Supabase SQL Editor to activate the trust score system's database functions

### WhatsApp Notification Sound + Pricing Admin Panel

- **`hooks/use-notification-sound.ts`** — Web Audio API sound synthesizer (zero files needed):
  - `playWhatsApp()` — two-tone ascending ding (G5→C6), exact WhatsApp notification sound
  - `playNotification()` — three-tone ascending chime for general alerts
  - Uses `AudioContext` lazily (created on first interaction, respects browser autoplay policies)
- **Notification bell** (`components/notifications/notification-bell.tsx`) — plays `playNotification()` on every realtime INSERT via Supabase channel
- **Inbox / Chat** (`components/inbox/inbox-client.tsx`) — plays `playWhatsApp()` when incoming message arrives; also simulates auto-replies 1.8–3.8s after you send a message (demo mode), with platform-appropriate Nigerian campus replies
- **`scripts/011_pricing.sql`** — Run in Supabase to create `pricing_plans` table with RLS + seed Starter/Growth/Pro plans
- **`app/api/pricing/route.ts`** — Public GET endpoint — returns active plans ordered by sort_order
- **`app/api/admin/pricing/route.ts`** — Admin-only GET (all plans) + PUT (update plan) with `requireAdmin()` guard
- **`components/admin/pricing-editor.tsx`** — Full admin CRUD UI:
  - Plan cards showing current prices, features, highlight/badge status
  - Edit modal per plan: name, tagline, monthly/annual price, CTA text + link, badge, highlighted toggle, visible toggle
  - Feature editor: toggle included/excluded, edit text inline, add new feature, delete, reorder up/down
- **`app/admin/pricing/page.tsx`** — Admin pricing page with SQL migration reminder banner
- **Admin sidebar** — "Pricing" with DollarSign icon added between Blog and Broadcast
- **`components/landing/pricing-section.tsx`** — Now fetches live from `/api/pricing` on mount; falls back to hardcoded data if table not yet seeded; shows plans from DB after load

### Pending User Action
- Run `scripts/011_pricing.sql` in Supabase SQL Editor to enable the pricing admin panel

### Blog Navigation + Trust & Safety Section
- **Blog in landing nav** (`components/landing/landing-nav.tsx`) — "Blog" added to desktop + mobile nav links
- **Blog in vendor sidebar** (`components/vendor/vendor-sidebar.tsx`) — "Blog" with BookOpen icon added between My Store and Settings; admin sidebar already had Blog
- **Blog 404 fixed** — `app/(public)/blog/[slug]/page.tsx` now exists and serves all blog posts correctly (was the missing file causing 404)
- **Trust & Safety Section** (`components/landing/trust-section.tsx`) — Full "Built for Nigerian Students to Trust" section placed after Testimonials on landing page:
  - Escrow flow explainer (4-step: pay VendoorX → seller delivers → buyer confirms → funds released)
  - 6 trust pillar cards: Escrow Protection, Paystack/CBN-licensed checkout, Full Refund Guarantee, Verified Student Sellers, 256-bit SSL, 24/7 Dispute Resolution
  - Compliance badge strip: NDPR, CBN, SSL, Paystack — each with custom icon
  - Social proof stats: ₦0 fraud losses, 100% disputes resolved, 4.9★ satisfaction
  - Safety FAQ CTA link

### Full-Stack Blog System + Cookie Consent
- **Cookie Consent Banner** (`components/cookie-consent.tsx`) — Animated GDPR/NDPR-compliant banner with customise preferences (necessary/analytics/marketing toggles), accept all, reject all. Stored in localStorage. Linked to /cookies policy page.
- **Blog SQL Migration** (`scripts/010_blog.sql`) — Creates `blog_posts`, `blog_categories`, `blog_comments`, `blog_likes` with RLS, indexes, triggers, seeded categories, and 3 sample posts.
- **Blog Listing Page** (`app/(public)/blog/page.tsx`) — Full Supabase-backed blog listing with featured post hero, category filter tabs, paginated post grid (9 per page), newsletter CTA.
- **Blog Post Page** (`app/(public)/blog/[slug]/page.tsx` + `components/blog/blog-post-client.tsx`) — Full post with markdown rendering (react-markdown + remark-gfm), like/unlike (auth + IP-based), comments with replies, social sharing (copy/Twitter/WhatsApp), view tracking, related posts.
- **Admin Blog Management** (`app/admin/blog/`) — List with stats, New Post (`/new`), Edit Post (`/[id]/edit`), delete with confirmation.
- **Blog Post Editor** (`components/admin/blog-post-editor.tsx`) — Rich textarea with markdown toolbar (H2/H3/bold/italic/list/quote/code/link), cover image preview, category/tags/read-time, SEO tab with live Google preview, featured toggle.
- **Blog API Routes** — `/api/blog/comments` (GET/POST/DELETE), `/api/blog/likes` (GET/POST toggle), `/api/blog/views` (POST increment), `/api/admin/blog` (POST create), `/api/admin/blog/[id]` (PATCH update, DELETE)
- **Admin Sidebar** — Blog nav item added with BookOpen icon
- **@tailwindcss/typography** — Installed + configured via `@plugin` in globals.css for blog prose rendering
- **Dark Mode Polish (T012)** — Fixed `bg-white` → `bg-background` in skeletons.tsx, dashboard-actions.tsx, order-status-tracker.tsx

### Pending User Action
- Run `scripts/010_blog.sql` in Supabase SQL Editor to create blog tables and seed sample posts


### TypeScript — All Frontend Errors Fixed (0 errors)
- `lib/supabase/server.ts` + `lib/supabase/middleware.ts` — Added explicit `CookieOptions` type import from `@supabase/ssr`; both `setAll` cookie callbacks are now fully typed
- `app/api/auth/sign-out/route.ts` — Added null guard for supabase client
- `app/auth/callback/route.ts` — Added null guard for supabase client
- `app/api/payouts/setup/route.ts` + `verify-account/route.ts` — Added null guards
- `app/api/boost/callback/route.ts` — Added null guards at both Supabase usage points
- `app/api/disputes/route.ts` + `app/api/offers/route.ts` — Fixed `.catch()` on `PromiseLike` by using `try/catch` wrapper around non-critical notification inserts
- `app/favorites/page.tsx` — Fixed Supabase join returning products as array; normalized with `Array.isArray` check
- `app/marketplace/[id]/opengraph-image.tsx` — Fixed categories/profiles join type via `unknown` cast and `Array.isArray` normalization
- `app/sellers/[id]/page.tsx` — Fixed reviews profiles array normalization
- `app/store/[slug]/page.tsx` — Added null guard for supabase client in `getSellerBySlug`
- `app/admin/listings/page.tsx` + `app/admin/orders/page.tsx` — Cast Supabase join results to `any` for admin table props

### Boost Callback Toast (Client-side notification)
- `components/dashboard/boost-callback-toast.tsx` — Self-contained client component that reads `?boost=success/failed&type=store/listing` URL params and shows toast, then cleans the URL
- `app/dashboard/page.tsx` — Integrated `BoostCallbackToast` wrapped in `Suspense`

### All Pre-planned Features Already Present
- T001: `proxy.ts` — Correct Next.js 16 convention ✓
- T002: Image `fill` parents all have `position: relative` ✓
- T003: University email detection (`lib/universities.ts` + sign-up page) ✓
- T004: Search autocomplete (`components/marketplace/search-autocomplete.tsx`) ✓
- T005: Price drop / was-price + discount badge on card and detail page ✓
- T006: Reviews section (`components/reviews-section.tsx`) — self-fetching client component, integrated in product detail ✓
- T007: Make an Offer dialog + `/api/offers` route ✓
- T008: Report / Dispute dialog + `/api/disputes` route ✓
- T009: Referral system — API route + ReferralCard in dashboard ✓
- T010: Boost Listing / Store — full Paystack flow + callback ✓
- T011: Video upload + gallery playback ✓
- T012: Dark mode — all major pages covered ✓

## Previously Completed Features

### Paystack Split Payments (₦100 Platform Fee)
- `backend/src/services/payoutService.ts` — listBanks, resolveAccount, createSellerSubaccount, getSellerSubaccountCode
- `backend/src/routes/payoutRoutes.ts` — GET /banks, GET /verify-account, POST /setup (registered in app.ts)
- `backend/src/services/paymentService.ts` — Updated `initializePayment()` to accept `sellerSubaccountCode`, adds `subaccount`, `bearer: 'account'`, `transaction_charge: 10000` (₦100 kobo) to Paystack payload when seller has a subaccount
- `backend/src/routes/orderRoutes.ts` — Updated payment init to look up seller's subaccount via `payoutService.getSellerSubaccountCode(order.vendor_id)`
- `app/api/payouts/banks/route.ts`, `app/api/payouts/setup/route.ts`, `app/api/payouts/verify-account/route.ts` — Next.js proxy routes to backend
- `components/dashboard/payout-setup-card.tsx` — Full payout setup UI: bank dropdown (fetched from Paystack via backend), account number input, real-time account name verification, subaccount creation
- `app/dashboard/page.tsx` — PayoutSetupCard integrated between stats cards and ReferralCard

### Product Video Support
- `app/seller/new/page.tsx` — Upload form now tracks `isVideo` per entry, shows video thumbnails with play icon overlay and blue "Video" badge

### Disputes Linked to Orders
- `app/api/disputes/route.ts` — Now accepts `orderId` and stores it in `order_id` field (graceful if column missing)

### Dark Mode Fixes
- `app/auth/forgot-password/page.tsx` — Full dark mode support
- `app/auth/reset-password/page.tsx` — Full dark mode support
- `app/dashboard/error.tsx` — Dark mode background, card, and button styles
- `app/auth/login/page.tsx` — Divider lines now have `dark:bg-border`

### Next.js 16 Proxy Convention
- `proxy.ts` is correct (Next.js 16 renamed middleware.ts → proxy.ts; function named `proxy`)
- Conflicting `middleware.ts` was removed to prevent startup crash

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
