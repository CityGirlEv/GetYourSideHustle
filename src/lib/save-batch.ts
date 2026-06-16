// ============================================================================
// SAVE BATCH — coalesces /testing pending changes into the smallest possible
// set of cloud writes, and runs them through a concurrency-limited pool while
// reporting progress to a UI bar.
//
// The /testing page was firing 2 cloud writes per draft field (one from the
// local saver, one from commitChanges), serialized through the browser's
// per-host connection cap — that is what made "save" hang. We now:
//   1. write locally with syncCloud:false  (no implicit cloud push)
//   2. coalesce status / severity / assignee / sprint of the same test id
//      into ONE cloudPushTest call (notes stay individual appends)
//   3. run those calls with a small concurrency limit and report progress
// ============================================================================

export type SaveField =
  | "status"
  | "qaNote"
  | "devNote"
  | "severity"
  | "assignee"
  | "devAssignee"
  | "sprint";

export interface PendingChangeInput {
  key: string;
  testId: string;
  field: SaveField;
}

/** Latest value of every drafted field, keyed by test id. */
export interface DraftValues {
  status: Record<string, string>;
  qaNote: Record<string, string>;
  devNote: Record<string, string>;
  severity: Record<string, string>;
  assignee: Record<string, string>;
  devAssignee: Record<string, string>;
  sprint: Record<string, string>;
}

export type PushTestPatch = {
  status?: string | null;
  severity?: string | null;
  assignee?: string | null;
  dev_assignee?: string | null;
  sprint_id?: string | null;
};

export interface CloudOp {
  kind: "push" | "note";
  testId: string;
  /** When kind === "push" */
  patch?: PushTestPatch;
  /** When kind === "note" */
  note?: { kind: "qa" | "dev"; text: string };
}

/**
 * Coalesce the user-selected pending changes into the smallest set of cloud
 * operations. Returns one `push` op per test id (merging status/severity/
 * assignee/sprint) plus one `note` op per non-blank QA/Dev note.
 */
export function buildCloudOps(
  changes: PendingChangeInput[],
  selectedKeys: ReadonlySet<string>,
  draft: DraftValues,
): CloudOp[] {
  const pushes = new Map<string, PushTestPatch>();
  const notes: CloudOp[] = [];

  for (const c of changes) {
    if (!selectedKeys.has(c.key)) continue;
    const id = c.testId;
    switch (c.field) {
      case "status": {
        const v = draft.status[id] ?? "";
        const p = pushes.get(id) ?? {};
        p.status = v || null;
        pushes.set(id, p);
        break;
      }
      case "severity": {
        const v = draft.severity[id] ?? "";
        const p = pushes.get(id) ?? {};
        p.severity = v || null;
        pushes.set(id, p);
        break;
      }
      case "assignee": {
        const v = draft.assignee[id] ?? "";
        const p = pushes.get(id) ?? {};
        p.assignee = v || null;
        pushes.set(id, p);
        break;
      }
      case "devAssignee": {
        const v = draft.devAssignee[id] ?? "";
        const p = pushes.get(id) ?? {};
        p.dev_assignee = v || null;
        pushes.set(id, p);
        break;
      }
      case "sprint": {
        const v = draft.sprint[id] ?? "";
        const p = pushes.get(id) ?? {};
        p.sprint_id = v || null;
        pushes.set(id, p);
        break;
      }
      case "qaNote": {
        const v = (draft.qaNote[id] ?? "").trim();
        if (v) notes.push({ kind: "note", testId: id, note: { kind: "qa", text: v } });
        break;
      }
      case "devNote": {
        const v = (draft.devNote[id] ?? "").trim();
        if (v) notes.push({ kind: "note", testId: id, note: { kind: "dev", text: v } });
        break;
      }
    }
  }

  const pushOps: CloudOp[] = Array.from(pushes.entries()).map(([testId, patch]) => ({
    kind: "push",
    testId,
    patch,
  }));
  return [...pushOps, ...notes];
}

/**
 * Run async tasks with a fixed concurrency cap, calling `onProgress(done, total)`
 * after every completion (success OR failure). Resolves with the number of
 * tasks that returned a truthy value.
 */
export async function runWithProgress<T>(
  tasks: Array<() => Promise<T>>,
  opts: { concurrency?: number; onProgress?: (done: number, total: number) => void } = {},
): Promise<{ done: number; ok: number; results: Array<T | undefined> }> {
  const total = tasks.length;
  const concurrency = Math.max(1, opts.concurrency ?? 6);
  const results: Array<T | undefined> = new Array(total);
  let done = 0;
  let ok = 0;
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= total) return;
      try {
        const r = await tasks[i]();
        results[i] = r;
        if (r) ok++;
      } catch {
        results[i] = undefined;
      } finally {
        done++;
        opts.onProgress?.(done, total);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);
  return { done, ok, results };
}
