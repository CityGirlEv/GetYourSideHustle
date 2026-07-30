# GYSH email (Resend) setup

Provider: **Resend** (same pattern as Munties: `RESEND_API_KEY` + `notify.` sender domain).

## 1. API key (production)

Already uploaded as a Cloudflare Pages **secret** (not a build env var, not `VITE_*`):

```bash
# From side-hustle-hub (stdin = key; do not put the key in git)
echo YOUR_KEY | node --use-system-ca ../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js pages secret put RESEND_API_KEY --project-name=getyoursidehustle
```

Optional secrets/vars on the same Pages project:

| Name | Purpose |
|------|---------|
| `RESEND_API_KEY` | Required. Resend API key (`re_…`) |
| `EMAIL_FROM` | Optional. Full From header, default `Get Your Side Hustle <info@getyoursidehustle.com>` |
| `CONTACT_TO` | Optional. Ops inbox (plus partner admins Tina / Evelyn / Lyriq always get form + signup alerts). Default `info@getyoursidehustle.com` |

## 2. Local development

1. Copy `.env.example` guidance into **`.dev.vars`** (gitignored; Wrangler loads it for `npm run dev`):

   ```
   RESEND_API_KEY=re_xxxxxxxx
   ```

2. Do **not** put the key in committed `.env` or any `VITE_*` variable.

3. Run `npm run dev` so Pages Functions see `.dev.vars`.

## 3. Domain / DNS (required for real From addresses)

Intended sender: **`getyoursidehustle.com`** (verified on the Get Your Side Hustle Resend account).

1. Open [Resend → Domains](https://resend.com/domains) on the **Get Your Side Hustle** account.
2. Confirm apex `getyoursidehustle.com` is **Verified** (sending enabled).
3. Production secrets: `RESEND_API_KEY` + `EMAIL_FROM=Get Your Side Hustle <info@getyoursidehustle.com>`.

Use a **separate** Resend account/key from Munties (free plans are one domain per account).

## 4. What the code sends today

| Flow | Endpoint | Behavior |
|------|----------|----------|
| Contact form | `POST /api/contact` | Emails admin inbox via Resend |
| Forgot password | `POST /api/auth/forgot-password` | Checks account email, emails one-time reset link via Resend |
| Confirm reset | `POST /api/auth/confirm-password-reset` | Sets new password from emailed token |
| Password change | `POST /api/auth/reset-password` | Optional known-current-password change + confirmation email |
| Daily Admin/QA digest | Cron + admin UI | Personal sprint summary (see below) |
| Health | `GET /api/health` | Includes `email: "configured" \| "missing"` |

Forgot-password UI: Login → Forgot / Reset password? → enter account email → Resend link → open link → choose new password.

## 4b. Daily Admin/QA digest (America/Chicago)

**Timezone:** `America/Chicago` (US Central). Digests are keyed by the Chicago calendar date and intended for **12:01** local time.

**Content (per Admin/QA recipient):** tasks + tests broken down by sprint — outstanding, recently updated (48h), newly assigned (recent `date_assigned`), and reassigned away (`assignment_events` + test history).

| Piece | Detail |
|-------|--------|
| Template slug | `daily_admin_digest` (Email Templates admin page) |
| Cron API | `POST /api/cron/daily-digest` with `Authorization: Bearer $CRON_SECRET` (or `x-cron-secret`) |
| Admin send | Email Templates → **Send digests now** → `POST /api/email/digest/send` |
| Evelyn test | Email Templates → **Test digest → Evelyn** → `POST /api/email/digest/send-evelyn-test` |
| Preview | Select **Daily Admin/QA digest** on Email Templates (sample), or `GET /api/email/digest/preview` |

Cloudflare **Pages** cannot host `[triggers] crons`. A companion Worker lives at `workers/daily-digest/`:

```bash
# One-time: same secret on Pages + Worker
openssl rand -hex 24 | node --use-system-ca ../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js pages secret put CRON_SECRET --project-name=getyoursidehustle
# then from workers/daily-digest:
#   wrangler secret put CRON_SECRET
#   wrangler deploy
```

Worker crons: `1 17 * * *` and `1 18 * * *` UTC (covers CDT/CST 12:01). The API only sends inside the Chicago 12:00–12:14 window unless `?force=1` / admin force is used, and skips duplicates via `digest_sends`.

## 5. Deploy

Secrets apply to production Functions after deploy:

```bash
npm run deploy:pages
```

Always deploy from **this** repo so `functions/` ship with the static site.
