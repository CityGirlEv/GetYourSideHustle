import { describe, expect, it } from "vitest";
import {
  COUNTY_REPORT_ZIP3_FEATURE,
  COUNTY_REPORT_ZIP5_FEATURE,
  packageIncludesCountyReportZip3,
  packageIncludesCountyReportZip5,
  resolveAgentPackageForUser,
  userCanAccessAnyCountyReportMode,
  userCanAccessCountyReportZip3,
  userCanAccessCountyReportZip5,
} from "../agent-package-access";

describe("packageIncludesCountyReportZip3", () => {
  it("unlocks via Gold tier or county-report-zip3 add-on", () => {
    expect(packageIncludesCountyReportZip3("gold", [])).toBe(true);
    expect(packageIncludesCountyReportZip3("bronze", [])).toBe(false);
    expect(packageIncludesCountyReportZip3("bronze", ["county-report-zip3"])).toBe(true);
  });
});

describe("packageIncludesCountyReportZip5", () => {
  it("unlocks via Gold tier or county-report-zip5 add-on", () => {
    expect(packageIncludesCountyReportZip5("gold", [])).toBe(true);
    expect(packageIncludesCountyReportZip5("bronze", [])).toBe(false);
    expect(packageIncludesCountyReportZip5("bronze", ["county-report-zip5"])).toBe(true);
  });
});

describe("resolveAgentPackageForUser", () => {
  it("returns Gold for admin and Bronze for agents (MVP)", () => {
    expect(resolveAgentPackageForUser({ role: "admin", roles: ["admin"] }).tierId).toBe("gold");
    expect(resolveAgentPackageForUser({ role: "agent", roles: ["agent"] }).tierId).toBe("bronze");
    expect(resolveAgentPackageForUser(null).tierId).toBe("bronze");
  });
});

describe("userCanAccessCountyReportZip3", () => {
  it("grants admin Gold access and denies agents without add-on", () => {
    expect(userCanAccessCountyReportZip3({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanAccessCountyReportZip3({ role: "agent", roles: ["agent"] })).toBe(false);
    expect(
      userCanAccessCountyReportZip3(
        { role: "agent", roles: ["agent"] },
        { tierId: "bronze", addOnIds: ["county-report-zip3"] },
      ),
    ).toBe(true);
  });
});

describe("userCanAccessCountyReportZip5", () => {
  it("grants admin Gold access and denies agents without add-on", () => {
    expect(userCanAccessCountyReportZip5({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanAccessCountyReportZip5({ role: "agent", roles: ["agent"] })).toBe(false);
    expect(
      userCanAccessCountyReportZip5(
        { role: "agent", roles: ["agent"] },
        { tierId: "bronze", addOnIds: ["county-report-zip5"] },
      ),
    ).toBe(true);
  });
});

describe("userCanAccessAnyCountyReportMode", () => {
  it("is true when either mode is entitled", () => {
    expect(userCanAccessAnyCountyReportMode({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanAccessAnyCountyReportMode({ role: "agent", roles: ["agent"] })).toBe(false);
    expect(
      userCanAccessAnyCountyReportMode(
        { role: "agent", roles: ["agent"] },
        { tierId: "bronze", addOnIds: ["county-report-zip5"] },
      ),
    ).toBe(true);
  });
});

describe("county report feature ids", () => {
  it("uses distinct SKU feature ids", () => {
    expect(COUNTY_REPORT_ZIP3_FEATURE).toBe("county-report-zip3");
    expect(COUNTY_REPORT_ZIP5_FEATURE).toBe("county-report-zip5");
  });
});
