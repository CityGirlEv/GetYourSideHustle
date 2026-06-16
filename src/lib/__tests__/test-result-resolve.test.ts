import { describe, it, expect } from "vitest";
import {
  localStorageKeysForTestResultId,
  parsePlatformVariantId,
  resolveTestContentId,
  isCustomTestContentId,
} from "@/lib/platform-variants";
import { resolveTestStatus, resolveTestString } from "@/lib/test-result-resolve";

describe("parsePlatformVariantId", () => {
  it("splits suffixed platform ids", () => {
    expect(parsePlatformVariantId("AUTH-001-PHONE")).toEqual({
      sourceId: "AUTH-001",
      platformSuffix: "PHONE",
    });
  });

  it("returns base ids unchanged", () => {
    expect(parsePlatformVariantId("AUTH-001")).toEqual({
      sourceId: "AUTH-001",
      platformSuffix: null,
    });
  });
});

describe("resolveTestContentId", () => {
  it("strips platform suffixes for shared content", () => {
    expect(resolveTestContentId("AUTH-001-PHONE")).toBe("AUTH-001");
    expect(resolveTestContentId("CUS-003-IPAD")).toBe("CUS-003");
  });

  it("leaves base ids unchanged", () => {
    expect(resolveTestContentId("AUTH-001")).toBe("AUTH-001");
  });
});

describe("isCustomTestContentId", () => {
  it("detects custom test ids", () => {
    expect(isCustomTestContentId("CUS-001")).toBe(true);
    expect(isCustomTestContentId("CUS-001-PHONE")).toBe(true);
    expect(isCustomTestContentId("AUTH-001")).toBe(false);
  });
});

describe("localStorageKeysForTestResultId", () => {
  it("fans out multi-platform base ids to all variants", () => {
    expect(localStorageKeysForTestResultId("AUTH-001")).toEqual([
      "AUTH-001-COMP",
      "AUTH-001-PHONE",
      "AUTH-001-IPAD",
    ]);
  });

  it("keeps admin-only base ids as a single key", () => {
    expect(localStorageKeysForTestResultId("ADMIN-001")).toEqual(["ADMIN-001"]);
  });

  it("keeps already-suffixed ids as a single key", () => {
    expect(localStorageKeysForTestResultId("AUTH-001-PHONE")).toEqual(["AUTH-001-PHONE"]);
  });
});

describe("resolveTestField helpers", () => {
  it("inherits status from the source test id", () => {
    const store = { "AUTH-001": "pass" as const };
    expect(resolveTestStatus(store, "AUTH-001-COMP")).toBe("pass");
  });

  it("prefers a variant-specific status over the source id", () => {
    const store = {
      "AUTH-001": "pass" as const,
      "AUTH-001-COMP": "fail" as const,
    };
    expect(resolveTestStatus(store, "AUTH-001-COMP")).toBe("fail");
  });

  it("inherits notes from the source test id", () => {
    const store = { "AUTH-001": "Saved on base row" };
    expect(resolveTestString(store, "AUTH-001-PHONE")).toBe("Saved on base row");
  });
});
