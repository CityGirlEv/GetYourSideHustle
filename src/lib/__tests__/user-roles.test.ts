import { describe, it, expect } from "vitest";
import {
  userHasAdminRole,
  userHasAgentRole,
  userHasQaRole,
  userHasLeadsAdminRole,
  userCanViewAllScenarios,
  userCanSeeAdminMenu,
  userCanSeeAllPlanFilterCount,
  userCanSeeAllPlansRow,
  userCanAccessAgentUpsellFeatures,
  userCanAccessFullPlanCatalog,
  userCanAccessZipCountyReport,
  userCanAccessISnpCatalog,
} from "../user-roles";
import {
  userCanAccessCountyReportZip3,
  userCanAccessCountyReportZip5,
} from "../agent-package-access";

describe("userHasAdminRole", () => {
  it("returns true for primary admin role", () => {
    expect(userHasAdminRole({ role: "admin", roles: ["admin"] })).toBe(true);
  });

  it("returns true for Leads Admin role", () => {
    expect(userHasAdminRole({ role: "leads_admin", roles: ["admin", "leads_admin"] })).toBe(true);
  });

  it("returns true when admin is in roles even if primary role differs", () => {
    expect(userHasAdminRole({ role: "qa", roles: ["qa", "admin"] })).toBe(true);
  });

  it("returns false for non-admin users", () => {
    expect(userHasAdminRole({ role: "qa", roles: ["qa"] })).toBe(false);
    expect(userHasAdminRole(null)).toBe(false);
  });
});

