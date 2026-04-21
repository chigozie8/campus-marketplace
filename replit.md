# VendoorX — Nigeria's AI-Powered WhatsApp Commerce Platform

## Recently Completed Features (Latest Session)

### Lifecycle Nudges + Crisp Support (April 2026)
- **4 new lifecycle cron jobs** added in `backend/src/jobs/`, all registered in `backend/src/server.ts`:
  - `profileCompletionJob.ts` — nudges users with no avatar 24h after signup (every 6h)
  - `sellerActivationJob.ts` — nudges sellers with 0 listings 48h after signup (every 6h)
  - `reviewRequestJob.ts` — asks buyers to review 3 days after delivery (every 6h)
  - `payoutReminderJob.ts` — reminds sellers about claimable wallet balance (daily, ₦100 min)
- Existing jobs already cover: cart abandonment, 7-day inactivity, weekly seller digest, escrow auto-release, auto-cancel unshipped orders.
- **Dedup layer**: new `user_nudges` table (migration `scripts/035_user_nudges.sql`) with `(user_id, nudge_key, ref_id)` unique constraint. Helper `backend/src/utils/nudgeTracker.ts` calls `shouldSendNudge()` before each send. Falls open if table missing so jobs keep working pre-migration.
- **Bug fix in old jobs**: `inactivityJob`, `cartAbandonmentJob`, and `weeklySellerDigest` were calling `notify()` with the old positional signature, silently failing DB inserts. Migrated all three to the current `notify({userId, type, title, body, data})` object form.
- **NotificationType union extended** with `reengagement | cart_reminder | weekly_digest | profile_incomplete | seller_activation | payout_available`.
- **Crisp Chat support (optional)**: drop-in `components/crisp-chat.tsx` activates only when `NEXT_PUBLIC_CRISP_WEBSITE_ID` is set. Identifies the logged-in user (email, name, phone, avatar, user_id) to Crisp's session. `app/layout.tsx` renders `<CrispChat />` when env var is set, otherwise falls back to the in-house `<ChatWidget />`. Setup is sign up at crisp.chat → copy Website ID → paste into Replit Secrets → done.



### Trust Badges → Admin-Only (April 2026)
- Auto trust-score badges (Excellent/Good/Rising/etc.) and auto seller-tier (Gold/Silver/Bronze based on activity) **removed from all public-facing pages**: `app/sellers/[id]/page.tsx`, `app/marketplace/[id]/page.tsx`, `components/marketplace/product-card.tsx`. Buyer's view of `TrustBadge`/`SellerTierBadge` is gone.
- New admin-awarded badges added in `components/TrustBadge.tsx` → `ADMIN_BADGE_DEFS` (single source of truth, exported with `AdminBadgeGroup` type and `normalizeAdminBadges()` helper):
  - **Promo group** (mutually exclusive, awarded based on amount paid): `gold_seller` 🥇, `silver_seller` 🥈, `bronze_seller` 🥉
  - **Rank group** (mutually exclusive, manual recognition): `excellent_seller` 🏅, `rising_seller` 🌱
  - **Other group** (any combination): top_seller, trusted_buyer, vip, verified_business, student_ambassador, rising_star, campus_vendor
- Admin picker at `/admin/trust-scores` Badges tab is reorganized into Promo/Recognition/Other sections; toggle uses shared `normalizeAdminBadges()` so client UI and server agree.
- `PATCH /api/admin/trust-scores/[userId]` now calls `normalizeAdminBadges()` server-side — strips unknowns, dedupes, enforces promo/rank exclusivity even via direct API calls.
- Internal-use kept: `lib/trust.ts` (`computeSellerScore`, `getSellerTier`, etc.) still powers admin trust-score visibility & seller's own dashboard `trust-panel`.



### Dashboard Improvements Batch 1–12 (April 2026)
Twelve dashboard upgrades shipped, with the buyer/seller view toggle as the centerpiece. Server-component branches by `?view=buyer|seller` (default from `profile.role`); client toggle persists choice in localStorage and updates URL via `router.replace`.

