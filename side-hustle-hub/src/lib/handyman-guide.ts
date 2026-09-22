/**
 * Handyman Services (`handyman`, Guide #011).
 * Small local repairs, installs, and punch-list jobs — stay in competence and legal scope.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const HANDYMAN_REALITY_CHECK = {
  title: "STAY IN YOUR LANE — REIMBURSEMENTS ARE NOT PROFIT",
  body: [
    "This is a local handyman / small home-maintenance service. Focus on small jobs you are competent and legally permitted to perform: minor repairs, furniture assembly, shelving/hardware installation, simple patching, touch-up painting, caulking, door/cabinet adjustments, landlord turnover punch lists, and similar non-specialty maintenance.",
    "",
    "GROSS SERVICE REVENUE is labor/service fees + approved add-on fees.",
    "CLIENT-REIMBURSED MATERIALS are not handyman profit — track them separately.",
    "ESTIMATED PROFIT is gross service revenue minus unreimbursed materials, fuel/travel, tool consumables, payment fees, advertising, insurance, and other business expenses.",
    "",
    "Write a DO-NOT-DO list. Perform only work within your actual competence.",
    "Verify current local/state contractor and handyman licensing thresholds, registration, permit, and insurance rules before accepting work. Do not invent a universal dollar threshold. Requirements vary and change.",
    "Do not perform regulated electrical, plumbing, HVAC, gas, roofing, structural, major construction, asbestos, lead, mold-remediation, or other specialty work unless you are appropriately qualified/licensed and legally permitted.",
    "Stop and refer out when hidden damage or specialty-trade issues appear.",
    "Use ladders and power tools only when trained and safe. Follow manufacturer instructions and task-appropriate PPE.",
    "Protect children, pets, floors, and furniture. Document pre-existing damage where appropriate.",
    "Get approval before additional work or materials. Document change orders before extra work.",
    "Protect keys, access codes, and client privacy.",
    "",
    "Tagline: Small Jobs. Clear Scope. Stay in Your Lane.",
  ].join("\n"),
};

export const HANDYMAN_NOTES_WORKSHEET = `MY HANDYMAN SERVICES PLAN

CLIENT
Name: ________
Phone: ________
Property: ________
Owner / Landlord / Property Manager: ________
Preferred Contact: ________

JOB
Requested Tasks: ________
Photos: ________
Walkthrough: ________
Scope Appropriate: Y / N
Specialty Trade Needed: Y / N
Permit / License Check Needed: Y / N

ESTIMATE
Labor Hours: ____
Labor / Flat Fee: $____
Materials: $____
Reimbursement: $____
Travel: $____
Disposal: $____
Add-Ons: $____
Total Quote: $____

APPROVAL
Estimate Approved: ☐
Material Budget: $____
Change Order Needed / Approved: ________

SCHEDULE
Date: ________
Arrival Window: ________
Access: ________
Pets / Children: ________
Parking: ________

WORK
Before Photos: ☐
Tasks Completed: ________
Unexpected Issues: ________
Licensed-Trade Referral: ________
Cleanup: ☐
Quality Check: ☐
Approved After Photos: ☐

PAYMENT
Service Revenue: $____
Materials Reimbursement: $____
Paid: $____
Balance: $____

RESULTS
Gross Service Revenue: $____
Expenses: $____
Estimated Profit: $____
Hours: ____
Profit / Hour: $____

FOLLOW-UP
Satisfaction: ________
Testimonial: ☐
Referral: ☐
Repeat / Punch-List Opportunity: ________

Marketing Channel 1: ________
Marketing Channel 2: ________
Marketing Channel 3: ________

GYSH PRO TIP
Quote the SCOPE, not a guess.

LABOR / SERVICE FEES + APPROVED ADD-ONS = GROSS SERVICE REVENUE.
REIMBURSED MATERIALS ≠ PROFIT.
REVENUE − UNREIMBURSED COSTS = PROFIT.

BEGINNER CHALLENGE
Complete one paid small job:
1. Write services and a DO-NOT-DO list.
2. Check local licensing / permit / insurance rules.
3. Set a service area and job minimum.
4. Intake photos and confirm the job fits.
5. Quote labor, materials, travel, and timing.
6. Get written approval and access.
7. Do only the approved work, with PPE.
8. Protect floors, kids, and pets.
9. Clean up and collect payment.
10. Track service revenue vs reimbursements vs profit.
11. Ask for a testimonial or landlord punch-list.
`;

export const HANDYMAN_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Offer small repairs, installs, painting, and punch-list jobs to homeowners and landlords who need reliable local help. Stay in competence and legal scope. Tagline: Small Jobs. Clear Scope. Stay in Your Lane. Category: Local Services / Home Repair. Beginner · 1 - 2 weeks to first jobs · $800 – $5,000 / month displayed figures are examples only, not guarantees. Free Guide.",
  },
  {
    id: "skills",
    label: "Skills and safe tool use",
    detail:
      "Basic repair skills, safe tool use, measuring/estimating, client communication, and appropriate PPE. Reliable transportation if your service area needs it.",
  },
  {
    id: "scope",
    label: "DO-NOT-DO list",
    detail:
      "Write work you will not take because it is outside your competence or legal scope. Typical referrals: regulated electrical, plumbing, HVAC, gas, roofing, structural, major construction, asbestos, lead, and mold-remediation unless you are qualified/licensed and legally permitted.",
  },
  {
    id: "rules",
    label: "Licensing, permits, and insurance",
    detail:
      "Verify current local/state contractor and handyman licensing, registration, permit, and insurance requirements before accepting work. Do not invent a universal dollar threshold. Rules vary and change. Use appropriate insurance where required or prudent.",
  },
];

export const HANDYMAN_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Job dates and arrival windows" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Estimates, jobs, expenses, profit" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Routing — do not post client addresses publicly" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Client intake and job checklist" },
  { label: "Nextdoor", url: "https://nextdoor.com/", note: "Neighborhood posts where allowed" },
];

export const HANDYMAN_SUPPLIES = {
  starterKitTotal:
    "About $40–90 for starter basics and PPE if you already own a few tools — do not buy a full workshop before paying jobs",
  items: [
    { id: "tape", name: "Tape measure", qty: "1", estCost: "$5–12", notes: "Essential — measure before you quote" },
    { id: "level", name: "Level", qty: "1", estCost: "$6–15", notes: "Essential — shelves, hardware, pictures" },
    { id: "drivers", name: "Screwdrivers", qty: "1 set", estCost: "$8–20", notes: "Essential" },
    { id: "wrench", name: "Adjustable wrench", qty: "1", estCost: "$8–15", notes: "Essential" },
    { id: "pliers", name: "Pliers", qty: "1 pair", estCost: "$6–15", notes: "Essential" },
    { id: "hammer", name: "Hammer", qty: "1", estCost: "$8–18", notes: "Essential" },
    { id: "knife", name: "Utility knife", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "drill", name: "Drill / driver and basic bits", qty: "1", estCost: "$0–40 if owned / starter", notes: "Essential — borrow first if needed" },
    { id: "stud", name: "Stud finder", qty: "1", estCost: "$10–25", notes: "Essential before hanging heavy items" },
    { id: "light", name: "Flashlight / work light", qty: "1", estCost: "$8–20", notes: "Essential" },
    { id: "pencil", name: "Pencil / marker", qty: "2–4", estCost: "$2–5", notes: "Essential" },
    { id: "ptape", name: "Painter's tape / drop cloth", qty: "1 set", estCost: "$6–15", notes: "Essential — protect floors and furniture" },
    { id: "caulk", name: "Caulk gun", qty: "1", estCost: "$6–12", notes: "Essential — tubes are job-specific after scope" },
    { id: "patch", name: "Basic patching tools", qty: "1 small set", estCost: "$8–18", notes: "Essential for simple wall patch" },
    { id: "clean", name: "Cleaning rags / broom or shop vacuum", qty: "as needed", estCost: "$0–25", notes: "Essential for cleanup — borrow vacuum if you can" },
    { id: "bag", name: "Tool bag", qty: "1", estCost: "$10–25", notes: "Essential — keep the kit together" },
    { id: "ppe", name: "Safety glasses, work gloves, hearing protection, task-appropriate respiratory protection", qty: "1 set", estCost: "$15–35", notes: "Essential PPE" },
    {
      id: "jobmat",
      name: "Job-specific materials (screws, caulk tubes, patch compound, paint)",
      qty: "only after scope",
      estCost: "Quoted per job",
      notes: "Optional until the quote is approved — not a warehouse inventory",
      optional: true,
    },
  ],
};

export const HANDYMAN_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "camera",
    name: "Smartphone camera",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Estimates and approved before-and-after photos — no kids' faces, house numbers, or license plates",
  },
  {
    id: "forms",
    name: "Intake / job checklist (Google Forms)",
    freePlanAvailable: true,
    costNote: "Requested tasks, photos, access, pets, and whether the job fits your DO-NOT-DO list",
    url: "https://forms.google.com/",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Job dates, arrival windows, and travel time",
    url: "https://calendar.google.com/",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Estimates, jobs, service revenue, reimbursements, expenses, and profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Routing inside your service area — do not post client addresses publicly",
    url: "https://maps.google.com/",
  },
  {
    id: "invoice",
    name: "Estimate / invoice / payment tool",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Clear quotes, deposits, and collection of SERVICE fees — reimbursements stay separate",
  },
  {
    id: "calc",
    name: "Material calculator / notes",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Count fasteners, caulk, patch, and paint after measurements — buy after the quote is approved",
  },
  {
    id: "mileage",
    name: "Optional mileage tracking",
    freePlanAvailable: true,
    costNote: "Fuel/travel cost vs a service-area charge",
    optional: true,
  },
  {
    id: "voicemail",
    name: "Optional business phone / voicemail",
    freePlanAvailable: true,
    costNote: "Missed-call callbacks — not required on day one",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Smartphone Camera + Google Forms + Google Calendar + Google Sheets + Google Maps + Payment / Invoice Tool",
  },
];

export const HANDYMAN_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "HANDYMAN SERVICES — PRICING EXAMPLES",
    "",
    "Displayed earning potential: $800 – $5,000 / month — examples only, not guarantees.",
    "",
    "Do not guarantee $800–$5,000/month or any income level.",
    "",
    "GROSS SERVICE REVENUE = Labor / Service Fees + Approved Add-On Fees.",
    "CLIENT-REIMBURSED MATERIALS are NOT handyman profit. Track them separately.",
    "ESTIMATED PROFIT = Gross Service Revenue − unreimbursed materials − fuel/travel − tool consumables − payment fees − advertising − insurance − other business expenses.",
    "",
    "REVENUE ≠ REIMBURSEMENTS ≠ PROFIT.",
    "",
    "Price for labor time, difficulty, skill, tools, setup/cleanup, travel, helper labor, materials, disposal, risk, and local market.",
    "",
    "STARTER RANGES — EXAMPLES ONLY",
    "Small / simple task: approximately $40–$100+",
    "Hourly labor: approximately $35–$75+ / hour depending on market, skill, and job",
    "Multi-task / punch-list visit: approximately $100–$300+",
    "Half-day / day project: quote based on scope, skill, market, and expenses",
    "Optional minimum service-call charge",
    "Materials reimbursement (not profit)",
    "Travel / service-area charge where appropriate",
  ].join("\n"),
  raiseTip:
    "Raise after you know true hours, travel, and unreimbursed costs. Displayed $800 – $5,000 / month is examples only — not income guarantees.",
  items: [
    { id: "small", label: "Small / simple task", price: "$40–$100+", notes: "Examples only" },
    { id: "hourly", label: "Hourly labor", price: "$35–$75+ / hour", notes: "Market, skill, and job" },
    { id: "punch", label: "Multi-task / punch-list visit", price: "$100–$300+", notes: "Examples only" },
    { id: "day", label: "Half-day / day project", price: "Quoted", notes: "Scope, skill, market, expenses" },
    { id: "min", label: "Optional minimum service-call charge", price: "Set in your area", notes: "Examples only" },
    { id: "materials", label: "Materials reimbursement", price: "At cost + tax", notes: "Not profit" },
    { id: "travel", label: "Travel / service-area charge", price: "Where appropriate", notes: "Examples only" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 7–9 per spec. Use ☐ only. */
