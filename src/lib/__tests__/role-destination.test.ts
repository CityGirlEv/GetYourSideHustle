import { describe, it, expect } from "vitest";
import { roleDestination } from "../role-destination";

describe("roleDestination", () => {
  it("sends admins to /admin", () => {
    expect(roleDestination("admin")).toBe("/admin");
  });
  it("sends agents to /agent", () => {
    expect(roleDestination("agent")).toBe("/agent");
  });
  it("sends QA users straight to the Testing Portal", () => {
    expect(roleDestination("qa")).toBe("/testing");
  });
  it("falls back to /advisor for advisor/editor/viewer/unknown/null", () => {
    expect(roleDestination("advisor")).toBe("/advisor");
    expect(roleDestination("editor")).toBe("/advisor");
    expect(roleDestination("viewer")).toBe("/advisor");
    expect(roleDestination("something-else")).toBe("/advisor");
    expect(roleDestination(null)).toBe("/advisor");
    expect(roleDestination(undefined)).toBe("/advisor");
  });
});