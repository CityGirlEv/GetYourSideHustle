/**
 * Homework Organizer (`homework-organizer`, Guide #076).
 * Help classmates build folders, planners, and weekly homework checklists.
 * You organize the system — you do not do the homework.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const HOMEWORK_ORGANIZER_REALITY_CHECK = {
  title: "ORGANIZE, DON’T DO THE HOMEWORK",
  body: [
    "A Homework Organizer helps another student build a system.",
    "",
    "You may help them:",
    "- Sort papers",
    "- Set up subject folders",
    "- Enter assignments in a planner",
    "- Build homework checklists",
    "- Organize due dates",
    "- Set reminders",
    "- Plan a weekly homework routine",
    "",
    "You do NOT:",
    "- Complete assignments for them",
    "- Give them answers",
    "- Write papers for them",
    "- Take quizzes/tests for them",
    "- Log into school systems without permission",
    "- Pretend to be the student",
    "- Help them cheat",
    "",
    "The student remains responsible for completing and submitting their own work.",
    "",
    "Tagline: Organize the Work. See the Deadlines. Get It Done.",
  ].join("\n"),
};

export const HOMEWORK_ORGANIZER_NOTES_WORKSHEET = `MY HOMEWORK ORGANIZER PLAN

Starter Package: ________
Price: $____
Included Time: ________

Marketing Channels:
1. ________
2. ________
3. ________

STUDENT SETUP

Student: ________
Grade: ________
Parent/Guardian Approval if needed: ☐
Teacher/School Requirements: ________

Subjects:
1. ________
2. ________
3. ________
4. ________
5. ________

Biggest Organization Problem: __________

System Created:
☐ Subject folders
☐ Binder
☐ Planner
☐ Calendar
☐ Weekly checklist
☐ Digital folders
☐ Reminder system

WEEKLY CHECK-IN

Assignments organized: ☐
Deadlines entered: ☐
Loose papers filed: ☐
Completed work packed: ☐
Upcoming projects reviewed: ☐

What Worked: __________
What Was Too Complicated: __________
What We Changed: __________

Student Can Maintain It: ☐ Yes ☐ Needs Practice
Rebooked: ☐ Yes ☐ Maybe ☐ No

GYSH PRO TIP
THE BEST ORGANIZATION SYSTEM IS NOT THE PRETTIEST ONE.
It is the one the student will actually USE.
If the system requires 20 steps every afternoon, it probably will not last.
Aim for: ONE HOME FOR EACH SUBJECT + ONE PLACE FOR DEADLINES + ONE WEEKLY CHECKLIST + ONE 10-MINUTE RESET

STARTER CHALLENGE
Build a SAMPLE HOMEWORK ORGANIZATION KIT.
Create:
1. Five labeled subject folders
2. One weekly homework checklist
3. One sample planner page
4. One due-date calendar
5. One 10-minute reset checklist
Practice explaining the entire system in 5 minutes.`;

export const HOMEWORK_ORGANIZER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Help classmates create simple systems for keeping track of homework — folders, planners, subject organization, due-date lists, and weekly homework checklists — with teacher/parent approval where appropriate. Tagline: Organize the Work. See the Deadlines. Get It Done. Category: Student Services / Organization. Best for Juniors / Teens. Beginner · Very low startup · After school / flexible · School-approved / home / remote · Per project / recurring check-in · 3 - 10 hrs/week · Starter Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Good personal organization habits · Planner/calendar skills · Basic folder/file organization · Ability to make simple checklists · Patience · Respect for privacy · Parent/teacher approval where appropriate · Parent/guardian involvement for minors where needed.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "Google Calendar · Google Docs · Google Sheets · School-approved planner · Colored folders · Labels · Highlighters · Binder/dividers.",
  },
  {
    id: "privacy",
    label: "Privacy",
    detail:
      "Only view assignments, grades, school portals, schedules, or personal information when the student and appropriate parent/guardian/school authority have authorized it. Do not save passwords.",
  },
];

export const HOMEWORK_ORGANIZER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Due-date system" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Weekly checklist" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Assignment tracker" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Digital subject folders" },
];

export const HOMEWORK_ORGANIZER_SUPPLIES = {
  starterKitTotal:
    "About $0–20 — do not require classmates to buy expensive supplies; build around what they already have",
  items: [
    { id: "planner", name: "Planner or calendar", qty: "1", estCost: "$0–8", notes: "Essential — use what they already have" },
    { id: "paper", name: "Notebook or paper", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "pen", name: "Pen / pencil", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "list", name: "Assignment list", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "folders-exist", name: "Existing school folders / materials", qty: "as needed", estCost: "$0", notes: "Essential" },
    { id: "color-folders", name: "Colored folders", qty: "5", estCost: "$4–10", notes: "Helpful", optional: true },
    { id: "binder", name: "Binder / dividers", qty: "1", estCost: "$4–10", notes: "Helpful", optional: true },
    { id: "labels", name: "Labels", qty: "1 pack", estCost: "$3–6", notes: "Helpful", optional: true },
    { id: "sticky", name: "Sticky notes", qty: "1 pack", estCost: "$2–5", notes: "Helpful", optional: true },
    { id: "highlighters", name: "Highlighters", qty: "1 pack", estCost: "$2–6", notes: "Helpful", optional: true },
    { id: "filebox", name: "File box", qty: "1", estCost: "$6–12", notes: "Helpful", optional: true },
    { id: "whiteboard", name: "Small dry-erase board", qty: "1", estCost: "$5–12", notes: "Optional", optional: true },
    { id: "desk", name: "Desk organizer", qty: "1", estCost: "$6–15", notes: "Optional", optional: true },
    { id: "timer", name: "Timer", qty: "1", estCost: "$0–8", notes: "Optional — phone is fine", optional: true },
    { id: "printable", name: "Printable weekly checklist", qty: "1", estCost: "$0–3", notes: "Optional", optional: true },
  ],
};

export const HOMEWORK_ORGANIZER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "ho_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Due dates and reminders",
    url: "https://calendar.google.com/",
  },
  {
    id: "ho_apple_cal",
    name: "Apple Calendar",
    freePlanAvailable: true,
    costNote: "Due dates when the student already uses it",
    optional: true,
  },
  {
    id: "ho_planner",
    name: "School-approved planner",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Use the planner the teacher already requires",
  },
  {
    id: "ho_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Weekly homework checklist",
    url: "https://docs.google.com/",
  },
  {
    id: "ho_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Assignment / due-date list",
    url: "https://sheets.google.com/",
  },
  {
    id: "ho_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Quick checklists",
  },
  {
    id: "ho_drive",
    name: "Google Drive folders",
    freePlanAvailable: true,
    costNote: "Digital subject organization",
    url: "https://drive.google.com/",
  },
  {
    id: "ho_timer",
    name: "Phone timer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "10-minute reset routine",
  },
  {
    id: "ho_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Planner + Subject Folders + Weekly Checklist + Calendar",
  },
];

export const HOMEWORK_ORGANIZER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Keep displayed pricing: $15 – $50 / project (examples).",
    "",
    "Define the scope before starting. Price depends on number of subjects, amount of disorganization, paper vs digital setup, time required, and follow-up support.",
  ].join("\n"),
  raiseTip:
    "Possible recurring option: short weekly organization check-in at an agreed price. Displayed range: $15 – $50 / project (examples). Examples only — not income guarantees.",
  items: [
    {
      id: "reset",
      label: "Quick organization reset",
      price: "$15–$20",
      notes: "Sort papers/folders and create a basic assignment checklist",
    },
    {
      id: "setup",
      label: "Homework system setup",
      price: "$20–$35",
      notes: "Folders + planner/calendar + weekly checklist + due-date system",
    },
    {
      id: "full",
      label: "Full student organization setup",
      price: "$35–$50+",
      notes: "Multiple subjects, digital + paper organization, weekly routine, and follow-up plan",
    },
    {
      id: "weekly",
      label: "Recurring weekly check-in",
      price: "Agreed short weekly price",
      notes: "15–30 minute organization reset",
    },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only. */
