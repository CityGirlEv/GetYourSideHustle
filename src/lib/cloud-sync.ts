// ============================================================================
// CLOUD SYNC — bridges localStorage-backed test-plan / tasks-sheet state to
// the test_results / task_rows / test_evidence_index tables. Reads from DB
// hydrate localStorage; writes dual-write to both. Notes are append-only
// history on the DB side (latest entry by any author is shown locally).
// ============================================================================
import { supabase } from "@/integrations/supabase/client";
import {
  TEST_CASES,
  TEST_STATUS_KEY, TEST_SEVERITY_KEY, TEST_ASSIGNEE_KEY, TEST_SPRINT_KEY,
  TEST_QA_NOTE_KEY, TEST_DEV_NOTE_KEY, TEST_DESC_KEY,
  type TestStatus, type FailSeverity, type TestDescriptionOverride,
} from "@/lib/test-plan";
import { TASKS_STORAGE_KEY, type TaskRow } from "@/lib/tasks-sheet";

export interface NoteEntry { author_id: string; author_name: string; text: string; at: string }
export type NoteKind = "qa" | "dev";

async function uid(): Promise<{ id: string; name: string } | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const name = (data.user.user_metadata?.full_name as string | undefined)
    || (data.user.email ?? "")
    || "Unknown";
  return { id: data.user.id, name };
}

/** Fire-and-forget upsert of a single test_results column. */
export function cloudPushTest(test_id: string, patch: Partial<{
  status: TestStatus | null;
  severity: FailSeverity | "" | null;
  assignee: string | null;
  sprint_id: string | null;
  description_override: TestDescriptionOverride | null;
}>) {
  if (typeof window === "undefined") return;
  (async () => {
    const u = await uid();
    if (!u) return;
    // Treat empty-string severity / assignee / sprint as null
    const normalized: Record<string, unknown> = { test_id, updated_by: u.id };
    for (const [k, v] of Object.entries(patch)) {
      normalized[k] = v === "" ? null : v;
    }
    const { error } = await supabase.from("test_results").upsert(normalized, { onConflict: "test_id" });
    if (error) console.warn("[cloud-sync] cloudPushTest", error.message);
  })();
}

/** Append a QA or Dev note entry. De-dupes (author_id + text) within last 50. */
export function cloudAppendNote(test_id: string, kind: NoteKind, text: string) {
  if (typeof window === "undefined" || !text.trim()) return;
  (async () => {
    const u = await uid();
    if (!u) return;
    const col = kind === "qa" ? "qa_notes" : "dev_notes";
    const { data: existing } = await supabase
      .from("test_results")
      .select(`${col}`)
      .eq("test_id", test_id)
      .maybeSingle();
    const arr: NoteEntry[] = Array.isArray((existing as Record<string, unknown> | null)?.[col])
      ? ((existing as Record<string, NoteEntry[]>)[col])
      : [];
    // De-dup if last entry by this author matches text
    const lastFromAuthor = [...arr].reverse().find((e) => e.author_id === u.id);
    if (lastFromAuthor && lastFromAuthor.text === text) return;
    const next: NoteEntry[] = [...arr, { author_id: u.id, author_name: u.name, text, at: new Date().toISOString() }];
    const { error } = await supabase
      .from("test_results")
      .upsert({ test_id, [col]: next, updated_by: u.id }, { onConflict: "test_id" });
    if (error) console.warn("[cloud-sync] cloudAppendNote", error.message);
  })();
}

/** Bulk upsert tasks rows (whole array). */
export function cloudPushAllTasks(rows: TaskRow[]) {
  if (typeof window === "undefined") return;
  (async () => {
    const u = await uid();
    if (!u) return;
    const payload = rows.map((r, i) => ({ id: r.id, data: r, sort_order: i, updated_by: u.id }));
    const { error } = await supabase.from("task_rows").upsert(payload, { onConflict: "id" });
    if (error) console.warn("[cloud-sync] cloudPushAllTasks", error.message);
  })();
}

/** Hydrate localStorage from test_results so the existing load*() readers see DB data. */
export async function hydrateTestResultsToLocal(): Promise<number> {
  if (typeof window === "undefined") return 0;
  const { data, error } = await supabase
    .from("test_results")
    .select("test_id, status, severity, assignee, sprint_id, description_override, qa_notes, dev_notes");
  if (error || !data) return 0;
  for (const row of data) {
    const id = row.test_id as string;
    if (row.status) localStorage.setItem(TEST_STATUS_KEY(id), row.status as string);
    if (row.severity) localStorage.setItem(TEST_SEVERITY_KEY(id), row.severity as string);
    if (row.assignee) localStorage.setItem(TEST_ASSIGNEE_KEY(id), row.assignee as string);
    if (row.sprint_id) localStorage.setItem(TEST_SPRINT_KEY(id), row.sprint_id as string);
    if (row.description_override) {
      localStorage.setItem(TEST_DESC_KEY(id), JSON.stringify(row.description_override));
    }
    const qa = Array.isArray(row.qa_notes) ? (row.qa_notes as NoteEntry[]) : [];
    const dev = Array.isArray(row.dev_notes) ? (row.dev_notes as NoteEntry[]) : [];
    if (qa.length) localStorage.setItem(TEST_QA_NOTE_KEY(id), qa[qa.length - 1].text);
    if (dev.length) localStorage.setItem(TEST_DEV_NOTE_KEY(id), dev[dev.length - 1].text);
  }
  return data.length;
}

