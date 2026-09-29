import { describe, expect, it } from "vitest";
import {
  BETA_CREDIT_REWARDS,
  BETA_CREDIT_SPEND_RULES,
  BETA_REPRO_FAIL_BONUS,
  BETA_REWARD_LEVELS,
  betaCreditForPriority,
  betaRewardLevelLabelFor,
} from "../beta-tester-credits";
import { betaRewardLevelFor } from "../beta-tester-dashboard";
import { parseAppRoute, pathForView, titleForView } from "../app-routes";

describe("beta tester credits", () => {
  it("matches Part B–style priority rewards and fail bonus", () => {
    expect(BETA_CREDIT_REWARDS).toEqual({ P0: 15, P1: 10, P2: 5, P3: 3 });
    expect(BETA_REPRO_FAIL_BONUS).toBe(5);
    expect(betaCreditForPriority("P0")).toBe(15);
    expect(betaCreditForPriority("p2")).toBe(5);
    expect(betaCreditForPriority("")).toBe(0);
  });

  it("maps eligible test counts to reward levels", () => {
    expect(betaRewardLevelLabelFor(0)).toBe("Not yet qualified");
    expect(betaRewardLevelLabelFor(4)).toBe("Not yet qualified");
    expect(betaRewardLevelLabelFor(5)).toBe("Contributor");
    expect(betaRewardLevelLabelFor(15)).toBe("Regular");
    expect(betaRewardLevelLabelFor(40)).toBe("Champion");
    expect(BETA_REWARD_LEVELS.map((l) => l.minTests)).toEqual([0, 5, 15, 40]);
  });

  it("keeps dashboard reward helper in sync with the guide", () => {
    expect(betaRewardLevelFor(0, 0)).toBe("Not yet qualified");
    expect(betaRewardLevelFor(12, 60_000)).toBe("Contributor");
    expect(betaRewardLevelFor(50, 0)).toBe("Champion");
  });

  it("explains credit packs vs plan consulting vs membership rewards", () => {
    const ids = BETA_CREDIT_SPEND_RULES.map((r) => r.id);
    expect(ids).toContain("credit-packs");
    expect(ids).toContain("consulting");
    expect(BETA_CREDIT_SPEND_RULES.find((r) => r.id === "credit-packs")?.detail).toMatch(
      /Packs do not replace membership/i,
    );
    expect(BETA_CREDIT_SPEND_RULES.find((r) => r.id === "consulting")?.detail).toMatch(
      /Plan consulting is included/i,
    );
  });
});

describe("beta credits route", () => {
  it("maps /beta-credits", () => {
    expect(parseAppRoute("/beta-credits")).toEqual({ view: "beta_credits", guidesManualId: null });
    expect(pathForView("beta_credits")).toBe("/beta-credits");
    expect(titleForView("beta_credits")).toBe("Beta Tester Credit Guide | Get Your Side Hustle");
  });
});
