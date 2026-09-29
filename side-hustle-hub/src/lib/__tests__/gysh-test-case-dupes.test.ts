import { describe, expect, it } from "vitest";
import {
  addAssigneeCopies,
  buildSiblingCatalogIndex,
  expandCatalogCasesForSingleAssignees,
  siblingTestCases,
  splitSharedAssignees,
  testCaseLogicalId,
} from "../gysh-test-case-dupes";
import { TEST_CASES } from "../gysh-test-plan";
import type { TestCase } from "../gysh-test-plan";

function sample(partial: Partial<TestCase> & Pick<TestCase, "id" | "assignees">): TestCase {
  return {
    area: "Membership",
    title: "Sample",
    priority: "P1",
    roles: ["qa"],
    suite: "manual",
    steps: ["Do the thing"],
    expected: "It works",
    path: "dashboard",
    ...partial,
  };
}

describe("gysh-test-case-dupes", () => {
  it("strips owner suffixes for logical ids", () => {
    expect(testCaseLogicalId("SCHED-PNL-001-EVELYN")).toBe("SCHED-PNL-001");
    expect(testCaseLogicalId("MEMBER-001-TINA")).toBe("MEMBER-001");
    expect(testCaseLogicalId("ADULT-002")).toBe("ADULT-002");
  });

  it("triples calculator cases for Lyriq + Evelyn + Tina", () => {
    const base = sample({ id: "SCHED-PNL-001", assignees: ["lyriq"] });
    const copies = addAssigneeCopies(base, ["evelyn", "tina"]);
    expect(copies.map((c) => c.id)).toEqual([
      "SCHED-PNL-001",
      "SCHED-PNL-001-EVELYN",
      "SCHED-PNL-001-TINA",
    ]);
    expect(copies.map((c) => c.assignees[0])).toEqual(["lyriq", "evelyn", "tina"]);
  });

  it("splits shared Evelyn+Tina assignees into one case each", () => {
    const [evelyn, tina] = splitSharedAssignees(
      sample({ id: "MEMBER-001", assignees: ["evelyn", "tina"] }),
    );
    expect(evelyn.id).toBe("MEMBER-001-EVELYN");
    expect(tina.id).toBe("MEMBER-001-TINA");
    expect(evelyn.assignees).toEqual(["evelyn"]);
    expect(tina.assignees).toEqual(["tina"]);
  });

  it("catalog has calculator triples and no multi-assignee manual cases", () => {
    const pnl = TEST_CASES.filter((t) => testCaseLogicalId(t.id) === "SCHED-PNL-001");
    expect(pnl.map((t) => t.id).sort()).toEqual([
      "SCHED-PNL-001",
      "SCHED-PNL-001-EVELYN",
      "SCHED-PNL-001-TINA",
    ]);
    expect(pnl.map((t) => t.assignees[0]).sort()).toEqual(["evelyn", "lyriq", "tina"]);

    const adult = TEST_CASES.filter((t) => testCaseLogicalId(t.id) === "ADULT-002");
    expect(adult).toHaveLength(3);

    const multi = TEST_CASES.filter(
      (t) => (t.suite ?? "manual") === "manual" && t.assignees.length > 1,
    );
    expect(multi.map((t) => t.id)).toEqual([]);
  });

  it("expandCatalogCasesForSingleAssignees is idempotent on already-split input", () => {
    const once = expandCatalogCasesForSingleAssignees([
      sample({ id: "SENIOR-001", assignees: ["evelyn", "tina"] }),
    ]);
    const twice = expandCatalogCasesForSingleAssignees(once);
    expect(twice.map((c) => c.id)).toEqual(once.map((c) => c.id));
  });

  it("siblingTestCases links owner copies of the same logical case", () => {
    const stripe = TEST_CASES.filter((t) => testCaseLogicalId(t.id) === "MEMBER-STRIPE-001");
    expect(stripe.length).toBeGreaterThanOrEqual(2);
    const first = stripe[0]!;
    const sibs = siblingTestCases(first.id, TEST_CASES);
    expect(sibs.map((s) => s.id).sort()).toEqual(
      stripe.filter((t) => t.id !== first.id).map((t) => t.id).sort(),
    );
    expect(sibs.every((s) => s.via === "logical_id")).toBe(true);

    const proof = siblingTestCases("PROOF-001-TINA", TEST_CASES);
    expect(proof.some((s) => s.id === "PROOF-001-LYRIQ")).toBe(true);
  });

  it("siblingTestCases matches identical titles/expected across different ids", () => {
    const a = sample({
      id: "DEMO-AAA",
      title: "Stripe checkout smoke (Tina)",
      assignees: ["tina"],
      expected: "Checkout succeeds",
    });
    const b = sample({
      id: "DEMO-BBB",
      title: "Stripe checkout smoke (Candace)",
      assignees: ["candace"],
      expected: "Checkout succeeds",
    });
    const c = sample({
      id: "DEMO-CCC",
      title: "Stripe checkout smoke (Lyriq)",
      assignees: ["lyriq"],
      expected: "Something else",
    });
    const sibs = siblingTestCases("DEMO-AAA", [a, b, c]);
    expect(sibs.map((s) => s.id)).toEqual(["DEMO-BBB"]);
    expect(sibs[0]?.via).toBe("title");
  });

  it("buildSiblingCatalogIndex matches siblingTestCases for the live catalog", () => {
    const index = buildSiblingCatalogIndex(TEST_CASES);
    for (const t of TEST_CASES.slice(0, 40)) {
      expect(index.byId.get(t.id)?.map((s) => s.id).sort()).toEqual(
        siblingTestCases(t.id, TEST_CASES).map((s) => s.id).sort(),
      );
    }
    const proofIdx = index.byId.get("PROOF-001-TINA") ?? [];
    expect(proofIdx.some((s) => s.id === "PROOF-001-LYRIQ")).toBe(true);
  });
});
