# Stripe billing setup (test mode)

This app uses **Stripe Checkout** for subscriptions and one-time lead bundles, **Stripe Customer Portal** for self-service billing, and a **webhook** to sync subscription state into Supabase.

## 1. Stripe Dashboard (test mode)

1. Open [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard) and stay in **Test mode**.
2. Create **Products** and **Prices**:
   - **Subscription + Leads (Intro)** — recurring monthly → copy Price ID
   - **Subscription + Leads (Regular)** — recurring monthly → copy Price ID
   - **Pay-as-you-go bundles** (1 / 2 / 3 leads) — one-time prices → copy Price IDs
3. Enable **Customer Portal** (Settings → Billing → Customer portal).
4. Create a **Webhook endpoint** pointing to:
   ```
   https://mypartb.com/api/stripe/webhook
   ```
   Events to subscribe:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook **Signing secret** (`whsec_...`).

## 2. Environment variables

### Local development (`.env` at project root)

Copy from `.env.example` and set:

| Variable | Example | Notes |
|----------|---------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Server only — never expose to client |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe webhook endpoint |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Optional for future embedded UI |
| `STRIPE_PRICE_SUBSCRIPTION_INTRO` | `price_...` | Intro monthly plan |
| `STRIPE_PRICE_SUBSCRIPTION_REGULAR` | `price_...` | Regular monthly plan |
| `STRIPE_PRICE_PAYG_1` | `price_...` | 1-lead bundle |
| `STRIPE_PRICE_PAYG_2` | `price_...` | 2-lead bundle |
| `STRIPE_PRICE_PAYG_3` | `price_...` | 3-lead bundle |

Use the Stripe CLI for local webhooks:

```bash
stripe listen --forward-to localhost:8081/api/stripe/webhook
```

Use the signing secret printed by `stripe listen` as `STRIPE_WEBHOOK_SECRET` locally.

### Cloudflare Pages / Worker (production & preview)

In the Cloudflare dashboard → **Workers & Pages** → project **mypartb** → **Settings** → **Environment variables**:

Add the same variables for **Production** and **Preview**:

- `STRIPE_SECRET_KEY` — mark as **Encrypted**
- `STRIPE_WEBHOOK_SECRET` — **Encrypted**
- `STRIPE_PRICE_SUBSCRIPTION_INTRO`
- `STRIPE_PRICE_SUBSCRIPTION_REGULAR`
- `STRIPE_PRICE_PAYG_1`
- `STRIPE_PRICE_PAYG_2`
- `STRIPE_PRICE_PAYG_3`
- `VITE_STRIPE_PUBLISHABLE_KEY` (optional)

Redeploy after saving variables (`npm run deploy`).

> Secrets are read via `getRuntimeSecret()` from Cloudflare bindings / worker `env`, not from source code.

### Supabase

Run the migration:

```bash
supabase db push
# or apply: supabase/migrations/20260616120000_stripe_billing.sql
```

**No Stripe secrets belong in Supabase.** Supabase only stores synced billing rows (`agents`, `subscriptions`, `lead_credits`, `payments`).

Optional: if you use Supabase Edge Functions later, store `STRIPE_SECRET_KEY` as a Supabase secret:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

This app’s webhook and checkout run on **Cloudflare**, not Supabase Edge Functions.

## 3. App endpoints

| Endpoint | Type | Purpose |
|----------|------|---------|
| `POST /api/stripe/webhook` | HTTP route | Stripe webhook (raw body + signature) |
| `createStripeCheckoutSession` | Server function | Authenticated checkout |
| `createStripeCustomerPortalSession` | Server function | Billing portal |
| `registerCustomerAndCheckout` | Server function | Public signup + checkout |
| `getBillingStatus` | Server function | Subscription snapshot |

## 4. User flow

1. Public **`/pricing`** page — choose a plan.
2. New users: signup + NDA → Stripe Checkout.
3. Returning users: sign in → Checkout from pricing.
4. Webhook syncs subscription → grants **`agent`** role + **`lead_credits`**.
5. **`/agent`** unlocks when subscription is **`active`** or **`trialing`** (admins always allowed).
6. Billing tab → **Manage billing** opens Stripe Customer Portal.

## 5. Database tables

| Table | Purpose |
|-------|---------|
| `agents` | `user_id` ↔ `stripe_customer_id` |
| `subscriptions` | Stripe subscription mirror |
| `lead_credits` | Monthly / purchased lead balance |
| `payments` | Invoice & checkout payment log |
| `stripe_webhook_events` | Webhook idempotency |

New role: **`customer`** — assigned at self-serve signup before payment completes.

## 6. Test cards

Use [Stripe test cards](https://docs.stripe.com/testing), e.g. `4242 4242 4242 4242`, any future expiry, any CVC.
