# Ecommerce Mild — Mulaba

**Version: Mild** · Independent Next.js 15 repository · Light theme · South Africa / ZAR

A complete source implementation for this tier, with separate storefront and admin routes. It shares the same secure core architecture as the other editions, but includes only this tier's features and those below it.

## Included in Mild

Everything in Basic, plus:

- Multi-image gallery (up to eight uploaded images), UI transitions and polished states.
- Stock quantities, low-stock indicators and safe stock allocation.
- Saved customer phone/address, checkout autofill, admin customer list and order history.
- Ranked full-text product search and dedicated category pages.
- 30-day revenue chart, top products and orders by status using Recharts.
- Sequential order numbers, printable invoice-style order receipts and status emails.

**Excluded:** behavior tracking/funnels, reviews, wishlists, coupons, CSV reports, recovery emails and advanced roles.

### Stock and order handling

Stock is checked at checkout and allocated atomically when payment is verified. Pending checkouts do not reserve stock. If another purchase takes the remaining stock, the successful payment is retained and the order becomes `on_hold`; the stock never goes negative. Restock and use the admin action to move it to `processing`, or arrange a refund in Paystack. Duplicate verification cannot deduct stock twice. Product edits use optimistic stock checks, so an outdated admin form cannot silently overwrite a purchase's stock deduction.

The payment confirmation includes the processing/on-hold status. Later processing, shipped and delivered transitions queue their own status emails. Reports paginate through all matching rows rather than silently stopping at Supabase's default 1,000-row limit. Report timestamps are UTC. Top-product values are gross item sales; paid revenue is based on verified order totals.

## Stack

Next.js **15.5.28** (App Router), TypeScript **5.9.3**, Tailwind CSS, shadcn-compatible local UI primitives, Supabase Auth/PostgreSQL/RLS, Cloudflare R2, Resend, Paystack and Zustand. Mild/Pro include Recharts; Pro also uses Sonner. Dependencies and the npm lockfile are pinned. An npm override pins PostCSS to 8.5.30 to replace Next.js 15's older bundled dependency while retaining the requested Next.js major version. Real production data always comes from Supabase, not the demo catalog.

## Run the storefront

Requires Node.js 22 or newer (the checks were run on Node 24).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The supplied environment example enables an explicitly labelled, read-only **demo catalog**. Cart interactions work; payments are disabled. Demo products are not inserted into your real database. Admin and customer accounts require Supabase and never have an authentication bypass.

## Connect the services

Use a **separate Supabase project for this repository**. Do not run the three repositories' migrations against one database. Each repository includes its own complete migration chain.

1. Create a Supabase project. In SQL Editor, run every file in `supabase/migrations/` in filename order. Alternatively use the Supabase CLI (`npx supabase --help`, then the documented link/db-push workflow). The migrations target a fresh project and create all tables, policies, restricted RPCs, and signup triggers.
2. Copy the project URL and publishable key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Put a **server-only** Supabase secret key (or legacy service-role key) in `SUPABASE_SECRET_KEY`.
3. In Supabase Auth, enable email/password and email confirmation. Set the Site URL to your app's origin and add `https://YOUR-DOMAIN/auth/callback` to allowed redirect URLs. Add the localhost callback for development. Configure a production SMTP sender for Auth confirmation emails; the application's Resend integration sends order emails, not Supabase's Auth messages.
4. Register normally through `/login`, confirm the email, then promote that exact account in SQL Editor:

```sql
-- Replace this with your own verified account's email.
update public.accounts
set role = 'admin'
where user_id = (
  select id from auth.users where email = 'you@example.com'
);
```

Only trusted database administration can change roles. User-editable signup metadata is never used for authorization. Visit `/admin` after signing in.

