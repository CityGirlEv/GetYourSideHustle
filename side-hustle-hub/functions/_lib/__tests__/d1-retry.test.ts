import { describe, expect, it, vi } from "vitest";
import { isTransientD1Error, withD1Retry } from "../d1-retry";

describe("isTransientD1Error", () => {
  it("matches D1 timeout / reset / dropped remote", () => {
    expect(
      isTransientD1Error(
        new Error("D1_ERROR: D1 DB storage operation exceeded timeout which caused object to be reset."),
      ),
    ).toBe(true);
    expect(isTransientD1Error("Network connection lost.")).toBe(true);
    expect(isTransientD1Error(new Error("Internal error while starting up D1 DB storage caused object to be reset"))).toBe(
      true,
    );
    expect(isTransientD1Error(new Error("internal error; reference = 6coi217vvgjhhaqojr0q5mqg"))).toBe(
      true,
    );
    expect(isTransientD1Error(new Error("UNIQUE constraint failed"))).toBe(false);
  });
});

describe("withD1Retry", () => {
  it("returns the first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(withD1Retry(fn)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries a transient D1 error then succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("D1_ERROR: D1 DB storage operation exceeded timeout which caused object to be reset."))
      .mockResolvedValueOnce("recovered");
    await expect(withD1Retry(fn)).resolves.toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries a Cloudflare internal error reference twice then succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("internal error; reference = 5oi2kr3hok8oa6rc14gg163u"))
      .mockRejectedValueOnce(new Error("internal error; reference = k0cj4krs5mo93qjittnga738"))
      .mockResolvedValueOnce("recovered");
    await expect(withD1Retry(fn)).resolves.toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry a non-transient error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("UNIQUE constraint failed"));
    await expect(withD1Retry(fn)).rejects.toThrow(/UNIQUE/);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
