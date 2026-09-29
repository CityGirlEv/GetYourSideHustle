import { describe, expect, it } from "vitest";
import {
  BETA_RETEST_BONUS,
  earnsRetestBonus,
  inferBetaCasePriority,
  pointsForBetaCase,
  scoreForTester,
  tallyBetaTesterScores,
} from "../beta-tester-points";
import { parseAppRoute, pathForView, titleForView } from "../app-routes";

describe("beta tester points", () => {
  it("awards P1 pass at 10 and adds the re-test bonus after a fail", () => {
    expect(inferBetaCasePriority("BETA-CRED-001-BRENDA")).toBe("P1");
    expect(pointsForBetaCase({ caseId: "BETA-CRED-001-BRENDA", status: "pass" })).toEqual({
      base: 10,
      retest: 0,
      total: 10,
    });
    expect(
      pointsForBetaCase({
        caseId: "BETA-CRED-001-BRENDA",
        status: "pass",
        hadPriorFail: true,
      }),
    ).toEqual({
      base: 10,
      retest: BETA_RETEST_BONUS,
      total: 15,
    });
  });

  it("does not credit Not Run or Blocked", () => {
    expect(pointsForBetaCase({ caseId: "AUTH-001", status: "not_run", priority: "P0" }).total).toBe(0);
    expect(pointsForBetaCase({ caseId: "AUTH-001", status: "blocked", priority: "P0" }).total).toBe(0);
    expect(earnsRetestBonus({ status: "fail" })).toBe(false);
  });

  it("tallies Brenda at 10 points for one P1 pass with no re-test", () => {
    const scores = tallyBetaTesterScores([
      { caseId: "BETA-CRED-001-BRENDA", status: "pass", assignee: "brenda", priority: "P1" },
      { caseId: "AUTH-001", status: "not_run", assignee: "brenda", priority: "P0" },
    ]);
    const brenda = scoreForTester(scores, "brenda");
    expect(brenda?.testsPassed).toBe(1);
    expect(brenda?.retests).toBe(0);
    expect(brenda?.totalPoints).toBe(10);
    expect(brenda?.displayName).toBe("Brenda");
  });
});

describe("beta points route", () => {
  it("maps /beta-points", () => {
    expect(parseAppRoute("/beta-points")).toEqual({ view: "beta_points", guidesManualId: null });
    expect(pathForView("beta_points")).toBe("/beta-points");
    expect(titleForView("beta_points")).toBe("Beta Tester Points | Get Your Side Hustle");
  });
});
