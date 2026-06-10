import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getEnvVariable, getRuntimeSecret } from "../env";

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
    delete (globalThis as any).__ENV__.TEST_VAR;
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

  it("should trim whitespace from env values", () => {
    process.env.TEST_VAR = "  spaced-val  ";
    expect(getEnvVariable("TEST_VAR")).toBe("spaced-val");
  });
});

describe("getRuntimeSecret helper", () => {
  const originalProcessEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalProcessEnv };
    delete (globalThis as any).__env__;
    delete (globalThis as any).__ENV__;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
    delete (globalThis as any).__env__;
    delete (globalThis as any).__ENV__;
  });

  it("prefers live worker bindings over process.env", () => {
    process.env.RESEND_API_KEY = "re_from_process_env_key";
    (globalThis as any).__env__ = { RESEND_API_KEY: "re_from_worker_binding_key" };
    expect(getRuntimeSecret("RESEND_API_KEY")).toBe("re_from_worker_binding_key");
  });

  it("trims secret values from worker bindings", () => {
    (globalThis as any).__env__ = { RESEND_API_KEY: " re_valid_resend_key \n" };
    expect(getRuntimeSecret("RESEND_API_KEY")).toBe("re_valid_resend_key");
  });

  it("falls back to process.env in local dev", () => {
    process.env.RESEND_API_KEY = "re_local_dev_key_abc";
    expect(getRuntimeSecret("RESEND_API_KEY")).toBe("re_local_dev_key_abc");
  });

  it("skips placeholder worker bindings for Resend keys", () => {
    (globalThis as any).__env__ = { RESEND_API_KEY: "re_your_resend_api_key" };
    process.env.RESEND_API_KEY = "re_cKCwKPD9_N4kLX3pEwjWGJF3e1aJ36fpW";
    expect(getRuntimeSecret("RESEND_API_KEY")).toBe("re_cKCwKPD9_N4kLX3pEwjWGJF3e1aJ36fpW");
  });

  it("skips placeholder Lovable keys", () => {
    process.env.LOVABLE_API_KEY = "your_lovable_api_key_if_using_lovable_relays";
    expect(getRuntimeSecret("LOVABLE_API_KEY")).toBeUndefined();
  });
});
