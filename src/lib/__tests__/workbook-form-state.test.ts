import { describe, expect, it, beforeEach } from "vitest";
import { getBenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";
import {
  emptyWorkbookFormState,
  loadWorkbookFormState,
  saveWorkbookFormState,
  workbookFormStorageKey,
} from "@/lib/workbook-form-state";

describe("workbook-form-state", () => {
  const workbook = getBenchmarkWorkbookContent();

  beforeEach(() => {
    localStorage.clear();
  });

  it("uses per-scenario storage keys", () => {
    expect(workbookFormStorageKey("bm-abc")).toBe("pbo-turning-65-wkbk-form-v1:BM-ABC");
    expect(workbookFormStorageKey()).toBe("pbo-turning-65-wkbk-form-v1");
  });

  it("does not bleed answers between scenarios", () => {
    const stateA = emptyWorkbookFormState(workbook);
    stateA.checked["workbook-before-compare:0"] = true;
    stateA.lines["workbook-agent-questions:notes:line-0"] = "Scenario A note";
    saveWorkbookFormState(stateA, "BM-A");

    const loadedB = loadWorkbookFormState(workbook, { scenarioCode: "BM-B", seedFromIntake: false });
    expect(loadedB.checked["workbook-before-compare:0"]).toBe(false);
    expect(loadedB.lines["workbook-agent-questions:notes:line-0"]).toBeUndefined();

    const loadedA = loadWorkbookFormState(workbook, { scenarioCode: "BM-A", seedFromIntake: false });
    expect(loadedA.checked["workbook-before-compare:0"]).toBe(true);
    expect(loadedA.lines["workbook-agent-questions:notes:line-0"]).toBe("Scenario A note");
  });

  it("skips intake medication seed when seedFromIntake is false", () => {
    const loaded = loadWorkbookFormState(workbook, {
      scenarioCode: "BM-NEW",
      seedFromIntake: false,
      medicationNames: ["Lisinopril"],
    });
    expect(loaded.lines["workbook-extra-prescriptions:drug-0"]).toBeUndefined();
  });
});
