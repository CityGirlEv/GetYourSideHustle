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
| `EMAIL_FROM` | Optional. Full From header, default `Get Your Side Hustle <noreply@getyoursidehustle.com>` |
| `CONTACT_TO` | Optional. Contact-form inbox, default `info@getyoursidehustle.com` |

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
3. Production secrets: `RESEND_API_KEY` + `EMAIL_FROM=Get Your Side Hustle <noreply@getyoursidehustle.com>`.

Use a **separate** Resend account/key from Munties (free plans are one domain per account).

## 4. What the code sends today

| Flow | Endpoint | Behavior |
|------|----------|----------|
| Contact form | `POST /api/contact` | Emails admin inbox via Resend |
| Forgot password | `POST /api/auth/forgot-password` | Checks account email, emails one-time reset link via Resend |
| Confirm reset | `POST /api/auth/confirm-password-reset` | Sets new password from emailed token |
| Password change | `POST /api/auth/reset-password` | Optional known-current-password change + confirmation email |
| Health | `GET /api/health` | Includes `email: "configured" \| "missing"` |

Forgot-password UI: Login → Forgot / Reset password? → enter account email → Resend link → open link → choose new password.

## 5. Deploy

Secrets apply to production Functions after deploy:

```bash
npm run deploy:pages
```

Always deploy from **this** repo so `functions/` ship with the static site.
