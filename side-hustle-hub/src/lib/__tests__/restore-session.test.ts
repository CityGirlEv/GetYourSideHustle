import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.fn();
const store = new Map<string, string>();

vi.stubGlobal("sessionStorage", {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => {
    store.clear();
  },
});

vi.mock("../api", () => ({
  api: (...args: unknown[]) => apiMock(...args),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  setSessionToken: vi.fn(),
}));

import { restoreSession } from "../auth";

const starter = {
  id: "u-brenda",
  name: "Brenda",
  email: "brenda@example.com",
  role: "user",
  status: "active",
  joinedAt: "2026-01-01",
  notes: "",
  canLogin: true,
  membershipTier: "starter",
};

describe("restoreSession", () => {
  beforeEach(() => {
    apiMock.mockReset();
    store.clear();
  });

  afterEach(() => {
    store.clear();
  });

  it("restores a Starter cookie session even when this tab has no local login marker", async () => {
    apiMock.mockResolvedValueOnce({ user: starter });
    const user = await restoreSession();
    expect(user?.email).toBe("brenda@example.com");
    expect(sessionStorage.getItem("gysh_tab_alive")).toBe("1");
  });

  it("stays signed out when /auth/me has no user and this tab was never marked alive", async () => {
    apiMock.mockRejectedValueOnce(new Error("unauthorized"));
    await expect(restoreSession()).resolves.toBeNull();
  });
});
