/**
 * AI Rideshare Timing Scout (`ai-timing`, Guide #027).
 * Public data + driver observations + AI organization — not guaranteed earnings.
 * Elite. Plain data only.
 */

export const AI_TIMING_REALITY_CHECK = {
  title: "THIS IS A TIMING SCOUT, NOT A GUARANTEED-EARNINGS SYSTEM",
  body: [
    "AI cannot reliably know live rideshare demand, surge pricing, platform dispatch logic, or exact future earnings unless a legitimate current data source provides that information.",
    "",
    "Never invent:",
    "- Live surge",
    "- Current driver demand",
    "- Exact wait times",
    "- Guaranteed hot zones",
    "- Guaranteed earnings",
    "- Private platform data",
    "",
    "Use AI to organize PUBLIC information and driver-supplied observations, then test recommendations in the real world.",
    "",
    "This hustle has two income paths: use the playbook yourself, or sell clearly labeled local timing research. Do not sell projected driver earnings as guaranteed results.",
    "",
    "Do not present yourself as affiliated with Uber, Lyft, DoorDash, or another platform unless actually authorized.",
    "",
    "Tagline: Study the Market. Test the Windows. Drive Smarter.",
  ].join("\n"),
};

export const AI_TIMING_NOTES_WORKSHEET = `MY AI RIDESHARE TIMING SCOUT PLAN

MARKET
City/Region: ________
ZIPs/Zones: ________
Platform: ________
Rideshare / Delivery / Both

DEMAND GENERATORS
Airport: ________
Hotels: ________
Hospitals: ________
Employers: ________
Universities: ________
Restaurants: ________
Venues: ________
Events: ________

TIMING TEST
Zone | Day | Time | Reason | Result | Keep/Retest/Drop
________ | ________ | ________ | ________ | ________ | ________
________ | ________ | ________ | ________ | ________ | ________
________ | ________ | ________ | ________ | ________ | ________

DRIVER RESULTS
Date: ________
Zone: ________
Online Hours: ____
Trips/Orders: ____
Gross: $____
Miles: ____
Costs: $____
Profit: $____
Profit/Hour: $____
Profit/Mile: $____

PLAYBOOK
Created: ________
Last Updated: ________
Sources: ________
Custom Client: ________
Price: $____

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Leads: ____
Sales: ____
Updates Sold: ____

NEXT REVIEW
Keep: ________
Retest: ________
Change: ________
Remove: ________

GYSH PRO TIP
The goal is NOT to predict exactly where the next ride will appear.
The goal is to stop driving completely blind.

PUBLIC DATA
+ LOCAL EVENTS
+ DRIVER OBSERVATIONS
+ AI ORGANIZATION
+ REAL-WORLD TESTING
= A BETTER TIMING PLAYBOOK.

ELITE CHALLENGE
Build one local Timing Scout playbook:
1. Pick 3–5 ZIPs/zones
2. Map demand generators
3. Build 7-day timing matrix
4. Add local events
5. Ask AI for hypotheses
6. Separate facts from predictions
7. Test at least 3 windows if driving
8. Track profit/hour and profit/mile
9. Update matrix
10. Create clean playbook
11. Add sources/date/disclaimer
12. Choose 2–3 marketing channels
13. Create one sample graphic
14. Offer 5 starter playbooks
15. Collect feedback and update
`;

