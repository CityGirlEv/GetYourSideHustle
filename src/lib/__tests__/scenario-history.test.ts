import { beforeEach, describe, expect, it } from "vitest";
import {
  discoverScenariosFromStorage,
  filterScenarioHistory,
  listScenarioHistory,
  rememberScenario,
  SCENARIO_SESSION_PREFIX,
  syncScenarioIndexFromStorage,
} from "../scenario-history";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("scenario-history", () => {
  it("returns [] when nothing stored", () => {
    expect(listScenarioHistory()).toEqual([]);
  });

  it("remembers scenarios newest-first and de-dupes", () => {
    rememberScenario("SCN-AAA", "705");
    rememberScenario("SCN-BBB", "303");
    rememberScenario("SCN-AAA", "705");
    const list = listScenarioHistory();
    expect(list.map((e) => e.code)).toEqual(["SCN-AAA", "SCN-BBB"]);
  });

  it("keeps all saved scenarios without an arbitrary cap", () => {
    for (let i = 0; i < 25; i++) rememberScenario(`SCN-C${i}`, "705");
    expect(listScenarioHistory()).toHaveLength(25);
  });

  it("survives corrupt JSON", () => {
    localStorage.setItem("scenario:index", "not-json");
    expect(listScenarioHistory()).toEqual([]);
  });

  it("keeps index entries even when zip3 is missing", () => {
    localStorage.setItem(
      "scenario:index",
      JSON.stringify([{ code: "SCN-OLD", createdAt: 1 }]),
    );
    expect(listScenarioHistory()).toEqual([
      { code: "SCN-OLD", zip3: "—", createdAt: 1 },
    ]);
  });

  it("backfills orphaned session payloads dropped from the index", () => {
    sessionStorage.setItem(
      `${SCENARIO_SESSION_PREFIX}SCN-705A`,
      JSON.stringify({
        scenarioCode: "SCN-705A",
        zip3: "705",
      }),
    );
    sessionStorage.setItem(
      `${SCENARIO_SESSION_PREFIX}SCN-705B`,
      JSON.stringify({
        scenarioCode: "SCN-705B",
        zip3: "705",
      }),
    );
    localStorage.setItem(
      "scenario:index",
      JSON.stringify([{ code: "SCN-RECENT", zip3: "303", createdAt: 99 }]),
    );

    const merged = syncScenarioIndexFromStorage();
    expect(merged.map((entry) => entry.code).sort()).toEqual([
      "SCN-705A",
      "SCN-705B",
      "SCN-RECENT",
    ]);
    expect(discoverScenariosFromStorage().map((entry) => entry.zip3)).toEqual(["705", "705"]);
  });

  it("filters by ZIP3 prefix and SCN- code", () => {
    rememberScenario("SCN-AAA", "705");
    rememberScenario("SCN-BBB", "303");
    const all = listScenarioHistory();

    expect(filterScenarioHistory(all, "705").map((entry) => entry.code)).toEqual(["SCN-AAA"]);
    expect(filterScenarioHistory(all, "scn-bbb").map((entry) => entry.code)).toEqual(["SCN-BBB"]);
  });
});
