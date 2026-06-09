import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getEnvVariable } from "../env";

describe("getEnvVariable helper", () => {
  const originalProcessEnv = { ...process.env };
  const originalGlobalEnv = (globalThis as any).__ENV__;

  beforeEach(() => {
    process.env = { ...originalProcessEnv };
    delete (globalThis as any).__ENV__;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
    if (originalGlobalEnv !== undefined) {
      (globalThis as any).__ENV__ = originalGlobalEnv;
    } else {
      delete (globalThis as any).__ENV__;
    }
    const storageKey = Symbol.for("tanstack-start:event-storage");
    delete (globalThis as any)[storageKey];
  });

  it("should retrieve a variable from globalThis.__ENV__ first", () => {
    (globalThis as any).__ENV__ = {
      TEST_VAR: "global-val",
      VITE_TEST_VAR: "global-vite-val",
    };
    process.env.TEST_VAR = "process-val";

    expect(getEnvVariable("TEST_VAR")).toBe("global-val");
    expect(getEnvVariable("VITE_TEST_VAR")).toBe("global-vite-val");
  });

  it("should fall back to process.env if globalThis.__ENV__ is not set", () => {
    process.env.TEST_VAR = "process-val";
    expect(getEnvVariable("TEST_VAR")).toBe("process-val");
  });

  it("should match prefixed and non-prefixed versions", () => {
    process.env.VITE_TEST_VAR = "prefixed-val";
    expect(getEnvVariable("TEST_VAR")).toBe("prefixed-val");
    expect(getEnvVariable("VITE_TEST_VAR")).toBe("prefixed-val");
  });

  it("should read from event storage cloudflare context as fallback", () => {
    const storageKey = Symbol.for("tanstack-start:event-storage");
    const mockStore = {
      h3Event: {
        context: {
          cloudflare: {
            env: {
              TEST_VAR: "cf-val",
            },
          },
        },
      },
    };

    (globalThis as any)[storageKey] = {
      getStore: () => mockStore,
    };

    expect(getEnvVariable("TEST_VAR")).toBe("cf-val");
  });

  it("should return undefined if variable is not in any scope", () => {
    expect(getEnvVariable("NON_EXISTENT")).toBeUndefined();
  });
});