export const HANDYMAN_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Services, Skills, and DO-NOT-DO Boundaries",
    desc: [
      "Write what you will do: minor repairs, furniture assembly, shelving/hardware, simple patching, touch-up painting, caulking, door/cabinet adjustments, landlord punch lists, and similar non-specialty maintenance.",
      "",
      "Write a DO-NOT-DO list for work outside your competence or legal scope.",
      "Typical referrals (unless you are qualified/licensed and legally permitted):",
      "☐ Regulated electrical",
      "☐ Plumbing",
      "☐ HVAC / gas",
      "☐ Roofing / structural / major construction",
      "☐ Asbestos, lead, or mold-remediation",
      "",
      "Perform only work within your actual skill. Stop and refer out when hidden damage appears.",
    ].join("\n"),
  },
  {
    title: "Check Licensing, Permits, and Insurance Requirements",
    desc: [
      "Before you take paid work, verify CURRENT local/state contractor and handyman licensing, registration, permit, and insurance rules.",
      "Do not invent a universal dollar threshold. Requirements vary by place and they change.",
      "Use appropriate insurance where required or prudent.",
      "If a job needs a permit or a licensed trade, write that on the intake and refer it out.",
    ].join("\n"),
  },
  {
    title: "Set Service Area, Job Minimums, and Pricing",
    desc: [
      "Draw a service area you can reach on time. Add a travel/service-area charge if needed.",
      "Set a minimum service-call so tiny jobs still cover setup, travel, and cleanup.",
      "Use the Suggested Pricing tab as examples only. Price labor time, difficulty, skill, tools, travel, materials, disposal, and risk.",
      "Client-reimbursed materials are not profit.",
    ].join("\n"),
  },
  {
    title: "Build Client Intake and Decide If the Job Fits",
    desc: [
      "Open Google Forms from the Tools tab.",
      "",
      "Collect:",
      "☐ Name, phone, property, owner vs landlord / property manager",
      "☐ Requested tasks and photos",
      "☐ Walkthrough need",
      "☐ Pets / children / parking / access",
      "☐ Scope appropriate? Y / N",
      "☐ Specialty trade needed? Y / N",
      "☐ Permit / license check needed? Y / N",
      "",
      "Decline politely if it is on your DO-NOT-DO list.",
    ].join("\n"),
  },
  {
    title: "Estimate Labor, Materials, Travel, and Give a Clear Quote",
    desc: [
      "Estimate labor hours, materials, travel, disposal, add-ons, and timing.",
      "Buy job-specific materials only after scope and measurements are confirmed — do not stock a warehouse.",
      "",
      "Write a quote that shows:",
      "- Labor / flat fee",
      "- Materials (reimbursed vs included)",
      "- Travel / disposal / add-ons",
      "- Total",
      "",
      "Open Google Sheets from the Tools tab. Gross service revenue is not profit.",
    ].join("\n"),
  },
  {
    title: "Confirm Scope, Approval, Schedule, Access, and Change Orders",
    desc: [
      "Get the estimate approved in writing. Confirm the material budget.",
      "Schedule date, arrival window, access, pets/children, and parking.",
      "Protect keys and access codes. Do not post them.",
      "Write the change-order rule: extra work or materials wait for approval before you do them.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "You need homeowners and landlords who want small, reliable help. Pick only 2 or 3 channels at first.",
      "",
      "Beginner options:",
      "☐ Referrals",
      "☐ Neighborhood Facebook groups where allowed",
      "☐ Nextdoor",
      "☐ Landlords / property managers",
      "☐ Real-estate contacts",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Tell 10 trusted people this week.",
      "- Ask 3 landlords if they need punch-list help.",
      "- Post in one parent-approved neighborhood group.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "☐ A simple service list and DO-NOT-DO line",
      "☐ Contact method and service area",
      "☐ Approved before/after examples (no private details)",
      "☐ Clear call to action",
      "",
      "Sample:",
      "“Small repairs, assembly, and punch-list jobs for homes and rentals in ______. Simple tasks from $____. Message photos for a quote. I stay in scope — licensed trades referred out.”",
      "",
      "Never post a client’s address, keys, or kids in photos.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Do the 2–3 channels you chose.",
      "",
      "This week:",
      "☐ Contact warm leads and local property contacts",
      "☐ Post where allowed",
      "☐ Reply promptly and track inquiries",
      "",
      "Track date | prospect | channel | job type | response | follow-up | booked.",
    ].join("\n"),
  },
  {
    title: "Perform Approved Work Safely, Clean Up, and Collect Payment",
    desc: [
      "Do only the approved scope. Use PPE. Follow tool manufacturer instructions.",
      "Use ladders and power tools only when trained and safe.",
      "Protect children, pets, floors, and furniture. Document pre-existing damage.",
      "If you find hidden damage or a specialty-trade issue, stop, tell the client, and refer out. Document change orders before extra work.",
      "Complete cleanup and a quality check. Collect the service fee. Keep material reimbursements separate on the receipt.",
    ].join("\n"),
  },
  {
    title: "Track Profit, Testimonials, and Repeat Punch-List Work",
    desc: [
      "Record:",
      "☐ Gross service revenue (labor + approved add-ons only)",
      "☐ Materials reimbursement (not profit)",
      "☐ Unreimbursed materials, consumables, fuel/travel, disposal, helper labor",
      "☐ Insurance allocation, payment fees, advertising, software, other expenses",
      "☐ Estimated profit, hours, profit per job, and profit per labor hour",
      "",
      "Ask for a short testimonial and referral. Follow up with landlords for repeat punch-list work. Improve pricing from actual hours — not guesses.",
      "Displayed $800 – $5,000 / month is examples only — not a guarantee.",
    ].join("\n"),
  },
];

