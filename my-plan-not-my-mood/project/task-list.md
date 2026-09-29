# MY PLAN, NOT MY MOOD — MASTER IMPLEMENTATION TASK LIST

---

## TASK MATRIX

| Task ID | Phase | Workstream | Task | Description | Priority | Tool / Location | Status | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-STR-01** | Phase 1 | Strategy | Brand Strategy & Voice Codification | Produce core mission, vision, voice guidelines, and phrase vault. | CRITICAL | AG / Docs | COMPLETE | Documentation approved and exported to `/docs`. |
| **TSK-PRD-01** | Phase 1 | Product | Merchandising & Catalog Specifications | Define tech specs for tees, hoodies, hats, and desk pads. | HIGH | AG / Docs | COMPLETE | Specs defined with fabric weights and graphic placements. |
| **TSK-UX-01** | Phase 1 | UX / Interactive | "What's Your Mood?" Tool Architecture | Design UX flow, mood-to-plan matrix, and action card specs. | CRITICAL | AG / Docs | COMPLETE | Matrix covers 6 moods with concrete action steps. |
| **TSK-UX-02** | Phase 1 | UX / Interactive | "What Won Today?" Receipt Generator Spec | Specify input form and 9:16 social card generator flow. | HIGH | AG / Docs | COMPLETE | Spec includes image download & social share rules. |
| **TSK-DOC-01** | Phase 1 | Architecture | Cursor Handoff Package Assembly | Assemble complete documentation suite for Cursor development. | CRITICAL | AG / Docs | COMPLETE | 12 core documentation files created and linked. |
| **TSK-DEV-01** | Phase 2 | Development | Frontend Project Setup & Design System | Initialize React/Tailwind project with brand color tokens & fonts. | CRITICAL | Cursor / Web | COMPLETE | Clean build, Tailwind configured, Inter & JetBrains Mono loaded. |
| **TSK-DEV-02** | Phase 2 | Development | "What's Your Mood?" Interactive Component | Build interactive widget on homepage with mood selection & response cards. | CRITICAL | Cursor / Web | COMPLETE | Mood selection triggers plan output & action step. |
| **TSK-DEV-03** | Phase 2 | Development | Product Catalog & Cart Slide-Out | Implement storefront catalog grid, variant picker, and cart drawer. | HIGH | Cursor / Web | COMPLETE | Add to cart updates drawer; cross-sell desk pad visible. |
| **TSK-QA-01** | Phase 2 | QA | Responsive & Accessibility Sweep | Test 320px–1440px breakpoints, keyboard nav, and contrast ratios. | HIGH | QA / Browser | COMPLETE | 0 horizontal scroll at 320px; keyboard accessible focus states. |
| **TSK-DEP-01** | Phase 2 | Deployment | Vercel Deployment & SPA Routing Config | Configure `vercel.json`, SPA fallback rewrites, security headers & Cursor MDC rules. | CRITICAL | Cursor / Vercel | COMPLETE | `vercel.json` formatted for Vercel, SPA rewrites active, local server running on port 3001, 31 Vitest tests passing. |
| **TSK-EML-01** | Phase 3 | Email | Resend Account & Domain Setup | Create Resend account, verify domain, API key, Cloudflare env vars. | CRITICAL | Resend / Cloudflare | IN PROGRESS | See `docs/resend-email-setup.md`; secrets set in Pages dashboard. |
| **TSK-EML-02** | Phase 3 | Email | Signup Pending Email | Send confirmation + pending approval email on Free Member / Beta signup. | CRITICAL | `functions/api/email/signup-pending.ts` | COMPLETE | User receives pending email; optional admin alert. |
| **TSK-EML-03** | Phase 3 | Email | Admin Approval + Login Link Email | When admin sets user pending → active, send approval email with sign-in link. | CRITICAL | `functions/api/email/user-approved.ts` | COMPLETE | Link opens `?auth=login&email=...` with modal prefilled. |
| **TSK-EML-04** | Phase 3 | Email | Email Tests | Vitest coverage for templates, notification client, approval gating. | HIGH | `src/lib/email/__tests__/` | COMPLETE | All email tests pass in `bun run test`. |
| **TSK-EML-05** | Phase 3 | Backend | Server-side User DB (future) | Move users from localStorage to D1/Supabase for cross-device auth + magic links. | HIGH | Cloudflare D1 / Supabase | PENDING | Signups visible to admin on any device; hashed passwords. |
