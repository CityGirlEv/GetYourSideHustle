/**
 * Local Business AI Setup Helper (`local-business-ai-setup`, Guide #081).
 * Elite Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project (examples).
 * Plain data only — no imports from guide-tools.
 */

export const LOCAL_BUSINESS_AI_SETUP_REALITY_CHECK = {
  title: "THE BUSINESS OWNER STAYS IN CONTROL",
  body: [
    "Set up simple, owner-approved AI reply templates, prompt libraries, and FAQ helpers for local shops that are new to ChatGPT — then train the owner to review every result before use.",
    "",
    "This service creates a repeatable AI-assisted workflow. It does not replace the business owner’s judgment or authorize the helper to send unreviewed messages, make promises, change prices, give professional advice, or upload confidential data.",
    "",
    "Use AI for low-risk drafts such as: frequently asked question responses; appointment or estimate-request acknowledgments; polite review-response drafts; plain-language service descriptions; internal checklists and brainstorming.",
    "",
    "Do not use a general AI tool as the final authority for medical, legal, financial, hiring, credit, housing, safety, emergency, regulated, or other high-impact decisions.",
    "",
    "Before setup, the owner must approve what data may be entered. Exclude passwords, payment-card information, government IDs, private employee records, private customer histories, health information, account credentials, and confidential documents unless the business has selected an appropriate approved system and verified its privacy, security, retention, and contractual requirements.",
    "",
    "AI can produce false or invented information. Every draft must be checked against the business’s current policies by an authorized person before it is sent or published.",
    "",
    "Do not ask the owner to share passwords. Have the owner sign in and keep credentials in a password manager they control.",
    "",
    "Tagline: Make AI Useful, Safe, and Simple for the Shop.",
  ].join("\n"),
};

export const LOCAL_BUSINESS_AI_SETUP_NOTES_WORKSHEET = `LOCAL BUSINESS AI SETUP NOTES

MY AI SETUP OFFER
Business Type: __________
Low-Risk Use Case: __________
Deliverables: __________
Mini Project Price: $____
Full Setup Price: $____
Training Rate: $____
Support Boundary: __________

My Two or Three Marketing Channels:
1. __________
2. __________
3. __________

CLIENT SAFETY PLAN
Account Owner: __________
Final Human Approver: __________
Allowed Data: __________
Prohibited Data: __________
No Automatic Sending: ☐ Confirmed
Escalation Rule: __________

DELIVERABLES
Prompt/Template Library: ☐
Source-of-Truth FAQ: ☐
Data-Boundary Checklist: ☐
Test Results: ☐
One-Page SOP: ☐
Version/Date Log: ☐
Owner Training Completed: ☐
Credentials Kept by Owner: ☐

RESULTS
Quoted Price: $____
Expenses: $____
Hours: ____
Profit: $____
Follow-Up Date: __________

GYSH PRO TIP
Make AI useful, safe, and simple for the shop.
APPROVED FACTS → BOUNDED PROMPTS → HUMAN REVIEW → TRAINING → PERIODIC UPDATE.`;

export const LOCAL_BUSINESS_AI_SETUP_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Set up simple, owner-approved AI reply templates, prompt libraries, and FAQ helpers for local shops that are new to ChatGPT — then train the owner to review every result before use. Tagline: Make AI Useful, Safe, and Simple for the Shop. Category: AI / Local. Best for Adults, Seniors / Retirees comfortable teaching simple technology. Beginner to Intermediate · $0 – $35 startup · Flexible / Appointment-Based · Local / Remote · Per Setup / Training / Light Support Retainer · 3 - 10 hrs/week · Elite Membership. Displayed $15 – $50 / project is examples only.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer or tablet with reliable internet · Owner-approved AI account and plan · Clear communication and patient teaching · Basic prompt-writing and fact-checking skills · Secure note and file storage · Written scope, access, and payment agreement · Ability to explain limitations in plain language.",
  },
  {
    id: "before",
    label: "Before accepting a shop",
    detail:
      "Confirm: business type and services; intended low-risk AI use cases; authorized owner/manager; who owns the accounts and files; data that is allowed and prohibited; who approves every external response; platform terms and commercial-use rules; any industry-specific privacy, recordkeeping, or professional requirements.",
  },
  {
    id: "passwords",
    label: "No password sharing",
    detail:
      "Do not ask the owner to share passwords. Have the owner sign in and keep credentials in a password manager they control. Do not promise that the setup is private, compliant, error-free, or secure without verifying the actual product, plan, settings, and business requirements.",
  },
];

