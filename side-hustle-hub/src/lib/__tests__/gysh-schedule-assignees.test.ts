import { describe, expect, it } from "vitest";
import {
  matchesScheduleAssigneeFilter,
  scheduleOwnerBubbles,
  scheduleTestOwnerLabels,
} from "../gysh-schedule-assignees";
import { partnerAssigneesWithExtras, parseAssigneePeople } from "../gysh-tasks";
import type { QaTester } from "../gysh-roles";

const milford: QaTester = {
  id: "milford",
  name: "Milford Hutsell",
  shortName: "Milford",
  accent: "#5c6b7a",
};

const qaTesters: QaTester[] = [
  { id: "tina", name: "Tina", shortName: "Tina", accent: "#9B2F28" },
  { id: "evelyn", name: "Evelyn", shortName: "Evelyn", accent: "#947D64" },
  { id: "lyriq", name: "Lyriq", shortName: "Lyriq", accent: "#2e7d32" },
  { id: "candace", name: "Candace", shortName: "Candace", accent: "#3d6b8c" },
  milford,
];

describe("schedule owner bubbles include live QA", () => {
  it("lists Milford with core partners", () => {
    const bubbles = scheduleOwnerBubbles(qaTesters);
    const labels = bubbles.map((b) => b.label);
    expect(labels).toContain("Milford");
    expect(labels).toContain("Candace");
    expect(labels[0]).toBe("All assignees");
    expect(labels.at(-1)).toBe("Unassigned");
  });

  it("parses Milford as a known assignee", () => {
    const known = partnerAssigneesWithExtras(["Milford"]);
    expect(parseAssigneePeople("Milford", known)).toEqual(["Milford"]);
    expect(parseAssigneePeople("Tina+Milford", known)).toEqual(["Tina", "Milford"]);
  });
});

describe("schedule test ownership counts", () => {
  const emailCase = {
    id: "EMAIL-TPL-welcome_pro",
    suite: "manual" as const,
    assignees: ["candace"] as const,
  };

  it("credits catalog owner when D1 assignee empty", () => {
    expect(scheduleTestOwnerLabels(emailCase, "", "", "not_run", qaTesters)).toEqual(["Candace"]);
  });

  it("keeps Fail findings under original QA when Fail→Dev", () => {
    expect(
      scheduleTestOwnerLabels(emailCase, "evelyn", "candace", "fail", qaTesters),
    ).toEqual(["Evelyn", "Candace"]);
    expect(
      matchesScheduleAssigneeFilter("Evelyn", "Candace", partnerAssigneesWithExtras(["Milford"]), [
        "Evelyn",
        "Candace",
      ]),
    ).toBe(true);
  });
});
