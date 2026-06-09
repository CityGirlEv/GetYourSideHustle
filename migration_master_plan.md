# Lovable Migration Master Plan (DevOps & Hosting Transition)

This document serves as the complete technical source of truth for migrating the private GitHub repositories under the GitHub account **`CityGirlEv`** off of the Lovable platform and its credit system. 

Use this file as context for ChatGPT or other AI engines to assist in self-hosting setups, deployment scripting (Docker, PM2, Cloudflare wrangler), and configuration of replacement services.

---

## 1. Project Migration Summary Table

| Project Name | Purpose | Tech Stack | Hosting Recommendation | Build Status | Environment Variables Required | Est. Migration Time | Migration Risk | Priority (1-10) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`mypartb`**<br>(Medicare Plan Optimizer) | Medicare plan evaluation and agent management console. | React 19, TanStack Start, Vite, Tailwind CSS (v4), Supabase | **Cloudflare Pages** (Serverless SSR) | **Passing** | `SUPABASE_URL`<br>`SUPABASE_PUBLISHABLE_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY`<br>`VITE_SUPABASE_URL`<br>`VITE_SUPABASE_PUBLISHABLE_KEY`<br>`RESEND_API_KEY` (Direct mail config) | 1-2 Hours | **Low** (No Stripe or proprietary OAuth dependencies) | **10** (Easiest, highest confidence) |
| **`munties-ai-prop-mgr`**<br>(AI Property Manager) | Property management portal with automated document parsing and tenant profiles. | React 19, TanStack Start, Vite, Tailwind CSS (v4), Supabase, Deno | **Cloudflare Pages** (Frontend)<br>**Supabase Edge Functions** (Backend) | **Passing** | `SUPABASE_URL`<br>`SUPABASE_PUBLISHABLE_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY`<br>`VITE_SUPABASE_URL`<br>`VITE_SUPABASE_PUBLISHABLE_KEY`<br>`GOOGLE_DRIVE_API_KEY` | 4-6 Hours | **Moderate** (Requires deploying Deno backend functions and setting up custom Google OAuth) | **7** (High savings, clear path) |
| **`rassavonrealtyfbrollout`**<br>(Social Realty Rollout) | Marketing Automation & Lead Gen Hub for Rollover Property Listings. | React 19, TanStack Start, Vite, Tailwind (v4), Supabase | **Cloudflare Pages** (Serverless SSR) | **Passing** | `SUPABASE_URL`<br>`SUPABASE_PUBLISHABLE_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY`<br>`VITE_SUPABASE_URL`<br>`VITE_SUPABASE_PUBLISHABLE_KEY`<br>`FIRECRAWL_API_KEY`<br>`GOOGLE_DRIVE_API_KEY`<br>`RAPIDAPI_ZILLOW_KEY`<br>`REALTOR_RAPIDAPI_HOST`<br>`REALTOR_RAPIDAPI_KEY`<br>`RENTCAST_API_KEY`<br>`TWILIO_API_KEY`<br>`TWILIO_AUTH_TOKEN`<br>`TWILIO_WHATSAPP_FROM`<br>`TWILIO_WHATSAPP_TO_EVELYN`<br>`TWILIO_WHATSAPP_TO_PAULINA` | 5-7 Hours | **Moderate** (Relies on heavy third-party listing APIs, Twilio triggers, and Google OAuth setup) | **5** (Medium complexity) |
| **`muntie-ev-ai-studio`**<br>(AI Agents Studio) | Subscription-based AI Agent platform & transactional hub. | React 19, TanStack Start, Vite, Tailwind (v4), Supabase, Bun | **Railway** or **Fly.io** (Runs containerized Node/Bun SSR) | **Passing** | `SUPABASE_URL`<br>`SUPABASE_PUBLISHABLE_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY`<br>`VITE_SUPABASE_URL`<br>`VITE_SUPABASE_PUBLISHABLE_KEY`<br>`DATABASE_URL` (direct PG connection)<br>`SITE_URL`<br>`VITE_SITE_URL`<br>`STRIPE_SECRET_KEY`<br>`TWILIO_API_KEY`<br>`TWILIO_FROM_NUMBER`<br>`RESEND_API_KEY` | 8-12 Hours | **High** (Active billing, Stripe webhooks, subscription sync, custom email infra) | **3** (High complexity, billing risk) |

---

## 2. Technical Profile & Shared Dependencies

