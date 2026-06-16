import { describe, it, expect } from "vitest";
import { isForceLoggedOut, jwtIssuedAt } from "../auth-session";
import type { Session, User } from "@supabase/supabase-js";

function fakeSession(accessToken: string, expiresAt = 0): Session {
  return {
    access_token: accessToken,
    refresh_token: "refresh",
    expires_at: expiresAt,
    expires_in: 3600,
    token_type: "bearer",
    user: { id: "u1" } as Session["user"],
  };
}

function fakeJwt(iat: number): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ iat }));
  return `${header}.${payload}.sig`;
}

describe("jwtIssuedAt", () => {
  it("reads iat from a JWT payload", () => {
    expect(jwtIssuedAt(fakeJwt(1_700_000_000))).toBe(1_700_000_000);
  });
});

describe("isForceLoggedOut", () => {
  it("returns true when force_logout_at is after JWT iat", () => {
    const session = fakeSession(fakeJwt(1_700_000_000));
    const user = {
      app_metadata: { force_logout_at: "2026-06-09T23:00:00.000Z" },
    } as User;
    expect(isForceLoggedOut(session, user)).toBe(true);
  });

  it("returns false when session is newer than force_logout_at", () => {
    const session = fakeSession(fakeJwt(Math.floor(Date.parse("2026-06-10T00:00:00.000Z") / 1000)));
    const user = {
      app_metadata: { force_logout_at: "2026-06-09T23:00:00.000Z" },
    } as User;
    expect(isForceLoggedOut(session, user)).toBe(false);
  });
});
