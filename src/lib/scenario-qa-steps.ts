/** Shared wizard steps for SCEN-QA-00x scenario audit tests in the Testing Portal. */
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
  return [
    "Start from home page where the user clicks Build My Scenario",
    `Step 1 — Basics: Enter the following for the Scenario Information. ${birthYear}, ZIP3 = ${zip3}. THEN CLICK NEXT.`,
    `${countyLine} Enter the remaining for the Scenario Information: ${demographics}. THEN CLICK NEXT.`,
    `Step 2 — Conditions: Add these medical conditions. If the exact condition isn't listed, click the "Other" box and type in the condition. ${conditions}. THEN CLICK NEXT.`,
    `Under Common medications for your conditions: Select the medication (if present). Those medications will be added to the list below. Click the plus sign to add additional medications. Add these medications: ${medications}. THEN CLICK CREATE SCENARIO.`,
    'A pop-up screen will appear allowing the user to Opt In. Enter your email and phone number and click the "Contact Me" button.',
    "Verify that an email was sent to the address you provided in the previous step.",
    "Capture the generated Scenario ID (SCN-YYYY-XXXX-XXXX) — write it in QA notes",
    'On the confirmation page, click "Copy scenario link" — verify the link uses the form /scenario/<SCN code>. Paste it into a new browser tab and confirm the scenario detail page loads with the SCN ID, summary card, share button, and expert opt-in trigger all present',
    "On the confirmation page, verify the header echoes back every demographic, condition, and medication you entered character-for-character",
    "On the confirmation page (or View scenario summary), click 'Download PDF' and 'Download Excel' to generate the system output reports",
    `Open each report and locate the Medication Cost summary. The total MUST equal ${costTotal}. If it does not, do not fail the test. Just add a note in the test putting the amounts you see vs. the test.`,
    "Cross-check that the conditions, demographics, and ZIP3 printed in the PDF and XLSX match what you entered in steps 2–5",
  ];
}
