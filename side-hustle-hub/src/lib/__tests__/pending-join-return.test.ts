import { describe, expect, it, beforeEach } from "vitest";
import { getLocalStore } from "../browser-storage";
import {
  PENDING_JOIN_RETURN_KEY,
  clearPendingJoinReturn,
  readPendingJoinReturn,
  resolvePostFreeSignupDestination,
  savePendingJoinReturn,
} from "../pending-join-return";

beforeEach(() => {
  getLocalStore().removeItem(PENDING_JOIN_RETURN_KEY);
});

describe("pending join return", () => {
  it("saves and reads the referring page", () => {
    savePendingJoinReturn({
      view: "quiz",
      findMineMode: "adult",
    });
    expect(readPendingJoinReturn()).toMatchObject({
      view: "quiz",
      findMineMode: "adult",
    });
    clearPendingJoinReturn();
    expect(readPendingJoinReturn()).toBeNull();
  });

  it("prefers wizard returnView over join return", () => {
    expect(
      resolvePostFreeSignupDestination({
        blueprintReturnView: "seniors",
        blueprintReturnTab: "match",
        joinReturn: { version: 1, view: "guides", savedAt: new Date().toISOString() },
      }),
    ).toEqual({ view: "seniors", seniorsTab: "match" });
  });

  it("uses join return when there is no wizard pending", () => {
    expect(
      resolvePostFreeSignupDestination({
        joinReturn: {
          version: 1,
          view: "kids",
          kidsMode: "junior",
          kidsTab: "wizard",
          savedAt: new Date().toISOString(),
        },
      }),
    ).toEqual({ view: "kids", kidsMode: "junior", kidsTab: "wizard" });
  });

  it("falls back to guides", () => {
    expect(resolvePostFreeSignupDestination({})).toEqual({ view: "guides" });
  });
});
