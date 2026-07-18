import { describe, expect, it } from "vitest";
import { buildBenchmarkProfileAnswerRows } from "@/lib/benchmark-profile-answers";

describe("buildBenchmarkProfileAnswerRows", () => {
  it("echoes intake answers with human-readable labels", () => {
    const rows = buildBenchmarkProfileAnswerRows({
      birthYear: 1960,
      gender: "female",
      tobacco: false,
      zip3: "770",
      county: "Harris",
      medicareEnrolled: "both",
      eligibilityCircumstance: "turning_65",
      incomeBand: "$35k–$55k",
      conditions: ["Diabetes"],
      medications: ["Metformin"],
      medicationDetails: [],
      visitFrequency: "medium",
      preferredPharmacy: "yes",
      preferredPharmacyName: "CVS",
      benefitPriorities: ["dental", "vision"],
    });

    expect(rows.find((r) => r.label === "Year of birth")?.value).toBe("1960");
    expect(rows.find((r) => r.label === "Gender")?.value).toBe("Female");
    expect(rows.find((r) => r.label === "Tobacco use")?.value).toBe("Non-smoker");
    expect(rows.find((r) => r.label === "ZIP prefix")?.value).toBe("770xx");
    expect(rows.find((r) => r.label === "County or parish")?.value).toMatch(/Harris/i);
    expect(rows.find((r) => r.label === "Medicare enrollment")?.value).toBe(
      "Both Part A and Part B",
    );
    expect(rows.find((r) => r.label === "Conditions")?.value).toBe("Diabetes");
    expect(rows.find((r) => r.label === "Preferred pharmacy")?.value).toBe("CVS");
    expect(rows.find((r) => r.label === "Extra benefit priorities")?.value).toContain("Dental");
  });

  it("formats county via zip3 lookup instead of showing undefined", () => {
    const rows = buildBenchmarkProfileAnswerRows({
      birthYear: 1960,
      gender: "female",
      tobacco: false,
      zip3: "770",
      county: "Harris",
      medicareEnrolled: "both",
      eligibilityCircumstance: "turning_65",
      incomeBand: "$35k–$55k",
      conditions: [],
      medications: [],
      medicationDetails: [],
      visitFrequency: "medium",
      preferredPharmacy: "no",
      preferredPharmacyName: "",
      benefitPriorities: [],
      eligibilityCircumstanceOther: "",
    });

    const county = rows.find((r) => r.label === "County or parish")?.value;
    expect(county).not.toContain("undefined");
    expect(county).toMatch(/Harris.*TX/i);
  });

  it("shows em dash when county is empty", () => {
    const rows = buildBenchmarkProfileAnswerRows({
      birthYear: 1960,
      gender: "female",
      tobacco: false,
      zip3: "770",
      county: "",
      medicareEnrolled: "both",
      eligibilityCircumstance: "turning_65",
      incomeBand: "$35k–$55k",
      conditions: [],
      medications: [],
      medicationDetails: [],
      visitFrequency: "medium",
      preferredPharmacy: "no",
      preferredPharmacyName: "",
      benefitPriorities: [],
      eligibilityCircumstanceOther: "",
    });

    expect(rows.find((r) => r.label === "County or parish")?.value).toBe("—");
  });
});
