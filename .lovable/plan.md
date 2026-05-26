## Goal

Move Test Plan + Task Sheet from browser localStorage to Lovable Cloud so every admin/QA sees the same data. Add a one-time "Sync this browser to cloud" button. Never override notes on conflict — always merge as an append-only history.

## Database (one migration)

**`test_results`** — one row per test case id
- `test_id` (text, PK), `status`, `severity`, `assignee`, `sprint_id`
- `description_override` (jsonb, nullable) — `{title, steps, expected, notes}`
- `qa_notes` (jsonb, default `[]`) — `[{author_id, author_name, text, at}]` append-only
- `dev_notes` (jsonb, default `[]`) — same shape
- `updated_at`, `updated_by`
- RLS: admin/qa read+write all; agent reads rows where assignee = them.

**`task_rows`** — replaces `SEED_TASK_ROWS`
- `id` (text, PK e.g. T-101), `description`, `category`, `priority`, `status`,
  `assign_by`, `assigned_to`, `notes`, `path`, `sort_order`, `updated_at`, `updated_by`
- RLS: admin read+write all.

**`test_evidence_index`** — DB pointer to files already in the `test-evidence` bucket
- `id` (uuid), `test_id`, `storage_path`, `file_name`, `size`, `uploaded_by`, `uploaded_at`
- RLS: admin/qa read all; uploader read+delete own; agent reads files for tests assigned to them.

Trigger auto-stamps `updated_at` / `updated_by` from `auth.uid()`.

## Notes merge rule

QA and Dev notes become append-only JSONB arrays. Each save pushes a new entry `{author_id, author_name, text, at}`. UI shows the most recent entry inline and a "history" expander. The Sync button imports each local note as a single entry stamped with the current user — nothing is ever overwritten.

## Code changes

**`src/lib/test-results.functions.ts`** (new, server fns)
- `listTestResults()` — returns all rows (admin/qa) or assigned rows (agent)
- `upsertTestField({test_id, field, value})` — status/severity/assignee/sprint/description_override
- `appendTestNote({test_id, kind: 'qa'|'dev', text})` — pushes entry, never overwrites

**`src/lib/tasks.functions.ts`** (new)
- `listTaskRows()`, `upsertTaskRow(row)`, `deleteTaskRow(id)`, `reorderTasks(ids)`

**`src/lib/evidence.functions.ts`** (new)
- `registerEvidence({test_id, storage_path, file_name, size})` — called after upload
- `listEvidence(test_id)`

**`src/lib/test-plan.ts`** — replace localStorage getters/setters with a React Query–backed cache reading from the server fns. Keep the existing `TEST_*_KEY` helpers exported as `legacy*` for the sync button to read once. New writes hit the DB only.

**`src/lib/tasks-sheet.ts`** — same treatment. `SEED_TASK_ROWS` becomes a server-side fallback used only when the table is empty (first-run seed).

**`src/components/SyncBrowserToCloud.tsx`** (new) — a single button that:
1. Reads every `test-status:*`, `test-qa-note:*`, `test-dev-note:*`, `test-severity:*`, `test-assignee:*`, `test-sprint:*`, `test-desc:*` key from localStorage.
2. Reads the saved Task Sheet rows.
3. Sends them in one batch to a `syncLocalToCloud` server fn.
4. Marks `localStorage.setItem('cloud-synced-at', isoString)` so the button disables itself after a successful sync (still re-runnable from a small "Re-sync" link in case Catria adds more later).
5. Toast with counts: "Imported 47 statuses, 12 notes, 3 tasks." Notes are appended — duplicates with identical text + author are deduped.

Place the button:
- `/testing` (top of test plan tab) — visible to admin + qa
- `/tasks` — visible to admin

## Migration order

1. Run the SQL migration (you approve).
2. I update the code: server fns, hook rewrites, sync button, evidence registration in `test-evidence.ts`.
3. You click "Sync this browser to cloud" once on `/testing` and once on `/tasks`.
4. Catria logs in on her browser and clicks the same button — her notes are appended to yours, not overwritten.

## What stays the same

- The `test-evidence` storage bucket and existing files — only a DB index row is added per file going forward (and on sync for the files you've already uploaded, if any).
- Test case definitions in `test-plan.ts` (titles, steps, expected) remain the source of truth; only per-test mutable state moves to the DB.

## Out of scope

- Real-time updates between browsers (next step if you want it; currently a refresh shows new data).
- Backfilling NDA/scenario/audit data (already in DB).
