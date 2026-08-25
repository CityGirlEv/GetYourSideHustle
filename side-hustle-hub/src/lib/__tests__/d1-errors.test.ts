import { describe, expect, it } from "vitest";
import { isRetryableD1ApiError } from "../d1-errors";

describe("isRetryableD1ApiError", () => {
  it("retries the D1 timeout reset message from local wrangler", () => {
    expect(
      isRetryableD1ApiError(
        "Server error: D1_ERROR: D1 DB storage operation exceeded timeout which caused object to be reset.",
      ),
    ).toBe(true);
  });

  it("does not retry ordinary validation errors", () => {
    expect(isRetryableD1ApiError("source and sourceId are required.")).toBe(false);
    expect(isRetryableD1ApiError("Not authenticated.")).toBe(false);
  });
});
