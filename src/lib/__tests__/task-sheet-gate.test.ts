import { describe, it, expect } from "vitest";

/**
 * Mirrors the access gate in src/routes/tasks.tsx. While auth is loading
 * or the user has not hydrated yet, we must NOT show the "no access"
 * message — that was flashing for admins on first paint.
 */
type Gate = "loading" | "denied" | "allowed";

function taskSheetGate(authLoading: boolean, user: { role?: string } | null): Gate {
  if (authLoading || !user) return "loading";
  return user.role === "admin" ? "allowed" : "denied";
}

describe("task sheet access gate", () => {
  it("shows loading while auth is still resolving", () => {
    expect(taskSheetGate(true, null)).toBe("loading");
    expect(taskSheetGate(true, { role: "admin" })).toBe("loading");
  });

  it("shows loading when user has not hydrated yet", () => {
    expect(taskSheetGate(false, null)).toBe("loading");
  });

  it("allows admins once hydrated", () => {
    expect(taskSheetGate(false, { role: "admin" })).toBe("allowed");
  });

  it("denies non-admin roles once hydrated", () => {
    expect(taskSheetGate(false, { role: "qa" })).toBe("denied");
    expect(taskSheetGate(false, { role: "agent" })).toBe("denied");
    expect(taskSheetGate(false, { role: "viewer" })).toBe("denied");
  });
});