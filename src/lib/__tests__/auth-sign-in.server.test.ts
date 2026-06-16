import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUserById = vi.fn();
const mockMaybeSingle = vi.fn();
const mockFrom = vi.fn(() => ({
  select: vi.fn(() => ({
    ilike: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(() => ({
          maybeSingle: mockMaybeSingle,
        })),
      })),
    })),
  })),
}));

vi.mock("@/lib/env", () => ({
  getRuntimeConfig: () => "https://test.supabase.co",
  getRuntimeSecret: () => "test-service-key",
}));

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        getUserById: (...args: unknown[]) => mockGetUserById(...args),
      },
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import {
  ACCOUNT_STATUS_ADMIN_DISABLED,
  ACCOUNT_STATUS_ACTIVE,
  ACCOUNT_STATUS_PENDING,
  inferAccountAccessState,
  isSupabaseBannedSignInError,
  isUserBanActive,
  signInBlockMessageForState,
  resolveBannedSignInMessage,
} from "../auth-sign-in.server";

const futureBan = new Date(Date.now() + 86400000).toISOString();
const pastBan = new Date(Date.now() - 86400000).toISOString();

function mockFilterLookup(users: Array<Record<string, unknown>>) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ users }),
    }),
  );
}

describe("isUserBanActive", () => {
  it("returns true for a future banned_until", () => {
    expect(isUserBanActive(futureBan)).toBe(true);
  });

  it("returns false when ban has expired or is absent", () => {
    expect(isUserBanActive(pastBan)).toBe(false);
    expect(isUserBanActive(null)).toBe(false);
  });
});

describe("inferAccountAccessState", () => {
  it("returns active when the user is not banned", () => {
    expect(
      inferAccountAccessState({
        banned_until: null,
        app_metadata: { account_status: ACCOUNT_STATUS_PENDING },
      }),
    ).toBe(ACCOUNT_STATUS_ACTIVE);
  });

  it("returns pending approval from app_metadata", () => {
    expect(
      inferAccountAccessState({
        banned_until: futureBan,
        app_metadata: { account_status: ACCOUNT_STATUS_PENDING },
      }),
    ).toBe(ACCOUNT_STATUS_PENDING);
  });

  it("returns admin disabled from app_metadata", () => {
    expect(
      inferAccountAccessState({
        banned_until: futureBan,
        last_sign_in_at: null,
        app_metadata: { account_status: ACCOUNT_STATUS_ADMIN_DISABLED },
      }),
    ).toBe(ACCOUNT_STATUS_ADMIN_DISABLED);
  });

  it("falls back to pending approval for legacy banned users who never signed in", () => {
    expect(
      inferAccountAccessState({
        banned_until: futureBan,
        last_sign_in_at: null,
        app_metadata: {},
      }),
    ).toBe(ACCOUNT_STATUS_PENDING);
  });

  it("falls back to admin disabled for legacy banned users with sign-in history", () => {
    expect(
      inferAccountAccessState({
        banned_until: futureBan,
        last_sign_in_at: "2026-01-01T00:00:00.000Z",
        app_metadata: {},
      }),
    ).toBe(ACCOUNT_STATUS_ADMIN_DISABLED);
  });
});

describe("signInBlockMessageForState", () => {
  it("uses pending approval wording for pending users", () => {
    expect(signInBlockMessageForState(ACCOUNT_STATUS_PENDING)).toMatch(/Pending approval/i);
  });

  it("uses disabled wording for admin-disabled users", () => {
    expect(signInBlockMessageForState(ACCOUNT_STATUS_ADMIN_DISABLED)).toMatch(/disabled/i);
  });
});

describe("isSupabaseBannedSignInError", () => {
  it("detects Supabase banned sign-in errors", () => {
    expect(isSupabaseBannedSignInError("User is banned")).toBe(true);
    expect(isSupabaseBannedSignInError("Invalid login credentials")).toBe(false);
  });
});

describe("resolveBannedSignInMessage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    mockGetUserById.mockReset();
    mockMaybeSingle.mockReset();
    mockFrom.mockClear();
  });

  it("returns original message if it is not a banned error", async () => {
    const msg = await resolveBannedSignInMessage("test@example.com", "Invalid credentials");
    expect(msg).toBe("Invalid credentials");
  });

  it("returns User Needs Admin Approval if the user is not found", async () => {
    mockFilterLookup([]);
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const msg = await resolveBannedSignInMessage("unknown@example.com", "User is banned");
    expect(msg).toBe("User Needs Admin Approval");
  });

  it("returns pending approval message for pending user", async () => {
    mockFilterLookup([
      {
        email: "pending@example.com",
        banned_until: futureBan,
        last_sign_in_at: null,
        app_metadata: { account_status: ACCOUNT_STATUS_PENDING },
      },
    ]);
    const msg = await resolveBannedSignInMessage("pending@example.com", "User is banned");
    expect(msg).toContain("Pending approval");
  });

  it("returns disabled message for disabled user", async () => {
    mockFilterLookup([
      {
        email: "disabled@example.com",
        banned_until: futureBan,
        last_sign_in_at: "2026-01-01T00:00:00Z",
        app_metadata: { account_status: ACCOUNT_STATUS_ADMIN_DISABLED },
      },
    ]);
    const msg = await resolveBannedSignInMessage("disabled@example.com", "User is banned");
    expect(msg).toContain("disabled");
  });

  it("returns User Needs Admin Approval if state resolves to active", async () => {
    mockFilterLookup([
      {
        email: "active@example.com",
        banned_until: null,
        app_metadata: {},
      },
    ]);
    const msg = await resolveBannedSignInMessage("active@example.com", "User is banned");
    expect(msg).toBe("User Needs Admin Approval");
  });

  it("falls back to nda_signatures lookup when filter returns no users", async () => {
    mockFilterLookup([]);
    mockMaybeSingle.mockResolvedValue({ data: { user_id: "user-123" }, error: null });
    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          email: "pending@example.com",
          banned_until: futureBan,
          last_sign_in_at: null,
          app_metadata: { account_status: ACCOUNT_STATUS_PENDING },
        },
      },
      error: null,
    });

    const msg = await resolveBannedSignInMessage("pending@example.com", "User is banned");
    expect(msg).toContain("Pending approval");
    expect(mockGetUserById).toHaveBeenCalledWith("user-123");
  });
});
