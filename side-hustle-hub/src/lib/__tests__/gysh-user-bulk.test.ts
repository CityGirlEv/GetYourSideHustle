import { describe, expect, it } from "vitest";
import {
  applyBulkRolesChange,
  gyshBulkDeleteConfirmMessage,
  gyshBulkDeleteEligibleIds,
  gyshBulkUpdateBlockReason,
  gyshBulkResultMessage,
  normalizeBulkUserIds,
  parseBulkRoles,
  parseBulkRolesMode,
  parseBulkUserStatus,
  toggleBulkUserId,
} from "../gysh-user-bulk";

describe("gysh-user-bulk", () => {
  it("normalizes and de-dupes bulk ids", () => {
    expect(normalizeBulkUserIds([" u-1 ", "u-1", "", "u-2", null])).toEqual(["u-1", "u-2"]);
  });

  it("parses status and roles mode", () => {
    expect(parseBulkUserStatus("Active")).toBe("active");
    expect(parseBulkUserStatus("deleted")).toBeNull();
    expect(parseBulkRolesMode("add")).toBe("add");
    expect(parseBulkRolesMode("weird")).toBe("set");
    expect(parseBulkRoles(["adult", "qa", "nope", "adult"])).toEqual(["adult", "qa"]);
  });

  it("applies set / add / remove role modes", () => {
    expect(applyBulkRolesChange(["adult"], ["qa", "dev"], "set")).toEqual(["qa", "dev"]);
    expect(applyBulkRolesChange(["adult"], ["qa"], "add")).toEqual(["adult", "qa"]);
    expect(applyBulkRolesChange(["adult", "qa"], ["qa"], "remove")).toEqual(["adult"]);
    expect(applyBulkRolesChange(["adult"], ["adult"], "remove")).toBeNull();
  });

  it("skips protected and self ids for bulk delete", () => {
    const result = gyshBulkDeleteEligibleIds({
      ids: ["u-guest-1", "u-tina", "u-ev", "u-lyriq"],
      actorId: "u-lyriq",
    });
    expect(result.eligible).toEqual(["u-guest-1"]);
    expect(result.skipped.map((s) => s.id)).toEqual(["u-tina", "u-ev", "u-lyriq"]);
  });

  it("validates bulk update payload", () => {
    expect(gyshBulkUpdateBlockReason({ ids: [] })).toBe("Select at least one user.");
    expect(gyshBulkUpdateBlockReason({ ids: ["u-1"] })).toBe(
      "Choose a status and/or at least one role to update.",
    );
    expect(gyshBulkUpdateBlockReason({ ids: ["u-1"], status: "deleted" })).toBe(
      "Status must be active, pending, or disabled.",
    );
    expect(gyshBulkUpdateBlockReason({ ids: ["u-1"], status: "active" })).toBeNull();
    expect(gyshBulkUpdateBlockReason({ ids: ["u-1"], roles: ["adult"], rolesMode: "add" })).toBeNull();
  });

  it("describes bulk delete confirmation", () => {
    expect(gyshBulkDeleteConfirmMessage(1)).toContain("1 selected user");
    expect(gyshBulkDeleteConfirmMessage(3)).toContain("3 selected users");
  });

  it("toggles selected ids and summarizes bulk results", () => {
    expect(toggleBulkUserId(["u-1"], "u-2", true)).toEqual(["u-1", "u-2"]);
    expect(toggleBulkUserId(["u-1", "u-2"], "u-1", false)).toEqual(["u-2"]);
    expect(gyshBulkResultMessage({ action: "delete", changed: 3, skipped: 1 })).toBe(
      "Deleted 3 users. 1 skipped.",
    );
    expect(gyshBulkResultMessage({ action: "update", changed: 1, skipped: 0 })).toBe(
      "Updated 1 user.",
    );
  });
});
