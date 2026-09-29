import { describe, expect, it } from "vitest";
import {
  manualQaOwnerForStats,
  testerFilterOwnersForCase,
} from "../gysh-tester-ownership";

describe("testerFilterOwnersForCase", () => {
  const emailCase = {
    id: "EMAIL-TPL-welcome_pro",
    suite: "manual",
    assignees: ["candace"] as const,
  };

  it("credits current assignee", () => {
    expect(testerFilterOwnersForCase(emailCase, "candace", "", "not_run")).toEqual(["candace"]);
  });

  it("keeps Fail findings under original QA when Fail→Dev moved assignee to Evelyn", () => {
    expect(testerFilterOwnersForCase(emailCase, "evelyn", "candace", "fail")).toEqual([
      "evelyn",
      "candace",
    ]);
  });

  it("keeps Conditional Pass findings under original QA after Dev assignment", () => {
    expect(
      testerFilterOwnersForCase(emailCase, "evelyn", "candace", "conditional_approval"),
    ).toEqual(["evelyn", "candace"]);
  });

  it("does not duplicate when assignee and original are the same", () => {
    expect(testerFilterOwnersForCase(emailCase, "candace", "candace", "fail")).toEqual(["candace"]);
  });
});

describe("manualQaOwnerForStats", () => {
  it("prefers D1 assignee over catalog", () => {
    expect(
      manualQaOwnerForStats(
        { id: "EMAIL-TPL-x", suite: "manual", assignees: ["candace"] },
        "evelyn",
      ),
    ).toBe("evelyn");
  });

  it("treats missing suite as manual so Guide Review cases still count", () => {
    expect(
      manualQaOwnerForStats(
        { id: "GUIDE-REV-launch-handyman", assignees: ["lyriq"] },
        "tina",
      ),
    ).toBe("tina");
  });
});