export const AI_TIMING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Use AI plus ZIP-code-level local research and a driver’s own observations to identify promising rideshare and delivery time windows, demand zones, events, commute patterns, airport activity, restaurant clusters, and other local demand signals. Use the research yourself or package it into clearly labeled, regularly updated local timing playbooks. Tagline: Study the Market. Test the Windows. Drive Smarter. Category: AI Services / Rideshare & Delivery / Local Data. Best for Adults, Seniors/Retirees; licensed drivers who meet applicable platform requirements. Beginner–Intermediate · $0 – Low startup · 1 - 2 weeks to build and test a local timing playbook · Local + Online Research · Personal Driving Optimization / Digital Playbooks / Custom Local Research · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer/phone · Internet · AI assistant · Maps · Spreadsheet · ZIP-code list/service area · Calendar/event sources · Local business/venue research · Driver observation log · Current platform apps if using the playbook personally · Clear disclaimer if selling research.",
  },
  {
    id: "research-inputs",
    label: "Research inputs may include",
    detail:
      "ZIP codes · Population/business districts · Airports · Hotels · Hospitals · Universities · Stadiums · Convention centers · Nightlife · Restaurant clusters · Shopping districts · Major employers · Transit hubs · Commute corridors · Public event calendars · Tourism patterns · Weather · Day-of-week patterns · Driver’s own trip history/notes. Use lawful public information and data the driver is authorized to use.",
  },
  {
    id: "two-paths",
    label: "Two income paths",
    detail:
      "A. Use the playbook yourself — value is improved decision-making and NET driving profit, not a price you charge yourself. B. Sell local timing research as dated snapshots, city playbooks, custom driver playbooks, fleet research, or monthly/seasonal updates. Do not sell projected driver earnings as guaranteed results.",
  },
  {
    id: "never-invent",
    label: "IMPORTANT — no invented live demand",
    detail:
      "Never invent live surge, current driver demand, exact wait times, guaranteed hot zones, guaranteed earnings, or private platform data. Label every playbook with AREA, DATE CREATED, LAST UPDATED, DATA/OBSERVATION SOURCES, and “TEST THESE WINDOWS — DEMAND AND EARNINGS ARE NOT GUARANTEED.”",
  },
];

export const AI_TIMING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Organize public research and driver observations" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Landmarks, zones, and routes" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Timing matrix and test results" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Events and recurring demand" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Playbook write-up and source notes" },
  { label: "Canva", url: "https://www.canva.com/", note: "Sample timing map and sales graphics" },
  { label: "Google Trends", url: "https://trends.google.com/", note: "Optional public search-interest patterns" },
  { label: "Eventbrite", url: "https://www.eventbrite.com/", note: "Public event listings" },
  { label: "National Weather Service", url: "https://www.weather.gov/", note: "Optional weather context" },
];

export const AI_TIMING_SUPPLIES = {
  starterKitTotal:
    "About $0–25 for printed logs and folders — software accounts live on the Tools tab. Do not buy paid data tools before you have a tested local playbook.",
  items: [
    { id: "computer", name: "Computer / phone", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "ai-assistant", name: "AI assistant access", qty: "1", estCost: "$0", notes: "Essential — see Tools" },
    { id: "maps", name: "Maps", qty: "1", estCost: "$0", notes: "Essential — see Tools" },
    { id: "spreadsheet", name: "Spreadsheet", qty: "1", estCost: "$0", notes: "Essential — timing matrix and results" },
    { id: "calendar", name: "Calendar", qty: "1", estCost: "$0", notes: "Essential — events and recurring demand" },
    { id: "event-sources", name: "Public event sources", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "zip-reference", name: "ZIP-code reference", qty: "1", estCost: "$0", notes: "Essential — service area list" },
    { id: "observation-log", name: "Driver observation template", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "mileage-tracker", name: "Mileage / expense tracker", qty: "1", estCost: "$0", notes: "Essential if driving or selling driver playbooks" },
    { id: "playbook-template", name: "Playbook template", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "disclaimer", name: "Disclaimer", qty: "1", estCost: "$0", notes: "Essential — no guaranteed earnings or live surge" },
    { id: "payment", name: "Payment / delivery method", qty: "1", estCost: "$0", notes: "Essential if selling research" },
    { id: "weather", name: "Weather source", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "traffic", name: "Traffic source", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "viz-map", name: "Visualization / map tool", qty: "1", estCost: "$0", notes: "Optional", optional: true },
  ],
};

