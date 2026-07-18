import { describe, expect, it, vi, afterEach } from "vitest";
import {
  loginReportStats,
  matchesLoginFilter,
  type LoginReportUser,
} from "@/lib/user-login-report-filters";

const baseUser = (overrides: Partial<LoginReportUser> = {}): LoginReportUser => ({
  id: "1",
  email: "a@test.com",
  full_name: "Alice",
  role: "qa",
  roles: ["qa"],
  ...overrides,
});

describe("user-login-report-filters", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("filters last 1 day by rolling 24h window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-09T12:00:00.000Z"));

    const recent = baseUser({ id: "r", last_sign_in_at: "2026-06-09T06:00:00.000Z" });
    const old = baseUser({ id: "o", last_sign_in_at: "2026-06-07T12:00:00.000Z" });
    const never = baseUser({ id: "n", last_sign_in_at: null });

    expect(matchesLoginFilter(recent, "last_1d")).toBe(true);
    expect(matchesLoginFilter(old, "last_1d")).toBe(false);
    expect(matchesLoginFilter(never, "last_1d")).toBe(false);
  });

  it("counts last1 in stats", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-09T12:00:00.000Z"));

    const stats = loginReportStats([
      baseUser({ last_sign_in_at: "2026-06-09T10:00:00.000Z" }),
      baseUser({ id: "2", last_sign_in_at: "2026-06-01T10:00:00.000Z" }),
      baseUser({ id: "3", last_sign_in_at: null }),
    ]);

    expect(stats.last1).toBe(1);
    expect(stats.last7).toBe(1);
    expect(stats.never).toBe(1);
  });
});
