/**
 * Tutoring & Skills Coaching (`tutoring`, Guide #111).
 * Distinct from #110 homework helper. Plain data only.
 */

export const TUTORING_SKILLS_REALITY_CHECK = {
  title: "NO OUTCOME GUARANTEES — REVENUE IS NOT PROFIT",
  body: [
    "Tutoring and skills coaching for school subjects, reading, languages, music, technology/software, and professional skills — in person or video.",
    "",
    "GROSS = 1-on-1 sessions × price + group participants × group price + packages/other.",
    "PROFIT = Gross − materials − software − fees − ads − travel/parking − other.",
    "Track profit per teaching hour AND per total hour including prep and admin.",
    "",
    "No guarantees of grades, scores, certifications, promotions, employment, fluency, or outcomes.",
    "This is not regulated professional advice unless you are qualified.",
    "AI lesson drafts: draft → human review → fact check → personalize → use.",
    "Parent/guardian communication when learners are minors. Public or supervised spaces for youth sessions.",
    "",
    "Tagline: Explain It. Practice It. Track Progress.",
  ].join("\n"),
};

export const TUTORING_SKILLS_NOTES_WORKSHEET = `MY TUTORING & SKILLS COACHING PLAN

LEARNER / CLIENT
Learner/client: ________
Subject / skill: ________
Current level: ________
Goal: ________

SESSION
Length: ____  Rate: $____  Package: ________
Dates: ________
Topics: ________
Practice / homework (learner does it): ________
Progress: ________
Next session: ________

RESULTS
Revenue: $____  Expenses: $____
Teaching hours: ____  Prep/admin hours: ____
Profit: $____  Profit per total hour: $____
Notes: ________
`;

export const TUTORING_SKILLS_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this hustle is", detail: "Math, reading, languages, music, or professional skills — in person or video. 3 - 12 hrs/week. Displayed $20 – $60 / hour is examples only." },
  { id: "knowledge", label: "Strong subject or skill knowledge", detail: "You must be able to explain clearly at the learner’s level. Do not teach past your competence." },
  { id: "setup", label: "Reliable schedule and session setup", detail: "Calendar, quiet space or video link, and parent/guardian contact when minors are involved." },
];

export const TUTORING_SKILLS_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Meet", url: "https://meet.google.com/", note: "Virtual sessions" },
  { label: "Zoom", url: "https://zoom.us/", note: "Virtual sessions" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Scheduling" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Materials" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Sharing" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Sessions and payments" },
  { label: "Canva", url: "https://www.canva.com/", note: "Worksheets / flyer" },
];

export const TUTORING_SKILLS_SUPPLIES = {
  starterKitTotal: "About $5–20 if you already have a laptop — buy only what the subject needs",
  items: [
    { id: "laptop", name: "Laptop or tablet", qty: "1 (usually owned)", estCost: "$0", notes: "Essential for video or worksheets" },
    { id: "phone", name: "Phone", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "notebook", name: "Notebook and writing supplies", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "board", name: "Optional whiteboard + markers", qty: "1 set", estCost: "$8–15", notes: "Optional", optional: true },
    { id: "worksheets", name: "Teaching materials / practice worksheets", qty: "as needed", estCost: "$0–10", notes: "Print only what you will use" },
    { id: "headset", name: "Optional headset / webcam", qty: "1", estCost: "$0 if owned", notes: "Optional for video", optional: true },
    { id: "subject", name: "Only relevant subject-specific equipment", qty: "as needed", estCost: "$0–20", notes: "Optional — do not overbuy", optional: true },
  ],
};

export const TUTORING_SKILLS_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "meet", name: "Google Meet", freePlanAvailable: true, costNote: "Virtual sessions", url: "https://meet.google.com/" },
  { id: "zoom", name: "Zoom", freePlanAvailable: true, costNote: "Virtual sessions", url: "https://zoom.us/" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Scheduling", url: "https://calendar.google.com/" },
  { id: "google_docs", name: "Google Docs", freePlanAvailable: true, costNote: "Session materials — sign in with Google, or use an account you already have", url: "https://accounts.google.com/ServiceLogin?continue=https://docs.google.com/" },
  { id: "drive", name: "Google Drive", freePlanAvailable: true, costNote: "Share practice files", url: "https://drive.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Learners, sessions, payments, profit", url: "https://sheets.google.com/" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Worksheets and marketing flyer", url: "https://www.canva.com/" },
  { id: "chatgpt", name: "ChatGPT", freePlanAvailable: true, costNote: "Draft exercises/lesson ideas — human review and fact check", url: "https://chatgpt.com/", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Meet or Zoom + Calendar + Docs + Drive + Sheets + Canva" },
];

export const TUTORING_SKILLS_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "TUTORING & SKILLS COACHING — RATE EXAMPLES",
    "",
    "Displayed $20 – $60 / hour is examples only, not a guarantee.",
    "Rates vary by subject, experience, credentials, difficulty, learner level, location, format, and group size.",
    "GROSS = 1-on-1 + group + packages. PROFIT = Gross − materials − software − fees − ads − travel − other.",
    "No grade, score, job, or fluency guarantees.",
    "",
    "New / basic tutor: about $20–$35/hour",
    "Experienced / specialized: about $35–$60/hour",
    "Advanced / specialty / professional coaching: about $50–$100+/hour where appropriate",
    "Small-group: per-person price you write",
    "4-session and 8-session packages: discount you write in advance",
    "Optional travel fee for in-person",
  ].join("\n"),
  raiseTip: "Raise after results and demand. Displayed $20 – $60 / hour is examples only.",
  items: [
    { id: "new", label: "New / basic tutor", price: "$20–$35 / hour", notes: "Examples only" },
    { id: "exp", label: "Experienced / specialized", price: "$35–$60 / hour", notes: "Examples only" },
    { id: "adv", label: "Advanced / professional coaching", price: "$50–$100+ / hour", notes: "Examples only" },
    { id: "group", label: "Small-group (per person)", price: "Write yours", notes: "Examples only" },
    { id: "pack4", label: "4-session package", price: "Package", notes: "Examples only" },
    { id: "pack8", label: "8-session package", price: "Package", notes: "Examples only" },
  ],
};

