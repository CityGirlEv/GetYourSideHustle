import { describe, it, expect } from "vitest";

// Mirrors the option-building logic in src/routes/testing.tsx Owner <select>.
// Keeps the rule (current assignee is always a selectable option) covered by
// a fast unit test even though the consumer is a JSX expression.
function buildAssigneeOptions(
  assignee: string,
  base: string[],
  assigneeLocked = false,
): string[] {
  if (assigneeLocked) return [assignee];
  return assignee && !base.includes(assignee) ? [assignee, ...base] : base;
}

describe("Owner select options", () => {
  it("returns base list when the current assignee is already in it", () => {
    expect(buildAssigneeOptions("Catria", ["Unassigned", "Catria", "Evelyn"])).toEqual([
      "Unassigned",
      "Catria",
      "Evelyn",
    ]);
  });

  it("prepends the current assignee when it is missing from a QA-restricted list", () => {
    // QA "Lyriq" viewing a test owned by "Catria" — without the prepend, the
    // <select> would silently show "Lyriq" as the displayed value, making the
    // first manual click a no-op.
    expect(buildAssigneeOptions("Catria", ["Lyriq", "Unassigned"])).toEqual([
      "Catria",
      "Lyriq",
      "Unassigned",
    ]);
  });

  it("prepends ex-QA owners no longer in the fetched assignee list", () => {
    expect(buildAssigneeOptions("Rich", ["Unassigned", "Catria", "Evelyn"])).toEqual([
      "Rich",
      "Unassigned",
      "Catria",
      "Evelyn",
    ]);
  });

  it("returns only the current assignee when locked (automated tests)", () => {
    expect(buildAssigneeOptions("AutomationBot", ["Catria"], true)).toEqual([
      "AutomationBot",
    ]);
  });

  it("does not prepend empty assignee", () => {
    expect(buildAssigneeOptions("", ["Unassigned", "Catria"])).toEqual([
      "Unassigned",
      "Catria",
    ]);
  });
});