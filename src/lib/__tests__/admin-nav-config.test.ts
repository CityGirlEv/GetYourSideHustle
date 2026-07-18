import { describe, expect, it } from "vitest";
import {
  ADMIN_CONTENT_GROUP,
  ADMIN_MOBILE_SECTIONS,
  ADMIN_OPERATION_LINKS,
  ADMIN_QA_GROUP,
} from "@/lib/admin-nav-config";

describe("admin-nav-config", () => {
  it("groups content tools under one submenu", () => {
    expect(ADMIN_CONTENT_GROUP.items.map((item) => item.to)).toEqual([
      "/admin/content-factory",
      "/admin/calendar",
      "/admin/meta",
      "/admin/facebook-posts",
      "/admin/articles",
      "/admin/newsletter",
    ]);
  });

  it("groups QA tools under one highlighted submenu", () => {
    expect(ADMIN_QA_GROUP.highlight).toBe(true);
    expect(ADMIN_QA_GROUP.items).toHaveLength(3);
  });

  it("orders mobile admin sections with content before QA", () => {
    const titles = ADMIN_MOBILE_SECTIONS.map((section) =>
      section.type === "group" ? section.group.label : section.type === "links" ? section.title : "Admin",
    );
    expect(titles.indexOf("Content")).toBeLessThan(titles.indexOf("QA & Testing"));
  });

  it("links lead certificates and PBO scenarios to dedicated admin routes", () => {
    const leadCerts = ADMIN_OPERATION_LINKS.find((l) => l.label === "Lead Certificates");
    const pboScenarios = ADMIN_OPERATION_LINKS.find((l) => l.label === "PBO Scenarios");
    expect(leadCerts?.to).toBe("/admin/lead-certificates");
    expect(leadCerts?.hash).toBe("lead-certificates");
    expect(leadCerts?.search).toBeUndefined();
    expect(pboScenarios?.to).toBe("/admin/pbo-scenarios");
  });
});
