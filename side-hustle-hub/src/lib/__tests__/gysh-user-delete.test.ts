import { describe, expect, it } from "vitest";
import {
  countDeletedDirectoryUsers,
  filterDirectoryUsers,
  membershipDirectoryView,
  gyshMembershipClearBlockReason,
  gyshUserDeleteBlockReason,
  gyshUserDeleteConfirmMessage,
  gyshUserDeletedEmailTombstone,
  isDeletedGyshUser,
  isGyshUserDeletedEmail,
  isGyshUserDeletedStatus,
  isProtectedFounderUserId,
  PROTECTED_FOUNDER_USER_IDS,
  userMatchesDirectoryStatus,
  usersListIncludesDeleted,
} from "../gysh-user-delete";

describe("gysh-user-delete", () => {
  it("protects Tina and Evelyn co-founder ids", () => {
    expect(PROTECTED_FOUNDER_USER_IDS).toEqual(["u-tina", "u-ev"]);
    expect(isProtectedFounderUserId("u-tina")).toBe(true);
    expect(isProtectedFounderUserId("u-ev")).toBe(true);
    expect(isProtectedFounderUserId("u-lyriq")).toBe(false);
    expect(isProtectedFounderUserId("u-member-1")).toBe(false);
  });

  it("tombstones deleted emails so the original address can re-register", () => {
    expect(gyshUserDeletedEmailTombstone("u-guest-1")).toBe("deleted.u-guest-1@users.deleted.local");
    expect(isGyshUserDeletedEmail("deleted.u-guest-1@users.deleted.local")).toBe(true);
    expect(isGyshUserDeletedEmail("jordan@example.com")).toBe(false);
    expect(isGyshUserDeletedStatus("deleted")).toBe(true);
    expect(isGyshUserDeletedStatus("active")).toBe(false);
  });

  it("allows deleting ordinary members", () => {
    expect(gyshUserDeleteBlockReason({ targetId: "u-guest-1", actorId: "u-ev" })).toBeNull();
  });

  it("rejects co-founder deletes", () => {
    expect(gyshUserDeleteBlockReason({ targetId: "u-tina", actorId: "u-ev" })).toBe(
      "Cannot delete co-founder admin accounts.",
    );
    expect(gyshUserDeleteBlockReason({ targetId: "u-ev", actorId: "u-tina" })).toBe(
      "Cannot delete co-founder admin accounts.",
    );
  });

  it("rejects deleting your own account", () => {
    expect(gyshUserDeleteBlockReason({ targetId: "u-lyriq", actorId: "u-lyriq" })).toBe(
      "You cannot delete your own account.",
    );
  });

  it("asks are you sure before soft-deleting a user", () => {
    expect(gyshUserDeleteConfirmMessage({ name: "Jordan Lee", email: "jordan@example.com" })).toBe(
      "Are you sure you want to delete Jordan Lee (jordan@example.com)? The account will be flagged deleted (kept on file). That email can sign up again as a new account.",
    );
    expect(gyshUserDeleteConfirmMessage({})).toBe(
      "Are you sure you want to delete this user? The account will be flagged deleted (kept on file). That email can sign up again as a new account.",
    );
  });

  it("allows clearing a paid membership back to Free", () => {
    expect(
      gyshMembershipClearBlockReason({ targetId: "u-member-1", currentTier: "starter" }),
    ).toBeNull();
    expect(gyshMembershipClearBlockReason({ targetId: "u-ev", currentTier: "elite" })).toBeNull();
  });

  it("rejects clearing a membership that is already Free", () => {
    expect(gyshMembershipClearBlockReason({ targetId: "u-member-1", currentTier: "free" })).toBe(
      "This member is already on Free.",
    );
    expect(gyshMembershipClearBlockReason({ targetId: "u-member-1" })).toBe(
      "This member is already on Free.",
    );
  });
});

describe("Users Area show/hide deleted users", () => {
  const active = { id: "u-a", status: "active" as const, email: "a@example.com" };
  const deleted = {
    id: "u-d",
    status: "deleted" as const,
    email: "deleted.u-d@users.deleted.local",
  };
  const tombstonedDisabled = {
    id: "u-old",
    status: "disabled" as const,
    email: "deleted.u-old@users.deleted.local",
  };

  it("treats tombstone emails as deleted even when status stayed disabled", () => {
    expect(isDeletedGyshUser(active)).toBe(false);
    expect(isDeletedGyshUser(deleted)).toBe(true);
    expect(isDeletedGyshUser(tombstonedDisabled)).toBe(true);
  });

  it("hides deleted users by default and shows them when the control is on", () => {
    const all = [active, deleted, tombstonedDisabled];
    expect(filterDirectoryUsers(all, false).map((u) => u.id)).toEqual(["u-a"]);
    expect(filterDirectoryUsers(all, true).map((u) => u.id)).toEqual(["u-a", "u-d", "u-old"]);
    expect(countDeletedDirectoryUsers(all)).toBe(2);
    expect(userMatchesDirectoryStatus(tombstonedDisabled, "deleted")).toBe(true);
    expect(userMatchesDirectoryStatus(tombstonedDisabled, "disabled")).toBe(true);
    expect(userMatchesDirectoryStatus(active, "deleted")).toBe(false);
    expect(userMatchesDirectoryStatus(active, "active")).toBe(true);
  });

  it("reads includeDeleted from the users list query string", () => {
    expect(usersListIncludesDeleted("/api/users")).toBe(false);
    expect(usersListIncludesDeleted("/api/users?includeDeleted=1")).toBe(true);
    expect(usersListIncludesDeleted("https://getyoursidehustle.com/api/users?showDeleted=true")).toBe(
      true,
    );
    expect(usersListIncludesDeleted("/api/users?includeDeleted=0")).toBe(false);
  });

  it("keeps deleted members out of Memberships counts even when the list shows them", () => {
    const all = [active, deleted, tombstonedDisabled];
    const hidden = membershipDirectoryView(all, false);
    expect(hidden.forCounts.map((u) => u.id)).toEqual(["u-a"]);
    expect(hidden.forList.map((u) => u.id)).toEqual(["u-a"]);
    expect(hidden.deletedCount).toBe(2);

    const shown = membershipDirectoryView(all, true);
    expect(shown.forCounts.map((u) => u.id)).toEqual(["u-a"]);
    expect(shown.forList.map((u) => u.id)).toEqual(["u-a", "u-d", "u-old"]);
    expect(shown.deletedCount).toBe(2);
  });
});