export const AI_TIMING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "AI RIDESHARE TIMING SCOUT PRICING EXAMPLES",
    "",
    "Displayed earning potential: $300 – $3,000+ / month — examples only, NOT guarantees.",
    "",
    "This hustle has TWO income paths.",
    "",
    "A. USE THE PLAYBOOK YOURSELF",
    "Value is measured by improved decision-making and NET driving profit — not by charging yourself a price.",
    "Track: Gross driving revenue · Miles · Fuel/charging · Tolls/parking · Vehicle costs · Online hours · Booked/active hours where available · Net profit/hour · Net profit/mile.",
    "Do not count a tax mileage deduction as though it were a cash vehicle expense. Keep tax calculations separate from operating-profit tracking.",
    "",
    "B. SELL LOCAL TIMING RESEARCH",
    "",
    "STARTER ZIP-CODE SNAPSHOT — $15–$35",
    "1 local area/ZIP cluster. Basic demand landmarks. Suggested test windows. Event/commute notes. Driver test sheet. Clearly dated.",
    "",
    "CITY/AREA TIMING PLAYBOOK — $35–$100",
    "Multiple ZIPs/zones. Weekday/weekend windows. Airport/event/restaurant/commute patterns. Rideshare + delivery observations. Testing checklist. Update date/source notes.",
    "",
    "CUSTOM DRIVER PLAYBOOK — $75–$200+",
    "Built around the driver’s platform(s), home/start area, preferred hours, airport preference, delivery vs rideshare, target driving schedule, and driver-supplied observations/history.",
    "",
    "BUSINESS/FLEET/TEAM RESEARCH — $150–$500+",
    "Only when scope supports it. May include broader local analysis, multiple zones, recurring updates, and custom reporting.",
    "",
    "MONTHLY/SEASONAL UPDATE — $20–$100+",
    "Refresh events, construction/access changes, seasonality, venue schedules, tourism, school/calendar patterns, and driver test results.",
    "",
    "PRICING FORMULA:",
    "Research Hours × Target Hourly Value + Data/Tool Costs + Number of ZIPs/Zones + Custom Analysis + Update Frequency = Playbook Price.",
    "",
    "MONTHLY EXAMPLES — NOT GUARANTEES",
    "10 snapshots × $25 = $250",
    "10 city playbooks × $50 = $500",
    "5 custom playbooks × $125 = $625",
    "10 city playbooks × $75 + 5 custom × $150 = $1,500",
    "Larger/custom research volume may reach $3,000+, but demand varies.",
    "",
    "Do NOT sell projected driver earnings as guaranteed results.",
  ].join("\n"),
  raiseTip:
    "After a few dated, source-labeled playbooks, package a repeatable ZIP cluster and add monthly/seasonal updates. Displayed $300 – $3,000+ / month is examples only — not income guarantees.",
  items: [
    { id: "snapshot", label: "Starter ZIP-code snapshot", price: "$15–$35", notes: "1 ZIP cluster, landmarks, test windows, dated driver test sheet" },
    { id: "city", label: "City / area timing playbook", price: "$35–$100", notes: "Multiple zones, weekday/weekend windows, testing checklist" },
    { id: "custom", label: "Custom driver playbook", price: "$75–$200+", notes: "Platform, start area, hours, and driver-supplied observations" },
    { id: "fleet", label: "Business / fleet / team research", price: "$150–$500+", notes: "Only when scope supports it" },
    { id: "update", label: "Monthly / seasonal update", price: "$20–$100+", notes: "Events, construction, seasonality, driver test results" },
  ],
};

export const AI_TIMING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "at_ai",
    name: "AI assistant",
    freePlanAvailable: true,
    costNote: "Organize research, compare patterns, and summarize observations — do not invent live surge or earnings",
    url: "https://chatgpt.com/",
  },
  {
    id: "at_maps",
    name: "Maps",
    freePlanAvailable: true,
    costNote: "Landmarks, zones, and routes",
    url: "https://maps.google.com/",
  },
  {
    id: "at_sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Timing matrix and test results",
    url: "https://sheets.google.com/",
  },
  {
    id: "at_calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Events and recurring demand",
    url: "https://calendar.google.com/",
  },
  {
    id: "at_events",
    name: "Public event / venue calendars",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Games, concerts, conventions, festivals, and community listings — never claim an event guarantees rides",
    url: "https://www.eventbrite.com/",
  },
  {
    id: "at_weather",
    name: "Weather / traffic tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Optional context only — weather does not equal demand",
    url: "https://www.weather.gov/",
    optional: true,
  },
  {
    id: "at_zip",
    name: "ZIP-code / demographic / business data sources",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Use only sources that are lawfully available",
    optional: true,
  },
  {
    id: "at_platforms",
    name: "Driver platform apps",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Current information for the individual driver, subject to platform rules — not a data feed you may resell",
  },
  {
    id: "at_mileage",
    name: "Mileage / expense tracker",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Gross, miles, fuel/charging, tolls, and net profit — do not treat a tax mileage deduction as cash expense",
  },
  {
    id: "at_docs",
    name: "Canva / Docs",
    freePlanAvailable: true,
    costNote: "Playbook formatting, sample maps, and sales posts",
    url: "https://docs.google.com/",
  },
  {
    id: "at_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "AI + Maps + Spreadsheet + Public Event Calendar + Driver Test Log",
  },
];