export const LOCAL_BUSINESS_AI_SETUP_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Owner-controlled account" },
  { label: "Google Gemini", url: "https://gemini.google.com/", note: "Alternative owner-approved AI" },
  { label: "OpenAI Terms of Use", url: "https://openai.com/policies/terms-of-use/", note: "Current commercial-use and age rules" },
  { label: "OpenAI Help Center", url: "https://help.openai.com/", note: "Business privacy / data guidance" },
  { label: "FTC business guidance", url: "https://www.ftc.gov/business-guidance", note: "Privacy and truthful claims" },
  { label: "NIST AI RMF", url: "https://airc.nist.gov/", note: "AI risk-management resources" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Prompt library and SOP" },
];

export const LOCAL_BUSINESS_AI_SETUP_SUPPLIES = {
  starterKitTotal: "About $10–35 if printed or laminated materials are purchased. Digital delivery can cost $0.",
  items: [
    { id: "laptop", name: "Laptop or tablet", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "charger", name: "Charger", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "intake", name: "Client intake form", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "boundary", name: "Use-case and data-boundary checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "prompt", name: "Prompt / template worksheet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "test", name: "Test-case sheet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "agenda", name: "Training agenda / handoff checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "print", name: "Printed setup checklist", qty: "1", estCost: "$3–8", notes: "Optional on-site leave-behind", optional: true },
    { id: "laminate", name: "Laminated how-to card", qty: "1", estCost: "$4–10", notes: "Optional", optional: true },
    { id: "folder", name: "SOP / login folder (passwords kept by owner)", qty: "1", estCost: "$2–5", notes: "Optional", optional: true },
    { id: "spare", name: "Spare charging cable for demonstrations", qty: "1", estCost: "$8–15", notes: "Optional", optional: true },
  ],
};

export const LOCAL_BUSINESS_AI_SETUP_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "chatgpt", name: "ChatGPT", freePlanAvailable: true, costNote: "Owner-controlled drafting account", url: "https://chatgpt.com/" },
  { id: "gemini", name: "Google Gemini", freePlanAvailable: true, costNote: "Alternative business-approved AI", url: "https://gemini.google.com/", optional: true },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Prompt library, FAQ, SOP", url: "https://docs.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Test cases and version log", url: "https://sheets.google.com/" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Simple instruction card", url: "https://www.canva.com/", optional: true },
  { id: "pwm", name: "Owner-controlled password manager + MFA", freePlanAvailable: true, costNote: "Owner keeps credentials" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Owner-Controlled AI Account + Google Docs + Approved FAQ + Test Sheet + Handoff Checklist" },
];

