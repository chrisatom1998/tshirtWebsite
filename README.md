# Threadline Supply

A production-style full-stack T-shirt storefront built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **Stripe Checkout**, **PostgreSQL**, and **Prisma**, with a protected admin dashboard for catalog and order management.

## What this project includes

### Storefront
- Brand-led homepage with featured products
- `/products` catalog with search plus size, color, and featured filters
- Product detail pages with image gallery, variant selection, quantity selection, and add-to-cart flow
- Persistent cart stored in local storage
- Responsive cart drawer and dedicated cart page

### Checkout and orders
- Real Stripe Checkout session creation
- Stripe-hosted card payments
- Shipping address collection and automatic tax support through Stripe
- Inventory reservation during checkout creation
- Stripe webhook handling for completed, expired, and failed checkout sessions
- Order persistence in PostgreSQL after successful payment
- Public checkout success flow that waits for webhook completion

### Admin
- Admin login protected by an HTTP-only signed session cookie
- Dashboard summary cards for products, orders, revenue, and low stock
- Product CRUD with variants, featured flag, visibility toggle, and inventory management
- Image uploads through Vercel Blob, plus manual image URL entry
- Order viewer with line items and totals

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Stripe Checkout + webhooks
- PostgreSQL
- Prisma ORM
- Signed HTTP-only cookie auth for admin access
- Vercel Blob for admin image uploads
- Vercel-ready deployment structure

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

Copy `.env.local.example` to `.env.local` and set the following values.

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Yes | Base URL for local or deployed app |
| `SESSION_SECRET` | Yes | Secret used to sign admin session cookies |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `BLOB_READ_WRITE_TOKEN` | Optional* | Required only if you want admin image uploads via Vercel Blob |
| `ADMIN_EMAIL` | Yes | Seeded admin email |
| `ADMIN_PASSWORD` | Yes | Seeded admin password |

\* The storefront still works without Blob configured because the sample catalog uses local images in `public/products`.

## Quick start

```bash
cp .env.local.example .env.local
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Then:
- Open `http://localhost:3000`
- Sign in at `/admin/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## Local development setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.local.example` and fill in the values.

3. Apply the Prisma migration.

   ```bash
   npx prisma migrate dev
   ```

4. Seed the admin user and sample T-shirt catalog.

   ```bash
   npm run prisma:seed
   ```

5. Start the development server.

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

7. Sign in at `/admin/login` using the admin credentials from your environment file.

### Windows / OneDrive note

If the repository lives inside a synced folder such as OneDrive, local `next build` can stall for a long time on Windows. If that happens, move or copy the project to a normal local path such as `C:\projects\tshirtWebsite` before building.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Generates Prisma client, runs production migrations, and builds the app |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs Next.js linting |
| `npm run prisma:generate` | Generates the Prisma client |
| `npm run prisma:migrate` | Runs Prisma development migrations |
| `npm run prisma:deploy` | Applies Prisma migrations in deploy/production style |
| `npm run prisma:seed` | Seeds the database with the admin user and sample catalog |

## Stripe local webhook setup

Completed Stripe payments will **not** create orders locally unless the webhook listener is running.

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

## Deploying to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Create a Vercel project for the repo.
3. Provision a PostgreSQL database.
   - Common options: Vercel Postgres, Neon, Supabase, or Railway
4. Create a Vercel Blob store and copy its `BLOB_READ_WRITE_TOKEN` if you want admin uploads.
5. Add all environment variables from `.env.local.example` in the Vercel project settings.
6. Set `NEXT_PUBLIC_SITE_URL` to your production domain, for example `https://shop.yourbrand.com`.
7. Deploy.

The build script runs `prisma migrate deploy` before `next build`, so production migrations are applied during deploy as long as the production database is reachable.

If you want sample products in production, run the seed script once against the production database after deployment.

## Production Stripe webhook setup

After deployment, create a webhook endpoint in the Stripe dashboard:

- Endpoint URL: `https://your-domain.com/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `checkout.session.async_payment_failed`

Then copy the production signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy if needed.

## Switching from Stripe test mode to live mode

1. Replace `STRIPE_SECRET_KEY` with the live secret key.
2. Replace `STRIPE_WEBHOOK_SECRET` with the live-mode webhook signing secret.
3. Confirm your production domain is set in `NEXT_PUBLIC_SITE_URL`.
4. Verify your Stripe account has live payments enabled.
5. Confirm tax settings and receipt preferences in the Stripe dashboard.
6. Run a real purchase with a low-cost live product before opening the store publicly.

## Image upload notes

- Admin uploads use Vercel Blob and require `BLOB_READ_WRITE_TOKEN`.
- The sample catalog already uses local images under `public/products`, so the store renders without Blob configured.
- Admins can also paste an image URL manually.

## Testing checklist

- Add a product to cart from a product detail page
- Refresh and confirm the cart still contains the item
- Update quantity in the drawer or cart page and confirm totals change
- Remove an item and confirm subtotal updates
- Start Stripe Checkout and confirm redirection succeeds
- Complete a test payment and confirm `/checkout/success` resolves into a saved order
- Confirm the order appears under `/admin/orders`
- Confirm inventory decreases after a successful payment
- Confirm an expired or failed checkout releases reserved inventory
- Create, edit, and delete a product from `/admin/products`
- Upload a product image from the admin when Blob is configured

## Verification

Verified locally with:
- `npm install`
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npm run prisma:seed`
- `npx tsc --noEmit`
- `npx eslint . --max-warnings=0`
- `npm run build`

## Recommended repo polish

A few easy improvements outside the README:
- Add a short GitHub repository description
- Add the deployed site URL once available
- Add repository topics such as `nextjs`, `typescript`, `stripe`, `prisma`, `postgresql`, and `ecommerce`
- Add 1–3 screenshots or a short GIF of the storefront and admin dashboard
- Add a `LICENSE` file if you want other people to reuse the code
