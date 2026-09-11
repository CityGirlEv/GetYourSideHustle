import { describe, expect, it } from "vitest";
import {
  d1ClientRetryLimit,
  friendlyD1UserMessage,
  isRetryableD1ApiError,
  shouldRetryD1ApiCall,
  TRANSIENT_DB_USER_MESSAGE,
  LOCAL_DEV_LOGIN_MESSAGE,
} from "../d1-errors";

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

  it("retries the friendly 503 after the API hides the Cloudflare reference", () => {
    expect(isRetryableD1ApiError(TRANSIENT_DB_USER_MESSAGE)).toBe(true);
    expect(
      isRetryableD1ApiError("The database is busy. Wait a few seconds and try signing in again."),
    ).toBe(true);
  });

  it("does not retry ordinary validation errors", () => {
    expect(isRetryableD1ApiError("source and sourceId are required.")).toBe(false);
    expect(isRetryableD1ApiError("Not authenticated.")).toBe(false);
  });

  it("retries login POST when remote D1 returns a transient 5xx", () => {
    expect(shouldRetryD1ApiCall("POST", "auth/login")).toBe(true);
    expect(shouldRetryD1ApiCall("GET", "health")).toBe(true);
    expect(shouldRetryD1ApiCall("POST", "auth/register")).toBe(false);
    expect(shouldRetryD1ApiCall("POST", "stripe/checkout")).toBe(false);
    expect(d1ClientRetryLimit("POST", "auth/login")).toBe(1);
    expect(d1ClientRetryLimit("GET", "tasks")).toBe(3);
    expect(d1ClientRetryLimit("GET", "test-statuses")).toBe(3);
    expect(d1ClientRetryLimit("GET", "agile-plan")).toBe(3);
    expect(d1ClientRetryLimit("GET", "health")).toBe(1);
    expect(d1ClientRetryLimit("POST", "auth/register")).toBe(0);
  });

  it("replaces Cloudflare internal error references with a retry message", () => {
    expect(
      friendlyD1UserMessage("Server error: internal error; reference = rd67dvsars25cpaqmu1845a5"),
    ).toBe(TRANSIENT_DB_USER_MESSAGE);
    expect(friendlyD1UserMessage("Invalid email or password.")).toBe("Invalid email or password.");
    expect(
      friendlyD1UserMessage("Server error: internal error; reference = rd67dvsars25cpaqmu1845a5", {
        localDev: true,
      }),
    ).toBe(LOCAL_DEV_LOGIN_MESSAGE);
    expect(LOCAL_DEV_LOGIN_MESSAGE).toMatch(/D1 proxy reset/i);
    expect(LOCAL_DEV_LOGIN_MESSAGE).not.toMatch(/getyoursidehustle\.com/);
  });
});