export const LOCAL_BUSINESS_AI_SETUP_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "LOCAL BUSINESS AI SETUP PRICING EXAMPLES",
    "",
    "Mini FAQ / Reply Template Project: $15 – $50",
    "Small starter project using owner-supplied facts; limited templates and one revision round.",
    "",
    "AI Starter Setup: $200 – $600",
    "Defined workflow, approved prompt library, FAQ/reply templates, test cases, and owner handoff.",
    "",
    "Owner Training: $75 – $150 / hour",
    "Live walkthrough, safe-use checklist, practice prompts, and questions.",
    "",
    "Light Support Retainer: $75 – $200 / month",
    "Limited monthly updates, prompt maintenance, and one scheduled check-in; define request and hour caps.",
    "",
    "Possible add-ons: additional department or location; expanded template library; staff training session; extra revision round; monthly quality review.",
    "",
    "Agree in writing: Use Cases + Deliverables + Excluded Data + Account Owner + Review/Approval Process + Training + Revision Limit + Deadline + Price + Support Boundary.",
    "Do not charge for a full “automation” if the deliverable is only a prompt document. Describe exactly what the owner will receive.",
  ].join("\n"),
  raiseTip:
    "Displayed $15 – $50 / project is a mini-project example, not a full-setup guarantee. Revenue is not profit.",
  items: [
    { id: "mini", label: "Mini FAQ / reply template project", price: "$15 – $50", notes: "Displayed earning-potential range" },
    { id: "setup", label: "AI starter setup", price: "$200 – $600" },
    { id: "train", label: "Owner training", price: "$75 – $150 / hour" },
    { id: "retainer", label: "Light support retainer", price: "$75 – $200 / month" },
  ],
};

export const LOCAL_BUSINESS_AI_SETUP_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose a Low-Risk Business & Use Case",
    desc: [
      "Start with one understandable local business and one narrow task.",
      "Examples: draft replies to opening-hours questions; turn approved service facts into FAQ answers; draft polite responses to common reviews; create a checklist for intake follow-up; rewrite an owner’s draft in a chosen tone.",
      "Avoid high-impact or regulated advice.",
      "Business Type: __________ · Use Case: __________ · Final Human Approver: __________.",
    ].join("\n"),
  },
  {
    title: "Set the Data & Decision Boundaries",
    desc: [
      "ALLOWED INPUT: public business hours, approved services, published prices, service area, booking link, return policy, and owner-written tone examples.",
      "PROHIBITED INPUT: passwords, payment-card data, government IDs, private health/employee/customer records, legal files, unpublished financial data, and anything the business lacks permission to use.",
      "Also define: AI may draft; authorized staff decides; no automatic sending in the starter setup; no made-up prices, policies, availability, credentials, guarantees, or citations; uncertain questions go to a person.",
      "Owner Approval: __________.",
    ].join("\n"),
  },
  {
    title: "Package the Exact Deliverable",
    desc: [
      "Choose one starter package. Example: “Ten owner-approved FAQ reply templates, five tone prompts, a one-page safe-use checklist, a test session, and a 45-minute owner training.”",
      "Write: Deliverables · Number of Templates/Prompts · Training Included (minutes) · Revision Rounds · Turnaround · Price.",
      "Not included: automation, integrations, account sharing, policy writing, legal review, or unlimited support unless expressly listed.",
    ].join("\n"),
  },
  {
    title: "Build a Demo with Fictional Data",
    desc: [
      "Create a safe sample for a fictional shop.",
      "Include: five approved source facts; one tone guide; three FAQ prompts; three example drafts; one incorrect AI answer that demonstrates why review matters; one escalation response: “I’m not certain—please contact the owner.”",
      "Do not use a real business’s confidential material in a public sample.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Choose exactly 2 or 3: existing local network; chamber or business group where permitted; in-person introductions; LinkedIn; parent/owner referrals; local business Facebook group; email to individually researched businesses.",
      "Set one measurable goal per channel. Examples: show the fictional demo to 5 known owners; attend 1 local business event; send 10 personalized, permission-conscious introductions.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a one-page offer and short demonstration.",
      "Sample: LOCAL BUSINESS AI STARTER SETUP — I help owners turn approved business facts into reusable AI prompt and reply templates. You keep control of the account, data, and every final message. Starter project from $____. Includes: __________. Does not include: automated sending or professional advice. Contact: __________.",
      "Do not claim that AI will replace staff, guarantee revenue, eliminate mistakes, or make the business compliant.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels chosen.",
      "Sample message: “I help local shops build simple, owner-reviewed AI FAQ and reply templates using facts you approve. I can show you a five-minute fictional demo and scope one small starter project. You keep control of all accounts and final messages.”",
      "Track: Date | Business | Channel | Use Case | Response | Follow-Up.",
      "Personalize outreach. Honor opt-outs and platform rules. Do not mass-spam.",
    ].join("\n"),
  },
  {
    title: "Run the Owner Discovery & Source-of-Truth Review",
    desc: [
      "Collect only approved information. Business: __________ · Owner/Manager: __________ · Use Case: __________.",
      "Approved sources: website, policy sheet, price list, hours, service area, booking link, and owner notes.",
      "For each fact record: Fact | Approved Wording | Source | Owner | Last Updated | Escalation Rule.",
      "Identify questions AI must never answer without a person. Do not invent missing facts. Mark them “Owner decision needed.”",
    ].join("\n"),
  },
  {
    title: "Build, Test & Red-Team the Templates",
    desc: [
      "For each prompt/template: state the role and task; provide only approved facts; set the tone and length; list prohibited claims; require uncertainty to be escalated; define the output format.",
      "Test: normal question; vague question; angry customer; request outside policy; false premise; personal-data request; prompt attempting to override instructions.",
      "Record expected result, actual result, correction, and owner approval.",
    ].join("\n"),
  },
  {
    title: "Train the Owner & Hand Off Cleanly",
    desc: [
      "During training, the owner practices: starting a new draft; using the approved source facts; removing private information; checking every claim; editing tone; escalating uncertain questions; updating an outdated template; signing out and protecting the account.",
      "Deliver: prompt/template library; source-of-truth FAQ; data-boundary checklist; test results; one-page SOP; version/date log.",
      "The owner changes or confirms account security settings and keeps all credentials.",
    ].join("\n"),
  },
  {
    title: "Support, Audit & Improve",
    desc: [
      "After 7–14 days, review a small approved sample of outputs without collecting unnecessary personal data.",
      "Ask: which templates were used; which answers were inaccurate or unclear; which policy changed; which questions still need human escalation; did staff follow the review rule?",
      "Update the version log and invoice only for the support included.",
    ].join("\n"),
  },
];

