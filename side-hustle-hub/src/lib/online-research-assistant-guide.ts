/**
 * Online Research Assistant (`online-research-assistant`, Guide #090).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK = {
  title: "DON'T JUST SEND LINKS",
  body: [
    "Clients are paying you to save them TIME.",
    "",
    "Your job is to:",
    "SEARCH → CHECK → COMPARE → ORGANIZE → SUMMARIZE",
    "",
    "A useful research brief helps the client make a decision.",
    "",
    "Tagline: Find It. Compare It. Organize It. Deliver It.",
  ].join("\n"),
};

/** Research planner shown above freeform Notes for this guide. */
export const ONLINE_RESEARCH_ASSISTANT_NOTES_WORKSHEET = `MY ONLINE RESEARCH BUSINESS

Starter Offer: __________
Price: $____
Turnaround: __________

MY MARKETING CHANNELS:
1. __________
2. __________
3. __________

CLIENT RESEARCH BRIEF

Client: __________
Question: __________
Goal: __________
Budget: __________
Deadline: __________

Must-Haves:
____________________

Deal Breakers:
____________________

Options Needed: ______

BEST FINDINGS:
1. __________
2. __________
3. __________

Sources:
____________________

Date Checked:
____________________

Time Spent:
Research: _____
Formatting: _____
Total: _____

Project Price: $____
Expenses: $____
Profit: $____

Client Feedback:
____________________

Follow-Up:
____________________

GYSH PRO TIP — THE CLIENT ISN'T PAYING YOU TO GOOGLE.
They're paying you so THEY don't have to.
A valuable research assistant turns 100 search results into 3–5 useful choices + important facts + clear comparisons + source links + a tidy answer.

BEGINNER CHALLENGE:
Create one sample research brief before looking for clients.
Example: “Compare 5 local venues for a 50-person birthday party under a $1,500 venue budget.”
Create: 1 comparison table + 1-page summary + source links.
Now you have a sample to show potential clients.`;

export const ONLINE_RESEARCH_ASSISTANT_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Research specific questions online and turn the results into clear, organized briefs for clients. Projects may include vendor research, travel options, product comparisons, local resources, pricing research, or other fact-finding assignments. Category: Virtual Services / Research. Best for teens, adults, seniors / retirees. Beginner · $0–very low startup · Flexible · Remote / home · Per project / recurring · 3–10 hrs/week · Starter Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable internet · Computer/tablet · Good web-search skills · Basic writing skills · Ability to organize information · Attention to detail · Ability to follow client instructions.",
  },
  {
    id: "skills",
    label: "You should know how to",
    detail:
      "Search effectively · Compare multiple sources · Record source links · Check dates · Separate facts from opinions · Create a clean document/table · Meet a deadline.",
  },
  {
    id: "disclaimer",
    label: "IMPORTANT — not licensed advice",
    detail:
      "Do not present yourself as a lawyer, doctor, financial adviser, or other licensed professional. For high-stakes topics, organize information from reliable sources and make clear that the client should consult an appropriate professional.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — organize, don't dump links",
    detail:
      "Clients pay so THEY don't have to Google. Deliver 3–5 useful choices, important facts, clear comparisons, source links, and a tidy answer.",
  },
];

export const ONLINE_RESEARCH_ASSISTANT_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Search",
    url: "https://www.google.com/",
    note: "General research",
  },
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Local / vendor research",
  },
  {
    label: "Google Docs",
    url: "https://docs.google.com/",
    note: "Research briefs",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Comparisons",
  },
  {
    label: "Google Drive",
    url: "https://drive.google.com/",
    note: "File delivery",
  },
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Polished reports",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Deadlines",
  },
  {
    label: "Gmail",
    url: "https://mail.google.com/",
    note: "Client communication",
  },
  {
    label: "ChatGPT",
    url: "https://chatgpt.com/",
    note: "Optional AI — verify all facts",
  },
];

