import { describe, it, expect } from "vitest";
import { roleDestination } from "../role-destination";
import { safeSignInRedirect } from "../auth-redirect";

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

describe("safeSignInRedirect", () => {
  it("allows app-local redirects such as the task sheet", () => {
    expect(safeSignInRedirect("/tasks")).toBe("/tasks");
  });

  it("rejects external or malformed redirect values", () => {
    expect(safeSignInRedirect("https://example.com", "/admin")).toBe("/admin");
    expect(safeSignInRedirect("//example.com", "/admin")).toBe("/admin");
    expect(safeSignInRedirect(null, "/admin")).toBe("/admin");
  });
});