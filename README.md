# VIRTUA — Premium E-Commerce with AR Try-On

A full-stack starter: Next.js 14 (App Router) + TypeScript + Tailwind +
Prisma + NextAuth. Ships with demo data so it looks complete immediately.

## What's included

- Home, Shop (filters/search/sort), Product Detail, Cart, Checkout (3-step)
- Auth: register/login (email + password, NextAuth credentials)
- Account dashboard + order history with a status timeline
- Admin dashboard: revenue/orders/customers stats, product list (toggle
  active, delete), orders list — protected by role + middleware
- AR Try-On Studio: camera permission flow, live preview, product overlay,
  scale/rotate controls, screenshot capture — architecture-ready to plug
  in a real AR engine (WebXR / Three.js / MediaPipe)
- Wishlist (persisted client-side)
- Prisma schema covering products, variants, orders, reviews, coupons,
  AR assets, analytics events, etc.

## What's intentionally simplified (so you can ship something today)

- **Database:** SQLite by default for zero-setup local dev. Swap to
  Postgres for Vercel (see below) — the schema and code don't change.
- **Payments:** the checkout flow is wired end-to-end and creates a real
  order, but the payment step is a visual demo. Before going live, add a
  real gateway (Razorpay/Stripe) and verify payment **server-side** in
  `app/api/orders/route.ts` — never trust a "success" flag from the
  browser.
- **AR:** the overlay is a placeholder (CSS circle that scales/rotates)
  wired to real state — swap the overlay renderer for WebXR/Three.js/
  MediaPipe without touching the rest of the page.
- **Image/file storage:** product images are URLs (Unsplash in demo
  data). For real uploads, add Vercel Blob/Cloudinary and store the
  returned URL the same way.
- **Testing, analytics dashboards, coupons UI, reviews moderation UI:**
  the data models exist (Coupon, AnalyticsEvent, Review.isApproved) but
  there's no admin screen for them yet — straightforward to add on top
  of the admin pattern already in `app/admin/`.

## Local setup

```bash
npm install
cp .env.example .env
# .env already defaults to SQLite — no DB server needed
npx prisma db push
npm run db:seed
npm run dev
```

Visit http://localhost:3000.

**Demo accounts** (created by the seed script):
- Admin: `admin@virtua.com` / `admin123`
- Customer: `customer@virtua.com` / `customer123`

## Deploying to Vercel (with Postgres)

1. Push this repo to GitHub.
2. Create a Postgres database (Vercel Postgres, Neon, or Supabase all work).
3. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
4. In Vercel's project settings, add environment variables from
   `.env.example` — at minimum `DATABASE_URL`, `NEXTAUTH_SECRET`,
   `NEXTAUTH_URL` (your production URL).
5. Run `npx prisma migrate dev --name init` locally against the new
   `DATABASE_URL` to create the migration, commit the generated
   `prisma/migrations` folder.
6. Deploy. Run `npx prisma migrate deploy && npm run db:seed` once
   against production (via Vercel CLI or a one-off script) to seed demo
   data, or replace it with your real catalog.

## Project structure

```
app/            pages (App Router) + api/ route handlers
components/     shared UI (Navbar, Footer, ProductCard, AddToCartPanel)
lib/            prisma client, auth config, cart/wishlist store, utils
prisma/         schema.prisma, seed.ts
types/          shared TypeScript types
```

## Next steps worth prioritizing

1. Real payment gateway + webhook verification
2. Image upload (Cloudinary/Vercel Blob) for the admin product form
3. A real AR engine behind the existing AR Studio UI
4. Coupon validation at checkout
5. Email notifications (order confirmation, shipping updates)