5. Create a Cloudflare R2 bucket and an S3 API token scoped to that bucket. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`. Enable a public custom domain and set `R2_PUBLIC_URL` to that HTTPS origin. This is **not** the `r2.cloudflarestorage.com` S3 API endpoint. Uploads go through the authenticated server, so browser PUT CORS is unnecessary. JPEG/PNG/WebP uploads are limited to 3 MB, decoded, resized, and re-encoded as WebP before storage. Object keys are random. Removing a product preserves order snapshots; it does not automatically delete its R2 objects.
6. Set a **Paystack test secret key** in `PAYSTACK_SECRET_KEY`. Configure this exact webhook URL in the matching test dashboard:

```text
https://YOUR-DOMAIN/api/payments/webhook
```

The callback is generated automatically as `/checkout/return`. Enable ZAR on your Paystack account. This implementation intentionally uses **South Africa / ZAR** throughout and includes delivery in product prices. It does not integrate shipping carriers, VAT calculations, or refunds. Configure your actual commercial policies before selling.

7. Verify your sending domain with Resend, set `RESEND_API_KEY`, and use an address on that verified domain for `RESEND_FROM`.
8. Set `NEXT_PUBLIC_SITE_URL` to the exact browser origin, without a trailing slash. CSRF checks compare mutation origins with this value. Configure preview environments separately if they use another origin.
9. Generate `CRON_SECRET` with a secure random generator (for example `openssl rand -hex 32`). `vercel.json` schedules a daily retry pass over the transactional email outbox. Normal confirmation emails are attempted immediately after settlement. Failed jobs have leases and a ten-attempt limit; inspect `email_outbox` to investigate failures. After correcting the sender/configuration, an operator can reset `attempts` and `lease_until` on unsent rows. Use a more frequent authenticated scheduler if daily retry is too slow for your business.
10. Set `NEXT_PUBLIC_DEMO_MODE=false`, add real products and images in `/admin/products`, and redeploy. Public environment variables are embedded at build time.

Never commit `.env.local`, service keys, R2 credentials, or Paystack secrets. `.gitignore` excludes all real environment files.

## Payment and order guarantees

- Browser requests contain product IDs and quantities, never authoritative prices.
- The database snapshots prices and creates an order in a transaction before Paystack is initialized. Amounts use integer cents.
- A checkout key belongs to one user and one cart/address fingerprint. Retry requests reuse the same pending order.
- Callback verification requires the signed-in order owner. Webhooks require an HMAC-SHA512 signature over the raw request body. Both paths independently verify the transaction with Paystack.
- Reference, amount, currency and successful status must match before settlement. Duplicate notifications do not create duplicate orders or repeat settlement.
- Email jobs are inserted with the payment transaction and dispatched separately. A transient email failure does not turn a successful payment into a failed payment.
- An unpaid order can be cancelled. A late verified successful payment is recorded instead of discarded. Paid order transitions are constrained; the UI cannot mark an unpaid order as fulfilled.
- If initialization loses its network response, the order remains pending. Retry the same checkout or inspect/verify the existing reference; **do not assume a network error means no charge**. Refunds are handled in Paystack's dashboard, outside this starter.

## Deploy to Vercel

1. Import this GitHub repository as a Next.js project.
2. Use the repository root, `npm ci`, and `npm run build`. Choose Node.js 22 or 24.
3. Add the environment variables for the correct Vercel environment before building. Keep all secret keys server-only.
4. Configure Supabase redirects, the Paystack webhook, your R2 public domain, and your Resend sender for the deployed origin.
5. Run a full **test-mode** purchase: signup/confirmation → login → product upload → add to cart → Paystack → order history → admin fulfilment → email.
6. Verify the webhook also completes the order when the buyer closes the payment tab. Repeat delivery of the same webhook and confirm there is no duplicate order or stock adjustment.
7. Only switch Paystack to live credentials after that test passes. Use the live dashboard webhook configuration too.

No infrastructure has been provisioned by this repository. No real service secrets are included.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

The test suite executes the SQL migrations in embedded PostgreSQL (PGlite), with distinct anonymous, authenticated, and service roles. It tests RLS, privilege escalation, cross-account reads, server-owned prices, amount mismatches, idempotency, status transitions and email job claims. Payment tests cover tampered webhook signatures and client price injection.

Production builds and these local tests are verified. Live Supabase Auth, R2 uploads, real Paystack requests, Resend delivery, and browser-based visual QA still require your configured deployment. `.github/workflows/check.yml` reruns the automated checks on push and pull request.

## Structure

```text
src/app/                 App Router pages and server API handlers
src/components/          Storefront, account and admin components
src/components/ui/       shadcn-style Radix/CVA button, input and badge primitives
src/lib/                 Authentication, validation, payment and email services
src/lib/supabase/        Separate browser, cookie-bound server and privileged clients
src/stores/cart.ts       Persisted Zustand cart
supabase/migrations/     Ordered schema, RLS and transaction functions
tests/                   Payment and actual PostgreSQL security tests
.env.example             Placeholder configuration only
vercel.json              Authenticated email retry schedule
```

Protected pages and every privileged API independently authorize the caller; middleware is only an additional guard. All exposed tables have RLS. Business RPCs use invoker security and are revoked from public/browser roles. The only definer functions are narrow private authorization/signup/email-sync helpers with a fixed search path and explicit execution restrictions.

## Primary integration references

- [Next.js 15 App Router](https://nextjs.org/docs/15/app)
- [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Paystack verification](https://paystack.com/docs/payments/verify-payments/) and [webhooks](https://paystack.com/docs/payments/webhooks/)
- [Cloudflare R2 S3 SDK integration](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)
- [Resend email idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)

Demo photography is served from Unsplash URLs. Replace it with your own authorized product photography uploaded to R2 for production.