export function aiTimingToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: AI + Maps + Spreadsheet + Public Event Calendar + Driver Test Log.",
    "",
    "Label every playbook with AREA, DATE CREATED, LAST UPDATED, DATA/OBSERVATION SOURCES, and “TEST THESE WINDOWS — DEMAND AND EARNINGS ARE NOT GUARANTEED.”",
    "",
    "Never invent live surge, current driver demand, exact wait times, guaranteed hot zones, guaranteed earnings, or private platform data.",
    "",
    "Never use the phone unsafely while driving. Park legally before analyzing data or changing research plans.",
  ].join("\n");
}

/** Exactly 11 authored core steps. Marketing = steps 8–10 (COMPLETE spec). Use ☐ only. */
export const AI_TIMING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Market",
    desc: [
      "Choose:",
      "☐ City / region",
      "☐ ZIP codes",
      "☐ Rideshare / delivery / both",
      "☐ Weekdays / weekends",
      "☐ Morning / midday / evening / late night",
      "",
      "Keep the first project small: 3–5 ZIPs or a few practical driving zones.",
      "",
      "Write the service area you will actually research. A statewide “hot zone list” is too big for v1.",
      "",
      "Open Google Sheets from the Tools tab (sign in with Google, or use an account you already have) and name the tab with the city and date.",
    ].join("\n"),
  },
  {
    title: "Map Demand Generators",
    desc: [
      "For each zone identify:",
      "☐ Airport",
      "☐ Hotels",
      "☐ Hospitals",
      "☐ Universities",
      "☐ Major employers",
      "☐ Downtown / business district",
      "☐ Stadiums",
      "☐ Event venues",
      "☐ Restaurants",
      "☐ Nightlife",
      "☐ Shopping",
      "☐ Transit",
      "☐ Tourism",
      "",
      "Do not label a place “busy” merely because it exists.",
      "It is a demand hypothesis to test.",
      "",
      "Use lawful public maps and listings. Record the source next to each landmark.",
    ].join("\n"),
  },
  {
    title: "Build a Time-Window Matrix",
    desc: [
      "Create a sheet with:",
      "Zone | Mon | Tue | Wed | Thu | Fri | Sat | Sun",
      "",
      "For each day add possible windows:",
      "☐ Early commute",
      "☐ Morning",
      "☐ Lunch",
      "☐ Afternoon",
      "☐ Evening commute",
      "☐ Dinner",
      "☐ Nightlife",
      "☐ Event-specific",
      "",
      "Mark each window:",
      "TEST · PROMISING · WEAK · UNKNOWN.",
      "",
      "Unknown is honest. Do not fill blanks with invented surge or wait times.",
    ].join("\n"),
  },
  {
    title: "Add Local Calendar & Event Signals",
    desc: [
      "Research:",
      "☐ Games",
      "☐ Concerts",
      "☐ Conventions",
      "☐ Festivals",
      "☐ School events",
      "☐ Airport travel periods",
      "☐ Holiday shopping",
      "☐ Tourism seasons",
      "☐ Large community events",
      "",
      "Record: Event | Date | Start | Expected End | Venue | Nearby pickup considerations | Delivery opportunities | Traffic/access concerns.",
      "",
      "Never claim an event guarantees rides.",
      "An event is a reason to TEST a window, not a promise of earnings.",
    ].join("\n"),
  },
  {
    title: "Use AI to Create Testable Hypotheses",
    desc: [
      "Prompt example:",
      "“Using only the public information and observations I provide, organize possible rideshare/delivery demand windows for these ZIP codes. Separate facts from hypotheses. Do not invent live surge, ride volume, platform demand, wait times, or earnings. For every recommendation, tell me what a driver should test.”",
      "",
      "AI output should produce:",
      "- WHY this window may matter",
      "- WHAT to test",
      "- WHEN to test",
      "- WHAT result to record",
      "",
      "Paste only public facts and observations you are authorized to use. Do not paste private platform screenshots, other people’s trip histories, or personal data.",
      "",
      "Every recommendation stays a hypothesis until a real-world test.",
    ].join("\n"),
  },
  {
    title: "Test the Playbook Safely",
    desc: [
      "If using the playbook personally, record actual results.",
      "",
      "Log:",
      "☐ Date",
      "☐ Zone",
      "☐ Time",
      "☐ Platform",
      "☐ Online minutes",
      "☐ Trips / orders",
      "☐ Gross revenue",
      "☐ Miles",
      "☐ Dead miles",
      "☐ Fuel / charging estimate",
      "☐ Tolls / parking",
      "☐ Notes",
      "",
      "Never use the phone unsafely while driving.",
      "Park legally before analyzing data or changing research plans.",
      "",
      "A test that shows a WEAK window is still useful research. Update the matrix instead of inventing a better story.",
    ].join("\n"),
  },
  {
    title: "Analyze Profit, Not Just Gross Earnings",
    desc: [
      "Calculate:",
      "Gross Revenue − Fuel/Charging − Tolls/Parking − Estimated Vehicle Costs − Other Driving Costs = Estimated Driving Profit Before Taxes.",
      "",
      "Track:",
      "- Profit / online hour",
      "- Profit / mile",
      "- Trips / orders per hour",
      "- Dead miles",
      "",
      "A $30 gross hour with heavy mileage may be worse than a $24 gross hour with short trips and less dead driving.",
      "",
      "Do not count a tax mileage deduction as though it were a cash vehicle expense. Keep tax calculations separate from operating-profit tracking.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about you.",
      "",
      "If selling playbooks, pick only 2 or 3 this month:",
      "☐ Driver communities where promotion is permitted",
      "☐ Facebook groups where allowed",
      "☐ Local social pages",
      "☐ TikTok / YouTube educational content",
      "☐ Referral network",
      "☐ Driver-to-driver referrals",
      "☐ Simple landing page",
      "☐ Local gig-worker communities",
      "☐ Email list",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write ONE measurable goal for each channel.",
      "",
      "Examples:",
      "- Sell 5 starter snapshots",
      "- Get 3 custom-driver interviews",
      "- Post 2 educational timing tips / week",
      "",
      "Do not spam groups or present yourself as affiliated with Uber, Lyft, DoorDash, or another platform unless actually authorized.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "☐ 1 sample timing map",
      "☐ 1 blurred / sample timing matrix",
      "☐ 1 explanation of methodology",
      "☐ 1 “what’s inside” graphic",
      "☐ 1 disclaimer",
      "☐ 1 sales page / post",
      "☐ 1 custom-driver intake form",
      "",
      "Sample copy:",
      "“Stop guessing where to start. I research local commute, event, airport, restaurant, and venue patterns and turn them into a dated driver TESTING playbook. It does not promise surge or earnings—it gives you smarter windows to test.”",
      "",
      "Every sample must show AREA, date, sources, and the testing disclaimer.",
      "Do not claim guaranteed earnings, live surge, or official platform affiliation.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use ONLY the 2 or 3 channels selected.",
      "",
      "Track: Lead | Area | Platform | Product | Price | Date | Delivered | Feedback | Update Requested.",
      "",
      "Before delivery verify:",
      "☐ Correct ZIPs",
      "☐ Current event dates",
      "☐ No invented live demand",
      "☐ No guaranteed earnings",
      "☐ Sources / date listed",
      "☐ Testing instructions included",
      "☐ Safety disclaimer included",
      "",
      "Ask buyers for observations so future versions can improve without exposing private information.",
      "",
      "Do not spam. Do not sell projected driver earnings as guaranteed results.",
    ].join("\n"),
  },
  {
    title: "Update the Playbook & Build Recurring Value",
    desc: [
      "Markets change.",
      "",
      "Review:",
      "☐ Events",
      "☐ Seasons",
      "☐ Construction",
      "☐ Airport patterns",
      "☐ Restaurant openings / closures",
      "☐ School schedules",
      "☐ Tourism",
      "☐ Driver observations",
      "☐ Platform changes",
      "",
      "Mark old recommendations: KEEP · RETEST · CHANGE · REMOVE.",
      "",
      "Offer monthly / seasonal updates.",
      "",
      "RESEARCH → HYPOTHESIS → DRIVE TEST → MEASURE → UPDATE.",
    ].join("\n"),
  },
];

