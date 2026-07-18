/** Canonical workbook copy for PDF generation, email capture, and batch seeding. */
export const DEFAULT_WORKBOOK_LEAD_MAGNET = {
  title: "Part B Optimizer (PBO) Turning 65 Workbook",
  excerpt: "Printable PBO checklist to gather facts before comparing coverage options.",
  body: [
    "# Part B Optimizer (PBO) Turning 65 Workbook",
    "",
    "## Before you compare plans",
    "",
    "- List every prescription with exact dosage",
    "- Write down preferred doctors, specialists, and hospitals",
    "- Note whether you are still working and whether your employer has 20+ employees",
    "- Gather current premium and deductible amounts for existing coverage",
    "",
    "## Questions for your review meeting",
    "",
    "- Do I need Part B now or can I delay without a penalty?",
    "- Would Original Medicare plus Medigap or a Medicare Advantage plan fit my care patterns?",
    "- How do my drugs appear on each plan formulary?",
    "",
    "## Official sources to verify",
    "",
    "- Medicare.gov and 1-800-MEDICARE",
    "- Social Security Administration for Part B enrollment",
    "- Your State Health Insurance Assistance Program (SHIP)",
    "",
    "Educational workbook only — not personalized enrollment advice.",
  ].join("\n"),
} as const;

export type WorkbookLeadMagnetSeed = typeof DEFAULT_WORKBOOK_LEAD_MAGNET;
