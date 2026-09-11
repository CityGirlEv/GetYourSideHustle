import { describe, expect, it } from "vitest";
import { STATUS_LABELS, TEST_STATUSES } from "../gysh-test-plan";
import { QA_TESTING_MANUAL } from "../qa-testing-manual";
import { ADMIN_GUIDE_SECTIONS } from "../user-guide-content";

describe("QA testing manual", () => {
  it("covers access, All-sprints default, and live QA assignees", () => {
    const access = QA_TESTING_MANUAL.access.join(" ");
    expect(access).toMatch(/QA role/i);
    expect(access).toMatch(/assignee/i);
    expect(access).toMatch(/Financials|Content Factory/i);

    const quick = QA_TESTING_MANUAL.quickStart.join(" ");
    expect(quick).toMatch(/All sprints/i);
    expect(quick).toMatch(/Sprint 10/i);
    expect(quick).toMatch(/date/i);
    expect(quick).toMatch(/Assignees is expanded/i);
    expect(quick).toMatch(/Sprint and Other start collapsed/i);
    expect(quick).toMatch(/Test Suites/i);
    expect(quick).toMatch(/All Test Cases/i);
    expect(quick).toMatch(/QA Testors|your name/i);

    const board = QA_TESTING_MANUAL.boardVsPortal.join(" ");
    expect(board).toMatch(/Users Area/i);
    expect(board).toMatch(/All sprints/i);
    expect(board).toMatch(/current sprint/i);
  });

  it("documents every Testing Portal status label", () => {
    const documented = new Set(QA_TESTING_MANUAL.statuses.map((s) => s.status));
    for (const key of TEST_STATUSES) {
      expect(documented.has(STATUS_LABELS[key])).toBe(true);
    }
  });

  it("is written for all QA partners, not Tina-only", () => {
    expect(QA_TESTING_MANUAL.subtitle).toMatch(/QA role/i);
    expect(QA_TESTING_MANUAL.checklist.some((c) => /your name|QA role/i.test(c))).toBe(true);
    expect(QA_TESTING_MANUAL.fixedCursor.failFormat).toMatch(/your name/i);
  });
});

describe("Admin User Guide — testing reference", () => {
  it("documents Testing Portal assignees from Users Area QA role", () => {
    const testing = ADMIN_GUIDE_SECTIONS.find((s) => s.id === "testing");
    expect(testing).toBeTruthy();
    const text = [
      testing!.intro,
      ...(testing!.items ?? []).map((i) => i.text),
    ].join(" ");
    expect(text).toMatch(/QA role/i);
    expect(text).toMatch(/All sprints/i);
    expect(text).toMatch(/Assignees \(expanded\)/i);
    expect(text).toMatch(/Other \(collapsed\)/i);
    expect(text).toMatch(/date range/i);
    expect(text).toMatch(/Testing Manual/i);
    expect(text).toMatch(/Fixed\/Lighthouse|Fixed\/Foresight|Rolled Over/i);
    expect(text).toMatch(/status buttons at the bottom/i);
    expect(text).toMatch(/not a dropdown/i);
  });

  it("tells testers to change status with card buttons, not a dropdown", () => {
    const main = QA_TESTING_MANUAL.flows.find((f) => f.id === "main");
    const outcome = main?.steps.find((s) => s.title === "Choose an outcome");
    expect(outcome?.detail).toMatch(/status buttons at the bottom/i);
    expect(outcome?.detail).toMatch(/not a dropdown/i);
  });

  it("documents QA role → assignee lists in Users Area", () => {
    const users = ADMIN_GUIDE_SECTIONS.find((s) => s.id === "users");
    const text = (users!.items ?? []).map((i) => i.text).join(" ");
    expect(text).toMatch(/QA/i);
    expect(text).toMatch(/assignee/i);
  });
});
