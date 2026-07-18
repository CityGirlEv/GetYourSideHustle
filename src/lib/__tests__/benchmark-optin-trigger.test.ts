import { describe, expect, it, beforeEach } from "vitest";
import {
  benchmarkAwaitPlansKey,
  benchmarkOptInSessionKeys,
  consumeBenchmarkAwaitingPlans,
  isBenchmarkAwaitingPlans,
  markBenchmarkAwaitingPlans,
  shouldAutoOpenBenchmarkExpertOptIn,
} from "@/lib/benchmark-optin-trigger";

describe("benchmarkOptInSessionKeys", () => {
  it("builds stable session storage keys per benchmark code", () => {
    expect(benchmarkOptInSessionKeys("BM-ABC")).toEqual({
      justCreated: "benchmark-just-created:BM-ABC",
      shown: "expert-optin-shown:BM-ABC",
    });
  });
});

describe("benchmarkAwaitPlans session helpers", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("builds stable await-plans key per benchmark code", () => {
    expect(benchmarkAwaitPlansKey("BM-ABC")).toBe("benchmark-await-plans:BM-ABC");
  });

  it("marks and consumes the await-plans flag once", () => {
    markBenchmarkAwaitingPlans("BM-XYZ");
    expect(sessionStorage.getItem(benchmarkAwaitPlansKey("BM-XYZ"))).toBe("1");
    expect(isBenchmarkAwaitingPlans("BM-XYZ")).toBe(true);
    expect(consumeBenchmarkAwaitingPlans("BM-XYZ")).toBe(true);
    expect(isBenchmarkAwaitingPlans("BM-XYZ")).toBe(false);
    expect(consumeBenchmarkAwaitingPlans("BM-XYZ")).toBe(false);
  });
});

describe("shouldAutoOpenBenchmarkExpertOptIn", () => {
  it("opens when just created and not yet shown", () => {
    expect(
      shouldAutoOpenBenchmarkExpertOptIn({
        justCreated: true,
        benchmarkJustCreatedFlag: "1",
        expertOptInShown: null,
      }),
    ).toBe(true);
  });

  it("opens when session flag remains after strict-mode remount", () => {
    expect(
      shouldAutoOpenBenchmarkExpertOptIn({
        justCreated: false,
        benchmarkJustCreatedFlag: "1",
        expertOptInShown: null,
      }),
    ).toBe(true);
  });

  it("does not open when already shown", () => {
    expect(
      shouldAutoOpenBenchmarkExpertOptIn({
        justCreated: true,
        benchmarkJustCreatedFlag: "1",
        expertOptInShown: "1",
      }),
    ).toBe(false);
  });

  it("does not open for returning visitors", () => {
    expect(
      shouldAutoOpenBenchmarkExpertOptIn({
        justCreated: false,
        benchmarkJustCreatedFlag: null,
        expertOptInShown: null,
      }),
    ).toBe(false);
  });
});
