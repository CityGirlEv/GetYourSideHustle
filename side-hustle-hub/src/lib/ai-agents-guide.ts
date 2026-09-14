/**
 * AI Agents for Side Hustlers (`ai-agents`, Guide #022).
 * Sell a solved workflow — not “an AI agent.” Elite. Plain data only.
 */

export const AI_AGENTS_REALITY_CHECK = {
  title: "SELL A SOLVED BUSINESS PROBLEM, NOT “AN AI AGENT”",
  body: [
    "Clients usually do not care which model or framework you used.",
    "",
    "They care whether the system:",
    "- Saves time",
    "- Responds faster",
    "- Reduces repetitive work",
    "- Keeps leads organized",
    "- Helps book appointments",
    "- Improves follow-up",
    "- Creates useful research",
    "- Produces reliable drafts",
    "- Works safely with their business data",
    "",
    "Start with ONE narrow workflow that can be tested and supervised.",
    "Do not promise full autonomy when human review is still needed.",
    "",
    "Do not begin with “Which AI agent should I build?”",
    "Begin with: “What repetitive business task is costing this client time every week?”",
    "",
    "PROBLEM → WORKFLOW → NARROW AGENT → TEST → HUMAN REVIEW → DEPLOY → SUPPORT → REPEATABLE OFFER.",
    "",
    "Tagline: Find the Repetitive Work. Build the Agent. Save the Client Time.",
  ].join("\n"),
};

export const AI_AGENTS_NOTES_WORKSHEET = `MY AI AGENT OFFER

CLIENT
Business: ________
Contact: ________
Industry: ________
Primary Problem: ________

WORKFLOW
Trigger: ________
Inputs: ________
Steps: ________
Outputs: ________
Human Approval: ________
Escalation: ________

ACCESS
Connected Tools: ________
Sensitive Data: Yes / No
Access Method: ________
Credentials Shared Securely: ☐

TESTING
Normal Case: Pass / Fail
Missing Data: Pass / Fail
Bad Input: Pass / Fail
Out of Scope: Pass / Fail
Duplicate: Pass / Fail
Failure/Fallback: Pass / Fail

PRICING
Package: ________
Project Price: $____
Estimated Hours: ____
Tool/API Estimate: $____
Support Included: ________
Retainer: $____

RESULTS
Hours Saved: ________
Errors Reduced: ________
Manual Reviews: ________
Support Issues: ________
Client Feedback: ________

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Prospects: ____
Discovery Calls: ____
Quotes: ____
Closed: ____

NEXT
Reuse Workflow? ________
Industry Variation: ________
Retainer Offered: ☐
Referral Requested: ☐

GYSH PRO TIP
Do not begin with: “Which AI agent should I build?”
Begin with: “What repetitive business task is costing this client time every week?”

ELITE CHALLENGE
1. Choose one niche
2. Identify one repetitive problem
3. Map current workflow
4. Define agent boundaries
5. Build v1
6. Test 8 scenarios
7. Create human-review/fallback rules
8. Document setup
9. Create one demo
10. Create 3 packages
11. Choose 2–3 marketing channels
12. Contact 10 prospects
13. Run one discovery call
14. Quote one project
15. Offer monthly support
`;

export const AI_AGENTS_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Build and sell custom AI agents that help small businesses and side hustlers handle repetitive tasks such as lead research, appointment scheduling, information gathering, follow-up drafting, FAQ support, intake, reminders, and workflow assistance. Tagline: Find the Repetitive Work. Build the Agent. Save the Client Time. Category: AI Services / Automation / Business Support. Best for Adults, Seniors/Retirees, and experienced Teens with adult-managed business accounts where required. Intermediate · Low–Moderate startup · Remote / Local · Setup fee / custom agent / monthly support · 2 - 4 weeks · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Laptop/computer · Reliable internet · AI platform/tool · Basic automation/workflow tool where needed · Client intake form · Workflow mapping template · Test dataset/examples · Privacy/data-handling plan · Scope-of-work template · Pricing/package sheet · Documentation process · Support/maintenance plan.",
  },
  {
    id: "before-building",
    label: "Before building, define",
    detail:
      "Client Type · Business Problem · Current Manual Process · Desired Outcome · Inputs · Outputs · Human Approval Needed · Connected Tools · Sensitive Data Involved (Yes / No). Start with low-risk workflows before handling sensitive or high-stakes data.",
  },
];

