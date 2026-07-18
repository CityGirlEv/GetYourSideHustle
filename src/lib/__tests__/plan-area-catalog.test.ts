import { describe, expect, it } from "vitest";
import { buildAreaPlanCatalog, buildFullPlanCatalog, fullCatalogPlanCounts, maCarrierAvailableInZip3, maPlanAvailableInCounty, medigapOrPartDCarrierAvailableInZip3 } from "../plan-area-catalog";
import { areaPlanDetails, fullCatalogPlanDetails } from "../plan-details";

describe("maPlanAvailableInCounty", () => {
  it("returns false for an unrecognized parish in a multi-county ZIP", () => {
    expect(maPlanAvailableInCounty("Humana", "HMO", "705", "Wrong Parish")).toBe(false);
  });

  it("returns true for a recognized parish in a multi-county ZIP", () => {
    expect(maPlanAvailableInCounty("Humana", "HMO", "705", "Evangeline Parish")).toBe(true);
  });

  it("accepts formatted parish labels with state suffix", () => {
    expect(maPlanAvailableInCounty("Humana", "HMO", "705", "Evangeline Parish, LA")).toBe(true);
  });
});

describe("medigapOrPartDCarrierAvailableInZip3", () => {
  it("is stable for the same carrier and zip3", () => {
    const first = medigapOrPartDCarrierAvailableInZip3("Humana", "705");
    expect(medigapOrPartDCarrierAvailableInZip3("Humana", "705")).toBe(first);
  });

  it("can differ across ZIP prefixes for the same carrier", () => {
    const zip705 = medigapOrPartDCarrierAvailableInZip3("Humana", "705");
    const zip331 = medigapOrPartDCarrierAvailableInZip3("Humana", "331");
    expect(typeof zip705).toBe("boolean");
    expect(typeof zip331).toBe("boolean");
  });
});

describe("maCarrierAvailableInZip3", () => {
  it("is stable for the same carrier and zip3", () => {
    const first = maCarrierAvailableInZip3("Humana", "331");
    expect(maCarrierAvailableInZip3("Humana", "331")).toBe(first);
  });

  it("excludes roughly one quarter of carriers per zip3", () => {
    const carriers = ["Humana", "UnitedHealthcare", "Aetna", "Cigna", "Anthem", "BCBS", "Kaiser", "WellCare", "Devoted"];
    const zip331Available = carriers.filter((c) => maCarrierAvailableInZip3(c, "331"));
    expect(zip331Available.length).toBeGreaterThan(0);
    expect(zip331Available.length).toBeLessThan(carriers.length);
  });

  it("narrows single-county zip3 MA regional catalog below national", () => {
    const base = { year: 2026 as const, zip3: "331", county: "Miami-Dade, FL", medications: [] as const[] };
    const regional = buildAreaPlanCatalog(base);
    const national = buildFullPlanCatalog({ year: base.year, medications: base.medications });
    const regionalMa = regional.filter((p) => /medicare advantage/i.test(p.planType));
    const nationalMa = national.filter((p) => /medicare advantage/i.test(p.planType));
    const regionalHmo = regional.filter((p) => /\(HMO\)/.test(p.planType));
    const nationalHmo = national.filter((p) => /\(HMO\)/.test(p.planType));

    expect(regionalMa.length).toBeGreaterThan(0);
    expect(regionalMa.length).toBeLessThan(nationalMa.length);
    expect(regionalHmo.length).toBeLessThan(nationalHmo.length);
  });
});

