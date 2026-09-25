import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("Memberships page", () => {
  const src = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../components/admin/MembershipsPage.tsx"),
    "utf8",
  );

  it("hides deleted users by default and excludes them from counts", () => {
    expect(src).toContain('data-testid="memberships-show-deleted"');
    expect(src).toContain("Show deleted users");
    expect(src).toContain("const [showDeleted, setShowDeleted] = useState(false);");
    expect(src).toContain("fetchUsers({ includeDeleted: true })");
    expect(src).toContain("membershipDirectoryView(users, showDeleted)");
    expect(src).toContain("forCounts: liveUsers");
    expect(src).toContain("forList: directoryUsers");
    expect(src).toContain("data-testid=\"memberships-showing-count\"");
  });

  it("lists membership details with the same credit and plan controls as Users Area", () => {
    expect(src).toContain("UsersMembershipAdjust");
    expect(src).toContain("UsersCreditAdjust");
    expect(src).toContain("adminMembershipTierLabel");
    expect(src).toContain("formatKidCreditBalance");
  });
});