**New components in `components/dashboard/`:**
- `mode-toggle.tsx` — Selling | Buying segmented control (URL + localStorage)
- `stat-card.tsx` — reusable stat tile w/ optional delta pill + sparkline slot
- `earnings-sparkline.tsx` — 7-day SVG line chart
- `header-badges.tsx` — pill counters (unread inbox / pending orders / unread notifs)
- `activity-feed.tsx` — last-24h orders + chat events with relative timestamps
- `inventory-alerts.tsx` — low-stock and "sold out but visible" warnings
- `smart-empty-state.tsx` — replaces generic zero-listing block
- `share-store-button.tsx` — generates 1200×630 PNG via `/api/og/store/[id]`, uses Web Share API w/ download fallback
- `buyer-dashboard-view.tsx` — full buyer dashboard (stats, in-transit, wishlist drops w/ `last_seen_price`, recent orders)

**New routes:**
- `app/api/og/store/[id]/route.tsx` — branded share image (next/og). Hardened: UUID regex check, `is_seller`/`role==='vendor'`/has-listings gate, SSRF allowlist on top-product image (Supabase host only).

**Refactored:**
- `app/dashboard/page.tsx` — view-conditional parallel fetches (capped at PRODUCT_LIMIT=200 / ORDERS_LIMIT=500), Quick Links horizontal-scroll on mobile, sparkline & deltas wired into stat cards
- `app/dashboard/loading.tsx` — proper skeleton matching final layout (was 5-line stub)
- `components/dashboard/trust-panel.tsx` — `rankTips()` reorders tips so unearned bonuses surface first

**Skipped (data not available):** Per-day view sparklines and trend deltas for views/CTR — no `product_views_history` table exists; only earnings sparkline is real data.



### Animations
- The custom GSAP/Lottie animation layer was removed at the user's request. The codebase now relies only on plain CSS transitions/Tailwind animations that were already in place.

### Per-Order Seller-Set Delivery Window
- New nullable column `orders.delivery_duration_days` (1–30, NULL = use default 5). Migration: `supabase/add_delivery_duration.sql` — paste once into the Supabase SQL editor.
- Seller-only endpoint `PATCH /api/backend/orders/:id/delivery-duration` (validator: `setDeliveryDurationSchema`). Allowed only while order is `paid`. Sends a `delivery_estimate_set` notification to the buyer on save.
- `backend/src/jobs/autoCancelOrders.ts` now respects per-order durations (default 5 days when NULL); pre-filters orders ≥1 day old then evaluates the per-order window in JS. Falls back gracefully if the column hasn't been added yet (logs a warning, treats every order as default).
- Seller UI: blue "Delivery window" picker (1/2/3/5/7/10/14/21/30 days) above the "Mark as Shipped" button on each paid order in `app/seller-orders/page.tsx`. Shows current value when set; Save button disabled until value changes.
- API client: `ordersApi.setDeliveryDuration(id, days)` in `lib/api.ts`.

### Two-Way Offer Conversations + Escrow Refund Fix + Order Detail Page
- **Offers — full negotiation thread:** new `offer_messages` table (`scripts/030_offer_messages.sql`) lets buyer & seller exchange replies and counter-prices on a single offer. New routes:
  - `GET/PATCH /api/offers/[id]` — fetch single offer with both parties; accept/decline/withdraw/counter
  - `GET/POST /api/offers/[id]/messages` — list & post messages, sets offer to `countered` when a counter price is sent
  - Conversation UI at `app/offers/[id]/page.tsx` with light 5s polling
  - Inbox at `app/dashboard/offers/page.tsx` with Received/Sent tabs
  - `POST /api/offers` now returns the new offer id; `make-offer-dialog.tsx` shows an "Open Chat" button that deep-links into the conversation
