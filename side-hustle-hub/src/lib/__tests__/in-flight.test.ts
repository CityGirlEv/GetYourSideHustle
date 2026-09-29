import { describe, expect, it } from "vitest";
import { apiGetCoalesceKey, coalesceInFlight } from "../in-flight";

describe("apiGetCoalesceKey", () => {
  it("keys identical GETs together and ignores writes", () => {
    expect(apiGetCoalesceKey("tasks", "GET", "tok")).toBe("GET:tasks:tok");
    expect(apiGetCoalesceKey("tasks", "get", "tok")).toBe("GET:tasks:tok");
    expect(apiGetCoalesceKey("tasks", "PUT", "tok")).toBeNull();
  });
});

describe("coalesceInFlight", () => {
  it("shares one promise for the same key while in flight", async () => {
    const inflight = new Map<string, Promise<unknown>>();
    let starts = 0;
    const start = () => {
      starts += 1;
      return new Promise<string>((resolve) => {
        setTimeout(() => resolve("ok"), 20);
      });
    };
    const [a, b] = await Promise.all([
      coalesceInFlight(inflight, "GET:tasks:", start),
      coalesceInFlight(inflight, "GET:tasks:", start),
    ]);
    expect(a).toBe("ok");
    expect(b).toBe("ok");
    expect(starts).toBe(1);
  });

  it("starts a new call after the first finishes", async () => {
    const inflight = new Map<string, Promise<unknown>>();
    let starts = 0;
    const start = () => {
      starts += 1;
      return Promise.resolve(starts);
    };
    await coalesceInFlight(inflight, "k", start);
    const second = await coalesceInFlight(inflight, "k", start);
    expect(second).toBe(2);
    expect(starts).toBe(2);
  });
});