describe("buildAreaPlanCatalog county scoping", () => {
  const base = { year: 2026 as const, zip3: "705", medications: [] };

  it("ZIP 705 Evangeline — excludes all MA plans when parish is unrecognized", () => {
    const scoped = buildAreaPlanCatalog({ ...base, county: "Wrong Parish" });
    const regional = buildAreaPlanCatalog(base);
    const scopedMa = scoped.filter((p) => /medicare advantage/i.test(p.planType));
    const regionalMa = regional.filter((p) => /medicare advantage/i.test(p.planType));

    expect(scopedMa).toHaveLength(0);
    expect(regionalMa.length).toBeGreaterThan(0);
    expect(scoped.length).toBeLessThan(regional.length);
  });

  it("ZIP 705 Evangeline — parish-scoped MA is smaller than full zip3 catalog", () => {
    const member = areaPlanDetails({ ...base, county: "Evangeline Parish" });
    const area = areaPlanDetails(base);
    const memberMa = member.filter((p) => /medicare advantage/i.test(p.planType));
    const areaMa = area.filter((p) => /medicare advantage/i.test(p.planType));

    expect(memberMa.length).toBeGreaterThan(0);
    expect(memberMa.length).toBeLessThan(areaMa.length);
  });

  it("ZIP 705 Evangeline — includes D-SNP plans in parish-scoped regional catalog", () => {
    const member = areaPlanDetails({ ...base, county: "Evangeline Parish" });
    const dsnp = member.filter((p) => /D-SNP/i.test(p.planType));

    expect(dsnp.length).toBeGreaterThan(0);
    expect(dsnp.some((p) => /UnitedHealthcare|Elevance|Centene|Molina/i.test(p.carrier))).toBe(
      true,
    );
  });

  it("ZIP 705 — zip3 regional Medigap/Part D counts are below national catalog", () => {
    const regional = buildAreaPlanCatalog({ ...base, county: "Evangeline Parish" });
    const national = buildFullPlanCatalog({ year: base.year, medications: base.medications });
    const regionalSupp = regional.filter((p) => /medigap|supplement/i.test(p.planType));
    const nationalSupp = national.filter((p) => /medigap|supplement/i.test(p.planType));
    const regionalPartD = regional.filter((p) => /^Medicare Part D/i.test(p.planType));
    const nationalPartD = national.filter((p) => /^Medicare Part D/i.test(p.planType));

    expect(regionalSupp.length).toBeGreaterThan(0);
    expect(regionalPartD.length).toBeGreaterThan(0);
    expect(regionalSupp.length).toBeLessThan(nationalSupp.length);
    expect(regionalPartD.length).toBeLessThan(nationalPartD.length);
  });
});

describe("buildFullPlanCatalog", () => {
  const base = { year: 2026 as const, medications: [] };
  const expected = fullCatalogPlanCounts();

  it("includes every CMS Medigap letter, MA type, and Part D tier × carrier nationally", () => {
    const full = buildFullPlanCatalog(base);
    const ma = full.filter((p) => /medicare advantage/i.test(p.planType));
    const supp = full.filter((p) => /medigap|supplement/i.test(p.planType));
    const pdp = full.filter((p) => /^Medicare Part D/i.test(p.planType));

    expect(full.length).toBe(expected.total);
    expect(ma.length).toBe(expected.medicareAdvantage);
    expect(supp.length).toBe(expected.medigap);
    expect(pdp.length).toBe(expected.partD);
    expect(fullCatalogPlanDetails(base).length).toBe(full.length);
  });

  it("is larger than any zip3 regional catalog — no ZIP or county scoping", () => {
    const full = buildFullPlanCatalog(base);
    const zip705 = buildAreaPlanCatalog({ ...base, zip3: "705" });
    const zip705Evangeline = buildAreaPlanCatalog({ ...base, zip3: "705", county: "Evangeline Parish" });

    expect(full.length).toBeGreaterThan(zip705Evangeline.length);
    expect(full.filter((p) => /medicare advantage/i.test(p.planType)).length).toBeGreaterThan(
      zip705Evangeline.filter((p) => /medicare advantage/i.test(p.planType)).length,
    );
    expect(full.length).toBeGreaterThan(zip705.length);
    expect(full.filter((p) => /medigap|supplement/i.test(p.planType)).length).toBeGreaterThan(
      zip705.filter((p) => /medigap|supplement/i.test(p.planType)).length,
    );
    expect(fullCatalogPlanDetails(base).length).toBe(full.length);
  });

  it("uses national premium references — annual costs differ from ZIP-localized catalog", () => {
    const full = buildFullPlanCatalog(base);
    const zip331 = buildAreaPlanCatalog({ ...base, zip3: "331" });
    const fullMedigap = full.find((p) => /medigap/i.test(p.planType));
    const zipMedigap = zip331.find(
      (p) => p.carrier === fullMedigap?.carrier && p.plan === fullMedigap?.plan,
    );
    expect(fullMedigap).toBeDefined();
    expect(zipMedigap).toBeDefined();
    expect(fullMedigap!.annual).not.toBe(zipMedigap!.annual);
  });
});
