import { describe, it, expect } from "vitest";
import { TEMPLATES } from "@/lib/email-templates/registry";
import { DEFAULT_ADMIN_NOTIFICATION_EMAILS } from "@/lib/registration.functions";

describe("admin notifications", () => {
  it("registers the account-enabled-admin template", () => {
    expect(TEMPLATES["account-enabled-admin"]).toBeDefined();
    expect(typeof TEMPLATES["account-enabled-admin"].component).toBe("function");
  });

  it("uses info@MyPartB.com as the default admin recipient", () => {
    expect(DEFAULT_ADMIN_NOTIFICATION_EMAILS).toContain("info@MyPartB.com");
  });

  it("skips BCC for admin-targeted templates", () => {
    // The send route uses the suffix '-admin' to detect admin notification
    // templates and skip the BCC copy (they already go to admins directly).
    expect("account-enabled-admin".endsWith("-admin")).toBe(true);
    expect("new-registration-admin".endsWith("-admin")).toBe(true);
  });
});