import { describe, it, expect } from "vitest";
import {
  resolveDiagnosis,
  isDME,
  searchMedCatalog,
  MED_CATALOG,
  COMMON_MEDS_BY_CONDITION,
  getCommonMedsForCondition,
} from "../diagnosis-resolver";

describe("resolveDiagnosis", () => {
  it("maps common drugs to diagnoses", () => {
    expect(resolveDiagnosis("Lisinopril")).toBe("Hypertension");
    expect(resolveDiagnosis("atorvastatin 20mg")).toBe("Hyperlipidemia");
    expect(resolveDiagnosis("Metformin")).toBe("Type 2 Diabetes");
    expect(resolveDiagnosis("Eliquis")).toBe("Anticoagulation");
    expect(resolveDiagnosis("Alendronate")).toBe("Osteoporosis");
    expect(resolveDiagnosis("Donepezil")).toBe("Alzheimer's Disease");
  });
  it("returns undefined for unknown drugs", () => {
    expect(resolveDiagnosis("zzz-fake")).toBeUndefined();
  });
});

describe("isDME", () => {
  it("flags Part B DME items", () => {
    expect(isDME("Dexcom G7")).toBe(true);
    expect(isDME("CPAP machine")).toBe(true);
    expect(isDME("Omnipod 5")).toBe(true);
  });
  it("returns false for oral meds", () => {
    expect(isDME("Metformin")).toBe(false);
  });
});

describe("searchMedCatalog", () => {
  it("returns [] for queries shorter than 2 chars", () => {
    expect(searchMedCatalog("a")).toEqual([]);
    expect(searchMedCatalog("")).toEqual([]);
  });
  it("matches starts-with before contains", () => {
    const res = searchMedCatalog("met");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].name.toLowerCase().startsWith("met")).toBe(true);
  });
  it("honors the limit argument", () => {
    expect(searchMedCatalog("a", 3).length).toBeLessThanOrEqual(3);
  });
  it("matches aliases", () => {
    const res = searchMedCatalog("lipitor");
    expect(res.some((r) => r.name === "Atorvastatin")).toBe(true);
  });
  it("includes SCEN-QA audit drugs in the pricing catalog", () => {
    for (const name of [
      "Alendronate",
      "Donepezil",
      "Buspirone",
      "Clopidogrel",
      "Entresto",
      "Carbidopa-Levodopa",
      "Humira",
      "Ocrevus",
    ]) {
      expect(searchMedCatalog(name.toLowerCase(), 1).some((r) => r.name === name)).toBe(true);
    }
  });
});

describe("MED_CATALOG", () => {
  it("has unique medication names", () => {
    const names = MED_CATALOG.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("COMMON_MEDS_BY_CONDITION", () => {
  it("lists at least one med per condition", () => {
    for (const [, meds] of Object.entries(COMMON_MEDS_BY_CONDITION)) {
      expect(meds.length).toBeGreaterThan(0);
    }
  });
});

describe("getCommonMedsForCondition", () => {
  it("returns preset meds for exact condition keys", () => {
    expect(getCommonMedsForCondition("Diabetes").map((m) => m.name)).toContain("Metformin");
  });

  it("maps free-text other conditions to related meds", () => {
    const asthma = getCommonMedsForCondition("Asthma");
    expect(asthma.length).toBeGreaterThan(0);
    expect(asthma.map((m) => m.name)).toContain("Albuterol");

    const osteoporosis = getCommonMedsForCondition("Osteoporosis");
    expect(osteoporosis.length).toBeGreaterThan(0);
    expect(osteoporosis.map((m) => m.name)).toContain("Alendronate");
  });

  it("returns empty for blank input", () => {
    expect(getCommonMedsForCondition("")).toEqual([]);
    expect(getCommonMedsForCondition("   ")).toEqual([]);
  });
});