export function handymanToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Smartphone Camera + Google Forms + Google Calendar + Google Sheets + Google Maps + Payment / Invoice Tool.",
    "",
    "Apps belong here. Tape measure, drill, PPE, and consumables live on the Supply List. Do not buy a full workshop before paying jobs.",
    "",
    "Verify current local licensing, permit, and insurance rules. Do not invent thresholds. Client-reimbursed materials are not profit.",
  ].join("\n");
}

/** Handyman profit. Reimbursements are not service revenue. */
export function computeHandymanProfit(input: {
  handymanSmallJobs?: number;
  smallJobPrice?: number;
  hourlyHours?: number;
  hourlyRate?: number;
  punchListJobs?: number;
  punchListPrice?: number;
  dayProjects?: number;
  dayProjectPrice?: number;
  addOnRevenue?: number;
  materialReimbursements?: number;
  unreimbursedMaterials?: number;
  toolConsumables?: number;
  fuelTravel?: number;
  disposal?: number;
  helperLabor?: number;
  insuranceAllocation?: number;
  paymentFees?: number;
  advertising?: number;
  software?: number;
  otherExpenses?: number;
  laborHours?: number;
  jobsCompleted?: number;
}): {
  smallJobRevenue: number;
  hourlyRevenue: number;
  punchListRevenue: number;
  dayProjectRevenue: number;
  addOnRevenue: number;
  grossServiceRevenue: number;
  materialReimbursements: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerJob: number | null;
  profitPerLaborHour: number | null;
  averageJobValue: number | null;
  profitMarginPercent: number;
} {
  const smallJobs = Math.max(0, Number(input.handymanSmallJobs) || 0);
  const hourlyHours = Math.max(0, Number(input.hourlyHours) || 0);
  const punchListJobs = Math.max(0, Number(input.punchListJobs) || 0);
  const dayProjects = Math.max(0, Number(input.dayProjects) || 0);
  const smallJobRevenue = smallJobs * Math.max(0, Number(input.smallJobPrice) || 0);
  const hourlyRevenue = hourlyHours * Math.max(0, Number(input.hourlyRate) || 0);
  const punchListRevenue = punchListJobs * Math.max(0, Number(input.punchListPrice) || 0);
  const dayProjectRevenue = dayProjects * Math.max(0, Number(input.dayProjectPrice) || 0);
  const addOnRevenue = Math.max(0, Number(input.addOnRevenue) || 0);
  const grossServiceRevenue =
    smallJobRevenue + hourlyRevenue + punchListRevenue + dayProjectRevenue + addOnRevenue;
  const materialReimbursements = Math.max(0, Number(input.materialReimbursements) || 0);
  const totalExpenses =
    Math.max(0, Number(input.unreimbursedMaterials) || 0) +
    Math.max(0, Number(input.toolConsumables) || 0) +
    Math.max(0, Number(input.fuelTravel) || 0) +
    Math.max(0, Number(input.disposal) || 0) +
    Math.max(0, Number(input.helperLabor) || 0) +
    Math.max(0, Number(input.insuranceAllocation) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const hours = Math.max(0, Number(input.laborHours) || 0);
  const jobsCompleted = Math.max(0, Number(input.jobsCompleted) || 0);
  return {
    smallJobRevenue,
    hourlyRevenue,
    punchListRevenue,
    dayProjectRevenue,
    addOnRevenue,
    grossServiceRevenue,
    materialReimbursements,
    totalExpenses,
    estimatedProfit,
    profitPerJob: jobsCompleted > 0 ? estimatedProfit / jobsCompleted : null,
    profitPerLaborHour: hours > 0 ? estimatedProfit / hours : null,
    averageJobValue: jobsCompleted > 0 ? grossServiceRevenue / jobsCompleted : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
