import { describe, expect, it } from "vitest";
import {
  approveFixesReportToMarkdown,
  buildFailureReportSnapshot,
  buildPostFixReport,
  failureReportFixPackageMarkdown,
  failureReportToMarkdown,
  formatProposedFixSticker,
  parseProposedFixSteps,
  planApproveFixesForTester,
  planExecuteFixesFromReport,
  postFixReportToMarkdown,
} from "../gysh-failure-report";
import type { TestStatusesPayload } from "../gysh-test-plan";

function emptyPayload(over: Partial<TestStatusesPayload> = {}): TestStatusesPayload {
  return {
    statuses: {},
    notes: {},
    assignees: {},
    sprints: {},
    dueDates: {},
    checkedSteps: {},
    failedStepIndex: {},
    assignedBy: {},
    dateAssigned: {},
    originalAssignees: {},
    updatedAt: {},
    updatedBy: {},
    attachments: {},
    generatedCases: [],
    ...over,
  };
}

describe("gysh-failure-report", () => {
  it("groups fail, conditional_approval, and pass with full markdown sections", () => {
    const payload = emptyPayload({
      statuses: {
        "AUTH-001": "fail",
        "AUTH-006": "conditional_approval",
        "AUTH-002": "pass",
        "EMAIL-001": "not_run",
      },
      notes: {
        "AUTH-001": JSON.stringify([
          {
            id: "n1",
            author: "Tina",
            createdAt: "2026-08-30T01:00:00.000Z",
            updatedAt: "2026-08-30T01:00:00.000Z",
            text: "Login button never enables",
          },
        ]),
        "AUTH-006": "Works on desktop only",
      },
      attachments: {
        "AUTH-001": [
          {
            id: "att1",
            name: "login-disabled.png",
            mimeType: "image/png",
            size: 12000,
            scanStatus: "ok",
            scanDetail: "",
            addedAt: "2026-08-30T01:01:00.000Z",
            addedBy: "Tina",
          },
        ],
      },
      assignees: { "AUTH-001": "evelyn" },
      sprints: { "AUTH-001": 3 },
    });

    const report = buildFailureReportSnapshot(payload, { siteUrl: "http://localhost:5173" });
    expect(report.summary.failed).toBeGreaterThanOrEqual(1);
    expect(report.failed.some((r) => r.id === "AUTH-001")).toBe(true);
    expect(report.conditional.some((r) => r.id === "AUTH-006")).toBe(true);
    expect(report.approved.some((r) => r.id === "AUTH-002")).toBe(true);
    const failRow = report.failed.find((r) => r.id === "AUTH-001");
    expect(failRow?.notes).toContain("Login button");
    expect(failRow?.noteEntries[0]?.author).toBe("Tina");
    expect(failRow?.attachments[0]?.name).toBe("login-disabled.png");

    const md = failureReportToMarkdown(report);
    expect(md).toContain("# GYSH Failure Report");
    expect(md).toContain("Tester notes (required reading before fixing)");
    expect(md).toContain("Attachments / evidence");
    expect(md).toContain("login-disabled.png");
    expect(md).toContain("## 1. Failed tests");
    expect(md).toContain("## 2. Conditionally approved");
    expect(md).toContain("## 3. Approved tests (Pass)");
    expect(md.indexOf("## 1. Failed tests")).toBeLessThan(md.indexOf("## 2. Conditionally approved"));
    expect(md.indexOf("## 2. Conditionally approved")).toBeLessThan(md.indexOf("## 3. Approved tests (Pass)"));

    const fixPkg = failureReportFixPackageMarkdown(report);
    expect(fixPkg).toContain("Execute Fixes");
    expect(fixPkg).toContain("read the tester notes first");
    expect(fixPkg).toContain("review every attachment");
  });

  it("builds post-fix report with fixed vs unfixed notes", () => {
    const prior = buildFailureReportSnapshot(
      emptyPayload({
        statuses: { "AUTH-001": "fail", "AUTH-006": "conditional_approval" },
        notes: { "AUTH-001": "broken", "AUTH-006": "flaky" },
      }),
    );

    const after = emptyPayload({
      statuses: { "AUTH-001": "pass", "AUTH-006": "fail" },
      notes: {
        "AUTH-001": "Fixed enable logic in AuthPage",
        "AUTH-006": "Still flaky on Safari — needs device lab",
      },
    });

    const post = buildPostFixReport(prior, after);
    expect(post.fixed.some((f) => f.id === "AUTH-001")).toBe(true);
    expect(post.fixed.find((f) => f.id === "AUTH-001")?.note).toContain("Fixed enable");
    expect(post.unfixed.some((f) => f.id === "AUTH-006")).toBe(true);
    expect(post.unfixed.find((f) => f.id === "AUTH-006")?.note).toContain("Safari");

    const md = postFixReportToMarkdown(post);
    expect(md).toContain("# GYSH Post-Fix Report");
    expect(md).toContain("## Fixed");
    expect(md).toContain("Could not fix");
  });

  it("plans approve fixes to Fixed/Re-Test + original tester", () => {
    const prior = buildFailureReportSnapshot(
      emptyPayload({
        statuses: { "AUTH-001": "fail" },
        notes: { "AUTH-001": "broken login" },
        assignees: { "AUTH-001": "evelyn" },
        originalAssignees: { "AUTH-001": "tina" },
        sprints: { "AUTH-001": 2 },
      }),
    );
    const after = emptyPayload({
      statuses: { "AUTH-001": "pass" },
      notes: { "AUTH-001": "Fixed AuthPage enable" },
      assignees: { "AUTH-001": "evelyn" },
      originalAssignees: { "AUTH-001": "tina" },
    });
    const plan = planApproveFixesForTester(prior, after);
    expect(plan).toHaveLength(1);
    expect(plan[0]?.toStatus).toBe("fixed_retest");
    expect(plan[0]?.testerId).toBe("tina");
    expect(approveFixesReportToMarkdown(plan)).toContain("Approve Fixes");
  });

  it("Execute Fixes leaves Fail when no real code fix applies (Proposed Fix explains why)", () => {
    const prior = buildFailureReportSnapshot(
      emptyPayload({
        statuses: { "AUTH-001": "fail" },
        notes: { "AUTH-001": "Login button stays disabled" },
        originalAssignees: { "AUTH-001": "tina" },
      }),
    );
    const live = emptyPayload({
      statuses: { "AUTH-001": "fail" },
      notes: { "AUTH-001": "Login button stays disabled" },
      originalAssignees: { "AUTH-001": "tina" },
    });
    const plan = planExecuteFixesFromReport(prior, live);
    expect(plan.fixed).toHaveLength(0);
    expect(plan.unfixed).toHaveLength(1);
    expect(plan.unfixed[0]!.toStatus).toBe("fail");
    const note = plan.unfixed[0]!.note;
    expect(note).toContain("[Proposed Fix]");
    expect(note).toContain("Proposed Fix — steps taken to fix:");
    const steps = parseProposedFixSteps(note);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps.some((s) => /Tester note/i.test(s))).toBe(true);
    expect(steps.some((s) => /Could not fix/i.test(s))).toBe(true);

    const sticker = formatProposedFixSticker(steps);
    expect(sticker).toContain("[/Proposed Fix]");
  });

  it("Execute Fixes marks Fixed/Cursor only when describeAppliedCodeFix finds a real email greeting fix", () => {
    const prior = buildFailureReportSnapshot(
      emptyPayload({
        statuses: { "EMAIL-TPL-schedule_suite_reminder": "fail" },
        notes: {
          "EMAIL-TPL-schedule_suite_reminder":
            "After Hi {{name}}. the next sentence must be a new paragraph starting with a capital letter",
        },
        originalAssignees: { "EMAIL-TPL-schedule_suite_reminder": "candace" },
      }),
    );
    const live = emptyPayload({
      statuses: { "EMAIL-TPL-schedule_suite_reminder": "fail" },
      notes: {
        "EMAIL-TPL-schedule_suite_reminder":
          "After Hi {{name}}. the next sentence must be a new paragraph starting with a capital letter",
      },
    });
    const plan = planExecuteFixesFromReport(prior, live);
    expect(plan.fixed).toHaveLength(1);
    expect(plan.fixed[0]!.toStatus).toBe("fixed_cursor");
    const steps = parseProposedFixSteps(plan.fixed[0]!.note);
    expect(steps.some((s) => /Fix applied/i.test(s))).toBe(true);
    expect(steps.some((s) => /Hi \{\{name\}\}/i.test(s))).toBe(true);
  });

  it("Execute Fixes reverts bogus Fixed/Cursor that had no real code fix", () => {
    const prior = buildFailureReportSnapshot(
      emptyPayload({
        statuses: { "AUTH-001": "fail" },
        notes: { "AUTH-001": "Login button stays disabled" },
      }),
    );
    const live = emptyPayload({
      statuses: { "AUTH-001": "fixed_cursor" },
      notes: {
        "AUTH-001":
          "Fixed/Cursor via Execute Fixes — auto handoff.\n\n[Proposed Fix]\n1. fake\n[/Proposed Fix]",
      },
    });
    const plan = planExecuteFixesFromReport(prior, live);
    expect(plan.fixed).toHaveLength(0);
    expect(plan.unfixed).toHaveLength(1);
    expect(plan.unfixed[0]!.toStatus).toBe("fail");
    expect(plan.unfixed[0]!.note).toMatch(/restored to Fail/i);
  });

  it("Execute Fixes tolerates archived rows missing fixSteps/noteEntries", () => {
    const prior = buildFailureReportSnapshot(
      emptyPayload({
        statuses: { "AUTH-001": "fail" },
        notes: { "AUTH-001": "broken" },
      }),
    );
    // Simulate older localStorage archive rows before fixSteps existed.
    const legacyRow = {
      ...prior.failed[0]!,
      fixSteps: undefined,
      noteEntries: undefined,
      attachments: undefined,
      steps: undefined,
      checkedSteps: undefined,
      relatedTaskIds: undefined,
    } as unknown as (typeof prior.failed)[0];
    const legacy = { ...prior, failed: [legacyRow], conditional: [] };
    const plan = planExecuteFixesFromReport(legacy, emptyPayload({ statuses: { "AUTH-001": "fail" } }));
    expect(plan.fixed).toHaveLength(0);
    expect(plan.unfixed).toHaveLength(1);
    expect(plan.unfixed[0]!.note).toContain("[Proposed Fix]");
  });
});