export const AI_AGENTS_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "AI assistant / model platform" },
  { label: "Zapier", url: "https://zapier.com/", note: "Automation" },
  { label: "Make", url: "https://www.make.com/", note: "Automation" },
  { label: "n8n", url: "https://n8n.io/", note: "Automation" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Calendar integrations" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Logs and test data" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Client intake" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Workflow map and documentation" },
  { label: "Notion", url: "https://www.notion.so/", note: "Docs / knowledge base" },
];

export const AI_AGENTS_SUPPLIES = {
  starterKitTotal:
    "About $0–25 for printed checklists and folders — software accounts live on the Tools tab. Do not buy expensive platforms before a paying client.",
  items: [
    { id: "computer", name: "Computer", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "ai-platform", name: "AI platform access", qty: "1", estCost: "$0", notes: "Essential — see Tools" },
    { id: "automation", name: "Automation / workflow platform", qty: "1", estCost: "$0", notes: "Essential when the job needs it — see Tools" },
    { id: "email", name: "Business email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "intake", name: "Client intake form", qty: "1", estCost: "$0", notes: "Essential — Google Forms or printed" },
    { id: "workflow-map", name: "Workflow map", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "prompt-template", name: "Prompt / instruction template", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "test-checklist", name: "Testing checklist", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "sample-data", name: "Sample / test data (no sensitive production data)", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "docs-template", name: "Documentation template", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "credentials", name: "Secure credential-sharing method", qty: "1", estCost: "$0", notes: "Essential — never collect passwords in plain text" },
    { id: "invoice", name: "Invoice / payment method", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "tracker", name: "Project tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "support-log", name: "Support log", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "crm-sandbox", name: "CRM sandbox", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "cal-test", name: "Calendar test account", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "email-test", name: "Email test inbox", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "sheet-db", name: "Database / spreadsheet", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "kb", name: "Knowledge-base tool", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "recorder", name: "Screen-recording tool", qty: "1", estCost: "$0", notes: "Optional", optional: true },
  ],
};

export const AI_AGENTS_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "AI AGENT PRICING EXAMPLES",
    "",
    "Displayed earning potential: $1,000 – $10,000+ / month — examples only, NOT guarantees.",
    "",
    "STARTER OFFER — $150–$400",
    "One narrow agent/workflow. Examples: FAQ assistant, lead-research helper, follow-up drafting assistant, simple intake/sorting assistant, basic appointment-request assistant. Includes limited setup/testing/documentation.",
    "",
    "STANDARD CUSTOM AGENT — $400–$1,500+",
    "More complex workflow, multiple steps, custom prompts/instructions, connected tools where appropriate, testing, client handoff, basic documentation, 1–2 revision rounds.",
    "",
    "ADVANCED WORKFLOW / MULTI-AGENT SYSTEM — $1,500–$5,000+",
    "Use only when scope justifies it. May include multiple connected workflows, data routing, CRM/calendar/email integrations, admin dashboard, escalation logic, approval steps, training/documentation, testing and deployment support.",
    "",
    "MONTHLY SUPPORT / OPTIMIZATION — $100–$1,000+ / month",
    "Prompt updates, workflow tuning, usage review, error handling, small changes, new FAQ/knowledge updates, monthly reporting, limited support hours.",
    "",
    "PRICING FORMULA:",
    "Estimated Build Hours × Target Hourly Value + Tool/API/Automation Costs + Testing Time + Integration Complexity + Documentation + Support/Revision Allowance + Risk/Compliance Complexity = Project Price.",
    "",
    "MONTHLY EXAMPLES — NOT GUARANTEES",
    "2 starter builds × $300 = $600",
    "1 standard build × $900 + 2 support retainers × $200 = $1,300",
    "2 standard builds × $1,250 + 4 retainers × $300 = $3,700",
    "1 advanced system × $3,500 + 6 retainers × $400 = $5,900",
    "Higher-volume agencies may exceed $10,000/month, but results vary widely.",
    "",
    "Revenue is NOT profit. Subtract software, APIs, automation tools, contractors, marketing, payment fees, support time, and taxes.",
  ].join("\n"),
  raiseTip:
    "After a few successful builds, package a repeatable niche offer and add monthly support. Displayed $1,000 – $10,000+ / month is examples only — not income guarantees.",
  items: [
    { id: "starter", label: "Starter offer (one narrow workflow)", price: "$150–$400", notes: "FAQ, lead research, follow-up drafts, simple intake, basic appointment requests" },
    { id: "standard", label: "Standard custom agent", price: "$400–$1,500+", notes: "Multiple steps, connected tools, testing, handoff, 1–2 revisions" },
    { id: "advanced", label: "Advanced workflow / multi-agent system", price: "$1,500–$5,000+", notes: "Use only when scope justifies it" },
    { id: "retainer", label: "Monthly support / optimization", price: "$100–$1,000+ / month", notes: "Updates, error handling, reporting, limited support hours" },
  ],
};