export const HOMEWORK_ORGANIZER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define What You Help With",
    desc: [
      "Choose your services:",
      "☐ Folder / binder setup",
      "☐ Paper sorting",
      "☐ Planner setup",
      "☐ Assignment checklist",
      "☐ Due-date calendar",
      "☐ Weekly homework plan",
      "☐ Digital folder organization",
      "☐ Weekly organization check-in",
      "",
      "Write:",
      "I HELP ORGANIZE: ________",
      "I DO NOT DO: homework, tests, essays, or assignments for the student.",
    ].join("\n"),
  },
  {
    title: "Create One Starter Package",
    desc: [
      "Example:",
      "",
      "HOMEWORK ORGANIZATION RESET",
      "- Up to 60 minutes",
      "- Organize up to 5 subjects",
      "- Set up folders",
      "- Build weekly assignment checklist",
      "- Enter known deadlines",
      "- Create simple homework routine",
      "",
      "Starting Price: $____",
      "",
      "Clearly state what is included. See Suggested Pricing — $15 – $50 / project (examples).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about your service. Pick only 2 or 3.",
      "",
      "Age-appropriate options:",
      "☐ Friends / classmates",
      "☐ Parent referrals",
      "☐ Teacher / counselor referrals where allowed",
      "☐ School club / community board where approved",
      "☐ Youth / community organization",
      "☐ Family / friend network",
      "",
      "Write:",
      "What I Offer: Homework Organization Help",
      "Starting Price: $____",
      "Who I Help: ________",
      "",
      "Set one measurable goal per channel. Examples:",
      "- Tell 5 classmates",
      "- Ask 3 parents for referrals",
      "- Ask an approved teacher/counselor whether referrals are permitted",
      "",
      "Do not solicit students in ways that violate school rules.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create one simple flyer/message.",
      "",
      "Sample:",
      "",
      "HOMEWORK FEELING EVERYWHERE?",
      "",
      "I can help you organize:",
      "- Subject folders",
      "- Papers",
      "- Planner",
      "- Due dates",
      "- Weekly homework checklist",
      "",
      "I help organize your work — I do NOT do your homework.",
      "",
      "Starting at $____.",
      "Parent/teacher approval where appropriate.",
      "Contact: ________",
      "",
      "For minors, use parent/guardian-approved contact information.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the selected 2–3 channels.",
      "",
      "This week:",
      "- Tell 5–10 appropriate people",
      "- Ask for referrals",
      "- Share approved flyer/message",
      "- Respond to interested families/students",
      "- Track inquiries",
      "",
      "Sample:",
      "“Hi! I help students organize folders, planners, due dates, and weekly homework checklists. I don’t do assignments for students — I help them build a system to manage their own work. My starter setup is $____.”",
      "",
      "Track: Date | Person/Referral | Channel | Response | Follow-Up",
    ].join("\n"),
  },
  {
    title: "Do a Homework Organization Check",
    desc: [
      "With permission, review what needs organizing.",
      "",
      "Ask:",
      "- How many subjects?",
      "- Paper, digital, or both?",
      "- Where are assignments written now?",
      "- What gets forgotten most?",
      "- Are papers getting lost?",
      "- Are deadlines being missed?",
      "- Is there already a planner?",
      "- What school tools must be used?",
      "- What system has the teacher requested?",
      "",
      "Create three piles/lists:",
      "KEEP & FILE",
      "DO / UPCOMING",
      "NO LONGER NEEDED / RETURN / DISCARD WITH APPROVAL",
      "",
      "Never discard schoolwork without permission.",
    ].join("\n"),
  },
  {
    title: "Build the Subject Folder System",
    desc: [
      "Give each subject one clear home.",
      "",
      "Example:",
      "BLUE = Math",
      "RED = English",
      "GREEN = Science",
      "YELLOW = History",
      "",
      "For each subject create:",
      "- Current Work",
      "- Completed / Return",
      "- Reference / Notes if useful",
      "",
      "For digital files: School Year → Subject → Assignments / Notes / Reference",
      "",
      "Keep names simple and consistent.",
    ].join("\n"),
  },
  {
    title: "Build the Planner & Due-Date System",
    desc: [
      "Enter known assignments and deadlines.",
      "",
      "Each entry should answer:",
      "WHAT? WHICH CLASS? WHEN DUE? WHAT MATERIALS? DONE?",
      "",
      "Example:",
      "Math — Problems 1–20 — Thursday — Workbook — ☐",
      "",
      "Use calendar reminders for major projects/tests when permitted.",
      "",
      "Do not invent deadlines. Use teacher/school information.",
    ].join("\n"),
  },
  {
    title: "Create the Weekly Homework Checklist",
    desc: [
      "Build one reusable weekly sheet.",
      "",
      "MONDAY",
      "☐ Check assignments",
      "☐ Math",
      "☐ English",
      "☐ Other",
      "☐ Pack completed work",
      "",
      "Repeat for school days as appropriate.",
      "",
      "Add:",
      "BIG PROJECTS THIS WEEK: ________",
      "TESTS/QUIZZES: ________",
      "ITEMS TO BRING: ________",
      "QUESTIONS FOR TEACHER: ________",
      "",
      "Keep it short enough that the student will actually use it.",
    ].join("\n"),
  },
  {
    title: "Teach the Student the 10-Minute Reset",
    desc: [
      "A system only works if the student can maintain it.",
      "",
      "Teach this routine:",
      "1. Put loose papers in the correct folder",
      "2. Check new assignments",
      "3. Update planner",
      "4. Mark completed work",
      "5. Check tomorrow’s deadlines",
      "6. Pack needed materials",
      "",
      "Goal: about 10 minutes at the end of the school/homework day.",
      "",
      "Have the student perform the routine themselves before the session ends.",
    ].join("\n"),
  },
  {
    title: "Follow Up & Get Rebooked",
    desc: [
      "After several days, ask:",
      "- Is the student finding assignments faster?",
      "- Are fewer papers getting lost?",
      "- Is the checklist being used?",
      "- Are deadlines easier to see?",
      "- What part is too complicated?",
      "",
      "Simplify anything they are not using.",
      "",
      "Possible recurring service: 15–30 minute weekly organization reset.",
      "",
      "GOOD SYSTEM → STUDENT USES IT → FEWER LOST ASSIGNMENTS → EASIER WEEK → HAPPY STUDENT/PARENT → REFERRALS",
    ].join("\n"),
  },
];

export function homeworkOrganizerToolsDisclaimer(): string {
  return "Beginner stack: Planner + Subject Folders + Weekly Checklist + Calendar. You organize the system — you do not do the homework, give answers, or save passwords. Parent/teacher approval where appropriate.";
}

/** Weekly homework-organizer profit math. */
export function computeHomeworkOrganizerProfit(input: {
  averageProjectPrice: number;
  projectsPerWeek: number;
  recurringCheckInRevenue?: number;
  printingSupplies?: number;
  travel?: number;
  advertising?: number;
  otherExpenses?: number;
  averageHoursPerProject?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const price = Math.max(0, Number(input.averageProjectPrice) || 0);
  const projects = Math.max(0, Number(input.projectsPerWeek) || 0);
  const recurring = Math.max(0, Number(input.recurringCheckInRevenue) || 0);
  const weeklyRevenue = price * projects + recurring;
  const weeklyExpenses =
    Math.max(0, Number(input.printingSupplies) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const hoursPer = Math.max(0, Number(input.averageHoursPerProject) || 0);
  const weeklyHours = hoursPer * projects;
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
