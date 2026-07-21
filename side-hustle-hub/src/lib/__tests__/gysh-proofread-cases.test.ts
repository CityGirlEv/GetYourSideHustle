import { describe, expect, it } from "vitest";
import {
  isProofreadCaseId,
  pairProofreadCase,
  PROOFREAD_CASES,
  proofreadLogicalId,
} from "../gysh-proofread-cases";
import { suggestedSprintForTest } from "../gysh-sprint-board";
import { TEST_CASES } from "../gysh-test-plan";

describe("gysh-proofread Tina + Lyriq pairing", () => {
  const proofreadFromCatalog = TEST_CASES.filter(
    (t) => t.area === "Proofread" || isProofreadCaseId(t.id),
  );

  it("exports PROOFREAD_CASES into the main test plan", () => {
    expect(PROOFREAD_CASES.length).toBeGreaterThan(0);
    expect(proofreadFromCatalog.length).toBe(PROOFREAD_CASES.length);
  });

  it("gives every proofread logical case a Tina + Lyriq pair (no orphans)", () => {
    const byLogical = new Map<string, typeof proofreadFromCatalog>();
    for (const t of proofreadFromCatalog) {
      expect(t.id).toMatch(/-(TINA|LYRIQ)$/);
      const logical = proofreadLogicalId(t.id);
      const list = byLogical.get(logical) ?? [];
      list.push(t);
      byLogical.set(logical, list);
    }

    expect(byLogical.size).toBe(proofreadFromCatalog.length / 2);

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

  it("suggests Sprint 1 for every proofread case", () => {
    for (const t of proofreadFromCatalog) {
      expect(suggestedSprintForTest(t)).toBe(1);
    }
  });

  it("pairProofreadCase builds matching Tina/Lyriq siblings", () => {
    const [tina, lyriq] = pairProofreadCase({
      id: "PROOF-PAGE-DEMO",
      area: "Proofread",
      title: "Proofread: Demo",
      priority: "P2",
      roles: ["all", "qa"],
      suite: "manual",
      steps: ["Open page"],
      expected: "Looks good",
      path: "dashboard",
    });
    expect(tina.id).toBe("PROOF-PAGE-DEMO-TINA");
    expect(lyriq.id).toBe("PROOF-PAGE-DEMO-LYRIQ");
    expect(tina.assignees).toEqual(["tina"]);
    expect(lyriq.assignees).toEqual(["lyriq"]);
    expect(tina.title).toBe(lyriq.title);
    expect(proofreadLogicalId(tina.id)).toBe("PROOF-PAGE-DEMO");
  });
});