export const TUTORING_SKILLS_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Choose the Subject or Skill You Will Coach", desc: "Pick one lane first: a school subject, reading, a language, music, tech/software, or professional skills you actually know." },
  { title: "Define Who You Help", desc: "Kids with parent present/nearby, teens, adult learners, or professional coaching. Minors need parent/guardian communication." },
  { title: "Assess Your Own Level Honestly", desc: "If you cannot explain it simply, do not sell it. No regulated professional advice unless qualified." },
  { title: "Create a Clear Offer", desc: "Session length, in-person vs video, what practice the learner does between sessions, and what you will not do (you do not complete graded work)." },
  { title: "Set Rates, Packages, and a Travel Fee", desc: "Open Google Sheets. 1-on-1, small-group per person, 4- and 8-session packages. Displayed $20 – $60 / hour is examples only. REVENUE is not PROFIT." },
  { title: "Build Session Structure and Intake", desc: "Open Google Forms. Current level, goal, session length, rate, package, dates. Diagnostic first session. Put Google Meet (https://meet.google.com/) or Zoom (https://zoom.us/) on Calendar." },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3 at first:",
      "☐ Referrals",
      "☐ Community / parent groups where allowed",
      "☐ Facebook / Nextdoor where allowed",
      "☐ LinkedIn for professional coaching",
      "☐ Organizations / appropriate tutoring marketplaces (adult-managed accounts)",
      "",
      "Examples:",
      "- Tell 10 trusted people your subject and rate.",
      "- Ask two teachers/coaches (with permission) if they hear of families who need practice help.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a Flyer (US Letter) or A4 flyer you can customize as a SAMPLE.",
      "",
      "Create:",
      "☐ Subject / skill and who you help",
      "☐ Session length and example rates",
      "☐ No grade/job guarantees",
      "",
      "Sample:",
      "“Tutoring & skills coaching in ______. 45–60 minutes. Sessions from $____. Practice between sessions. No grade guarantees.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week:",
      "☐ Share the offer with referrals",
      "☐ Book one diagnostic",
      "☐ Track yes / maybe / no",
    ].join("\n"),
  },
  { title: "Deliver Sessions and Track Progress", desc: "Use Google Docs (Tools tab) for notes. Learner does the practice. AI drafts need human review and fact check. Log progress toward the stated goal — still no outcome guarantees." },
  { title: "Improve, Rebook, and Track Profit", desc: "Profit per teaching hour and per total hour (prep + admin). Ask for a package rebook and a short review." },
];

export function tutoringSkillsToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Meet or Zoom + Calendar + Docs + Drive + Sheets + Canva.",
    "",
    "This is not the Tutor / Homework Helper (#110) guide. You explain and coach — you do not complete graded work. No outcome guarantees.",
  ].join("\n");
}

export function computeTutoringSkillsProfit(input: {
  tutoringSessions1on1?: number;
  oneOnOnePrice?: number;
  groupParticipants?: number;
  groupPrice?: number;
  packageRevenue?: number;
  otherRevenue?: number;
  materials?: number;
  software?: number;
  paymentFees?: number;
  advertising?: number;
  travelParking?: number;
  otherExpenses?: number;
  teachingHours?: number;
  laborHours?: number;
}): {
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerTeachingHour: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossServiceRevenue =
    Math.max(0, Number(input.tutoringSessions1on1) || 0) * Math.max(0, Number(input.oneOnOnePrice) || 0) +
    Math.max(0, Number(input.groupParticipants) || 0) * Math.max(0, Number(input.groupPrice) || 0) +
    Math.max(0, Number(input.packageRevenue) || 0) +
    Math.max(0, Number(input.otherRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.materials) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.travelParking) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const teaching = Math.max(0, Number(input.teachingHours) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerTeachingHour: teaching > 0 ? estimatedProfit / teaching : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