export const ONLINE_RESEARCH_ASSISTANT_SUPPLIES = {
  starterKitTotal:
    "About $0–20 — startup can be $0 if you already own a computer/tablet and internet",
  items: [
    {
      id: "computer",
      name: "Computer / tablet",
      qty: "1",
      estCost: "$0",
      notes: "Essential — already owned",
    },
    {
      id: "internet",
      name: "Internet connection",
      qty: "1",
      estCost: "$0+",
      notes: "Essential",
    },
    {
      id: "email",
      name: "Email account",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "browser",
      name: "Web browser",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "docs",
      name: "Document tool (Google Docs / Word)",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "sheets",
      name: "Spreadsheet tool (Google Sheets / Excel)",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "monitor",
      name: "Second monitor",
      qty: "1",
      estCost: "$0–150",
      notes: "Helpful — optional",
      optional: true,
    },
    {
      id: "notebook",
      name: "Notebook",
      qty: "1",
      estCost: "$3–8",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "cloud",
      name: "Cloud storage",
      qty: "1",
      estCost: "$0+",
      notes: "Helpful — Drive free tier",
      optional: true,
    },
    {
      id: "calculator",
      name: "Calculator",
      qty: "1",
      estCost: "$0",
      notes: "Helpful — phone app OK",
      optional: true,
    },
    {
      id: "headphones",
      name: "Headphones",
      qty: "1",
      estCost: "$0–30",
      notes: "Helpful — optional",
      optional: true,
    },
  ],
};

export const ONLINE_RESEARCH_ASSISTANT_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "google-search",
    name: "Google Search",
    freePlanAvailable: true,
    costNote: "General research",
    url: "https://www.google.com/",
  },
  {
    id: "google-maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Local / vendor research",
    url: "https://maps.google.com/",
  },
  {
    id: "google-docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Research briefs",
    url: "https://docs.google.com/",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Comparisons",
    url: "https://sheets.google.com/",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "File delivery",
    url: "https://drive.google.com/",
  },
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Polished reports",
    url: "https://www.canva.com/",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Deadlines",
    url: "https://calendar.google.com/",
  },
  {
    id: "email",
    name: "Email",
    freePlanAvailable: true,
    costNote: "Client communication",
    url: "https://mail.google.com/",
  },
  {
    id: "chatgpt",
    name: "ChatGPT (optional AI)",
    freePlanAvailable: true,
    costNote: "Organize / summarize only — verify every important fact",
    url: "https://chatgpt.com/",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner tool stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Browser + Google + Docs + Sheets + Drive",
  },
];

