import { afterEach, describe, it, expect, beforeEach } from "vitest";
import {
  DEPLOY_ACK_KEY,
  DEPLOY_RESUME_KEY,
  consumeDeployResume,
  getCurrentAppPath,
  isAuthRoute,
  isNewDeploy,
  markDeployHandled,
  parseDeployBroadcast,
  parseVersionManifest,
  peekDeployResume,
  registerDeploySaveHandler,
  runDeploySaveHandlers,
  stashDeployResume,
  wasDeployAlreadyHandled,
} from "../deploy-version";

describe("isNewDeploy", () => {
  it("returns false when ids match", () => {
    expect(isNewDeploy("build-abc", "build-abc")).toBe(false);
  });

  it("returns true when production ids differ", () => {
    expect(isNewDeploy("build-abc", "build-xyz")).toBe(true);
  });

  it("returns false in dev builds", () => {
    expect(isNewDeploy("dev", "build-xyz")).toBe(false);
    expect(isNewDeploy("build-abc", "dev")).toBe(false);
  });

  it("returns false for missing ids", () => {
    expect(isNewDeploy("", "build-xyz")).toBe(false);
    expect(isNewDeploy("build-abc", null)).toBe(false);
    expect(isNewDeploy("unknown", "build-xyz")).toBe(false);
  });
});

describe("parseVersionManifest", () => {
  it("accepts live production manifests", () => {
    expect(
      parseVersionManifest({
        buildId: "build-2",
        live: true,
        deployedAt: "2026-06-15T00:00:00.000Z",
      }),
    ).toEqual({ buildId: "build-2" });
  });

  it("rejects manifests that were built but not deployed", () => {
    expect(parseVersionManifest({ buildId: "build-2", live: false })).toBeNull();
    expect(parseVersionManifest({ buildId: "build-2" })).toBeNull();
  });

  it("rejects dev and unknown build ids", () => {
    expect(parseVersionManifest({ buildId: "dev", live: true })).toBeNull();
    expect(parseVersionManifest({ buildId: "unknown", live: true })).toBeNull();
  });

  it("returns null for invalid payloads", () => {
    expect(parseVersionManifest(null)).toBeNull();
    expect(parseVersionManifest({ live: true })).toBeNull();
  });
});

describe("deploy ack persistence", () => {
  afterEach(() => {
    localStorage.removeItem(DEPLOY_ACK_KEY);
  });

  it("remembers a handled deploy in localStorage", () => {
    expect(wasDeployAlreadyHandled("build-9")).toBe(false);
    markDeployHandled("build-9");
    expect(wasDeployAlreadyHandled("build-9")).toBe(true);
    expect(wasDeployAlreadyHandled("build-10")).toBe(false);
  });
});

describe("isAuthRoute", () => {
  it("matches login and password reset routes", () => {
    expect(isAuthRoute("/auth")).toBe(true);
    expect(isAuthRoute("/register")).toBe(true);
    expect(isAuthRoute("/reset-password")).toBe(true);
  });

  it("does not match app routes", () => {
    expect(isAuthRoute("/advisor")).toBe(false);
    expect(isAuthRoute("/admin")).toBe(false);
  });
});

describe("parseDeployBroadcast", () => {
  it("parses a valid broadcast payload", () => {
    expect(parseDeployBroadcast(JSON.stringify({ buildId: "build-2", at: 123 }))).toEqual({
      buildId: "build-2",
      at: 123,
    });
  });

  it("returns null for invalid payloads", () => {
    expect(parseDeployBroadcast(null)).toBeNull();
    expect(parseDeployBroadcast("{")).toBeNull();
    expect(parseDeployBroadcast(JSON.stringify({ at: 1 }))).toBeNull();
  });
});

describe("deploy resume context", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.removeItem(DEPLOY_RESUME_KEY);
  });

  it("stashes and consumes a safe internal resume path", () => {
    expect(stashDeployResume("/testing?tab=qa")).toBe("/testing?tab=qa");
    expect(peekDeployResume()?.redirect).toBe("/testing?tab=qa");
    expect(consumeDeployResume()).toBe("/testing?tab=qa");
    expect(peekDeployResume()).toBeNull();
  });

  it("rejects auth routes for resume", () => {
    expect(stashDeployResume("/auth")).toBeNull();
    expect(sessionStorage.getItem(DEPLOY_RESUME_KEY)).toBeNull();
  });
});

describe("deploy save handlers", () => {
  it("runs registered handlers and counts failures", async () => {
    const cleanupOk = registerDeploySaveHandler(async () => {});
    const cleanupFail = registerDeploySaveHandler(async () => {
      throw new Error("fail");
    });
    const result = await runDeploySaveHandlers();
    cleanupOk();
    cleanupFail();
    expect(result.ran).toBe(1);
    expect(result.failed).toBe(1);
  });
});

describe("getCurrentAppPath", () => {
  it("includes pathname, search, and hash", () => {
    window.history.replaceState({}, "", "/testing?tab=qa#section");
    expect(getCurrentAppPath()).toBe("/testing?tab=qa#section");
  });
});
