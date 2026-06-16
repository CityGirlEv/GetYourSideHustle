# Agent Contributor Guide

## Test policy (mandatory)

Every new piece of functionality MUST ship with automated coverage in the same
change. CI runs `bun run test` (Vitest) and `bun run e2e` (Playwright) on every
PR via `.github/workflows/tests.yml`, so coverage added here runs automatically.

Decision matrix:

| Kind of change                                               | Required coverage                                       |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| Pure logic / utility / parser / validator / formula          | Vitest unit test under `src/**/__tests__/*.test.ts(x)`  |
| Reducer, hook, store, permission gate, data transform        | Vitest unit test (mock IO with `vi.mock`)               |
| Security gate (uploads, role checks, signature verification) | Vitest test for the happy path **and** each reject path |
| New public route (auth gating, redirect, title)              | Add a case to `e2e/smoke.spec.ts`                       |
| New user-facing flow (form submit, multi-step wizard, modal) | Playwright spec under `e2e/*.spec.ts`                   |
| Server function (`createServerFn`)                           | Vitest test for the handler + auth/validation paths     |
| Pre-existing edge function change                            | `supabase--test_edge_functions` Deno test               |
| Pure UI restyle with no behavior change                      | No new test required                                    |

Rules of thumb:

- If you write a new exported function, write a Vitest test for it in the same change.
- If you add a new route file in `src/routes/`, add a smoke case (auth gate +
  title or one visible element) to `e2e/smoke.spec.ts`.
- If you add a new failure / reject path to existing security code, add a test
  for that reject path — never just the happy path.
- Before finishing a change, run `bun run test` locally and confirm green.

Do not weaken tests to make them pass — fix the code or update the assertion
to reflect the intended new behavior.

## Where tests live

- Unit tests: `src/lib/__tests__/*.test.ts(x)` (co-located by module name)
- E2E smoke: `e2e/smoke.spec.ts` (fast public-surface coverage)
- E2E flows: `e2e/<feature>.spec.ts`
- Edge function tests: `supabase/functions/<name>/*_test.ts`

## CI

Both suites are wired in `.github/workflows/tests.yml`. New `*.test.ts(x)` and
`*.spec.ts` files under the paths above are picked up automatically — no
workflow edits needed when adding tests.
