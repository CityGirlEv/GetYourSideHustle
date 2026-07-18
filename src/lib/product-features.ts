/** Consumer-facing product capabilities for the Features marketing page. */
export type ConsumerProductFeature = {
  id: string;
  title: string;
  description: string;
};

export const CONSUMER_PRODUCT_FEATURES: ConsumerProductFeature[] = [
  {
    id: "benchmark-tool",
    title: "Part B Optimizer Benchmark Tool",
    description:
      "De-identified intake for ZIP, eligibility, medications, and priorities — no phone, email, or login required to start.",
  },
  {
    id: "benchmark-report",
    title: "Educational benchmark report",
    description:
      "PBO Blueprint, federal Part B baselines, and regional frameworks from your inputs — clearly labeled as educational, not enrollment advice.",
  },
  {
    id: "plan-comparison",
    title: "Plan comparison views",
    description:
      "Potential Top 3 rationale, Top 10 rankings, and side-by-side compare for up to three plans in your available catalog.",
  },
  {
    id: "workbook",
    title: "Turning 65 workbook",
    description:
      "Downloadable Part B Optimizer workbook to prepare questions before talking with a licensed professional.",
  },
  {
    id: "exports",
    title: "PDF & spreadsheet exports",
    description:
      "Save and share benchmark reports as PDF or XLSX on your device — your Benchmark Tool ID keeps the link private.",
  },
  {
    id: "privacy",
    title: "Privacy-first by design",
    description:
      "We do not collect PHI or PII in the public benchmark flow. Partner contact is optional and only when you opt in.",
  },
];
