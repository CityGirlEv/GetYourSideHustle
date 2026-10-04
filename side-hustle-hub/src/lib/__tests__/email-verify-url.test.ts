import { describe, expect, it } from "vitest";
import { MEMBERSHIP_ACTIVATION_ORIGIN, membershipActivationUrl } from "../email-verify-url";

describe("membership activation url", () => {
  it("always points at the live site, never localhost", () => {
    const url = membershipActivationUrl("abc 123");
    expect(url.startsWith(`${MEMBERSHIP_ACTIVATION_ORIGIN}/?verify=`)).toBe(true);
    expect(url).toContain("verify=abc%20123");
    expect(url).not.toMatch(/localhost|127\.0\.0\.1/i);
  });
});
