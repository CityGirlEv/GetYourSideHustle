import { describe, expect, it } from "vitest";
import { parseAuditListQuery } from "../audit-list-query";

describe("parseAuditListQuery", () => {
  it("defaults to 500 rows and no email filter", () => {
    expect(parseAuditListQuery("https://getyoursidehustle.com/api/audit")).toEqual({
      email: "",
      limit: 500,
    });
  });

  it("canonicalizes email and clamps limit", () => {
    expect(parseAuditListQuery("https://getyoursidehustle.com/api/audit?email=QA@Example.COM&limit=50")).toEqual({
      email: "qa@example.com",
      limit: 50,
    });
    expect(parseAuditListQuery("https://getyoursidehustle.com/api/audit?limit=99999").limit).toBe(2000);
    expect(parseAuditListQuery("https://getyoursidehustle.com/api/audit?limit=0").limit).toBe(1);
  });
});
