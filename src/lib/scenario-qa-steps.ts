/** Shared wizard steps for SCEN-QA-00x scenario audit tests in the Testing Portal. */
export function splitScenarioDemographics(demographics: string): {
  basics: string;
  costPreference: string;
} {
  const parts = demographics
    .split(", ")
    .map((s) => s.trim())
    .filter(Boolean);
  const costIdx = parts.findIndex((p) => /^cost preference/i.test(p));
  const costPreference = costIdx >= 0 ? parts[costIdx]! : "cost preference = 'minimize monthly'";
  const basics = costIdx >= 0 ? parts.filter((_, i) => i !== costIdx).join(", ") : demographics;
  return { basics, costPreference };
}

/** QA checkbox label for a condition — guides testers to use Other when not listed. */
export function formatConditionForQaStep(condition: string): string {
  return `Condition: ${condition} — check if listed; if not present, select Other and type in the condition`;
}

/** QA checkbox label for cost preference — adds PPO/HMO guidance on predictability. */
export function formatCostPreferenceForQaStep(costPreference: string): string {
  if (/predictability/i.test(costPreference) && !/lean toward PPO/i.test(costPreference)) {
    return `${costPreference} (lean toward PPO vs. HMO)`;
  }
  return costPreference;
}

/** QA step label for county dropdown — matches wizard field order (before gender). */
export function formatCountyForQaStep(countyLine: string): string {
  return `County or parish — ${countyLine}`;
}

/** Extract "Cook, IL" style label from county dropdown instruction line. */
export function countyLabelFromLine(countyLine: string): string {
  const m = countyLine.match(/select (.+?) —/);
  return m ? m[1].trim() : countyLine;
}

/** Parse "$7/mo and $84/yr" style expected cost strings. */
export function parseCostTotal(costTotal: string): { monthly: string; annual: string } | null {
  const match = costTotal.match(/^(\$[\d,]+\/mo)\s+and\s+(\$[\d,]+\/yr)$/i);
  if (!match) return null;
  return { monthly: match[1]!, annual: match[2]! };
}

export function buildMedicationCostSubsteps(costTotal: string): string[] {
  const parsed = parseCostTotal(costTotal);
  const substeps = ["Open each report and locate the Medication Cost summary."];
  if (parsed) {
    substeps.push(`The monthly total MUST equal ${parsed.monthly}.`);
    substeps.push(`The annual total MUST equal ${parsed.annual}.`);
  } else {
    substeps.push(`The total MUST equal ${costTotal}.`);
  }
  substeps.push(
    "If it does not, do not fail the test. Just add a note in the test putting the amounts you see vs. the test.",
  );
  return substeps;
}

export function buildScenarioQaAuditSteps(parts: {
  birthYear: string;
  zip3: string;
  countyLine: string;
  demographics: string;
  conditions: string;
  medications: string;
  costTotal: string;
}): string[] {
  const { birthYear, zip3, countyLine, demographics, conditions, medications, costTotal } = parts;
  const { basics, costPreference } = splitScenarioDemographics(demographics);
  const demoParts = basics
    .split(", ")
    .map((s) => s.trim())
    .filter(Boolean);
  const step1Intro = "Step 1 — Demographics: Enter the following for the Scenario Information.";
  const step1Substeps = [
    birthYear,
    `ZIP3 = ${zip3}`,
    formatCountyForQaStep(countyLine),
    ...demoParts,
    "THEN CLICK NEXT.",
  ];
  const conditionParts = conditions
    .split(", ")
    .map((s) => s.trim())
    .filter(Boolean);
  const step2Substeps = [
    formatCostPreferenceForQaStep(costPreference),
    ...conditionParts.map(formatConditionForQaStep),
    "THEN CLICK NEXT.",
  ];
  const step2Intro =
    "Step 2 — Preferences & Conditions: On the Part 2 page, cost preference is first (section a), then conditions (section b). If a condition isn't listed, select Other and type in the condition if not present.";
  const medParts = medications
    .split("; ")
    .map((s) => s.trim())
    .filter(Boolean);
  const medSubsteps = [
    "Add these medications.",
    ...medParts.map((med) => `${med}.`),
    "THEN CLICK CREATE SCENARIO.",
  ];
  const step3Intro =
    "Step 3 — Medications: Under Common medications for your conditions: Select the medication (if present). Those medications will be added to the list below. Click the plus sign to add additional medications.";
  const step5Intro = "A pop-up screen will appear allowing the user to Opt In.";
  const step5Substeps = [
    "Enter your email and phone number.",
    'Click the "Contact Me" button.',
    "You should receive a confirmation email at the email you entered. Verify that you received the email.",
  ];
  const scenarioLinkIntro = "On the confirmation page :";
  const scenarioLinkSubsteps = [
    'Click "Copy scenario link".',
    "Verify the link uses the form /scenario/<SCN code>.",
    "Paste it into a new browser tab.",
    "Confirm the scenario detail page loads with the SCN ID, summary card, share button, and expert opt-in trigger all present.",
  ];
  const headerVerifyIntro =
    "On the confirmation page, verify the header echoes back each item character-for-character:";
  const headerVerifySubsteps = [
    birthYear,
    `ZIP3 = ${zip3}`,
    `County = ${countyLabelFromLine(countyLine)}`,
    ...demoParts,
    formatCostPreferenceForQaStep(costPreference),
    ...conditionParts.map(formatConditionForQaStep),
    ...medParts.map((m) => `Medication: ${m}`),
  ];
  const crossCheckIntro =
    "Cross-check that what you entered in steps 1–3 matches the PDF and XLSX:";
  const crossCheckSubsteps = [
    "Conditions printed in the PDF and XLSX match what you entered.",
    "Demographics printed in the PDF and XLSX match what you entered.",
    `ZIP3 (${zip3}) printed in the PDF and XLSX matches what you entered.`,
  ];
  const downloadFilesIntro = "On the confirmation page (or View scenario summary), download files:";
  const downloadFilesSubsteps = [
    "Click 'Download PDF' to generate the system output report.",
    "Click 'Download Excel' to generate the system output report.",
  ];
  const medCostIntro = "Review the Medication Cost summary in each report:";

  return [
    "Start from home page where the user clicks Build My Scenario",
    `${step1Intro} ${step1Substeps.join(" | ")}`,
    `${step2Intro} ||| ${step2Substeps.join(" | ")}`,
    `${step3Intro} ||| ${medSubsteps.join(" | ")}`,
    `${step5Intro} ||| ${step5Substeps.join(" | ")}`,
    "Copy the generated Scenario ID (SCN-YYYY-XXXX-XXXX) — write it in QA notes",
    `${scenarioLinkIntro} ||| ${scenarioLinkSubsteps.join(" | ")}`,
    `${headerVerifyIntro} ||| ${headerVerifySubsteps.join(" | ")}`,
    `${downloadFilesIntro} ||| ${downloadFilesSubsteps.join(" | ")}`,
    `${medCostIntro} ||| ${buildMedicationCostSubsteps(costTotal).join(" | ")}`,
    `${crossCheckIntro} ||| ${crossCheckSubsteps.join(" | ")}`,
  ];
}