describe("userCanSeeAdminMenu", () => {
  it("returns true only for the admin role", () => {
    expect(userCanSeeAdminMenu({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanSeeAdminMenu({ role: "qa", roles: ["qa", "admin"] })).toBe(true);
    expect(userCanSeeAdminMenu({ role: "qa", roles: ["qa"] })).toBe(false);
    expect(userCanSeeAdminMenu({ role: "editor", roles: ["editor"] })).toBe(false);
    expect(userCanSeeAdminMenu({ role: "leads_admin", roles: ["leads_admin"] })).toBe(false);
    expect(userCanSeeAdminMenu({ role: "agent", roles: ["agent"] })).toBe(false);
  });
});

describe("userHasLeadsAdminRole", () => {
  it("returns true only for leads_admin", () => {
    expect(userHasLeadsAdminRole({ role: "leads_admin", roles: ["admin", "leads_admin"] })).toBe(
      true,
    );
    expect(userHasLeadsAdminRole({ role: "admin", roles: ["admin"] })).toBe(false);
  });
});

describe("userCanViewAllScenarios", () => {
  it("returns true only for Leads Admin", () => {
    expect(userCanViewAllScenarios({ role: "leads_admin", roles: ["leads_admin"] })).toBe(true);
    expect(userCanViewAllScenarios({ role: "admin", roles: ["admin"] })).toBe(false);
  });
});

describe("userHasQaRole", () => {
  it("returns true for qa role", () => {
    expect(userHasQaRole({ role: "qa", roles: ["qa"] })).toBe(true);
    expect(userHasQaRole({ role: "agent", roles: ["agent", "qa"] })).toBe(true);
  });

  it("returns false for non-qa users", () => {
    expect(userHasQaRole({ role: "agent", roles: ["agent"] })).toBe(false);
    expect(userHasQaRole(null)).toBe(false);
  });
});

describe("userCanSeeAllPlansRow", () => {
  it("returns true for logged-in admins, agents, and QA", () => {
    expect(userCanSeeAllPlansRow({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanSeeAllPlansRow({ role: "qa", roles: ["qa", "admin"] })).toBe(true);
    expect(userCanSeeAllPlansRow({ role: "agent", roles: ["agent"] })).toBe(true);
    expect(userCanSeeAllPlansRow({ role: "qa", roles: ["qa"] })).toBe(true);
  });

  it("returns false when logged out or other roles", () => {
    expect(userCanSeeAllPlansRow(null)).toBe(false);
    expect(userCanSeeAllPlansRow({ role: "customer", roles: ["customer"] })).toBe(false);
  });
});

describe("userCanAccessISnpCatalog", () => {
  it("matches full plan catalog access (display-only MVP)", () => {
    expect(userCanAccessISnpCatalog({ role: "agent", roles: ["agent"] })).toBe(true);
    expect(userCanAccessISnpCatalog({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanAccessISnpCatalog({ role: "qa", roles: ["qa"] })).toBe(true);
    expect(userCanAccessISnpCatalog(null)).toBe(false);
  });
});

describe("userHasAgentRole", () => {
  it("returns true for agent role", () => {
    expect(userHasAgentRole({ role: "agent", roles: ["agent"] })).toBe(true);
  });

  it("returns false for non-agents", () => {
    expect(userHasAgentRole({ role: "admin", roles: ["admin"] })).toBe(false);
    expect(userHasAgentRole(null)).toBe(false);
  });
});

describe("userCanAccessFullPlanCatalog", () => {
  it("returns true for QA, agent, and admin", () => {
    expect(userCanAccessFullPlanCatalog({ role: "qa", roles: ["qa"] })).toBe(true);
    expect(userCanAccessFullPlanCatalog({ role: "agent", roles: ["agent"] })).toBe(true);
    expect(userCanAccessFullPlanCatalog({ role: "admin", roles: ["admin"] })).toBe(true);
  });

  it("returns false for other users", () => {
    expect(userCanAccessFullPlanCatalog({ role: "customer", roles: ["customer"] })).toBe(false);
    expect(userCanAccessFullPlanCatalog(null)).toBe(false);
  });
});

describe("userCanAccessAgentUpsellFeatures", () => {
  it("returns true for agent or admin", () => {
    expect(userCanAccessAgentUpsellFeatures({ role: "agent", roles: ["agent"] })).toBe(true);
    expect(userCanAccessAgentUpsellFeatures({ role: "admin", roles: ["admin"] })).toBe(true);
  });

  it("returns false for other users", () => {
    expect(userCanAccessAgentUpsellFeatures({ role: "qa", roles: ["qa"] })).toBe(false);
    expect(userCanAccessAgentUpsellFeatures(null)).toBe(false);
  });
});

describe("userCanAccessZipCountyReport", () => {
  it("matches agent upsell access (panel visibility)", () => {
    expect(userCanAccessZipCountyReport({ role: "agent", roles: ["agent"] })).toBe(true);
    expect(userCanAccessZipCountyReport({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanAccessZipCountyReport({ role: "customer", roles: ["customer"] })).toBe(false);
  });
});

describe("county report mode gating", () => {
  it("grants both modes to admin and neither to agents without add-ons", () => {
    expect(userCanAccessCountyReportZip3({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanAccessCountyReportZip5({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanAccessCountyReportZip3({ role: "agent", roles: ["agent"] })).toBe(false);
    expect(userCanAccessCountyReportZip5({ role: "agent", roles: ["agent"] })).toBe(false);
  });
});

describe("userCanSeeAllPlanFilterCount", () => {
  it("returns true for admin only", () => {
    expect(userCanSeeAllPlanFilterCount({ role: "admin", roles: ["admin"] })).toBe(true);
    expect(userCanSeeAllPlanFilterCount({ role: "qa", roles: ["qa", "admin"] })).toBe(true);
  });

  it("returns false for agents, anonymous, and other users", () => {
    expect(userCanSeeAllPlanFilterCount({ role: "agent", roles: ["agent"] })).toBe(false);
    expect(userCanSeeAllPlanFilterCount({ role: "leads_admin", roles: ["leads_admin"] })).toBe(false);
    expect(userCanSeeAllPlanFilterCount({ role: "qa", roles: ["qa"] })).toBe(false);
    expect(userCanSeeAllPlanFilterCount(null)).toBe(false);
  });
});