/**
 * Tutor / Homework Helper & Reading Buddy (`homework`, Guide #110).
 * Learning support — not doing the assignment. Do not confuse with homework-organizer (#076).
 */

export const HOMEWORK_HELPER_REALITY_CHECK = {
  title: "HELP THEM LEARN — DO NOT DO THE WORK FOR THEM",
  body: [
    "This hustle is tutoring, homework help, and reading-buddy support. You explain, quiz, and practice — you do not complete graded work.",
    "",
    "GROSS SERVICE REVENUE = session fees + packages + approved add-ons.",
    "ESTIMATED PROFIT = Gross − materials − travel − payment fees − advertising − other.",
    "",
    "Never complete tests, write essays, fabricate citations, or promise a grade.",
    "Follow parent and school academic-integrity rules. If unsure, ask the parent.",
    "Keep student work and family details confidential.",
    "Younger helpers need adult supervision for in-home sessions, payments, and safety.",
    "You are not a licensed teacher or therapist unless you actually are.",
    "Do not invent school policies.",
    "",
    "Tagline: Guide the Work. Don’t Do the Work.",
  ].join("\n"),
};

export const HOMEWORK_HELPER_NOTES_WORKSHEET = `MY TUTOR / HOMEWORK HELPER PLAN

CLIENT / STUDENT
Parent: ________  Phone: ________  Student first name only: ________
Grade / subject: ________  Location: in-home | virtual | library

SESSION
Length: 30 / 45 / 60 min  Subject focus: ________
Package: ☐  Recurring day/time: ________

BOUNDARIES
Allowed help: ________
Not allowed (tests, take-homes, graded work): ________
Parent present / nearby: ☐

PRICING
30-min: $____  45-min: $____  60-min: $____  Package: $____
Travel: $____  Expected monthly: $____

SESSION LOG
Date: ________  Minutes: ____  Topics: ________
Practice assigned: ________  Parent update: ☐  Paid: ☐

RESULTS
Sessions: ____  Revenue: $____  Expenses: $____  Profit: $____  Hours: ____  Profit/hour: $____
`;

export const HOMEWORK_HELPER_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this hustle is", detail: "Help nearby students with homework, reading practice, and study skills. 3 - 10 hrs/week. $15 – $40 / session is examples only." },
  { id: "integrity", label: "Academic integrity with parents", detail: "Support learning. Do not complete graded work. Confirm subject, session length, and location with a parent." },
];

export const HOMEWORK_HELPER_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Sessions" },
  { label: "Google Meet", url: "https://meet.google.com/", note: "Optional virtual sessions with parent approval" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Sessions and payments" },
  { label: "Khan Academy", url: "https://www.khanacademy.org/", note: "Optional practice resources — not a substitute for the student’s work" },
];

export const HOMEWORK_HELPER_SUPPLIES = {
  starterKitTotal: "About $5–25 — most sessions use what the student already has",
  items: [
    { id: "notebook", name: "Notebook + pencils / highlighters", qty: "1 set", estCost: "$3–8", notes: "Essential" },
    { id: "timer", name: "Timer / phone timer", qty: "1", estCost: "$0", notes: "Essential for session length" },
    { id: "books", name: "Age-appropriate reading / practice materials", qty: "as needed", estCost: "$0–10", notes: "Optional extras; student materials first" },
    { id: "folder", name: "Session notes folder", qty: "1", estCost: "$2–6", notes: "Essential" },
    { id: "virtual", name: "Quiet space + internet for virtual sessions", qty: "1", estCost: "$0 if owned", notes: "If offering virtual" },
  ],
};

export const HOMEWORK_HELPER_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Sessions and reminders", url: "https://calendar.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Subject, grade, integrity rules, location", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Sessions, packages, profit", url: "https://sheets.google.com/" },
  { id: "meet", name: "Google Meet (optional virtual)", freePlanAvailable: true, costNote: "Parent-approved virtual only", url: "https://meet.google.com/", optional: true },
  { id: "drive", name: "Google Drive", freePlanAvailable: true, costNote: "Practice worksheets you created — not the student’s graded work", url: "https://drive.google.com/" },
  { id: "khan", name: "Khan Academy / similar practice", freePlanAvailable: true, costNote: "Optional practice — student still does the work", url: "https://www.khanacademy.org/", optional: true },
  { id: "pay", name: "Payment / invoice", freePlanAvailable: true, planLabelApplicable: false, costNote: "Session and package fees" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Calendar + Forms + Sheets + Payment (+ Meet if virtual)" },
];

