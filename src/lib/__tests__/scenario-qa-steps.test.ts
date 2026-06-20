import { describe, it, expect } from "vitest";
import {
  buildScenarioQaAuditSteps,
  splitScenarioDemographics,
  formatCostPreferenceForQaStep,
  formatConditionForQaStep,
  countyLabelFromLine,
  parseCostTotal,
} from "../scenario-qa-steps";

function parseStep1Substeps(step: string): string[] {
  const body = step.replace(
    /^Step 1 — Demographics: Enter the following for the Scenario Information\. /,
    "",
  );
  return body.split(" | ").map((s) => s.trim());
}

describe("countyLabelFromLine", () => {
  it("extracts county and state from dropdown instruction", () => {
    expect(
      countyLabelFromLine(
        "From the county dropdown that auto-populates for ZIP3=606, select Cook, IL — this scopes the carrier/plan check to only plans available in that county.",
      ),
    ).toBe("Cook, IL");
  });
});

describe("parseCostTotal", () => {
  it("splits monthly and annual amounts", () => {
    expect(parseCostTotal("$7/mo and $84/yr")).toEqual({
      monthly: "$7/mo",
      annual: "$84/yr",
    });
  });
});

describe("splitScenarioDemographics", () => {
  it("splits cost preference from other demographics", () => {
    expect(
      splitScenarioDemographics(
        "gender = male, tobacco use = NO, income band = $55k–$75k, cost preference = 'minimize monthly'",
      ),
    ).toEqual({
      basics: "gender = male, tobacco use = NO, income band = $55k–$75k",
      costPreference: "cost preference = 'minimize monthly'",
    });
  });
});

describe("formatConditionForQaStep", () => {
  it("guides testers to use Other when condition is not listed", () => {
    expect(formatConditionForQaStep("Chronic Kidney Disease Stage 3")).toBe(
      "Condition: Chronic Kidney Disease Stage 3 — check if listed; if not present, select Other and type in the condition",
    );
  });
});

describe("formatCostPreferenceForQaStep", () => {
  it("adds PPO/HMO guidance for predictability", () => {
    expect(formatCostPreferenceForQaStep("cost preference = 'predictability'")).toBe(
      "cost preference = 'predictability' (lean toward PPO vs. HMO)",
    );
  });

  it("leaves minimize monthly unchanged", () => {
    expect(formatCostPreferenceForQaStep("cost preference = 'minimize monthly'")).toBe(
      "cost preference = 'minimize monthly'",
    );
  });
});

