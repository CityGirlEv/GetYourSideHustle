import { describe, expect, it } from "vitest";
import { BETA_NDA_VERSION } from "../beta-tester-nda";
import {
  BETA_REWARD_NOT_QUALIFIED,
  betaTesterStatsFromCounts,
  emptyBetaTesterStats,
  formatBetaRecordedTime,
  isBetaTestingUnlocked,
} from "../beta-tester-dashboard";

describe("beta tester dashboard stats", () => {
  it("starts at 0 tests, 00:00, and Not yet qualified", () => {
    const stats = emptyBetaTesterStats();
    expect(stats.testsCompleted).toBe(0);
    expect(stats.recordedMs).toBe(0);
    expect(stats.rewardLevel).toBe(BETA_REWARD_NOT_QUALIFIED);
    expect(formatBetaRecordedTime(stats.recordedMs)).toBe("00:00");
    expect(betaTesterStatsFromCounts(0, 0).rewardLevel).toBe("Not yet qualified");
  });

  it("formats recorded time as MM:SS and HH:MM:SS", () => {
    expect(formatBetaRecordedTime(0)).toBe("00:00");
    expect(formatBetaRecordedTime(90_000)).toBe("01:30");
    expect(formatBetaRecordedTime(3_661_000)).toBe("01:01:01");
  });

  it("unlocks testing only after the current NDA version is on file", () => {
    expect(isBetaTestingUnlocked(null, BETA_NDA_VERSION)).toBe(false);
    expect(
      isBetaTestingUnlocked(
        {
          version: "GYSH-BETA-NDA-v0.9",
          acceptedAt: "2026-08-23T18:00:00.000Z",
          legalName: "Jordan Avery",
          userId: "u-1",
        },
        BETA_NDA_VERSION,
      ),
    ).toBe(false);
    expect(
      isBetaTestingUnlocked(
        {
          version: BETA_NDA_VERSION,
          acceptedAt: "2026-08-23T18:00:00.000Z",
          legalName: "Jordan Avery",
          userId: "u-1",
        },
        BETA_NDA_VERSION,
      ),
    ).toBe(true);
  });
});
