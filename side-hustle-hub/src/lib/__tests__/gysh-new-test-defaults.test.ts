import { describe, expect, it } from "vitest";
import {
  defaultsForNewTest,
  isKevinaKidsYouthTest,
  sprintForNewKidsYouthTest,
} from "../gysh-new-test-defaults";
import { currentSprintIndex, dueDateForSprint, dueDatePlusDays } from "../gysh-sprints";
import { suggestedSprintForTest } from "../gysh-sprint-board";
import {
  EMAIL_TEMPLATE_REVIEW_CASES,
  emailTemplateReviewDueDate,
  emailTemplateReviewSprint,
} from "../gysh-email-template-review-cases";

describe("gysh-new-test-defaults", () => {
  it("matches Kevina / Kids / Youth / Teens by id, area, path, category, title", () => {
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

  it("defaults general new tests to the current sprint + due today", () => {
    const midS3 = new Date(2026, 7, 22); // Sat in Sprint 3
    const d = defaultsForNewTest(
      { id: "VT-FAIL-xyz", title: "Portal Vitest structural" },
      midS3,
    );
    expect(d.sprint).toBe(currentSprintIndex(midS3));
    expect(d.assignee).toBe("");
    expect(d.dueDate).toBe(dueDatePlusDays(0, midS3));
  });

  it("defaults Kids/Youth new tests to Tina, skips Sprint 0, due = creation + 1", () => {
    // Mid Sprint 0 (Thu Jul 16, 2026) — bump to Sprint 1 unless S0 task match
    const mid = new Date(2026, 6, 16);
    const d = defaultsForNewTest(
      { id: "PW-FAIL-1", title: "Kids/Teens Corner nav opens kids content" },
      mid,
    );
    expect(d.assignee).toBe("tina");
    expect(d.sprint).toBe(1);
    expect(d.dueDate).toBe(dueDatePlusDays(1, mid));
    expect(sprintForNewKidsYouthTest(mid)).toBe(1);
  });

  it("does not pin former S0 catalog ids onto Sprint 0 at create", () => {
    const midS3 = new Date(2026, 7, 22);
    const d = defaultsForNewTest(
      { id: "EMAIL-001", area: "Email", title: "API health" },
      midS3,
    );
    expect(d.sprint).toBe(currentSprintIndex(midS3));
    expect(d.dueDate).toBe(dueDatePlusDays(0, midS3));
    const kidsMatch = defaultsForNewTest({
      id: "KIDS-001",
      area: "Kids Corner",
      title: "Kevina Stories",
    });
    // Kids/Youth create path → Tina + current/next sprint (never S0)
    expect(kidsMatch.sprint).toBeGreaterThanOrEqual(1);
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

  it("never assigns a new test onto a closed sprint", () => {
    const now = new Date(2026, 7, 23); // Sun in Sprint 3
    const closed = [0, 1, 2];
    const general = defaultsForNewTest(
      { id: "PROOF-NEW-TINA", title: "Proofread: Privacy Policy", area: "Proofread" },
      now,
      closed,
    );
    expect(general.sprint).toBe(3);
    const kids = defaultsForNewTest(
      { id: "PW-FAIL-kids", title: "Kids Corner regression", area: "Kids Corner" },
      now,
      closed,
    );
    expect(closed).not.toContain(kids.sprint);
    expect(kids.sprint).toBeGreaterThanOrEqual(3);
    expect(closed).not.toContain(sprintForNewKidsYouthTest(now, closed));
  });
});

describe("email template review sprint / dues", () => {
  it("maps EMAIL-TPL cases to the current sprint", () => {
    const midS3 = new Date(2026, 7, 22);
    expect(emailTemplateReviewSprint(midS3)).toBe(3);
    expect(
      suggestedSprintForTest({
        id: "EMAIL-TPL-password_reset",
        area: "Email",
        priority: "P1",
      }),
    ).toBe(currentSprintIndex());
  });

  it("spreads template review dues half today / half tomorrow", () => {
    const ref = new Date(2026, 7, 22);
    const today = dueDatePlusDays(0, ref);
    const tomorrow = dueDatePlusDays(1, ref);
    const dues = EMAIL_TEMPLATE_REVIEW_CASES.map((c) => emailTemplateReviewDueDate(c.id, ref));
    expect(dues.filter((d) => d === today)).toHaveLength(9);
    expect(dues.filter((d) => d === tomorrow)).toHaveLength(9);
    expect(dues).not.toContain(dueDateForSprint(3));
  });
});
