/**
 * Holiday Decorating Helper (`holiday-decorating-helper`, Guide #075).
 * Light INDOOR decorating and take-down. Ladders only with adults. Plain data only.
 */

export const HOLIDAY_DECORATING_REALITY_CHECK = {
  title: "INDOOR AND LIGHT ONLY — LADDERS ONLY WITH ADULTS",
  body: [
    "Light indoor holiday decorating and take-down: unpacking, trees, lightweight decor, tabletop displays, safe garland, organizing, packing, labeling/storage, and cleanup.",
    "No roofs, high exterior ladders, professional exterior light installation, electrical repair, structural installation, unsafe heights, or excessive lifting.",
    "",
    "GROSS = quick help + standard/hourly + larger indoor sessions + take-down + bundled packages + add-ons.",
    "PROFIT = Gross − supplies − travel − parking/tolls − fees − ads − helper costs − other.",
    "",
    "Preserve: ladders only with adults. Avoid outlet overload and open flames. Protect fragile and sentimental property. Photo permission required.",
    "Customer generally provides decorations.",
    "",
    "Tagline: Unpack It. Place It. Pack It Away.",
  ].join("\n"),
};

export const HOLIDAY_DECORATING_NOTES_WORKSHEET = `MY HOLIDAY DECORATING PLAN

CUSTOMER
Customer: ________  Holiday: ________
Decorating date: ________  Take-down date: ________
Areas: ________  Tree: ☐
Customer decorations: ________
Instructions: ________
Photo permission: ☐

QUOTE
Quote: $____  Package: ________  Add-ons: ________
Estimated time: ____  Actual time: ____  Travel: ____

RESULTS
Revenue: $____  Expenses: $____  Profit: $____
Take-down booked: ☐  Repeat customer: ☐
Notes: ________
`;

export const HOLIDAY_DECORATING_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this hustle is", detail: "Help hang indoor decorations and pack them away after the season — ladders only with adults. 2 - 8 hrs/week. Displayed $10 – $40 / job is examples only." },
  { id: "care", label: "Care with fragile property", detail: "Follow customer instructions. Handle sentimental ornaments slowly. Indoor / light work only." },
  { id: "ladder", label: "Ladders only with adults", detail: "Kids and younger teens do not climb extension ladders. Adults handle ladder-dependent tasks." },
];

export const HOLIDAY_DECORATING_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Decorating and take-down dates" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Travel" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Jobs, payments, profit" },
  { label: "Canva", url: "https://www.canva.com/", note: "Marketing" },
];

export const HOLIDAY_DECORATING_SUPPLIES = {
  starterKitTotal: "About $10–30 — customer generally provides decorations",
  items: [
    { id: "gloves", name: "Gloves", qty: "1 pair", estCost: "$4–8", notes: "Essential" },
    { id: "scissors", name: "Scissors", qty: "1", estCost: "$0–6", notes: "Essential" },
    { id: "hooks", name: "Surface-appropriate removable hooks / fasteners", qty: "1 pack", estCost: "$5–10", notes: "Essential — renter-safe first" },
    { id: "tape", name: "Tape measure", qty: "1", estCost: "$4–8", notes: "Essential" },
    { id: "labels", name: "Labels, marker, zip bags", qty: "1 set", estCost: "$4–8", notes: "Essential for packing" },
    { id: "cloths", name: "Microfiber cloths", qty: "1 pack", estCost: "$4–8", notes: "Essential" },
    { id: "bags", name: "Trash bags", qty: "1 box", estCost: "$4–8", notes: "Essential" },
    { id: "phone", name: "Phone", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "tote", name: "Supply organizer", qty: "1", estCost: "$5–10", notes: "Essential" },
    { id: "ornament", name: "Optional extra ornament hooks / ribbon / clips", qty: "1 pack", estCost: "$3–8", notes: "Optional", optional: true },
    { id: "tools", name: "Optional small tool kit / knee pad / battery tester", qty: "1", estCost: "$8–20", notes: "Optional", optional: true },
  ],
};

export const HOLIDAY_DECORATING_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Decorating and take-down dates", url: "https://calendar.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Travel", url: "https://maps.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Rooms, tree, instructions, take-down date", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Jobs, payments, seasonal profit", url: "https://sheets.google.com/" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Indoor decorating flyer", url: "https://www.canva.com/" },
  { id: "pay", name: "Payment app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Collect the session fee" },
  { id: "camera", name: "Phone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Approved before/after only" },
  { id: "chatgpt", name: "ChatGPT", freePlanAvailable: true, costNote: "Messages/checklists/promo drafts with review", url: "https://chatgpt.com/", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Calendar + Maps + Forms + Sheets + Canva + Payment" },
];

