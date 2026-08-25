import { describe, expect, it } from "vitest";
import {
  assignProofreadCase,
  isPrivacyPolicyProofreadCase,
  isProofreadCaseId,
  pairProofreadCase,
  PRIVACY_POLICY_PROOFREAD_LOGICAL_ID,
  PRIVACY_POLICY_PROOFREAD_REVIEWERS,
  PRIVACY_POLICY_PROOFREAD_TITLE,
  PROOFREAD_CASES,
  proofreadLogicalId,
  proofreadOwnerFromId,
  testIdHasNumber,
} from "../gysh-proofread-cases";
import { sprintForUnstoredTest, suggestedSprintForTest } from "../gysh-sprint-board";
import { currentSprintIndex } from "../gysh-sprints";
import { TEST_CASES } from "../gysh-test-plan";

describe("gysh-proofread Tina + Lyriq pairing", () => {
  const proofreadFromCatalog = TEST_CASES.filter(
    (t) => t.area === "Proofread" || isProofreadCaseId(t.id),
  );
  const launchProofread = proofreadFromCatalog.filter((t) => !isPrivacyPolicyProofreadCase(t));
  const privacyProofread = proofreadFromCatalog.filter((t) => isPrivacyPolicyProofreadCase(t));

  it("exports PROOFREAD_CASES into the main test plan", () => {
    expect(PROOFREAD_CASES.length).toBeGreaterThan(0);
    expect(proofreadFromCatalog.length).toBe(PROOFREAD_CASES.length);
  });

  it("numbers every proofread logical case as PROOF-NNN", () => {
    for (const t of proofreadFromCatalog) {
      expect(t.id).toMatch(/^PROOF-\d{3}-(TINA|LYRIQ|EVELYN|CANDACE)$/);
      expect(testIdHasNumber(t.id)).toBe(true);
    }
    const logicals = [
      ...new Set(proofreadFromCatalog.map((t) => proofreadLogicalId(t.id))),
    ].sort();
    expect(logicals[0]).toBe("PROOF-001");
    expect(logicals).toContain(PRIVACY_POLICY_PROOFREAD_LOGICAL_ID);
  });

  it("gives every launch proofread logical case a Tina + Lyriq pair (no orphans)", () => {
    const byLogical = new Map<string, typeof launchProofread>();
    for (const t of launchProofread) {
      expect(t.id).toMatch(/-(TINA|LYRIQ)$/);
      const logical = proofreadLogicalId(t.id);
      const list = byLogical.get(logical) ?? [];
      list.push(t);
      byLogical.set(logical, list);
    }

    expect(byLogical.size).toBe(launchProofread.length / 2);

    for (const [logicalId, siblings] of byLogical) {
      expect(siblings, logicalId).toHaveLength(2);
      const assignees = siblings.map((s) => s.assignees.join(",")).sort();
      expect(assignees).toEqual(["lyriq", "tina"]);

      const [a, b] = siblings;
      expect(a.title).toBe(b.title);
      expect(a.steps).toEqual(b.steps);
      expect(a.expected).toBe(b.expected);
      expect(a.path).toBe(b.path);
      expect(a.priority).toBe(b.priority);
      expect(a.roles).toEqual(b.roles);
      expect(a.suite).toBe("manual");
      expect(a.assignees).toHaveLength(1);
      expect(b.assignees).toHaveLength(1);
    }
  });

  it("assigns Privacy Policy proofread to Tina, Evelyn, and Candace in Sprint 3", () => {
    expect(privacyProofread).toHaveLength(PRIVACY_POLICY_PROOFREAD_REVIEWERS.length);
    expect(privacyProofread.map((t) => t.assignees[0]).sort()).toEqual(
      [...PRIVACY_POLICY_PROOFREAD_REVIEWERS].sort(),
    );
    expect(privacyProofread.map((t) => proofreadOwnerFromId(t.id)).sort()).toEqual(
      [...PRIVACY_POLICY_PROOFREAD_REVIEWERS].sort(),
    );
    for (const t of privacyProofread) {
      expect(t.title).toBe(PRIVACY_POLICY_PROOFREAD_TITLE);
      expect(t.path).toBe("privacy");
      expect(t.assignees).toHaveLength(1);
      expect(suggestedSprintForTest(t)).toBe(currentSprintIndex());
      expect(suggestedSprintForTest({ id: t.id, area: "Proofread", priority: "P1" })).toBe(
        currentSprintIndex(),
      );
    }
  });

  it("suggests Sprint 1 for launch proofread history but places new ones on the current sprint", () => {
    for (const t of launchProofread) {
      expect(suggestedSprintForTest(t)).toBe(1);
      expect(sprintForUnstoredTest(t, [0, 1, 2])).toBe(currentSprintIndex());
    }
    for (const t of privacyProofread) {
      expect(suggestedSprintForTest(t)).toBe(currentSprintIndex());
      expect(sprintForUnstoredTest(t, [0, 1, 2])).toBe(currentSprintIndex());
    }
  });

  it("pairProofreadCase builds matching Tina/Lyriq siblings", () => {
    const [tina, lyriq] = pairProofreadCase({
      id: "PROOF-999",
      area: "Proofread",
      title: "Proofread: Demo",
      priority: "P2",
      roles: ["all", "qa"],
      suite: "manual",
      steps: ["Open page"],
      expected: "Looks good",
      path: "dashboard",
    });
    expect(tina.id).toBe("PROOF-999-TINA");
    expect(lyriq.id).toBe("PROOF-999-LYRIQ");
    expect(tina.assignees).toEqual(["tina"]);
    expect(lyriq.assignees).toEqual(["lyriq"]);
    expect(tina.title).toBe(lyriq.title);
    expect(proofreadLogicalId(tina.id)).toBe("PROOF-999");
  });

  it("assignProofreadCase builds one sibling per reviewer", () => {
    const siblings = assignProofreadCase(
      {
        id: "PROOF-998",
        area: "Proofread",
        title: "Proofread: Privacy Policy",
        priority: "P1",
        roles: ["all", "qa"],
        suite: "manual",
        steps: ["Open /privacy"],
        expected: "Copy is clear",
        path: "privacy",
      },
      ["tina", "evelyn", "candace"],
    );
    expect(siblings.map((s) => s.id)).toEqual([
      "PROOF-998-TINA",
      "PROOF-998-EVELYN",
      "PROOF-998-CANDACE",
    ]);
    expect(siblings.map((s) => s.assignees[0])).toEqual(["tina", "evelyn", "candace"]);
  });

  it("gives every proofread test id a number", () => {
    const missing = proofreadFromCatalog.filter((t) => !testIdHasNumber(t.id)).map((t) => t.id);
    expect(missing, `Unnumbered proofread ids: ${missing.join(", ")}`).toEqual([]);
  });
});