export const AI_AGENTS_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "aa_ai",
    name: "AI assistant / model platform",
    freePlanAvailable: true,
    costNote: "ChatGPT or similar — plans and limits change; verify current options before you quote a client",
    url: "https://chatgpt.com/",
  },
  {
    id: "aa_zapier",
    name: "Zapier",
    freePlanAvailable: true,
    costNote: "Automation when the workflow needs connected apps",
    url: "https://zapier.com/",
    optional: true,
  },
  {
    id: "aa_make",
    name: "Make",
    freePlanAvailable: true,
    costNote: "Automation alternative",
    url: "https://www.make.com/",
    optional: true,
  },
  {
    id: "aa_n8n",
    name: "n8n",
    freePlanAvailable: true,
    costNote: "Automation alternative",
    url: "https://n8n.io/",
    optional: true,
  },
  {
    id: "aa_calendar",
    name: "Calendar integrations",
    freePlanAvailable: true,
    costNote: "Google Calendar or the client’s calendar — only with approved access",
    url: "https://calendar.google.com/",
  },
  {
    id: "aa_crm",
    name: "CRM integrations",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Use a sandbox first. Do not connect live customer lists until the client approves.",
    optional: true,
  },
  {
    id: "aa_email",
    name: "Email integrations",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Drafts first. No auto-send until the client signs off on human review.",
  },
  {
    id: "aa_sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Test data, logs, and time-saved tracking",
    url: "https://sheets.google.com/",
  },
  {
    id: "aa_forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Client intake",
    url: "https://forms.google.com/",
  },
  {
    id: "aa_docs",
    name: "Google Docs / Notion",
    freePlanAvailable: true,
    costNote: "Workflow map, offer sheet, and handoff documentation",
    url: "https://docs.google.com/",
  },
  {
    id: "aa_db",
    name: "Database tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Only when the workflow stores structured records — start with a Sheet when you can",
    optional: true,
  },
  {
    id: "aa_webhook",
    name: "Webhook / API tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Connect steps only after the core task works reliably",
    optional: true,
  },
  {
    id: "aa_logging",
    name: "Testing / logging tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Track Test | Expected | Actual | Pass/Fail | Fix",
  },
  {
    id: "aa_recorder",
    name: "Screen recorder",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Short demo video for marketing and client training",
    optional: true,
  },
  {
    id: "aa_password",
    name: "Password / credential manager",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Delegated access, roles, API keys, or OAuth — never plain-text passwords",
  },
  {
    id: "aa_pm",
    name: "Project management board",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Quotes, builds, tests, and support tickets",
  },
  {
    id: "aa_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "1 AI Platform + 1 Automation Tool + Google Forms/Sheets + Client Workflow Map + Test Checklist + Documentation",
  },
];

