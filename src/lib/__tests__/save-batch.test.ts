import { describe, it, expect, vi } from "vitest";
import { buildCloudOps, runWithProgress, type DraftValues } from "@/lib/save-batch";

const blankDraft: DraftValues = {
  status: {}, qaNote: {}, devNote: {}, severity: {}, assignee: {}, sprint: {},
};

describe("buildCloudOps", () => {
  it("coalesces status + severity + assignee + sprint of the same id into ONE push", () => {
    const changes = [
      { key: "T-1:status",   testId: "T-1", field: "status"   as const },
      { key: "T-1:severity", testId: "T-1", field: "severity" as const },
      { key: "T-1:assignee", testId: "T-1", field: "assignee" as const },
      { key: "T-1:sprint",   testId: "T-1", field: "sprint"   as const },
    ];
    const draft: DraftValues = {
      ...blankDraft,
      status:   { "T-1": "pass" },
      severity: { "T-1": "high" },
      assignee: { "T-1": "Catria" },
      sprint:   { "T-1": "S-2026-02" },
    };
    const ops = buildCloudOps(changes, new Set(changes.map((c) => c.key)), draft);
    expect(ops).toHaveLength(1);
    expect(ops[0]).toEqual({
      kind: "push", testId: "T-1",
      patch: { status: "pass", severity: "high", assignee: "Catria", sprint_id: "S-2026-02" },
    });
  });

  it("emits a separate note op per non-blank qa/dev note and skips blank notes", () => {
    const changes = [
      { key: "T-1:qaNote",  testId: "T-1", field: "qaNote"  as const },
      { key: "T-2:devNote", testId: "T-2", field: "devNote" as const },
      { key: "T-3:qaNote",  testId: "T-3", field: "qaNote"  as const }, // blank
    ];
    const draft: DraftValues = {
      ...blankDraft,
      qaNote:  { "T-1": "broken on iPad", "T-3": "   " },
      devNote: { "T-2": "fixed in PR #42" },
    };
    const ops = buildCloudOps(changes, new Set(changes.map((c) => c.key)), draft);
    expect(ops).toEqual([
      { kind: "note", testId: "T-1", note: { kind: "qa",  text: "broken on iPad" } },
      { kind: "note", testId: "T-2", note: { kind: "dev", text: "fixed in PR #42" } },
    ]);
  });

  it("ignores unchecked changes (opt-out via the confirm dialog)", () => {
    const changes = [
      { key: "T-1:status", testId: "T-1", field: "status" as const },
      { key: "T-2:status", testId: "T-2", field: "status" as const },
    ];
    const draft: DraftValues = { ...blankDraft, status: { "T-1": "pass", "T-2": "fail" } };
    const ops = buildCloudOps(changes, new Set(["T-1:status"]), draft); // user unchecked T-2
    expect(ops).toHaveLength(1);
    expect(ops[0].testId).toBe("T-1");
  });

  it("turns empty strings into null so cloudPushTest clears the column", () => {
    const changes = [{ key: "T-1:assignee", testId: "T-1", field: "assignee" as const }];
    const ops = buildCloudOps(changes, new Set(["T-1:assignee"]), { ...blankDraft, assignee: { "T-1": "" } });
    expect(ops[0].patch).toEqual({ assignee: null });
  });
});

describe("runWithProgress", () => {
  it("never exceeds the concurrency cap and reports progress after each task", async () => {
    let inFlight = 0;
    let peak = 0;
    const tasks = Array.from({ length: 20 }, () => async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return true;
    });
    const onProgress = vi.fn();
    const { done, ok } = await runWithProgress(tasks, { concurrency: 4, onProgress });
    expect(peak).toBeLessThanOrEqual(4);
    expect(done).toBe(20);
    expect(ok).toBe(20);
    expect(onProgress).toHaveBeenCalledTimes(20);
    expect(onProgress).toHaveBeenLastCalledWith(20, 20);
  });

  it("counts thrown tasks as not-ok but still finishes and reports progress", async () => {
    const tasks = [
      async () => true,
      async () => { throw new Error("boom"); },
      async () => true,
    ];
    const { done, ok } = await runWithProgress(tasks, { concurrency: 2 });
    expect(done).toBe(3);
    expect(ok).toBe(2);
  });
});