- **Escrow refund bug fix:** `reversePendingCredit` in `backend/src/services/walletService.ts` now takes `(sellerId, buyerId, orderId, amount)` and credits the buyer's wallet `available` balance in addition to reversing the seller's pending credit. Removed the duplicate Paystack `/refund` call (funds stayed on the platform's Paystack balance, so the in-wallet credit is the actual refund). Auto-cancel job (`backend/src/jobs/autoCancelOrders.ts`) now also refunds the buyer when an order is auto-cancelled after 5 days unshipped.
- **Order detail page:** created `app/dashboard/orders/[id]/page.tsx` (was missing — payment callback redirected to a 404). Shows status tracker, product summary, contextual CTAs (pay if pending), and embeds `OrderChat` for buyer↔seller messaging at any non-cancelled status.
- **Buy Now spinner:** `components/features/product-buy-button.tsx` shows a loading spinner during the auth check before opening the checkout modal.
- **Removed Instagram/Facebook CTAs** from `components/product/product-interactions.tsx`, `app/marketplace/[id]/page.tsx`, and `app/sellers/[id]/page.tsx`.
- **Mobile responsiveness pass** on `app/auth/login/page.tsx` and `app/auth/sign-up/page.tsx`: tighter padding on small screens, smaller heading sizes, no-wrap "Sign in/up" link to prevent header overflow.

**Pending DB action:** run `scripts/030_offer_messages.sql` in Supabase SQL editor.



### 10-Platform-Improvement Build Pass

**#1 — Order status push notifications:**
- Created `backend/src/services/notificationService.ts` — inserts into `notifications` table via Supabase admin + fire-and-forget push to `/api/push/send`
- Updated `backend/src/services/orderService.ts` — `updateOrderStatus()` now sends targeted notifications:
  - `paid` → seller gets "New Order — Action Required"
  - `shipped` → buyer gets "Your Order is on the Way!"
  - `delivered` → buyer gets "Order Marked as Delivered"
  - `completed` → both parties notified; seller's wallet released
  - `cancelled` → both parties notified

**#2 — Fix admin chat page profiles showing "Unknown":**
- Updated `app/api/admin/chats/route.ts` to fetch profiles from `profiles` table using service-role client and include them in the API response as `profiles: Record<string, string>`
- Updated `app/admin/chats/page.tsx` to remove the anon-key Supabase client entirely; uses profile names directly from API response

**#3 — Supabase Realtime on order_chats:**
- Created `scripts/013_realtime_order_chats.sql` — run in Supabase SQL Editor to enable Realtime for `order_chats` and `vendor_locations` tables

**#4 — Location data expiry/cleanup:**
- Created `backend/src/jobs/locationCleanup.ts` — deletes `vendor_locations` rows older than 30 minutes; runs every 30 min
- Registered in `backend/src/server.ts`

**#5 — New user onboarding flow:**
- Created `components/dashboard/onboarding-banner.tsx` — dismissible progress banner with 3 steps (complete profile, add listing, get verified); uses localStorage to remember dismissal
- Integrated into `app/dashboard/page.tsx` — shown to new users who haven't completed all steps

**#6 — Seller analytics dashboard:**
- Created `app/dashboard/analytics/page.tsx` — full analytics with:
  - 7 stat cards (revenue, orders, listings, completion rate, views, clicks, CTR)
  - Revenue over time area chart (Recharts)
  - Orders by status bar chart
  - Top listings table by views
- Added "Analytics" link to vendor sidebar (`components/vendor/vendor-sidebar.tsx`)

**#7 — Account deletion + data export:**
- Created `app/api/account/delete/route.ts` — anonymises profile, cancels pending orders, deactivates listings, removes push subscriptions, deletes auth user
- Created `app/api/account/export/route.ts` — downloads user's profile, listings, orders, reviews, notifications as JSON (NDPR-compliant)
- Added "Danger Zone" section to Security tab in `app/profile/page.tsx` — Export Data button + typed DELETE confirmation for account deletion

**#8 — Auto-cancel unshipped orders:**
- Created `backend/src/jobs/autoCancelOrders.ts` — cancels `paid` orders older than 5 days with no ship update; notifies both buyer (refund notice) and seller; runs every 6 hours
- Registered in `backend/src/server.ts`

**#9 — Stock quantity enforcement:**
- Updated `backend/src/services/orderService.ts` — after order is inserted, stock is decremented atomically: `stock_quantity = max(0, stock_quantity - quantity)`
- Stock check already existed; decrement was the missing piece

**#10 — Payout history page:**
- Created `app/dashboard/wallet/payouts/page.tsx` — lists all withdrawal requests with status badges (pending/paid/failed/rejected), bank name, masked account number, total paid/pending summary
- Added "Payout History" link to wallet page header

### Previous Session — T001–T013 Build Pass — All Features Verified & Gaps Fixed

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
  - `backend/src/config/` — Supabase, Redis, Paystack, Swagger
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
| `WASENDER_API_KEY` | Frontend + Backend | WaSenderAPI WhatsApp send/receive |
| `WASENDER_WEBHOOK_SECRET` | Frontend + Backend | HMAC SHA256 verification for incoming webhooks |
| `UPSTASH_REDIS_REST_URL` | Frontend + Backend | Upstash Redis (used for WhatsApp consent + rate limits) |
| `UPSTASH_REDIS_REST_TOKEN` | Frontend + Backend | Upstash Redis auth token |

### WhatsApp (WaSenderAPI) — Conversational Commerce Bot
The bot is a full e-commerce assistant living inside WhatsApp:
- **Stateful conversations** (Redis, 30 min TTL) — bot remembers what step you're on (browsing, viewing a product, awaiting address, confirming order)
- **Account linking** — phone number → Supabase profile lookup (tries `whatsapp_number` and `phone` columns with multiple format variants)
- **Buyer flows**: search products → numeric pick (1-5) → product detail → ORDER → delivery address → confirm → Paystack payment link generated → order created in DB
- **Order management**: "my orders" lists last 5 with status; "track" shows latest delivery
- **Seller flows**: "my sales" shows listings + recent sales for sellers
- **Smart intent detection** — handles greetings, browse, search, order, track, sell, support, plus universal "cancel/back" to exit any flow
- **Files**: `lib/whatsapp/{state,account,handlers,format,wasender,consent,messages,redis}.ts`

### Admin debug + reset
- `GET /api/admin/whatsapp/debug?phone=2348012345678` — shows consent + state + linked profile
- `POST /api/admin/whatsapp/debug` body `{phone, action}` where action is `reset|opt_in|opt_out|test`
- Auth: `x-admin-key: <INTERNAL_API_KEY>` header OR logged-in admin session
- `GET /api/webhook/whatsapp` — health check (`{ok, hasKey, hasSecret, env}`)

### WhatsApp Anti-ban Architecture
The bot ships with these guardrails to keep the connected number safe:
- **Opt-in flow** (`lib/whatsapp/messages.ts`) — every new contact receives ToS prompt; must reply `YES` before bot responds
- **Opt-out keywords** — `STOP / UNSUBSCRIBE / CANCEL / QUIT / OPT-OUT / END` permanently silences the bot for that number; `START` re-enables
- **Per-recipient rate limit** — ≤ 30 messages / hour / number (Redis counter, 1 h TTL)
- **Global daily cap** — ≤ 1000 bot replies / day across all users
- **Dedup window** — identical reply text within 30 s is dropped
- **Human-like jitter** — 800–2400 ms randomised delay before each send
- **Group/broadcast/channel filter** — webhook ignores `@g.us`, `@broadcast`, `@newsletter` JIDs
- **Webhook signature** — HMAC SHA256 verification when `WASENDER_WEBHOOK_SECRET` is set
- **Public ToS** at `/legal/whatsapp-terms` — referenced from every consent prompt

Files: `lib/whatsapp/{redis,consent,messages,wasender}.ts`, `app/api/webhook/whatsapp/route.ts`, `components/admin/whatsapp-status-card.tsx`, `app/legal/whatsapp-terms/page.tsx`.

Webhook URL (paste in WaSender dashboard): `https://www.vendoorx.ng/api/webhook/whatsapp`. Enable only `messages.upsert` + `session.status` events. In Advanced Settings: `Always Online = OFF`, ignore groups/broadcasts/channels.

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

## Dashboard & Orders v2 Pass (April 2026)

A focused UX improvement pass on the buyer + seller orders surfaces.

### Frontend changes
- **`/seller-orders`** — added full-text search (buyer/product/order ID), sticky search+filter bar with per-filter counts, CSV export of filtered orders, repeat-buyer badge in trust panel, richer empty states with contextual CTAs, skeleton loaders.
- **`/orders`** — sticky search+filter bar, table-skeleton loader, copy-order-ID button on each row.
- **`/dashboard/orders/[id]`** — copy-order-ID button on header, payment breakdown card (item subtotal + platform fee + total), `OrderStatusTracker` now shows timestamps under each completed/active step.
- **`/dashboard`** — mobile horizontal-overflow fix on the 4-stat grid (added `[&>*]:min-w-0` and tighter mobile gap).

### New shared components
| Component | Path | Purpose |
|---|---|---|
| `CopyButton` | `components/ui/copy-button.tsx` | Reusable copy-to-clipboard button with copied-state feedback |
| `OrderListSkeleton` / `OrderRowSkeleton` / `OrderTableRowSkeleton` | `components/orders/order-skeleton.tsx` | Replaces spinners in orders pages with content-shaped placeholders |

### Modified components
- `components/features/order-status-tracker.tsx` — `OrderStatusTracker` now accepts an optional `timestamps` prop (`OrderStatusTimestamps`) and renders the stamp under each step. Backwards compatible — calls without `timestamps` keep prior behaviour.

### Notes for future work (deferred this round)
- Tracking number, delivery-OTP buyer-input UI, and saved addresses require new DB columns/tables and are queued for the next backend pass.
- Full in-app dispute flow, time-series analytics, bulk actions, and refund-request UI are larger features that need their own design passes.

## Dashboard & Orders v2 Pass — Batch C (April 2026)

Backend additions for tracking, in-app delivery OTP confirmation, and the
buyer's saved address book.

### New SQL migrations (run once in Supabase SQL editor)
- `supabase/add_tracking_info.sql` — adds `tracking_number TEXT` + `tracking_courier TEXT` to `orders`.
- `supabase/saved_addresses.sql` — creates `saved_addresses` table with RLS so each user only sees their own rows.

### New backend endpoints
| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/orders/:id/tracking` | PATCH | seller of order or admin | Save / update tracking number + courier on a shipped or delivered order |
| `/api/delivery-otp/:orderId/resend` | POST | buyer, seller, or admin (was: admin-only) | Re-issue the 6-digit delivery OTP via email + SMS + in-app bell |

### New Next.js API routes (backed by Supabase RLS)
| Route | Methods | Description |
|---|---|---|
| `/api/saved-addresses` | GET, POST | List or create the current user's saved addresses |
| `/api/saved-addresses/:id` | PATCH, DELETE | Update (e.g. mark default) or delete a saved address |

### New shared frontend components
| Component | Path | Purpose |
|---|---|---|
| `TrackingEditor` | `components/orders/tracking-editor.tsx` | Seller-side input for courier name + tracking number |
| `TrackingDisplay` | `components/orders/tracking-display.tsx` | Buyer-side read-only courier + tracking number with copy button |
| `DeliveryOtpCard` | `components/orders/delivery-otp-card.tsx` | Buyer pastes 6-digit OTP, hits Confirm delivery → escrow released. Includes "Resend code" |
| `SavedAddressesPicker` | `components/orders/saved-addresses-picker.tsx` | Lists saved address chips; auto-fills the default one on checkout |

### UI integrations
- **`/seller-orders`** — `TrackingEditor` appears on every shipped/delivered order card.
- **`/dashboard/orders/[id]`** — replaces the static "your order is on the way" hint with `TrackingDisplay` + `DeliveryOtpCard`. The OTP card refetches the order after a successful confirm so the page transitions to the "completed" state.
- **CheckoutModal** — `SavedAddressesPicker` chips above the address textarea, plus a "Save this address for next time" checkbox + label input that POSTs the address to `/api/saved-addresses` after order creation.

### Behaviour notes
- Tracking columns and `saved_addresses` table are gracefully handled: the GET endpoint returns an empty list if the table is missing, and the PATCH endpoint surfaces a clear "run the migration" error if the columns are missing.
- The OTP itself is generated and dispatched by the existing backend pipeline when the seller marks "shipped" — the new frontend just gives the buyer a place to enter it.
- The OTP resend endpoint now allows the buyer or seller to request a fresh code (previously admin-only); this works because the OTP is still hashed and short-lived in `delivery_otps`.
