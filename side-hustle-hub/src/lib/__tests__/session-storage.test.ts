import { afterEach, describe, expect, it, vi } from "vitest";
import { clearMemoryStore } from "../browser-storage";
import {
  readSessionToken,
  readTabAlive,
  shouldPersistSessionLocally,
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
});
