import { beforeEach, describe, expect, it } from "vitest";
import { BENCHMARK_ESTIMATE_STORE_PREFIX } from "@/lib/benchmark-id";
import {
  discoverBenchmarkEstimatesFromStorage,
  filterBenchmarkEstimateHistory,
  formatBenchmarkSavedAt,
  listBenchmarkEstimateHistory,
  rememberBenchmarkEstimate,
  syncBenchmarkEstimateIndexFromStorage,
} from "@/lib/benchmark-estimate-history";

beforeEach(() => {
  localStorage.clear();
});

describe("formatBenchmarkSavedAt", () => {
  it("formats millisecond timestamps with date and time", () => {
    const formatted = formatBenchmarkSavedAt(Date.UTC(2026, 6, 4, 14, 15, 0));
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Jul");
    expect(formatted).toMatch(/\d/);
  });

  it("formats ISO strings with date and time", () => {
    const formatted = formatBenchmarkSavedAt("2026-07-04T14:15:00.000Z");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Jul");
  });

  it("returns an em dash for invalid values", () => {
    expect(formatBenchmarkSavedAt("not-a-date")).toBe("—");
  });
});

describe("benchmark estimate history storage", () => {
  it("returns [] when nothing stored", () => {
    expect(listBenchmarkEstimateHistory()).toEqual([]);
  });

  it("remembers estimates newest-first and de-dupes by id", () => {
    rememberBenchmarkEstimate({ id: "BM-AAA", zip3: "705" });
    rememberBenchmarkEstimate({ id: "BM-BBB", zip3: "303" });
    rememberBenchmarkEstimate({ id: "BM-AAA", zip3: "705" });

    expect(listBenchmarkEstimateHistory().map((entry) => entry.id)).toEqual(["BM-AAA", "BM-BBB"]);
  });

  it("keeps all saved estimates without an arbitrary cap", () => {
    for (let i = 0; i < 25; i++) {
      rememberBenchmarkEstimate({ id: `BM-${i}`, zip3: "705" });
    }

    expect(listBenchmarkEstimateHistory()).toHaveLength(25);
  });

  it("survives corrupt JSON", () => {
    localStorage.setItem("benchmark-estimate:index", "not-json");
    expect(listBenchmarkEstimateHistory()).toEqual([]);
  });

  it("keeps index entries even when zip3 is missing", () => {
    localStorage.setItem(
      "benchmark-estimate:index",
      JSON.stringify([{ id: "BM-OLD", createdAt: 1 }]),
    );
    expect(listBenchmarkEstimateHistory()).toEqual([
      { id: "BM-OLD", zip3: "—", createdAt: 1 },
    ]);
  });

  it("backfills orphaned store payloads dropped from the index", () => {
    localStorage.setItem(
      `${BENCHMARK_ESTIMATE_STORE_PREFIX}BM-705A`,
      JSON.stringify({
        estimateId: "BM-705A",
        intake: { zip3: "705" },
        report: { zip3: "705" },
      }),
    );
    localStorage.setItem(
      `${BENCHMARK_ESTIMATE_STORE_PREFIX}BM-705B`,
      JSON.stringify({
        estimateId: "BM-705B",
        intake: { zip3: "705" },
        report: { zip3: "705" },
      }),
    );
    localStorage.setItem(
      "benchmark-estimate:index",
      JSON.stringify([{ id: "BM-RECENT", zip3: "303", createdAt: 99 }]),
    );

    const merged = syncBenchmarkEstimateIndexFromStorage();
    expect(merged.map((entry) => entry.id).sort()).toEqual(["BM-705A", "BM-705B", "BM-RECENT"]);
    expect(discoverBenchmarkEstimatesFromStorage().map((entry) => entry.zip3)).toEqual(["705", "705"]);
  });

  it("filters by ZIP3 prefix and benchmark ID", () => {
    rememberBenchmarkEstimate({ id: "BM-AAA", zip3: "705" });
    rememberBenchmarkEstimate({ id: "BM-BBB", zip3: "303" });
    const all = listBenchmarkEstimateHistory();

    expect(filterBenchmarkEstimateHistory(all, "705").map((entry) => entry.id)).toEqual(["BM-AAA"]);
    expect(filterBenchmarkEstimateHistory(all, "bm-bbb").map((entry) => entry.id)).toEqual(["BM-BBB"]);
  });
});
