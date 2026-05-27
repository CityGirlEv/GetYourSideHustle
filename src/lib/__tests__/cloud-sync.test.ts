import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
    from: vi.fn(),
    storage: { from: vi.fn() },
  },
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { cloudPushTest, cloudSyncAllTasks, lastSyncedAt, syncLocalToCloud } from "../cloud-sync";

beforeEach(() => {
  localStorage.clear();
});

describe("cloud-sync", () => {
  it("lastSyncedAt reads localStorage", () => {
    expect(lastSyncedAt()).toBeNull();
    localStorage.setItem("cloud-synced-at", "2026-01-01");
    expect(lastSyncedAt()).toBe("2026-01-01");
  });

  it("cloudPushTest returns false when not signed in", async () => {
    const ok = await cloudPushTest("T1", { status: "pass" });
    expect(ok).toBe(false);
  });

  it("syncLocalToCloud throws when not signed in", async () => {
    await expect(syncLocalToCloud()).rejects.toThrow("Not signed in");
  });

  it("cloudSyncAllTasks returns null when not signed in", async () => {
    const r = await cloudSyncAllTasks([]);
    expect(r).toBeNull();
  });
});