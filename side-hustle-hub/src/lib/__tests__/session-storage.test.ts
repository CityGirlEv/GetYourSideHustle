import { afterEach, describe, expect, it, vi } from "vitest";
import { clearMemoryStore } from "../browser-storage";
import {
  clearCachedAuthUser,
  readCachedAuthUser,
  readSessionToken,
  readTabAlive,
  shouldPersistSessionLocally,
  writeCachedAuthUser,
  writeSessionToken,
  writeTabAlive,
} from "../session-storage";

afterEach(() => {
  clearMemoryStore();
  vi.unstubAllGlobals();
});

describe("shouldPersistSessionLocally", () => {
  it("is true only for localhost / 127.0.0.1", () => {
    expect(shouldPersistSessionLocally("localhost")).toBe(true);
    expect(shouldPersistSessionLocally("127.0.0.1")).toBe(true);
    expect(shouldPersistSessionLocally("getyoursidehustle.com")).toBe(false);
  });
});

describe("session token storage", () => {
  it("writes and reads a bearer token on localhost via durable store", () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    writeSessionToken("tok-abc");
    expect(readSessionToken()).toBe("tok-abc");
    writeSessionToken(null);
    expect(readSessionToken()).toBeNull();
  });

  it("tracks tab-alive flag on localhost", () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    expect(readTabAlive()).toBe(false);
    writeTabAlive(true);
    expect(readTabAlive()).toBe(true);
    writeTabAlive(false);
    expect(readTabAlive()).toBe(false);
  });

  it("caches auth user on localhost and clears it when the token is wiped", () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    writeCachedAuthUser({
      id: "u1",
      name: "Evelyn",
      email: "evelyn3@cox.net",
      role: "admin",
      status: "active",
      joinedAt: "2026-01-01",
      notes: "",
      canLogin: true,
    });
    expect(readCachedAuthUser()?.email).toBe("evelyn3@cox.net");
    writeSessionToken("tok");
    writeSessionToken(null);
    expect(readCachedAuthUser()).toBeNull();
    clearCachedAuthUser();
  });

  it("does not cache auth user off localhost", () => {
    vi.stubGlobal("window", { location: { hostname: "getyoursidehustle.com" } });
    writeCachedAuthUser({
      id: "u1",
      name: "Evelyn",
      email: "evelyn3@cox.net",
      role: "admin",
      status: "active",
      joinedAt: "2026-01-01",
      notes: "",
      canLogin: true,
    });
    expect(readCachedAuthUser()).toBeNull();
  });
});