export const HOMEWORK_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "TUTOR / HOMEWORK HELPER & READING BUDDY — SESSION PRICING",
    "",
    "Displayed $15 – $40 / session is examples only.",
    "GROSS = session fees + packages + add-ons. PROFIT = Gross − materials − travel − fees − ads − other.",
    "",
    "30-minute help / reading buddy: about $12–$20",
    "45-minute homework help: about $18–$30",
    "60-minute tutoring / study skills: about $25–$40+",
    "Weekly package (4 sessions): quoted as a bundle",
  ].join("\n"),
  raiseTip: "Raise after you know prep time and subject difficulty. Never price “doing the homework.” Examples only.",
  items: [
    { id: "30", label: "30-minute help / reading buddy", price: "$12–$20", notes: "Examples only" },
    { id: "45", label: "45-minute homework help", price: "$18–$30", notes: "Examples only" },
    { id: "60", label: "60-minute tutoring / study skills", price: "$25–$40+", notes: "Examples only" },
    { id: "pkg", label: "Weekly package (4 sessions)", price: "Quoted bundle", notes: "Examples only" },
  ],
};

export const HOMEWORK_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Define Subjects, Session Length, Location, and Integrity Rules", desc: "Homework help, reading buddy, and study skills only. You do not complete graded work or promise grades." },
  { title: "Agree Scope With a Parent Before the First Session", desc: "Subject, grade, allowed help, location, who is present, and payment. Open Google Forms." },
  { title: "Set Session and Package Pricing", desc: "Price by length and subject. Open Google Sheets. Examples only on Suggested Pricing." },
  { title: "Prepare a Simple Session Flow", desc: "Warm-up, student attempts the work, you explain/quiz, practice, short parent update." },
  { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3: parent referrals · neighborhood Facebook · Nextdoor · community boards · school-adjacent permitted posts." },
  { title: "Make Your Marketing Materials", desc: "Subjects, session lengths, example prices, integrity statement, how to book. No student photos without permission." },
  { title: "Carry Out Your Marketing Plan", desc: "Warm leads, permitted posts, book a first session with parent confirmation." },
  { title: "Run the Session: Guide, Don’t Complete", desc: "Student does the work. You explain, check understanding, and stop at integrity boundaries." },
  { title: "Send a Short Parent Update and Collect Payment", desc: "What was practiced, what to review, next session. Collect session or package fee." },
  { title: "Offer Recurring Times and Packages", desc: "Same day/time is easier for families and your calendar. Open Google Calendar." },
  { title: "Track Hours, Profit, and Whether Students Are Actually Improving", desc: "Revenue, expenses, profit per hour. If a subject is over your head, refer out." },
];

export function homeworkHelperToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Calendar + Forms + Sheets + Payment (+ Meet if virtual).",
    "",
    "Practice resources are optional. The student still does the assignment. You never complete graded work.",
  ].join("\n");
}

export function computeHomeworkHelperProfit(input: {
  homeworkHelperSessions30?: number;
  price30?: number;
  sessions45?: number;
  price45?: number;
  sessions60?: number;
  price60?: number;
  packageRevenue?: number;
  materials?: number;
  travel?: number;
  paymentFees?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  sessionsCompleted?: number;
}): {
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerSession: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossServiceRevenue =
    Math.max(0, Number(input.homeworkHelperSessions30) || 0) * Math.max(0, Number(input.price30) || 0) +
    Math.max(0, Number(input.sessions45) || 0) * Math.max(0, Number(input.price45) || 0) +
    Math.max(0, Number(input.sessions60) || 0) * Math.max(0, Number(input.price60) || 0) +
    Math.max(0, Number(input.packageRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.materials) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const sessions = Math.max(0, Number(input.sessionsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerSession: sessions > 0 ? estimatedProfit / sessions : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
