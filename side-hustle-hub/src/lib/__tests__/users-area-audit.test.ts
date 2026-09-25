import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("Users Area audit surface", () => {
  it("keeps a per-user Audit log dropdown and a page Audit Log tab", () => {
    const src = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../components/admin/UsersArea.tsx"),
      "utf8",
    );
    const trail = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../components/admin/UserAuditTrail.tsx"),
      "utf8",
    );
    expect(src).toContain("UserAuditTrail");
    expect(src).toContain('data-testid="users-area-tab-audit"');
    expect(src).toContain("users-audit-dropdown-");
    expect(src).toContain("Last logged in");
    expect(src).toContain("UsersCreditAdjust");
    expect(src).toContain("UsersMembershipAdjust");
    expect(src).toContain('data-testid="users-show-deleted"');
    expect(src).toContain("Show deleted users");
    expect(src).toContain('data-testid="users-showing-count"');
    expect(src).toContain("membershipDirectoryView(users, showDeleted)");
    expect(src).toContain("forCounts: liveUsers");
    expect(trail).toContain("Audit log (");
    expect(trail).toContain("aria-expanded");
  });
});
