import { describe, expect, it } from "vitest";
import {
  VSPW_MIN_TIER,
  VSPW_PRODUCT_NAME,
  canAccessVspw,
  vspwIsComingSoon,
  vspwStatusLabel,
} from "../vspw";

describe("vspw feature gate", () => {
  it("names the product and Pro minimum tier", () => {
    expect(VSPW_PRODUCT_NAME).toMatch(/Video Scene Production Wizard/i);
    expect(VSPW_MIN_TIER).toBe("pro");
  });

  it("allows Pro, Elite, and admins — not Free or Starter", () => {
    expect(canAccessVspw("free")).toBe(false);
    expect(canAccessVspw("starter")).toBe(false);
    expect(canAccessVspw("pro")).toBe(true);
    expect(canAccessVspw("elite")).toBe(true);
    expect(canAccessVspw("free", { isAdmin: true })).toBe(true);
  });

  it("marks production Coming Soon and local Dev as WIP", () => {
    expect(vspwIsComingSoon(false)).toBe(true);
    expect(vspwStatusLabel(false)).toMatch(/coming soon/i);
    expect(vspwIsComingSoon(true)).toBe(false);
    expect(vspwStatusLabel(true)).toMatch(/local build/i);
  });
});
