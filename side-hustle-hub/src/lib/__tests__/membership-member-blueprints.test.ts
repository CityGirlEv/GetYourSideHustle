import { describe, expect, it } from "vitest";
import {
  formatMemberBlueprintPct,
  membershipBlueprintsToggleLabel,
  parseMembershipBlueprintCounts,
  summarizeMemberBlueprint,
} from "../membership-member-blueprints";

describe("membership member blueprints", () => {
  it("summarizes the top three matches with labels and percents", () => {
    const summary = summarizeMemberBlueprint({
      id: "bp-1",
      ageGroup: "adult",
      completedAt: "2026-09-20T12:00:00.000Z",
      resultIds: ["affiliate", "pod", "tutoring", "airbnb"],
      resultPcts: { affiliate: 41.2, pod: 22, tutoring: 18, airbnb: 10 },
    });
    expect(summary.title).toBe("Adult Side Hustle Blueprint");
    expect(summary.matchCount).toBe(4);
    expect(summary.matches).toHaveLength(3);
    expect(summary.matches[0]?.rank).toBe(1);
    expect(summary.matches[0]?.label.length).toBeGreaterThan(2);
    expect(formatMemberBlueprintPct(summary.matches[0]?.pct)).toBe("41%");
  });

  it("handles an empty Blueprint", () => {
    const summary = summarizeMemberBlueprint({
      id: "bp-empty",
      ageGroup: "kids",
      completedAt: "",
      resultIds: [],
      resultPcts: {},
    });
    expect(summary.title).toBe("Kids Side Hustle Blueprint");
    expect(summary.matches).toEqual([]);
    expect(formatMemberBlueprintPct(undefined)).toBe("");
  });

  it("shows Blueprint counts next to the Memberships link", () => {
    expect(membershipBlueprintsToggleLabel(null)).toBe("Blueprints");
    expect(membershipBlueprintsToggleLabel(undefined)).toBe("Blueprints");
    expect(membershipBlueprintsToggleLabel(0)).toBe("Blueprints (0)");
    expect(membershipBlueprintsToggleLabel(3)).toBe("Blueprints (3)");
    expect(membershipBlueprintsToggleLabel(3.9)).toBe("Blueprints (3)");
  });

  it("parses admin Blueprint counts by member id", () => {
    expect(parseMembershipBlueprintCounts({ "user-a": 2, "user-b": "1", skip: -1 })).toEqual({
      "user-a": 2,
      "user-b": 1,
    });
    expect(parseMembershipBlueprintCounts(null)).toEqual({});
    expect(parseMembershipBlueprintCounts([])).toEqual({});
  });
});
