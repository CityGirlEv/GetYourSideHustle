import { describe, expect, it } from "vitest";
import {
  leadDevAssigneeForStatusChange,
  resolveLeadDevAssignment,
  statusAssignsToLeadDev,
} from "../gysh-fail-assignee";

describe("statusAssignsToLeadDev", () => {
  it("is true for Fail and Conditional Pass only", () => {
    expect(statusAssignsToLeadDev("fail")).toBe(true);
    expect(statusAssignsToLeadDev("conditional_approval")).toBe(true);
    expect(statusAssignsToLeadDev("pass")).toBe(false);
    expect(statusAssignsToLeadDev("blocked")).toBe(false);
    expect(statusAssignsToLeadDev("not_run")).toBe(false);
  });
});

describe("resolveLeadDevAssignment", () => {
  it("assigns Fail to Evelyn and remembers the QA finder", () => {
    expect(
      resolveLeadDevAssignment({
        status: "fail",
        prevStatus: "in_progress",
        currentAssignee: "brenda",
        requestedAssignee: "brenda",
        originalAssignee: "",
      }),
    ).toEqual({ assignee: "evelyn", originalAssignee: "brenda" });
  });

  it("assigns Conditional Pass to Evelyn the same way", () => {
    expect(
      resolveLeadDevAssignment({
        status: "conditional_approval",
        prevStatus: "not_run",
        currentAssignee: "tina",
        requestedAssignee: "tina",
        originalAssignee: "",
        encodedOwner: "lyriq",
      }),
    ).toEqual({ assignee: "evelyn", originalAssignee: "tina" });
  });

  it("uses the encoded case owner when the row has no assignee yet", () => {
    expect(
      resolveLeadDevAssignment({
        status: "fail",
        prevStatus: "not_run",
        currentAssignee: "",
        requestedAssignee: "",
        originalAssignee: "",
        encodedOwner: "candace",
      }),
    ).toEqual({ assignee: "evelyn", originalAssignee: "candace" });
  });

  it("snaps a leftover QA assignee back to Evelyn on later Fail saves", () => {
    expect(
      resolveLeadDevAssignment({
        status: "fail",
        prevStatus: "fail",
        currentAssignee: "brenda",
        requestedAssignee: "brenda",
        originalAssignee: "brenda",
        devAssigneeIds: new Set(["evelyn"]),
      }),
    ).toEqual({ assignee: "evelyn", originalAssignee: "brenda" });
  });

  it("keeps a Dev reassignment after the first Fail", () => {
    expect(
      resolveLeadDevAssignment({
        status: "fail",
        prevStatus: "fail",
        currentAssignee: "evelyn",
        requestedAssignee: "evelyn",
        originalAssignee: "tina",
        devAssigneeIds: new Set(["evelyn"]),
      }),
    ).toEqual({ assignee: "evelyn", originalAssignee: "tina" });
  });

  it("does not steal locked automated suite owners", () => {
    expect(
      resolveLeadDevAssignment({
        status: "fail",
        prevStatus: "not_run",
        currentAssignee: "playwright",
        requestedAssignee: "evelyn",
        lockedSuiteOwner: "playwright",
      }),
    ).toEqual({ assignee: "playwright", originalAssignee: "" });
  });
});

describe("leadDevAssigneeForStatusChange", () => {
  it("returns Evelyn unless the current owner is already a Dev", () => {
    expect(leadDevAssigneeForStatusChange("fail", "brenda", new Set(["evelyn"]))).toBe("evelyn");
    expect(leadDevAssigneeForStatusChange("conditional_approval", "lyriq")).toBe("evelyn");
    expect(leadDevAssigneeForStatusChange("fail", "evelyn", new Set(["evelyn"]))).toBe("evelyn");
    expect(leadDevAssigneeForStatusChange("pass", "brenda")).toBe("brenda");
  });
});
