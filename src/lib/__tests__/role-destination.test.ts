import { describe, it, expect } from "vitest";
import { roleDestination } from "../role-destination";
import { safeSignInRedirect } from "../auth-redirect";

describe("roleDestination", () => {
  it("sends admins and Leads Admin to /admin", () => {
    expect(roleDestination("admin")).toBe("/admin");
    expect(roleDestination("leads_admin")).toBe("/admin");
  });
  it("sends agents to /agent", () => {
    expect(roleDestination("agent")).toBe("/agent");
  });
  it("sends QA users straight to the Testing Portal", () => {
    expect(roleDestination("qa")).toBe("/testing");
  });
  it("sends clients to home (scenario builder)", () => {
    expect(roleDestination("client")).toBe("/");
  });
  it("falls back to /agent for advisor/editor/viewer/unknown/null", () => {
    expect(roleDestination("advisor")).toBe("/agent");
    expect(roleDestination("editor")).toBe("/agent");
    expect(roleDestination("viewer")).toBe("/agent");
    expect(roleDestination("something-else")).toBe("/agent");
    expect(roleDestination(null)).toBe("/agent");
    expect(roleDestination(undefined)).toBe("/agent");
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

describe("qa routing override", () => {
  it("routes QA users to /testing even when their primary role is something else", () => {
    const userWithQaRole = { roles: ["qa", "agent"], role: "agent" };
    const qaOverride = userWithQaRole.roles.includes("qa") ? "/testing" : null;
    const destination = qaOverride ?? roleDestination(userWithQaRole.role);
    expect(destination).toBe("/testing");
  });

  it("does not override when the user has no qa role", () => {
    const userWithoutQa = { roles: ["agent"], role: "agent" };
    const qaOverride = userWithoutQa.roles.includes("qa") ? "/testing" : null;
    const destination = qaOverride ?? roleDestination(userWithoutQa.role);
    expect(destination).toBe("/agent");
  });
});