export function localBusinessAiSetupToolsDisclaimer(): string {
  return "Beginner stack: Owner-Controlled AI Account + Google Docs + Approved FAQ + Test Sheet + Handoff Checklist. Check current AI provider terms, plan-level data controls, privacy policy, retention, and commercial-use terms before setup. OpenAI Terms: https://openai.com/policies/terms-of-use/";
}

export function computeLocalBusinessAiSetupProfit(input: {
  lbaiMiniProjects?: number;
  lbaiAvgMiniPrice?: number;
  lbaiFullSetups?: number;
  lbaiAvgSetupPrice?: number;
  lbaiTrainingHours?: number;
  lbaiTrainingRate?: number;
  lbaiMonthlySupportRevenue?: number;
  lbaiAiSoftwareCosts?: number;
  lbaiPrintingTravel?: number;
  lbaiPaymentFees?: number;
  lbaiOtherExpenses?: number;
  lbaiTotalHours?: number;
}): {
  miniRevenue: number;
  setupRevenue: number;
  trainingRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const miniRevenue = n(input.lbaiMiniProjects) * n(input.lbaiAvgMiniPrice);
  const setupRevenue = n(input.lbaiFullSetups) * n(input.lbaiAvgSetupPrice);
  const trainingRevenue = n(input.lbaiTrainingHours) * n(input.lbaiTrainingRate);
  const grossServiceRevenue =
    miniRevenue + setupRevenue + trainingRevenue + n(input.lbaiMonthlySupportRevenue);
  const totalExpenses =
    n(input.lbaiAiSoftwareCosts) +
    n(input.lbaiPrintingTravel) +
    n(input.lbaiPaymentFees) +
    n(input.lbaiOtherExpenses);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours = n(input.lbaiTotalHours);
  return {
    miniRevenue,
    setupRevenue,
    trainingRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