export function aiAgentsToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: 1 AI Platform + 1 Automation Tool + Google Forms/Sheets + Client Workflow Map + Test Checklist + Documentation.",
    "",
    "Do not ask clients to send passwords in plain text. Use delegated access, roles, API keys, OAuth, or a secure credential process where supported.",
    "",
    "Sell a solved business problem, not “an AI agent.” Keep a human-review step until the client agrees the workflow is safe.",
  ].join("\n");
}

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const AI_AGENTS_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose One Business Problem",
    desc: [
      "Clients usually do not care which model or framework you used. They care whether the system saves time, responds faster, reduces repetitive work, keeps leads organized, helps book appointments, improves follow-up, creates useful research, produces reliable drafts, and works safely with their business data.",
      "",
      "Start with ONE narrow workflow that can be tested and supervised.",
      "",
      "Good first agent ideas:",
      "☐ Lead research",
      "☐ Appointment request handling",
      "☐ Follow-up drafting",
      "☐ FAQ answering from approved information",
      "☐ Customer intake",
      "☐ Research summarization",
      "☐ Proposal first drafts",
      "☐ Content repurposing",
      "☐ Reminder workflows",
      "",
      "Avoid starting with:",
      "- Fully autonomous financial decisions",
      "- Medical advice",
      "- Legal advice",
      "- Hiring / firing decisions",
      "- Unsupervised money transfers",
      "- High-risk identity / security decisions",
      "",
      "Write:",
      "“The agent helps [CLIENT] do [TASK] by taking [INPUT] and producing [OUTPUT], with [HUMAN REVIEW] before [ACTION].”",
      "",
      "Do not promise full autonomy when human review is still needed.",
    ].join("\n"),
  },
  {
    title: "Map the Current Workflow",
    desc: [
      "Document:",
      "- Trigger",
      "- Input",
      "- Steps",
      "- Decision points",
      "- Tools",
      "- Output",
      "- Human review",
      "- Failure points",
      "",
      "Example:",
      "New lead form → capture contact → research company → summarize fit → draft follow-up → human reviews → send manually or through approved automation.",
      "",
      "Do not automate a bad process before understanding it.",
    ].join("\n"),
  },
  {
    title: "Define Agent Scope & Boundaries",
    desc: [
      "Write:",
      "- What the agent CAN do",
      "- What it CANNOT do",
      "- What data it may access",
      "- What requires approval",
      "- What happens when uncertain",
      "- Who receives escalations",
      "- How errors are logged",
      "",
      "Add a fallback:",
      "“When confidence is low or required data is missing, stop and ask for human review.”",
      "",
      "Start with low-risk workflows before handling sensitive or high-stakes data.",
    ].join("\n"),
  },
  {
    title: "Build the First Working Version",
    desc: [
      "Create:",
      "- System instructions",
      "- Task instructions",
      "- Input format",
      "- Output format",
      "- Examples",
      "- Guardrails",
      "- Error / fallback behavior",
      "",
      "Keep v1 narrow.",
      "Do not add five integrations before the core task works reliably.",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have) and save the v1 spec there.",
    ].join("\n"),
  },
  {
    title: "Test with Realistic Examples",
    desc: [
      "Test at least:",
      "☐ Normal case",
      "☐ Missing information",
      "☐ Bad input",
      "☐ Conflicting information",
      "☐ Duplicate lead",
      "☐ Unclear request",
      "☐ Unexpected format",
      "☐ Out-of-scope request",
      "",
      "Track: Test | Expected Result | Actual Result | Pass/Fail | Fix.",
      "",
      "Never test with sensitive production data when safe dummy data will work.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about you.",
      "",
      "Pick only 2 or 3 this month.",
      "",
      "Good channels:",
      "☐ Direct outreach to small businesses",
      "☐ LinkedIn",
      "☐ Facebook business groups where allowed",
      "☐ Local networking",
      "☐ Referrals",
      "☐ Existing clients",
      "☐ Email outreach to qualified prospects",
      "☐ Industry-specific communities",
      "☐ Your own website / portfolio",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write ONE measurable goal for each channel.",
      "",
      "Examples:",
      "- Contact 10 qualified prospects / week",
      "- Book 3 discovery calls / month",
      "- Post 2 workflow demos / week",
      "- Ask every client for 1 referral",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "- 1 simple offer sheet",
      "- 2–3 demo agents / workflows",
      "- 1 before / after workflow graphic",
      "- 1 ROI / time-saved example",
      "- 1 discovery-call checklist",
      "- 1 outreach message",
      "- 1 case-study template",
      "- 1 short demo video",
      "",
      "Sample outreach:",
      "“Hi! I build simple AI-assisted workflows for small businesses that reduce repetitive work like lead research, follow-up drafting, intake, and scheduling. If you tell me one task your team repeats every day, I can show you what may be worth automating.”",
      "",
      "Do not claim guaranteed revenue or headcount savings.",
      "Do not publicly post client data or unnecessary private information.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use ONLY the 2 or 3 channels selected.",
      "",
      "On the discovery call ask:",
      "- What task repeats most?",
      "- How often?",
      "- Who does it?",
      "- How long does it take?",
      "- What mistakes happen?",
      "- What tools are used?",
      "- What data is sensitive?",
      "- What absolutely requires human approval?",
      "- What would success look like?",
      "",
      "Then scope ONE workflow first.",
      "",
      "Track: Prospect | Problem | Current Time | Proposed Agent | Quote | Status | Follow-Up",
      "",
      "Do not spam.",
    ].join("\n"),
  },
  {
    title: "Deploy with Human Review & Documentation",
    desc: [
      "Before launch:",
      "☐ Confirm client approval",
      "☐ Confirm tool access",
      "☐ Confirm permissions",
      "☐ Test with safe data",
      "☐ Document workflow",
      "☐ Document failure behavior",
      "☐ Set human approval point",
      "☐ Set escalation contact",
      "☐ Create rollback / manual process",
      "☐ Train client",
      "",
      "Deliver:",
      "- How to use",
      "- What to check",
      "- Known limitations",
      "- What not to put into the agent",
      "- How to report errors",
      "- How to disable / stop the workflow if needed",
    ].join("\n"),
  },
  {
    title: "Monitor, Fix & Support",
    desc: [
      "Track:",
      "- Usage",
      "- Errors",
      "- Failed steps",
      "- Bad outputs",
      "- Escalations",
      "- Time saved",
      "- Manual overrides",
      "- Client questions",
      "- Tool / API cost",
      "",
      "Review logs regularly.",
      "",
      "If an integration breaks:",
      "Pause risky automation → use manual fallback → fix → retest → resume only after verification.",
      "",
      "Monthly support can become recurring revenue. Subtract software, APIs, automation tools, contractors, marketing, payment fees, support time, and taxes — revenue is not profit.",
    ].join("\n"),
  },
  {
    title: "Turn One Agent Into a Repeatable Offer",
    desc: [
      "After a successful build, identify patterns.",
      "",
      "Example:",
      "- Lead Follow-Up Agent for Realtors",
      "- Lead Follow-Up Agent for Contractors",
      "- Lead Follow-Up Agent for Coaches",
      "",
      "Create:",
      "- Reusable intake",
      "- Reusable workflow map",
      "- Reusable prompt framework",
      "- Reusable test checklist",
      "- Reusable documentation",
      "- Industry-specific variations",
      "",
      "Then build packages: SETUP → TEST → TRAIN → SUPPORT → OPTIMIZE.",
    ].join("\n"),
  },
];

