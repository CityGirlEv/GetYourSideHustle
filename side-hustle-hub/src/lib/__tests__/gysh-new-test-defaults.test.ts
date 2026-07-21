import { describe, expect, it } from "vitest";
import {
  defaultsForNewTest,
  isKevinaKidsYouthTest,
  sprintForNewKidsYouthTest,
} from "../gysh-new-test-defaults";
import { BACKLOG_SPRINT, dueDateForSprint, dueDatePlusDays } from "../gysh-sprints";

describe("gysh-new-test-defaults", () => {
  it("matches Kevina / Kids / Youth / Teens / Junior by id, area, path, category, title", () => {
    expect(isKevinaKidsYouthTest({ id: "KIDS-001" })).toBe(true);
    expect(isKevinaKidsYouthTest({ id: "JR-FMSH-012" })).toBe(true);
    expect(isKevinaKidsYouthTest({ id: "VT-FAIL-abc", title: "KevinaStarr embed broken" })).toBe(
      true,
    );
    expect(isKevinaKidsYouthTest({ area: "Kids Corner", title: "Stories tab" })).toBe(true);
    expect(isKevinaKidsYouthTest({ path: "kids" })).toBe(true);
    expect(isKevinaKidsYouthTest({ category: "wizard_junior" })).toBe(true);
    expect(isKevinaKidsYouthTest({ title: "Youth savings tone check" })).toBe(true);
    expect(isKevinaKidsYouthTest({ title: "Teens Join parental consent" })).toBe(true);
    expect(isKevinaKidsYouthTest({ id: "AUTH-001", title: "Admin login", area: "Auth" })).toBe(
      false,
    );
    expect(isKevinaKidsYouthTest({ id: "PW-SMOKE-001", title: "Homepage loads" })).toBe(false);
  });

  it("defaults general new tests to Backlog + Unassigned with no due", () => {
    expect(defaultsForNewTest({ id: "VT-FAIL-xyz", title: "Portal Vitest structural" })).toEqual({
      sprint: BACKLOG_SPRINT,
      assignee: "",
      dueDate: "",
    });
  });

  it("defaults Kids/Youth new tests to Tina, skips Sprint 0, due = creation + 1", () => {
    // Mid Sprint 0 (Thu Jul 16, 2026) — bump to Sprint 1 unless S0 task match
    const mid = new Date(2026, 6, 16);
    const d = defaultsForNewTest(
      { id: "PW-FAIL-1", title: "Kids/Juniors Corner nav opens kids content" },
      mid,
    );
    expect(d.assignee).toBe("tina");
    expect(d.sprint).toBe(1);
    expect(d.dueDate).toBe(dueDatePlusDays(1, mid));
    expect(sprintForNewKidsYouthTest(mid)).toBe(1);
  });

  it("allows Sprint 0 only when the new test matches a Sprint 0 task", () => {
    const d = defaultsForNewTest({ id: "EMAIL-001", area: "Email", title: "API health" });
    expect(d.sprint).toBe(0);
    expect(d.dueDate).toBe(dueDateForSprint(0));
    const kidsMatch = defaultsForNewTest({
      id: "KIDS-001",
      area: "Kids Corner",
      title: "Kevina Stories",
    });
    expect(kidsMatch.sprint).toBe(0);
    expect(kidsMatch.assignee).toBe("tina");
  });

  it("moves Kids/Youth to next sprint on last 2 days (Sun/Mon)", () => {
    const sunday = new Date(2026, 6, 19); // Sprint 0 ends Mon Jul 20
    const monday = new Date(2026, 6, 20);
    expect(sprintForNewKidsYouthTest(sunday)).toBe(1);
    expect(sprintForNewKidsYouthTest(monday)).toBe(1);
    const d = defaultsForNewTest({ area: "Kids Corner", title: "Kevina bio" }, sunday);
    expect(d.sprint).toBe(1);
    expect(d.assignee).toBe("tina");
    expect(d.dueDate).toBe(dueDatePlusDays(1, sunday)); // still creation+1
  });

  it("uses current sprint for Kids/Youth when already past Sprint 0", () => {
    const midS1 = new Date(2026, 6, 23); // Thu in Sprint 1
    expect(sprintForNewKidsYouthTest(midS1)).toBe(1);
    const midS2 = new Date(2026, 6, 30); // Thu in Sprint 2
    expect(sprintForNewKidsYouthTest(midS2)).toBe(2);
  });
});
