import { describe, expect, it, beforeEach } from "vitest";
import {
  clearStaffNavUser,
  hasStaffNavHint,
  persistStaffNavUser,
} from "@/lib/staff-nav-session";

describe("staff-nav-session", () => {
  beforeEach(() => {
    clearStaffNavUser();
  });

  it("persists and checks staff nav hint for a user id", () => {
    expect(hasStaffNavHint("user-1")).toBe(false);
    persistStaffNavUser("user-1");
    expect(hasStaffNavHint("user-1")).toBe(true);
    expect(hasStaffNavHint("user-2")).toBe(false);
  });

  it("clears staff nav hint", () => {
    persistStaffNavUser("user-1");
    clearStaffNavUser();
    expect(hasStaffNavHint("user-1")).toBe(false);
  });
});
