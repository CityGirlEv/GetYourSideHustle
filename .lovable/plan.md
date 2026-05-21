## Goal

Pivot from "HIPAA vault with client-side encryption" to a simpler **de-identified scenario** model. The system stores only Safe-Harbor-compliant scenario data and never collects PII. Consumers get a Scenario ID they share with their agent out-of-band.

## What gets removed

- `src/lib/crypto-phi.ts` (AES-GCM/PBKDF2 vault)
- `src/routes/auth.tsx` passphrase setup + vault unlock UI (keep email/password auth)
- `src/components/HipaaAck.tsx` (no longer needed — no PHI)
- `encryption_keys` table
- `clients_encrypted` and `soas_encrypted` tables (replaced)
- All "unlock vault" / "15-minute auto-lock" logic in `app-store.tsx`
- The HIPAA-specific copy and warnings

## What stays

- Supabase auth for **agents/admins only** (consumers never log in)
- `user_roles`, `profiles`, `audit_logs`, `advisor_credits`, `credit_txns`
- The intake wizard UI structure (re-wired to the new model)
- Admin/advisor portals

## New data model

Drop encrypted tables, add:

```text
scenarios
  id                  uuid pk
  scenario_code       text unique  -- "SCN-2026-A7K9-3M2P" (lookup token)
  birth_year          int
  zip3                text(3)
  gender              text
  tobacco             bool
  income_band         text
  cost_preference     text
  medications         jsonb  -- [{name, dosage, frequency}]
  conditions          jsonb  -- ["diabetes", "hypertension"]
  preferences         jsonb  -- plan type, network prefs, etc.
  claimed_by          uuid nullable  -- advisor_id on first lookup
  claimed_at          timestamptz nullable
  created_at          timestamptz
  expires_at          timestamptz   -- created_at + 90 days

scenario_lookup_attempts
  id, advisor_id, code_attempted, succeeded, created_at
  -- used for rate-limiting (max 10 failed/min/advisor)

soas  -- de-identified scope-of-appointment, tied to scenario not person
  id, advisor_id, scenario_id, plan_type, status, signed_at
```

**RLS:**
- `scenarios` INSERT: anyone (anon role) — public scenario creation
- `scenarios` SELECT: only by exact `scenario_code` match via a SECURITY DEFINER function `claim_scenario(code text)` that also enforces claim-lock and rate limit
- No SELECT by `id` directly, no list/browse policy
- `scenario_lookup_attempts`: insert + own-read only

## New routes

- `/` — landing (already exists, update copy)
- `/scenario/new` — **public** consumer wizard (no login)
- `/scenario/created/:code` — **public** confirmation page with the code + "how to contact your agent" instructions
- `/auth` — agent login (simplified, no passphrase)
- `/advisor` — agent dashboard, with "Look up scenario by ID" as the primary action
- `/advisor/scenario/:code` — view fetched scenario, run comparison, generate SOA
- `/admin` — unchanged

## Behavior rules

- Consumer entry: structured fields only (no free-text "notes"). Year-only DOB. ZIP-3 only. No name/email/phone fields exist in the schema.
- Banner on `/scenario/new`: "We do not collect or store your name, address, phone, email, or any way to identify you. After you finish, you'll get a Scenario ID — share it with your agent yourself."
- Scenario code: `SCN-{YYYY}-XXXX-XXXX` from alphabet `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (no 0/O/1/I/L) — easy to read aloud, ~10^24 entropy.
- Agent lookup: must be authenticated, calls `claim_scenario(code)` server fn. First successful lookup sets `claimed_by`; subsequent lookups by different advisors return "already claimed."
- Rate limit: 10 failed lookups per advisor per minute → 429.
- TTL: pg_cron job (or on-read check) deletes scenarios past `expires_at`.
- Audit log: every successful and failed lookup written to `audit_logs`.

## Implementation steps

1. **DB migration** — drop encrypted tables; create `scenarios`, `scenario_lookup_attempts`, new `soas`; create `claim_scenario` SECURITY DEFINER function; RLS.
2. **Remove HIPAA/vault code** — delete `crypto-phi.ts`, `HipaaAck.tsx`; strip vault logic from `app-store.tsx`; simplify `auth.tsx` to plain email/password.
3. **Public scenario wizard** — refactor `IntakeWizard.tsx` for de-identified fields; mount at `/scenario/new`. Add `/scenario/created/$code.tsx` confirmation page.
4. **Advisor lookup** — rewrite `advisor.tsx` with "Enter Scenario ID" as the primary CTA; add `/advisor/scenario/$code.tsx` detail page wired to `claim_scenario` server fn.
5. **Copy + landing page** — update `/` to explain the model; "This system does not store any personally identifiable information. It stores de-identified scenarios only."
6. **Cleanup** — remove dead imports, update routeTree, verify build.

## Copy for the landing/footer banner

> This tool stores only de-identified Medicare scenarios — never your name, address, phone, email, Social Security number, Medicare ID, or date of birth. After entering your scenario you'll receive a Scenario ID. Share it with your licensed agent yourself; we will never contact you.

## What you'll need to do outside the app

Even without PHI, sound practice:
- Disclaimer / Terms of Use page reviewed by counsel
- Privacy policy reflecting the de-identified model
- Make sure agents are trained not to paste names back into the scenario notes (there won't be a notes field, but worth a policy line)