/** Monthly AI-agent profit math. Revenue is not profit. */
export function computeAiAgentsProfit(input: {
  starterBuilds?: number;
  starterPrice?: number;
  standardBuilds?: number;
  standardPrice?: number;
  advancedBuilds?: number;
  advancedPrice?: number;
  monthlyRetainers?: number;
  retainerPrice?: number;
  aiApiCosts?: number;
  automationTools?: number;
  hostingDatabase?: number;
  contractors?: number;
  software?: number;
  paymentFees?: number;
  marketing?: number;
  otherExpenses?: number;
  buildHours?: number;
  testingHours?: number;
  supportHours?: number;
  salesAdminHours?: number;
}): {
  starterRevenue: number;
  standardRevenue: number;
  advancedRevenue: number;
  retainerRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  totalHours: number;
  effectiveProfitPerHour: number | null;
} {
  const starterRevenue =
    Math.max(0, Number(input.starterBuilds) || 0) * Math.max(0, Number(input.starterPrice) || 0);
  const standardRevenue =
    Math.max(0, Number(input.standardBuilds) || 0) * Math.max(0, Number(input.standardPrice) || 0);
  const advancedRevenue =
    Math.max(0, Number(input.advancedBuilds) || 0) * Math.max(0, Number(input.advancedPrice) || 0);
  const retainerRevenue =
    Math.max(0, Number(input.monthlyRetainers) || 0) * Math.max(0, Number(input.retainerPrice) || 0);
  const monthlyRevenue = starterRevenue + standardRevenue + advancedRevenue + retainerRevenue;
  const monthlyExpenses =
    Math.max(0, Number(input.aiApiCosts) || 0) +
    Math.max(0, Number(input.automationTools) || 0) +
    Math.max(0, Number(input.hostingDatabase) || 0) +
    Math.max(0, Number(input.contractors) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.marketing) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const totalHours =
    Math.max(0, Number(input.buildHours) || 0) +
    Math.max(0, Number(input.testingHours) || 0) +
    Math.max(0, Number(input.supportHours) || 0) +
    Math.max(0, Number(input.salesAdminHours) || 0);
  return {
    starterRevenue,
    standardRevenue,
    advancedRevenue,
    retainerRevenue,
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    totalHours,
    effectiveProfitPerHour: totalHours > 0 ? monthlyProfit / totalHours : null,
  };
}
