# Threadline Supply

A production-style full-stack t-shirt storefront built with Next.js App Router, TypeScript, Tailwind CSS, Stripe Checkout, PostgreSQL, Prisma, and a protected admin dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Stripe Checkout + webhooks
- PostgreSQL
- Prisma ORM
- Custom admin authentication with signed HTTP-only cookies
- Vercel Blob for image uploads
- Vercel-ready deployment structure

## Features

### Storefront
- Brand-led homepage with featured products
- `/products` catalog with search, size, color, and featured filters
- Product detail pages with image gallery, size/color selection, quantity selection, and add-to-cart flow
- Persistent cart stored in local storage
- Responsive shopping cart drawer and dedicated cart page

### Checkout and orders
- Real Stripe Checkout session creation
- Card payments via Stripe-hosted checkout
- Shipping address collection and automatic tax support through Stripe
- Inventory reservation during checkout session creation
- Stripe webhook processing for completed, expired, and failed checkout sessions
- Order persistence in PostgreSQL after successful payment
- Public order confirmation page that waits for webhook completion

### Admin
- Admin login protected by an HTTP-only signed session cookie
- Dashboard overview with product, order, revenue, and low-stock summaries
- Product CRUD with variants, featured flag, visibility toggle, and inventory management
- Vercel Blob-based image uploads plus manual image URL entry
- Order viewer with line items and totals

## Project structure

```text
app/
  (store)/
    page.tsx
    products/
    cart/
  admin/
    login/
    (dashboard)/
  api/
    checkout/
    orders/lookup/
    stripe/webhook/
    upload/
  checkout/
components/
  admin/
  layout/
  store/
  ui/
lib/
prisma/
  schema.prisma
  seed.ts
public/products/
```

## Environment variables

Copy `.env.local.example` to `.env.local` and set these values:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` locally and your production URL on Vercel
- `SESSION_SECRET`: long random string used to sign admin sessions
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: signing secret from Stripe CLI or Stripe dashboard
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for admin image uploads
- `ADMIN_EMAIL`: seed admin email
- `ADMIN_PASSWORD`: seed admin password

## Local setup

1. Install dependencies.

```bash
npm install
```

If the repository lives inside a synced folder such as OneDrive, local `next build` can stall for a very long time on Windows. If that happens, move or copy the project to a normal local path such as `C:\projects\tshirtWebsite` before building.

2. Create `.env.local` from `.env.local.example` and fill in the values.

3. Apply the included Prisma migration.

```bash
npx prisma migrate dev
```

4. Seed the admin user and sample t-shirt catalog.

```bash
npm run prisma:seed
```

5. Start the dev server.

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

7. Sign in at `/admin/login` using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from your environment file.

## Stripe local webhook setup

You need the webhook running locally or completed Stripe payments will not create orders.

1. Install and authenticate the Stripe CLI.
2. Forward Stripe events to the local webhook route.

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

3. Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET` in `.env.local`.
4. Keep the Stripe listener running while testing checkout locally.

Subscribe the endpoint to these events:

- `checkout.session.completed`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`

## Test payments

Use Stripe test mode and a standard test card such as:

- Card number: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any valid ZIP/postal code

## Deployment to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Create a Vercel project for the repo.
3. Provision a PostgreSQL database.
   Good options: Vercel Postgres, Neon, Supabase, or Railway.
4. Create a Vercel Blob store and copy its `BLOB_READ_WRITE_TOKEN`.
5. Add all environment variables from `.env.local.example` in the Vercel project settings.
6. Set `NEXT_PUBLIC_SITE_URL` to your production domain, for example `https://shop.yourbrand.com`.
7. Deploy.

The project build script runs `prisma migrate deploy` before `next build`, so production migrations are applied during deploy as long as the production database is reachable.

If you want sample products in production, run the seed script once against the production database after deployment.

## Production Stripe webhook setup

After the site is deployed, create a webhook endpoint in the Stripe dashboard:

- Endpoint URL: `https://your-domain.com/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `checkout.session.async_payment_failed`

Then copy the production webhook signing secret into the Vercel environment variable `STRIPE_WEBHOOK_SECRET` and redeploy if needed.

## Switching from Stripe test mode to live mode

1. Replace `STRIPE_SECRET_KEY` with the live secret key.
2. Replace `STRIPE_WEBHOOK_SECRET` with the live-mode webhook signing secret.
3. Confirm your production domain is set in `NEXT_PUBLIC_SITE_URL`.
4. Verify your Stripe account has live payments enabled.
5. Confirm tax settings and any receipt preferences in Stripe dashboard.
6. Run a real purchase with a small live-price product before announcing the store publicly.

## Notes about image uploads

- Admin uploads use Vercel Blob and require `BLOB_READ_WRITE_TOKEN`.
- The sample catalog already uses local images under `public/products`, so the store still renders without Blob configured.
- Admins can also paste an image URL manually if they want to host images elsewhere.

## Testing checklist

- Add a product to cart from a product detail page.
- Refresh the page and confirm the cart still contains the item.
- Update quantity in the drawer or cart page and confirm totals change.
- Remove an item and confirm subtotal updates.
- Start Stripe Checkout and confirm redirection succeeds.
- Complete a test payment and confirm `/checkout/success` resolves into a saved order.
- Confirm the order appears under `/admin/orders`.
- Confirm inventory decreases after a successful payment.
- Confirm an expired or failed checkout releases reserved inventory.
- Create, edit, and delete a product from `/admin/products`.
- Upload a product image from the admin when Blob is configured.

## Verification status

Verified locally with:

- `npm install`
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npm run prisma:seed`
- `npx tsc --noEmit`
- `npx eslint . --max-warnings=0`
- `npm run build`

Important local note: in the original workspace path under OneDrive, `next build` stalled for an extended period. The same code and dependencies built successfully from a plain local path outside OneDrive, which points to a filesystem/sync performance issue rather than an application build error.