/** Hydrate the Task Sheet from task_rows. Returns row count (0 if table empty). */
export async function hydrateTasksToLocal(): Promise<number> {
  if (typeof window === "undefined") return 0;
  const { data, error } = await supabase
    .from("task_rows")
    .select("data, sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return 0;
  const rows = data.map((r) => r.data as TaskRow);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(rows));
  return rows.length;
}

/** One-time bulk push of everything in this browser's localStorage to the DB. */
export async function syncLocalToCloud(): Promise<{ tests: number; notes: number; tasks: number }> {
  if (typeof window === "undefined") return { tests: 0, notes: 0, tasks: 0 };
  const u = await uid();
  if (!u) throw new Error("Not signed in");

  // 1) Test rows
  const testPayload: Record<string, unknown>[] = [];
  let noteCount = 0;
  for (const t of TEST_CASES) {
    const id = t.id;
    const status = localStorage.getItem(TEST_STATUS_KEY(id));
    const severity = localStorage.getItem(TEST_SEVERITY_KEY(id));
    const assignee = localStorage.getItem(TEST_ASSIGNEE_KEY(id));
    const sprintId = localStorage.getItem(TEST_SPRINT_KEY(id));
    const descRaw = localStorage.getItem(TEST_DESC_KEY(id));
    const qaText = localStorage.getItem(TEST_QA_NOTE_KEY(id));
    const devText = localStorage.getItem(TEST_DEV_NOTE_KEY(id));
    if (!status && !severity && !assignee && !sprintId && !descRaw && !qaText && !devText) continue;

    // Fetch existing for merge-append of notes
    const { data: existing } = await supabase
      .from("test_results")
      .select("qa_notes, dev_notes")
      .eq("test_id", id)
      .maybeSingle();
    const qaArr: NoteEntry[] = Array.isArray(existing?.qa_notes) ? (existing!.qa_notes as NoteEntry[]) : [];
    const devArr: NoteEntry[] = Array.isArray(existing?.dev_notes) ? (existing!.dev_notes as NoteEntry[]) : [];

    const newQa = [...qaArr];
    if (qaText && qaText.trim()) {
      const dup = [...qaArr].reverse().find((e) => e.author_id === u.id && e.text === qaText);
      if (!dup) { newQa.push({ author_id: u.id, author_name: u.name, text: qaText, at: new Date().toISOString() }); noteCount++; }
    }
    const newDev = [...devArr];
    if (devText && devText.trim()) {
      const dup = [...devArr].reverse().find((e) => e.author_id === u.id && e.text === devText);
      if (!dup) { newDev.push({ author_id: u.id, author_name: u.name, text: devText, at: new Date().toISOString() }); noteCount++; }
    }

    let descOv: unknown = null;
    if (descRaw) { try { descOv = JSON.parse(descRaw); } catch { descOv = null; } }

    testPayload.push({
      test_id: id,
      status: status || null,
      severity: severity || null,
      assignee: assignee || null,
      sprint_id: sprintId || null,
      description_override: descOv,
      qa_notes: newQa,
      dev_notes: newDev,
      updated_by: u.id,
    });
  }
  if (testPayload.length) {
    const { error } = await supabase.from("test_results").upsert(testPayload, { onConflict: "test_id" });
    if (error) throw new Error("test_results sync failed: " + error.message);
  }

  // 2) Tasks
  let taskCount = 0;
  const raw = localStorage.getItem(TASKS_STORAGE_KEY);
  if (raw) {
    try {
      const rows = JSON.parse(raw) as TaskRow[];
      if (Array.isArray(rows) && rows.length) {
        const payload = rows.map((r, i) => ({ id: r.id, data: r, sort_order: i, updated_by: u.id }));
        const { error } = await supabase.from("task_rows").upsert(payload, { onConflict: "id" });
        if (error) throw new Error("task_rows sync failed: " + error.message);
        taskCount = rows.length;
      }
    } catch (e) {
      console.warn("[cloud-sync] tasks parse", e);
    }
  }

  localStorage.setItem("cloud-synced-at", new Date().toISOString());
  return { tests: testPayload.length, notes: noteCount, tasks: taskCount };
}

export function lastSyncedAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cloud-synced-at");
}

/** Evidence index — DB pointer for files in the test-evidence bucket. */
export async function cloudRegisterEvidence(args: { test_id: string; storage_path: string; file_name: string; size: number }) {
  const u = await uid();
  if (!u) return;
  const { error } = await supabase.from("test_evidence_index").insert({
    test_id: args.test_id,
    storage_path: args.storage_path,
    file_name: args.file_name,
    size: args.size,
    uploaded_by: u.id,
  });
  if (error && !/duplicate/i.test(error.message)) console.warn("[cloud-sync] registerEvidence", error.message);
}

export async function cloudDeleteEvidence(storage_path: string) {
  const { error } = await supabase.from("test_evidence_index").delete().eq("storage_path", storage_path);
  if (error) console.warn("[cloud-sync] deleteEvidence", error.message);
}