export const ONLINE_RESEARCH_ASSISTANT_PRICING = {
  tabLabel: "Suggested Pricing",
  intro:
    "Starter examples — always define the project BEFORE starting. Avoid unlimited research for one flat price. Displayed range: $15–$50/project (examples).",
  raiseTip:
    "Examples only — not income guarantees. Raise prices after strong sample briefs and happy clients.",
  items: [
    {
      id: "quick",
      label: "Quick Research",
      price: "$15–$20",
      notes: "One focused question · approx. 3–5 useful findings",
    },
    {
      id: "standard",
      label: "Standard Research Brief",
      price: "$25–$35",
      notes: "Several options · basic comparison · source links · short summary",
    },
    {
      id: "detailed",
      label: "Detailed Comparison",
      price: "$40–$50+",
      notes:
        "Multiple options · comparison table · source links · recommendation summary based on client's stated criteria",
    },
    {
      id: "addon-rush",
      label: "Add-on: Rush turnaround",
      price: "Agree in advance",
      notes: "Faster deadline",
    },
    {
      id: "addon-category",
      label: "Add-on: Extra research category",
      price: "Agree in advance",
      notes: "Additional vendors / options / larger table",
    },
    {
      id: "addon-followup",
      label: "Add-on: Follow-up research",
      price: "Agree in advance",
      notes: "Or presentation-ready formatting",
    },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only. */
export const ONLINE_RESEARCH_ASSISTANT_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Research Services",
    desc: [
      "Choose 2–4 areas to start.",
      "",
      "Examples:",
      "☐ Vendor research",
      "☐ Product comparisons",
      "☐ Travel-option research",
      "☐ Local business/resource research",
      "☐ Pricing research",
      "☐ Event/location research",
      "☐ Software/tool comparisons",
      "☐ Gift/product research",
      "☐ General web research",
      "",
      "Avoid projects requiring professional licenses or expertise you do not have.",
    ].join("\n"),
  },
  {
    title: "Create Your Starter Offer",
    desc: [
      "Example:",
      "",
      "ONLINE RESEARCH MINI",
      "",
      "I'll research:",
      "One focused question",
      "",
      "Client receives:",
      "☐ 3–5 useful options",
      "☐ Key details",
      "☐ Source links",
      "☐ Short comparison",
      "☐ Organized summary",
      "",
      "Price: $____",
      "Turnaround: ______",
      "",
      "Keep the offer easy to understand.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about you.",
      "",
      "Pick ONLY 2 or 3 this month.",
      "",
      "Good channels:",
      "☐ Friends/family/referrals",
      "☐ Email",
      "☐ LinkedIn",
      "☐ Facebook business/community groups",
      "☐ Small-business groups",
      "☐ Entrepreneur groups",
      "☐ Local business outreach",
      "☐ Virtual assistant communities",
      "☐ Networking groups",
      "",
      "Write:",
      "",
      "Service: Online Research Assistance",
      "Starter Price: $____",
      "Turnaround: ______",
      "",
      "Set goals:",
      "☐ Contact _____ potential clients",
      "☐ Send _____ outreach messages",
      "☐ Make _____ service posts",
      "☐ Ask _____ contacts for referrals",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "1. Simple service graphic/flyer",
      "2. Short service description",
      "3. Sample research brief",
      "4. Outreach message",
      "",
      "SAMPLE:",
      "",
      "NEED RESEARCH BUT DON'T HAVE TIME?",
      "",
      "I can research and organize:",
      "☐ Vendors",
      "☐ Products",
      "☐ Travel Options",
      "☐ Local Resources",
      "☐ Pricing",
      "☐ Online Tools",
      "",
      "You'll receive organized findings, comparisons, and source links.",
      "",
      "Starter projects from $____",
      "Contact: __________",
      "",
      "OUTREACH:",
      "",
      "“Hi! I'm offering online research assistance for busy individuals and small businesses. If you need vendors, products, travel options, pricing, or other information researched and organized, I can turn it into a simple research brief so you don't have to spend hours searching yourself.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY your selected 2–3 channels.",
      "",
      "This week:",
      "☐ Contact 8–12 appropriate people/businesses",
      "☐ Send your short pitch",
      "☐ Share a sample brief",
      "☐ Post in selected groups/channels",
      "☐ Ask for referrals",
      "",
      "Track:",
      "",
      "Date | Person/Business | Channel | Need | Response | Follow-Up",
      "",
      "Reply promptly.",
      "",
      "Do not spam groups or send mass unsolicited messages.",
    ].join("\n"),
  },
  {
    title: "Define the Research Question",
    desc: [
      "Before researching, ask:",
      "",
      "“What exactly are you trying to decide or find?”",
      "",
      "Confirm:",
      "",
      "Topic: __________",
      "Goal: __________",
      "Location if relevant: __________",
      "Budget: __________",
      "Must-Haves: __________",
      "Deal Breakers: __________",
      "Number of Options: __________",
      "Deadline: __________",
      "Deliverable: __________",
      "",
      "Example:",
      "",
      "BAD:",
      "“Find hotels in Atlanta.”",
      "",
      "BETTER:",
      "“Find 5 Atlanta hotels under $175/night, near downtown, with parking and strong recent guest ratings.”",
      "",
      "Clear questions create better research.",
    ].join("\n"),
  },
  {
    title: "Build Your Research Plan",
    desc: [
      "Break the project into searches.",
      "",
      "Example:",
      "",
      "Client Needs:",
      "Catering vendor for 50 people.",
      "",
      "Research:",
      "☐ Location",
      "☐ Price",
      "☐ Minimum order",
      "☐ Menu",
      "☐ Delivery",
      "☐ Reviews",
      "☐ Availability information",
      "☐ Contact details",
      "",
      "Create your comparison columns BEFORE researching.",
      "",
      "This keeps you focused.",
    ].join("\n"),
  },
  {
    title: "Research & Verify",
    desc: [
      "Find several useful sources/options.",
      "",
      "For each result record:",
      "",
      "Name: __________",
      "Finding: __________",
      "Price: __________",
      "Important Details: __________",
      "Source: __________",
      "Date Checked: __________",
      "",
      "Verify important information.",
      "",
      "Whenever practical:",
      "- Prefer primary/official sources",
      "- Check current information",
      "- Compare multiple sources",
      "- Watch for sponsored results",
      "- Distinguish reviews/opinions from facts",
      "",
      "Never invent missing information.",
      "",
      "Write:",
      "“Not found” or “Needs confirmation”",
      "when appropriate.",
      "",
      "If you use AI: it can help organize, summarize, brainstorm search terms, and structure information — but do NOT assume an AI answer is automatically correct. Verify important facts using reliable sources.",
    ].join("\n"),
  },
  {
    title: "Compare & Analyze",
    desc: [
      "Don't stop after collecting information.",
      "",
      "Ask:",
      "",
      "Which option:",
      "☐ Best matches client's budget?",
      "☐ Meets the most requirements?",
      "☐ Has the fewest drawbacks?",
      "☐ Is easiest/convenient?",
      "☐ Needs additional verification?",
      "",
      "Create a comparison:",
      "",
      "OPTION | PRICE | PROS | CONS | SOURCE",
      "",
      "A | $___ | ___ | ___ | ___",
      "B | $___ | ___ | ___ | ___",
      "C | $___ | ___ | ___ | ___",
      "",
      "Separate facts from your interpretation.",
    ].join("\n"),
  },
  {
    title: "Create & Deliver the Brief",
    desc: [
      "Use this format:",
      "",
      "RESEARCH QUESTION",
      "____________________",
      "",
      "CLIENT CRITERIA",
      "____________________",
      "",
      "TOP FINDINGS",
      "1. __________",
      "2. __________",
      "3. __________",
      "",
      "COMPARISON",
      "____________________",
      "",
      "BEST MATCH BASED ON CLIENT'S CRITERIA",
      "____________________",
      "",
      "IMPORTANT NOTES",
      "____________________",
      "",
      "SOURCES",
      "____________________",
      "",
      "DATE RESEARCHED",
      "____________________",
      "",
      "Proofread before sending.",
      "",
      "Then deliver as:",
      "☐ Google Doc",
      "☐ PDF",
      "☐ Spreadsheet",
      "☐ Email summary",
      "☐ Other agreed format",
    ].join("\n"),
  },
  {
    title: "Get Rebooked",
    desc: [
      "After delivery ask:",
      "",
      "“Did the research give you what you needed to make your decision?”",
      "",
      "If yes:",
      "",
      "“I'm glad it helped! If you have another research project, I'd be happy to help again.”",
      "",
      "Ask for:",
      "☐ Testimonial",
      "☐ Referral",
      "☐ Next project",
      "☐ Recurring research work",
      "",
      "Recurring opportunities may include:",
      "- Monthly vendor research",
      "- Competitor/market monitoring",
      "- Product sourcing",
      "- Lead research",
      "- Pricing updates",
      "- Resource lists",
      "",
      "Only offer recurring work that matches your skills.",
    ].join("\n"),
  },
];

