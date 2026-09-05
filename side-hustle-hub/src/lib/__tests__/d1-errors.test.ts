import { describe, expect, it } from "vitest";
import { isRetryableD1ApiError, shouldRetryD1ApiCall } from "../d1-errors";

describe("isRetryableD1ApiError", () => {
  it("retries the D1 timeout reset message from local wrangler", () => {
    expect(
      isRetryableD1ApiError(
        "Server error: D1_ERROR: D1 DB storage operation exceeded timeout which caused object to be reset.",
      ),
    ).toBe(true);
  });

  it("retries Cloudflare internal error reference from remote D1", () => {
    expect(
      isRetryableD1ApiError("Server error: internal error; reference = 6coi217vvgjhhaqojr0q5mqg"),
    ).toBe(true);
  });

  it("does not retry ordinary validation errors", () => {
    expect(isRetryableD1ApiError("source and sourceId are required.")).toBe(false);
    expect(isRetryableD1ApiError("Not authenticated.")).toBe(false);
  });

  it("retries login POST once when remote D1 returns a transient 5xx", () => {
    expect(shouldRetryD1ApiCall("POST", "auth/login")).toBe(true);
    expect(shouldRetryD1ApiCall("GET", "health")).toBe(true);
    expect(shouldRetryD1ApiCall("POST", "auth/register")).toBe(false);
    expect(shouldRetryD1ApiCall("POST", "stripe/checkout")).toBe(false);
  });
});