All audited projects share a modernized, high-performance web architecture:
* **Frontend**: React 19, Vite, Tailwind CSS (v4), Radix UI primitives, Lucide icons, and Sonner notifications.
* **Routing & State**: TanStack Router (`@tanstack/react-router`) and TanStack Query (`@tanstack/react-query`).
* **SSR Framework & App Server**: TanStack Start (`@tanstack/react-start`) compiling on the Nitro engine.
* **Database & Auth Integration**: Supabase client (`@supabase/supabase-js`) for user authentication, RLS, and table data.
* **Vite Config Dev Wrapper**: `@lovable.dev/vite-tanstack-config` (a development package wrapping Vite config utilities; operates locally and is not a production network blocker).

---

## 3. Independence Roadmap & Blockers

To run these applications fully independent of Lovable's systems, three main technical blockers must be resolved in their configurations:

### A. Replacing `@lovable.dev/cloud-auth-js` (Auth Blocker)
* **Status**: Found in `rassavonrealtyfbrollout` and `munties-ai-prop-mgr`. It proxies OAuth Google login redirects under Lovable's domain credentials.
* **Migration Step**:
  1. Remove `@lovable.dev/cloud-auth-js` from `package.json`.
  2. Rewrite the file `src/integrations/lovable/index.ts` to directly invoke standard Supabase OAuth client methods instead:
     ```typescript
     import { supabase } from "../supabase/client";
     export const lovable = {
       auth: {
         signInWithOAuth: async (provider: "google", opts?: any) => {
           return await supabase.auth.signInWithOAuth({
             provider,
             options: {
               redirectTo: opts?.redirect_uri || window.location.origin + "/auth/callback"
             }
           });
         }
       }
     };
     ```
  3. Configure OAuth Client Credentials (ID and Secret) directly in your Google Developer Console and add them under **Authentication -> Providers -> Google** in your Supabase Console.

### B. Configuring Custom Outgoing Email (`@lovable.dev/email-js`)
* **Status**: Used in `mypartb` and `muntie-ev-ai-studio` to send transactional mail.
* **Migration Step**:
  1. Add a direct mailing provider API key to your environment variables, specifically `RESEND_API_KEY`.
  2. The underlying `@lovable.dev/email-js` helper library checks for the presence of local keys. If `RESEND_API_KEY` is set in the runtime process, it skips Lovable's credit proxy and sends transactional emails directly via Resend.

### C. Deploying Supabase Edge Functions
* **Status**: `munties-ai-prop-mgr` uses a custom administration endpoint under `supabase/functions/admin-users/index.ts`.
* **Migration Step**:
  1. Install the Supabase CLI (`npm install -g supabase`).
  2. Log in and link your local project to your live Supabase database instance:
     ```bash
     supabase login
     supabase link --project-ref [YOUR_SUPABASE_PROJECT_ID]
     ```
  3. Deploy the Deno function from the repository root:
     ```bash
     supabase functions deploy admin-users
     ```
  4. Ensure your project's `SUPABASE_SERVICE_ROLE_KEY` is added to the edge function environment secrets.

---

## 4. Recommended Migration Order (Risk vs. Savings)

1. **`mypartb` (Medicare Plan Optimizer)**: 
   * *Strategy*: Migrate first. Easiest setup, standard Supabase config, zero third-party blockers. 
   * *Hosting*: Deploy on Cloudflare Pages (connect repository, configure environment variables, and build).
2. **`munties-ai-prop-mgr` (AI Property Manager)**:
   * *Strategy*: Migrate second. Teaches you how to deploy Supabase Edge Functions and custom OAuth.
   * *Hosting*: Cloudflare Pages (Frontend) + Supabase Edge Functions (Backend).
3. **`rassavonrealtyfbrollout` (Social Realty Rollout)**:
   * *Strategy*: Migrate third. Requires configuring heavy third-party keys (Firecrawl, Rentcast, Zillow, Twilio WhatsApp templates) and verifying message delivery routes.
   * *Hosting*: Cloudflare Pages.
4. **`muntie-ev-ai-studio` (AI Agents Studio)**:
   * *Strategy*: Migrate last. High complexity due to live subscription management.
   * *Hosting*: Deploy on Railway, Render, or a VPS (Coolify/Dokku) using the Node/Bun dockerized runtime. Make sure to point your production Stripe webhook URLs to your new server domain only after comprehensive testing.
