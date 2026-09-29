import { describe, expect, it } from "vitest";
import { displayPrerequisiteLabel, expandStandaloneHustleCopy } from "../side-hustle-copy";

describe("expandStandaloneHustleCopy", () => {
  it("rewrites the About prerequisite label", () => {
    expect(displayPrerequisiteLabel("What this hustle is")).toBe("What this side-hustle is");
    expect(displayPrerequisiteLabel("What this side-hustle is")).toBe("What this side-hustle is");
  });

  it("expands standalone hustle in running copy", () => {
    expect(expandStandaloneHustleCopy("Pick a hustle calculator that matches.")).toBe(
      "Pick a side hustle calculator that matches.",
    );
    expect(expandStandaloneHustleCopy("Your hustle, your results.")).toBe(
      "Your side hustle, your results.",
    );
    expect(expandStandaloneHustleCopy("Parent approves your hustle plan")).toBe(
      "Parent approves your side hustle plan",
    );
    expect(expandStandaloneHustleCopy("Wear the hustle")).toBe("Wear the side hustle");
  });

  it("does not double-prefix Side Hustle or official titles", () => {
    expect(expandStandaloneHustleCopy("Get Your Side Hustle")).toBe("Get Your Side Hustle");
    expect(expandStandaloneHustleCopy("Your Side Hustle Blueprint")).toBe(
      "Your Side Hustle Blueprint",
    );
    expect(expandStandaloneHustleCopy("Grow Your Hustle: Put Some Earnings Back")).toBe(
      "Grow Your Hustle: Put Some Earnings Back",
    );
    expect(expandStandaloneHustleCopy("Craft Hustle Starter + Kevina Kindness Extra")).toBe(
      "Craft Hustle Starter + Kevina Kindness Extra",
    );
  });
});
