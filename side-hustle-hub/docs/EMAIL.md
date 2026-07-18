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
| `EMAIL_FROM` | Optional. Full From header, default `Get Your Side Hustle <noreply@notify.getyoursidehustle.com>` |
| `CONTACT_TO` | Optional. Contact-form inbox, default `info@getyoursidehustle.com` |

## 2. Local development

1. Copy `.env.example` guidance into **`.dev.vars`** (gitignored; Wrangler loads it for `npm run dev`):

   ```
   RESEND_API_KEY=re_xxxxxxxx
   ```

2. Do **not** put the key in committed `.env` or any `VITE_*` variable.

3. Run `npm run dev` so Pages Functions see `.dev.vars`.

## 3. Domain / DNS (required for real From addresses)

Intended sender: **`notify.getyoursidehustle.com`** (see `EMAIL_SENDER_DOMAIN` in `src/lib/site-config.ts` and `functions/_lib/email.ts`).

1. Open [Resend → Domains](https://resend.com/domains).
2. Add `notify.getyoursidehustle.com` (or apex `getyoursidehustle.com`).
3. Add the SPF / DKIM / (optional) MX records Resend shows in DNS for `getyoursidehustle.com`.
4. Click Verify in Resend.

**Plan note:** Resend free plans allow **one** domain. If this API key’s account already has `mypartb.com` verified, you cannot add GYSH until you upgrade, remove that domain, or create a **separate Resend account + API key** for GYSH and replace the Pages secret.

Until the GYSH domain is verified, `/api/contact` and password-change notices will fail with a domain error (contact form surfaces a friendly message).

## 4. What the code sends today

| Flow | Endpoint | Behavior |
|------|----------|----------|
| Contact form | `POST /api/contact` | Emails admin inbox via Resend |
| Password change | `POST /api/auth/reset-password` | Still on-screen change with current password; also tries a confirmation email |
| Health | `GET /api/health` | Includes `email: "configured" \| "missing"` |

True “forgot password” email links are **not** implemented yet (UI still says reset link coming soon).

## 5. Deploy

Secrets apply to production Functions after deploy:

```bash
npm run deploy:pages
```

Always deploy from **this** repo so `functions/` ship with the static site.