/** Playbook-business math plus optional driver-test profit. Revenue is not profit. */
export function computeAiTimingProfit(input: {
  snapshotsSold?: number;
  averageSnapshotPrice?: number;
  cityPlaybooksSold?: number;
  averageCityPrice?: number;
  customPlaybooksSold?: number;
  averageCustomPrice?: number;
  updatesSubscriptions?: number;
  aiSoftware?: number;
  dataTools?: number;
  marketing?: number;
  paymentFees?: number;
  otherExpenses?: number;
  researchHours?: number;
  customizationHours?: number;
  marketingAdminHours?: number;
  grossDrivingRevenue?: number;
  onlineHours?: number;
  miles?: number;
  fuelCharging?: number;
  tollsParking?: number;
  estimatedVehicleCosts?: number;
  otherDrivingCosts?: number;
}): {
  snapshotRevenue: number;
  cityRevenue: number;
  customRevenue: number;
  updateRevenue: number;
  playbookRevenue: number;
  playbookExpenses: number;
  playbookProfit: number;
  totalHours: number;
  playbookProfitPerHour: number | null;
  drivingCosts: number;
  drivingProfit: number;
  profitPerOnlineHour: number | null;
  profitPerMile: number | null;
} {
  const snapshotRevenue =
    Math.max(0, Number(input.snapshotsSold) || 0) * Math.max(0, Number(input.averageSnapshotPrice) || 0);
  const cityRevenue =
    Math.max(0, Number(input.cityPlaybooksSold) || 0) * Math.max(0, Number(input.averageCityPrice) || 0);
  const customRevenue =
    Math.max(0, Number(input.customPlaybooksSold) || 0) * Math.max(0, Number(input.averageCustomPrice) || 0);
  const updateRevenue = Math.max(0, Number(input.updatesSubscriptions) || 0);
  const playbookRevenue = snapshotRevenue + cityRevenue + customRevenue + updateRevenue;
  const playbookExpenses =
    Math.max(0, Number(input.aiSoftware) || 0) +
    Math.max(0, Number(input.dataTools) || 0) +
    Math.max(0, Number(input.marketing) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const playbookProfit = playbookRevenue - playbookExpenses;
  const totalHours =
    Math.max(0, Number(input.researchHours) || 0) +
    Math.max(0, Number(input.customizationHours) || 0) +
    Math.max(0, Number(input.marketingAdminHours) || 0);
  const drivingCosts =
    Math.max(0, Number(input.fuelCharging) || 0) +
    Math.max(0, Number(input.tollsParking) || 0) +
    Math.max(0, Number(input.estimatedVehicleCosts) || 0) +
    Math.max(0, Number(input.otherDrivingCosts) || 0);
  const drivingProfit = Math.max(0, Number(input.grossDrivingRevenue) || 0) - drivingCosts;
  const onlineHours = Math.max(0, Number(input.onlineHours) || 0);
  const miles = Math.max(0, Number(input.miles) || 0);
  return {
    snapshotRevenue,
    cityRevenue,
    customRevenue,
    updateRevenue,
    playbookRevenue,
    playbookExpenses,
    playbookProfit,
    totalHours,
    playbookProfitPerHour: totalHours > 0 ? playbookProfit / totalHours : null,
    drivingCosts,
    drivingProfit,
    profitPerOnlineHour: onlineHours > 0 ? drivingProfit / onlineHours : null,
    profitPerMile: miles > 0 ? drivingProfit / miles : null,
  };
}
