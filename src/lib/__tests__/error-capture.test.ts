import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { consumeLastCapturedError } from "../error-capture";

describe("error-capture", () => {
  beforeEach(() => {
    // drain any pending
    consumeLastCapturedError();
  });
  afterEach(() => vi.useRealTimers());

  it("returns undefined when nothing captured", () => {
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captures errors via window error event and consumes once", () => {
    const err = new Error("boom");
    const evt = new Event("error") as ErrorEvent;
    Object.defineProperty(evt, "error", { value: err });
    window.dispatchEvent(evt);
    expect(consumeLastCapturedError()).toBe(err);
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captures unhandledrejection reason", () => {
    const reason = new Error("rej");
    const evt = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.defineProperty(evt, "reason", { value: reason });
    window.dispatchEvent(evt);
    expect(consumeLastCapturedError()).toBe(reason);
  });

  it("expires entries older than TTL", () => {
    vi.useFakeTimers();
    const err = new Error("old");
    const evt = new Event("error") as ErrorEvent;
    Object.defineProperty(evt, "error", { value: err });
    window.dispatchEvent(evt);
    vi.advanceTimersByTime(10_000);
    expect(consumeLastCapturedError()).toBeUndefined();
  });
});