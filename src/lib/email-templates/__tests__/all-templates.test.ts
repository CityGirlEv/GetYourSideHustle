import { describe, it, expect } from "vitest";
import { ALL_TEMPLATES } from "../all-templates.server";

describe("ALL_TEMPLATES catalog", () => {
  it("includes transactional and auth templates for the admin editor", () => {
    const transactional = ALL_TEMPLATES.filter((t) => t.kind === "transactional");
    const auth = ALL_TEMPLATES.filter((t) => t.kind === "auth");
    expect(transactional.length).toBeGreaterThanOrEqual(8);
    expect(auth.length).toBe(6);
    expect(new Set(auth.map((t) => t.name))).toEqual(
      new Set(["email_change", "invite", "magiclink", "recovery", "reauthentication", "signup"]),
    );
  });
});
