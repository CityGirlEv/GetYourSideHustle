import { describe, it, expect } from "vitest";
import {
  buildDeviceFilterOptions,
  testerMatchesDevices,
} from "../qa-device-match";

describe("testerMatchesDevices", () => {
  it("matches when tester owns any selected device", () => {
    expect(
      testerMatchesDevices(["iPhone", "MacBook"], ["iPad", "iPhone"]),
    ).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(testerMatchesDevices(["iphone"], ["iPhone"])).toBe(true);
  });

  it("returns true when no devices are selected", () => {
    expect(testerMatchesDevices(["iPhone"], [])).toBe(true);
  });

  it("returns false when there is no overlap", () => {
    expect(testerMatchesDevices(["Windows laptop"], ["iPad"])).toBe(false);
  });
});

describe("buildDeviceFilterOptions", () => {
  it("includes custom devices from profiles", () => {
    const opts = buildDeviceFilterOptions(["Chromebook", "iPhone"]);
    expect(opts).toContain("Chromebook");
    expect(opts.filter((d) => d === "iPhone")).toHaveLength(1);
  });
});