export function onlineResearchAssistantToolsDisclaimer(): string {
  return [
    "Beginner stack: Browser + Google + Docs + Sheets + Drive.",
    "",
    "Optional AI can help organize, summarize, brainstorm search terms, and structure information.",
    "Do NOT assume an AI answer is automatically correct — verify important facts using reliable sources.",
  ].join("\n");
}

/** Weekly project profit math with research + formatting hours. */
export function computeOnlineResearchAssistantProfit(input: {
  projectPrice: number;
  projectsPerWeek: number;
  researchHoursPerProject: number;
  adminHoursPerProject: number;
  softwareCosts?: number;
  otherExpenses?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  totalWeeklyHours: number;
  effectiveHourlyRate: number;
} {
  const price = Math.max(0, Number(input.projectPrice) || 0);
  const projects = Math.max(0, Number(input.projectsPerWeek) || 0);
  const researchHrs = Math.max(0, Number(input.researchHoursPerProject) || 0);
  const adminHrs = Math.max(0, Number(input.adminHoursPerProject) || 0);
  const software = Math.max(0, Number(input.softwareCosts) || 0);
  const other = Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyRevenue = price * projects;
  const weeklyExpenses = software + other;
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const totalWeeklyHours = (researchHrs + adminHrs) * projects;
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    totalWeeklyHours,
    effectiveHourlyRate: totalWeeklyHours > 0 ? weeklyProfit / totalWeeklyHours : 0,
  };
}
