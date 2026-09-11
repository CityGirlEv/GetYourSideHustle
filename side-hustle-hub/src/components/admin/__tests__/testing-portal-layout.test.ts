import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../TestingPortal.tsx"), "utf8");

function testIdIndex(id: string): number {
  const i = src.indexOf(`data-testid="${id}"`);
  expect(i, `missing data-testid="${id}"`).toBeGreaterThan(-1);
  return i;
}

describe("Testing Portal filter layout", () => {
  it("puts Assignees, Sprint, Status, then Other, with extra filters nested under Other", () => {
    const assignees = testIdIndex("qa-assignees-panel");
    const sprint = testIdIndex("qa-sprint-panel");
    const status = testIdIndex("qa-status-panel");
    const bars = testIdIndex("qa-tester-status-bars");
    const other = testIdIndex("qa-other-panel");
    const suites = testIdIndex("qa-test-suites");
    const facing = testIdIndex("qa-facing-panel");
    const categories = testIdIndex("qa-categories-panel");

    expect(assignees).toBeLessThan(sprint);
    expect(sprint).toBeLessThan(status);
    expect(status).toBeLessThan(bars);
    expect(bars).toBeLessThan(other);
    expect(other).toBeLessThan(suites);
    expect(suites).toBeLessThan(facing);
    expect(facing).toBeLessThan(categories);
  });

  it("keeps Sprint Progress last and hides the rollout schedule", () => {
    const categories = testIdIndex("qa-categories-panel");
    const progress = src.lastIndexOf("<SprintStatusBars");
    expect(progress).toBeGreaterThan(categories);
    expect(src).toContain("showRolloutSchedule={false}");
  });

  it("shows the Sprint heading in all-caps and title-cases Test Suites", () => {
    expect(src).toContain('qa-categories-panel__title">Sprint');
    expect(src).not.toContain('qa-heading-title-case">Sprint');
    expect(src).toContain('qa-heading-title-case">Test Suites');
    expect(src).toContain('title="All Test Cases"');
  });

  it("lets Status chips multi-select on a plain click", () => {
    expect(src).toMatch(/chipClick\(\s*statusFilters[\s\S]*?e,\s*true,/);
    expect(src).toContain("tap to multi-select · Shift+click for a range");
  });
});