export const HOLIDAY_DECORATING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "HOLIDAY DECORATING HELPER — SESSION EXAMPLES",
    "",
    "Displayed $10 – $40 / job is examples only.",
    "GROSS = quick + standard/hourly + larger indoor + take-down + bundles + add-ons.",
    "PROFIT = Gross − supplies − travel − parking/tolls − fees − ads − helpers − other.",
    "Indoor / light work only. Ladders only with adults.",
    "",
    "Quick help: about $20–$40",
    "Standard session: about $40–$75",
    "Larger indoor session: about $75–$150+",
    "Hourly option: about $20–$40/hour",
    "Take-down / pack-away: about $30–$100+",
    "Bundled decorate + take-down: package you write in advance",
    "",
    "Add-ons: ornament organization, labeling, gift-wrap assistance, extra rooms/tree.",
  ].join("\n"),
  raiseTip: "Price for rooms, complexity, packing, travel, and take-down. Examples only.",
  items: [
    { id: "quick", label: "Quick help", price: "$20–$40", notes: "Examples only" },
    { id: "standard", label: "Standard indoor session", price: "$40–$75", notes: "Examples only" },
    { id: "larger", label: "Larger indoor session", price: "$75–$150+", notes: "Examples only" },
    { id: "hourly", label: "Hourly option", price: "$20–$40 / hour", notes: "Examples only" },
    { id: "takedown", label: "Take-down / pack-away", price: "$30–$100+", notes: "Examples only" },
    { id: "bundle", label: "Decorate + take-down bundle", price: "Package", notes: "Examples only" },
  ],
};

export const HOLIDAY_DECORATING_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Choose Indoor Decorating Services You Will Offer", desc: "Unpacking, tree, lightweight decor, tabletop, safe garland, organizing, take-down, packing, labeling, cleanup. Customer provides decorations." },
  { title: "Write Safety Boundaries", desc: "Indoor/light only. Ladders only with adults. No roofs, high exterior ladders, professional exterior lights, electrical repair, structural installs, unsafe heights, or excessive lifting. No outlet overload or open flames." },
  { title: "Set Session and Package Pricing", desc: "Open Google Sheets. Quick / standard / larger / hourly / take-down / bundle. Price time, rooms, complexity, packing, travel, supplies. REVENUE is not PROFIT." },
  { title: "Pack Your Indoor Supply Kit", desc: "Gloves, scissors, removable hooks, tape measure, labels, marker, zip bags, cloths, trash bags, phone, organizer. Optional: ornament hooks, ribbon, clips, small tools, knee pad, battery tester." },
  { title: "Create Intake and a Room Checklist", desc: "Open Google Forms. Holiday, decorating date, take-down date, areas, tree, decorations, instructions, photo permission." },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3:",
      "☐ Neighbors / family",
      "☐ Parent-approved local groups",
      "☐ Repeat holiday customers",
      "",
      "Examples:",
      "- Ask 8 trusted households this week.",
      "- Offer decorate + January take-down as one package.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a Flyer (US Letter) or A4 flyer you can customize as a SAMPLE (indoor decorating — no private addresses).",
      "",
      "Create:",
      "☐ Indoor-only menu and prices",
      "☐ Ladders only with adults",
      "☐ Take-down booking line",
      "",
      "Sample:",
      "“Indoor holiday decorating and pack-away. Quick help $____ · standard session $____. Ladders only with adults.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week:",
      "☐ Message warm contacts",
      "☐ Book decorating AND take-down dates together",
      "☐ Track yes / maybe / no",
    ].join("\n"),
  },
  { title: "Confirm the Decorating Plan Before You Start", desc: "Walk rooms. Note fragile items. Agree what goes where. Take approved before photos — no kids’ faces." },
  { title: "Complete the Job Carefully", desc: "Place, fluff, organize, clean as you go. Protect sentimental pieces. Adults handle ladder work." },
  { title: "Schedule Take-Down and Track Profit", desc: "Put take-down on Google Calendar. Log decorating + travel + setup + cleanup + packing + admin hours. Profit per total hour. Seasonal tracking." },
];

export function holidayDecoratingToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Calendar + Maps + Forms + Sheets + Canva + Payment.",
    "",
    "Hooks and packing supplies are Supplies. Customer decorations stay theirs. Ladders only with adults.",
  ].join("\n");
}

export function computeHolidayDecoratingProfit(input: {
  holidayDecoratingQuickJobs?: number;
  quickPrice?: number;
  standardSessions?: number;
  standardPrice?: number;
  largerSessions?: number;
  largerPrice?: number;
  hourlyHours?: number;
  hourlyRate?: number;
  takeDownRevenue?: number;
  packageRevenue?: number;
  addOnRevenue?: number;
  supplies?: number;
  travel?: number;
  parkingTolls?: number;
  paymentFees?: number;
  advertising?: number;
  helperCosts?: number;
  otherExpenses?: number;
  laborHours?: number;
  jobsCompleted?: number;
}): {
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerJob: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossServiceRevenue =
    Math.max(0, Number(input.holidayDecoratingQuickJobs) || 0) * Math.max(0, Number(input.quickPrice) || 0) +
    Math.max(0, Number(input.standardSessions) || 0) * Math.max(0, Number(input.standardPrice) || 0) +
    Math.max(0, Number(input.largerSessions) || 0) * Math.max(0, Number(input.largerPrice) || 0) +
    Math.max(0, Number(input.hourlyHours) || 0) * Math.max(0, Number(input.hourlyRate) || 0) +
    Math.max(0, Number(input.takeDownRevenue) || 0) +
    Math.max(0, Number(input.packageRevenue) || 0) +
    Math.max(0, Number(input.addOnRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.parkingTolls) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.helperCosts) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const jobs = Math.max(0, Number(input.jobsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerJob: jobs > 0 ? estimatedProfit / jobs : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
