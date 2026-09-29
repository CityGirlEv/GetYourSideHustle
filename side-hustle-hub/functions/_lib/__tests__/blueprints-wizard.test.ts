import { describe, expect, it } from "vitest";
import { parseWizardBlueprintPayload } from "../blueprints";

describe("parseWizardBlueprintPayload", () => {
  it("accepts a completed Match Wizard body", () => {
    expect(
      parseWizardBlueprintPayload({
        ageGroup: "junior",
        answers: { hours: "few" },
        resultIds: ["tech-helper", "tutoring"],
        resultPcts: { "tech-helper": 82, tutoring: "61" },
      }),
    ).toEqual({
      ageGroup: "junior",
      answers: { hours: "few" },
      resultIds: ["tech-helper", "tutoring"],
      resultPcts: { "tech-helper": 82, tutoring: 61 },
    });
  });

  it("rejects missing matches or an invalid age group", () => {
    expect(
      parseWizardBlueprintPayload({
        ageGroup: "adult",
        answers: {},
        resultIds: [],
      }),
    ).toBeNull();
    expect(
      parseWizardBlueprintPayload({
        ageGroup: "teens",
        resultIds: ["pod"],
      }),
    ).toBeNull();
  });
});
