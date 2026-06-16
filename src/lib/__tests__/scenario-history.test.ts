import { describe, it, expect, beforeEach } from "vitest";
import { listScenarioHistory, rememberScenario } from "../scenario-history";

beforeEach(() => {
  localStorage.clear();
});

describe("scenario-history", () => {
  it("returns [] when nothing stored", () => {
    expect(listScenarioHistory()).toEqual([]);
  });
  it("remembers scenarios newest-first and de-dupes", () => {
    rememberScenario("AAA");
    rememberScenario("BBB");
    rememberScenario("AAA");
    const list = listScenarioHistory();
    expect(list.map((e) => e.code)).toEqual(["AAA", "BBB"]);
  });
  it("caps the list at 20 entries", () => {
    for (let i = 0; i < 25; i++) rememberScenario(`C${i}`);
    expect(listScenarioHistory().length).toBe(20);
  });
  it("survives corrupt JSON", () => {
    localStorage.setItem("scenario:index", "not-json");
    expect(listScenarioHistory()).toEqual([]);
  });
});
