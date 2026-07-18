import { beforeEach, describe, expect, it } from "vitest";
import { mergeBenchmarkHistorySources } from "@/hooks/use-benchmark-estimate-history";
import { mergeScenarioHistorySources } from "@/hooks/use-scenario-history";
import type { BenchmarkEstimateHistoryEntry } from "@/lib/benchmark-estimate-history";
import type { ScenarioHistoryEntry } from "@/lib/scenario-history";

describe("mergeBenchmarkHistorySources", () => {
  it("merges device and server entries without dropping either source", () => {
    const device: BenchmarkEstimateHistoryEntry[] = [
      { id: "BM-DEVICE", zip3: "705", createdAt: 200 },
      { id: "BM-SHARED", zip3: "705", createdAt: 100 },
    ];
    const server: BenchmarkEstimateHistoryEntry[] = [
      { id: "SCN-SERVER", zip3: "303", createdAt: 300 },
      { id: "BM-SHARED", zip3: "999", createdAt: 50 },
    ];

    const merged = mergeBenchmarkHistorySources(device, server);
    expect(merged.map((entry) => entry.id).sort()).toEqual([
      "BM-DEVICE",
      "BM-SHARED",
      "SCN-SERVER",
    ]);
    expect(merged.find((entry) => entry.id === "BM-SHARED")?.zip3).toBe("705");
  });

  it("sorts merged entries newest-first", () => {
    const merged = mergeBenchmarkHistorySources(
      [{ id: "BM-OLD", zip3: "705", createdAt: 1 }],
      [{ id: "SCN-NEW", zip3: "303", createdAt: 99 }],
    );
    expect(merged.map((entry) => entry.id)).toEqual(["SCN-NEW", "BM-OLD"]);
  });
});

describe("mergeScenarioHistorySources", () => {
  it("merges device and server SCN- entries", () => {
    const device: ScenarioHistoryEntry[] = [
      { code: "SCN-DEVICE", zip3: "705", createdAt: 10 },
    ];
    const server: ScenarioHistoryEntry[] = [
      { code: "SCN-SERVER", zip3: "303", createdAt: 20 },
    ];

    const merged = mergeScenarioHistorySources(device, server);
    expect(merged.map((entry) => entry.code).sort()).toEqual(["SCN-DEVICE", "SCN-SERVER"]);
  });
});