describe("buildScenarioQaAuditSteps", () => {
  it("builds the updated wizard flow for SCEN-QA audits", () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: "birth year = 1958 (age 68 in 2026)",
      zip3: "606",
      countyLine:
        "From the county dropdown that auto-populates for ZIP3=606, select Cook, IL — this scopes the carrier/plan check to only plans available in that county.",
      demographics:
        "gender = male, tobacco use = NO, income band = $55k–$75k, cost preference = 'minimize monthly'",
      conditions: "Chronic Kidney Disease Stage 3",
      medications: "Losartan 50 mg tablet (daily) = $7/mo",
      costTotal: "$7/mo and $84/yr",
    });

    expect(steps[0]).toContain("Compare Plans Privately");
    expect(steps[1]).toContain("Step 1 — Demographics");
    expect(steps[1]).toContain("birth year = 1958 (age 68 in 2026)");
    expect(steps[1]).toContain("ZIP3 = 606");
    expect(steps[1]).toContain("County or parish");
    expect(steps[1]).toContain("gender = male");
    expect(steps[1]).toContain("THEN CLICK NEXT.");

    const step1 = parseStep1Substeps(steps[1]);
    expect(step1).toEqual([
      "birth year = 1958 (age 68 in 2026)",
      "ZIP3 = 606",
      "County or parish — From the county dropdown that auto-populates for ZIP3=606, select Cook, IL — this scopes the carrier/plan check to only plans available in that county.",
      "gender = male",
      "tobacco use = NO",
      "income band = $55k–$75k",
      "THEN CLICK NEXT.",
    ]);
    expect(step1[2]).toContain("County or parish");
    expect(steps[2]).toContain("Step 2 — Preferences & Conditions");
    expect(steps[2]).toContain("Part 2 page");
    expect(steps[2]).toContain("select Other and type in the condition if not present");
    expect(steps[3]).toContain("Step 3 — Medications");
  });

  it("puts county or parish at 2c before gender", () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: "birth year = 1942 (age 84 in 2026)",
      zip3: "441",
      countyLine:
        "From the county dropdown that auto-populates for ZIP3=441, select Cuyahoga, OH — this scopes the carrier/plan check to only plans available in that county.",
      demographics:
        "gender = female, tobacco use = YES, income band = $15k–$35k, cost preference = 'minimize monthly'",
      conditions: "Asthma, GERD",
      medications:
        "Albuterol 90 mcg inhaler (PRN) = $55/mo; Omeprazole 20 mg capsule (daily) = $10/mo",
      costTotal: "$65/mo and $780/yr",
    });

    const step1 = parseStep1Substeps(steps[1]);
    expect(step1[0]).toContain("birth year = 1942");
    expect(step1[1]).toBe("ZIP3 = 441");
    expect(step1[2]).toContain("County or parish");
    expect(step1[2]).toContain("Cuyahoga, OH");
    expect(step1[3]).toBe("gender = female");
  });

  it("annotates predictability with PPO vs HMO on Step 2", () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: "birth year = 1957 (age 69 in 2026)",
      zip3: "100",
      countyLine:
        "From the county dropdown that auto-populates for ZIP3=100, select Hudson, NJ — this scopes the carrier/plan check to only plans available in that county.",
      demographics:
        "gender = male, tobacco use = YES, income band = $15k–$35k, cost preference = 'predictability'",
      conditions: "COPD",
      medications: "Tiotropium (Spiriva) 18 mcg inhaler (daily) = $380/mo",
      costTotal: "$380/mo and $4,560/yr",
    });

    expect(steps[2]).toContain("cost preference = 'predictability' (lean toward PPO vs. HMO)");
    const step2Body = steps[2].split(" ||| ", 2)[1] ?? "";
    expect(step2Body.split(" | ")[0]).toBe(
      "cost preference = 'predictability' (lean toward PPO vs. HMO)",
    );
  });

  it("checkboxes each medication with Add these medications on the first line", () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: "birth year = 1945 (age 81 in 2026)",
      zip3: "021",
      countyLine:
        "From the county dropdown that auto-populates for ZIP3=021, select Middlesex, MA — this scopes the carrier/plan check to only plans available in that county.",
      demographics:
        "gender = female, tobacco use = NO, income band = Under $15k, cost preference = 'minimize monthly'",
      conditions: "Hypertension, Type 2 Diabetes",
      medications:
        "Metformin 500 mg tablet (twice daily) = $8/mo; Lisinopril 10 mg tablet (daily) = $5/mo",
      costTotal: "$13/mo and $156/yr",
    });

    expect(steps[3]).toContain("Step 3 — Medications");
    const step3Body = steps[3].split(" ||| ", 2)[1] ?? "";
    expect(step3Body.split(" | ").map((s) => s.trim())).toEqual([
      "Add these medications.",
      "Metformin 500 mg tablet (twice daily) = $8/mo.",
      "Lisinopril 10 mg tablet (daily) = $5/mo.",
      "THEN CLICK CREATE SCENARIO.",
    ]);
  });

  it("builds minimize-monthly cost preference without PPO note", () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: "birth year = 1958 (age 68 in 2026)",
      zip3: "606",
      countyLine:
        "From the county dropdown that auto-populates for ZIP3=606, select Cook, IL — this scopes the carrier/plan check to only plans available in that county.",
      demographics:
        "gender = male, tobacco use = NO, income band = $55k–$75k, cost preference = 'minimize monthly'",
      conditions: "Chronic Kidney Disease Stage 3",
      medications: "Losartan 50 mg tablet (daily) = $7/mo",
      costTotal: "$7/mo and $84/yr",
    });

    expect(steps[0]).toContain("Compare Plans Privately");
    expect(steps[1]).toContain("Step 1 — Demographics");
    const step1 = parseStep1Substeps(steps[1]);
    expect(step1[0]).toContain("birth year = 1958");
    expect(step1[2]).toContain("County or parish");
    expect(step1[3]).toBe("gender = male");
    expect(steps[2]).toContain("Step 2 — Preferences & Conditions");
    expect(steps[2]).toContain("cost preference = 'minimize monthly'");
    expect(steps[2]).not.toContain("PPO");
    const step2Body = steps[2].split(" ||| ", 2)[1] ?? "";
    expect(step2Body.split(" | ").map((s) => s.trim())).toEqual([
      "cost preference = 'minimize monthly'",
      formatConditionForQaStep("Chronic Kidney Disease Stage 3"),
      "THEN CLICK NEXT.",
    ]);
    expect(steps[3]).toContain("Step 3 — Medications");
    const step3Body = steps[3].split(" ||| ", 2)[1] ?? "";
    expect(step3Body.split(" | ").map((s) => s.trim())).toEqual([
      "Add these medications.",
      "Losartan 50 mg tablet (daily) = $7/mo.",
      "THEN CLICK CREATE SCENARIO.",
    ]);
    expect(steps[4]).toContain("A pop-up screen will appear allowing the user to Opt In.");
    const step5Body = steps[4].split(" ||| ", 2)[1] ?? "";
    expect(step5Body.split(" | ").map((s) => s.trim())).toEqual([
      "Enter your email and phone number.",
      'Click the "Contact Me" button.',
      "You should receive a confirmation email at the email you entered. Verify that you received the email.",
    ]);
    expect(steps[5]).toContain("Copy the generated Scenario ID");
    expect(steps[8]).toContain("download files");
    const downloadBody = steps[8].split(" ||| ", 2)[1] ?? "";
    expect(downloadBody.split(" | ").map((s) => s.trim())).toEqual([
      "Click 'Download PDF' to generate the system output report.",
      "Click 'Download Excel' to generate the system output report.",
    ]);
    expect(steps[9]).toContain("Review the Medication Cost summary");
    const medCostBody = steps[9].split(" ||| ", 2)[1] ?? "";
    expect(medCostBody.split(" | ").map((s) => s.trim())).toEqual([
      "Open each report and locate the Medication Cost summary.",
      "The monthly total MUST equal $7/mo.",
      "The annual total MUST equal $84/yr.",
      "If it does not, do not fail the test. Just add a note in the test putting the amounts you see vs. the test.",
    ]);
  });

  it("checkboxes copy scenario link verification on the confirmation page", () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: "birth year = 1958 (age 68 in 2026)",
      zip3: "606",
      countyLine:
        "From the county dropdown that auto-populates for ZIP3=606, select Cook, IL — this scopes the carrier/plan check to only plans available in that county.",
      demographics:
        "gender = male, tobacco use = NO, income band = $55k–$75k, cost preference = 'minimize monthly'",
      conditions: "Chronic Kidney Disease Stage 3",
      medications: "Losartan 50 mg tablet (daily) = $7/mo",
      costTotal: "$7/mo and $84/yr",
    });

    expect(steps[6]).toContain("On the confirmation page :");
    const linkBody = steps[6].split(" ||| ", 2)[1] ?? "";
    expect(linkBody.split(" | ").map((s) => s.trim())).toEqual([
      'Click "Copy scenario link".',
      "Verify the link uses the form /scenario/<SCN code>.",
      "Paste it into a new browser tab.",
      "Confirm the scenario detail page loads with the SCN ID, summary card, share button, and expert opt-in trigger all present.",
    ]);
  });

  it("checkboxes each demographic, condition, and medication in the header echo step", () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: "birth year = 1958 (age 68 in 2026)",
      zip3: "606",
      countyLine:
        "From the county dropdown that auto-populates for ZIP3=606, select Cook, IL — this scopes the carrier/plan check to only plans available in that county.",
      demographics:
        "gender = male, tobacco use = NO, income band = $55k–$75k, cost preference = 'minimize monthly'",
      conditions: "Chronic Kidney Disease Stage 3",
      medications: "Losartan 50 mg tablet (daily) = $7/mo",
      costTotal: "$7/mo and $84/yr",
    });

    expect(steps[7]).toContain("verify the header echoes back each item");
    const headerBody = steps[7].split(" ||| ", 2)[1] ?? "";
    expect(headerBody.split(" | ").map((s) => s.trim())).toEqual([
      "birth year = 1958 (age 68 in 2026)",
      "ZIP3 = 606",
      "County = Cook, IL",
      "gender = male",
      "tobacco use = NO",
      "income band = $55k–$75k",
      "cost preference = 'minimize monthly'",
      formatConditionForQaStep("Chronic Kidney Disease Stage 3"),
      "Medication: Losartan 50 mg tablet (daily) = $7/mo",
    ]);
  });

  it("checkboxes PDF/XLSX cross-check for conditions, demographics, and ZIP3", () => {
    const steps = buildScenarioQaAuditSteps({
      birthYear: "birth year = 1958 (age 68 in 2026)",
      zip3: "606",
      countyLine:
        "From the county dropdown that auto-populates for ZIP3=606, select Cook, IL — this scopes the carrier/plan check to only plans available in that county.",
      demographics:
        "gender = male, tobacco use = NO, income band = $55k–$75k, cost preference = 'minimize monthly'",
      conditions: "Chronic Kidney Disease Stage 3",
      medications: "Losartan 50 mg tablet (daily) = $7/mo",
      costTotal: "$7/mo and $84/yr",
    });

    expect(steps[10]).toContain("Cross-check that what you entered in steps 1–3");
    const crossCheckBody = steps[10].split(" ||| ", 2)[1] ?? "";
    expect(crossCheckBody.split(" | ").map((s) => s.trim())).toEqual([
      "Conditions printed in the PDF and XLSX match what you entered.",
      "Demographics printed in the PDF and XLSX match what you entered.",
      "ZIP3 (606) printed in the PDF and XLSX matches what you entered.",
    ]);
  });
});
