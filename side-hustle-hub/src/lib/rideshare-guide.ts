/**
 * Rideshare (Uber / Lyft) (`rideshare`, Guide #018).
 * Platform marketplace — drivers do not set passenger fares.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const RIDESHARE_REALITY_CHECK = {
  title: "GROSS EARNINGS ARE NOT PROFIT",
  body: [
    "Rideshare income can look strong in the app, but your real profit depends on vehicle costs.",
    "",
    "Track: App Earnings + Tips + Eligible Bonuses/Incentives − Fuel or Charging − Tolls/Parking You Pay − Cleaning − Maintenance − Insurance/Rideshare Coverage − Other Driving Expenses = Estimated Profit.",
    "",
    "Do not judge a driving shift only by the amount shown in the app.",
    "",
    "Tagline: Drive Smart. Work the Busy Windows. Track Your Real Profit.",
  ].join("\n"),
};

/** Rideshare planner shown above freeform Notes for this guide. */
export const RIDESHARE_NOTES_WORKSHEET = `MY RIDESHARE PLAN

Platforms:
☐ Uber
☐ Lyft

Vehicle: __________
City/Market: __________

My Peak Windows:
1. __________
2. __________
3. __________
4. __________

Important Local Rules: __________
Airport Rules: __________
Weekly Driving Goal: ____ hours

SHIFT TRACKER:
Date: __________
Platform: __________
Online Hours: __________
Trips: __________
App Earnings: $____
Tips: $____
Bonuses: $____
Total Miles: ____
Fuel/Charging: $____
Tolls/Parking: $____
Other Expenses: $____
Estimated Profit: $____
Profit Per Hour: $____
Profit Per Mile: $____

What Worked: __________
What Didn't: __________
Best Area/Window: __________
Next Adjustment: __________

GYSH PRO TIP
DON'T CHASE HOURS — CHASE PROFITABLE HOURS.
Being online for 10 hours does not automatically mean you made more money than someone who drove 5 well-chosen hours.
DEMAND + LOW DEAD MILES + CONTROLLED EXPENSES + SAFE DRIVING = BETTER PROFIT POTENTIAL

PRO CHALLENGE
Complete 3 TEST SHIFTS at different times. For each, calculate Gross Earnings, Expenses, Estimated Profit, Profit Per Hour, and Profit Per Mile. Rank #1 Best / #2 Middle / #3 Weakest. Build next week's schedule around what your numbers actually show.`;

export const RIDESHARE_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Drive passengers using rideshare platforms such as Uber or Lyft. Work flexible hours and focus on higher-demand windows such as airport traffic, commute periods, nightlife, concerts, sporting events, conventions, and other local events. Tagline: Drive Smart. Work the Busy Windows. Track Your Real Profit. Category: Driving / Gig Economy. Best for Adults and Seniors / Retirees. Beginner · Low to moderate startup · Timeline 3–7 days · Platform earnings / tips · Pro Membership. Displayed income example $600–$3,500 / month (examples only — not guaranteed).",
  },
  {
    id: "need",
    label: "You generally need",
    detail:
      "Valid driver's license · Eligible vehicle that meets the platform's current local requirements · Auto insurance meeting applicable requirements · Smartphone with reliable data · Bank/payment account for payouts · Ability to pass platform onboarding and any required background or driving-record checks · Safe driving record · Clean, reliable vehicle.",
  },
  {
    id: "before-signup",
    label: "Before signing up",
    detail:
      "Check current Uber and Lyft driver/vehicle requirements for your exact city · Check minimum age and driving-experience rules · Confirm vehicle age, condition, inspection, registration, and insurance requirements · Ask your insurer whether you need a rideshare endorsement or additional coverage · Understand that platform availability, vehicle rules, bonuses, and rates vary by market · Never drive when tired, impaired, or unable to safely operate the vehicle.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "Phone mount · Fast charger · Dash cam where legal and properly disclosed/used · Cleaning supplies · Mileage/expense tracker · Emergency roadside plan.",
  },
];

export const RIDESHARE_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Uber Driver",
    url: "https://www.uber.com/us/en/drive/",
    note: "Verify current local driver and vehicle requirements before you apply",
  },
  {
    label: "Lyft Driver",
    url: "https://www.lyft.com/driver",
    note: "Requirements vary by city — check Lyft for your market",
  },
  {
    label: "IRS standard mileage rates",
    url: "https://www.irs.gov/tax-professionals/standard-mileage-rates",
    note: "Tax deduction ≠ cash expense. Keep records; use current IRS guidance or a tax pro",
  },
];

export const RIDESHARE_SUPPLIES = {
  starterKitTotal:
    "About $15–40 for phone mount and charger if you already have an eligible vehicle — do not overspend on accessories before you know whether rideshare is a good fit",
  items: [
    { id: "vehicle", name: "Eligible vehicle", qty: "1", estCost: "Owned", notes: "Essential — must meet current local platform rules" },
    { id: "phone", name: "Smartphone", qty: "1", estCost: "$0", notes: "Essential — reliable data" },
    { id: "mount", name: "Phone mount", qty: "1", estCost: "$10–20", notes: "Essential" },
    { id: "charger", name: "Charging cable / car charger", qty: "1", estCost: "$8–20", notes: "Essential" },
    { id: "license", name: "Driver's license", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "reg", name: "Registration", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "ins", name: "Insurance", qty: "1", estCost: "Policy", notes: "Essential — ask about rideshare endorsement" },
    { id: "fuel", name: "Fuel or EV charging access", qty: "1", estCost: "Ongoing", notes: "Essential" },
    { id: "cloth", name: "Microfiber cloth", qty: "1", estCost: "$3–8", notes: "Useful", optional: true },
    { id: "trash", name: "Small trash bag", qty: "1", estCost: "$2–5", notes: "Useful", optional: true },
    { id: "wipes", name: "Interior wipes", qty: "1 pack", estCost: "$4–8", notes: "Useful", optional: true },
    { id: "sanitizer", name: "Hand sanitizer", qty: "1", estCost: "$3–8", notes: "Useful", optional: true },
    { id: "organizer", name: "Seat-back organizer", qty: "1", estCost: "$8–15", notes: "Useful", optional: true },
    { id: "flashlight", name: "Flashlight", qty: "1", estCost: "$5–12", notes: "Useful", optional: true },
    { id: "gauge", name: "Tire-pressure gauge", qty: "1", estCost: "$5–12", notes: "Useful", optional: true },
    { id: "kit", name: "Emergency kit", qty: "1", estCost: "$20–40", notes: "Useful", optional: true },
    { id: "powerbank", name: "Portable battery pack", qty: "1", estCost: "$15–30", notes: "Useful", optional: true },
    { id: "water-you", name: "Water for yourself", qty: "1", estCost: "$0–3", notes: "Useful — not a passenger gimmick", optional: true },
    { id: "dashcam", name: "Dash cam (where legal)", qty: "1", estCost: "$30–80", notes: "Optional — disclose/use per law and platform rules", optional: true },
    { id: "covers", name: "Seat covers", qty: "1 set", estCost: "$20–50", notes: "Optional", optional: true },
    { id: "mats", name: "Floor mats", qty: "1 set", estCost: "$15–40", notes: "Optional", optional: true },
    { id: "vac", name: "Small vacuum", qty: "1", estCost: "$20–50", notes: "Optional", optional: true },
    { id: "roadside", name: "Roadside assistance membership", qty: "1", estCost: "Plan", notes: "Optional", optional: true },
  ],
};

export const RIDESHARE_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "uber_driver",
    name: "Uber Driver",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Driver app · vehicle, insurance, and fuel are your costs",
    url: "https://www.uber.com/us/en/drive/",
  },
  {
    id: "lyft_driver",
    name: "Lyft Driver",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Driver app · verify current local vehicle rules",
    url: "https://www.lyft.com/driver",
  },
  {
    id: "gmaps",
    name: "Google Maps",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Navigation",
    url: "https://maps.google.com/",
  },
  {
    id: "apple_maps",
    name: "Apple Maps",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Navigation",
    url: "https://maps.apple.com/",
    optional: true,
  },
  {
    id: "waze",
    name: "Waze",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Traffic and routing",
    url: "https://www.waze.com/",
    optional: true,
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Shift P&L tracker",
    url: "https://sheets.google.com/",
  },
  {
    id: "mileage",
    name: "Mileage / expense tracking app",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Turn on before the first shift · tax records ≠ cash cost",
  },
  {
    id: "notes",
    name: "Notes app",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Airport rules, waiting spots, window notes",
  },
  {
    id: "calendar",
    name: "Calendar",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Peak-window schedule",
    url: "https://calendar.google.com/",
  },
  {
    id: "stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Uber or Lyft Driver App + Maps + Mileage Tracker + Expense Tracker",
  },
];

export const RIDESHARE_PRICING = {
  tabLabel: "Rideshare Earnings & Shift Strategy",
  intro: [
    "Drivers usually do NOT set passenger prices directly. Uber and Lyft calculate rider fares and driver earnings under their current market rules.",
    "",
    "Displayed income example: $600–$3,500 / month. Example range only — NOT guaranteed income.",
    "",
    "Evaluate every shift using: gross earnings per hour · gross earnings per mile · tips · bonuses/incentives · paid miles versus total miles driven · fuel/charging · maintenance/vehicle cost · net profit per hour · net profit per mile.",
    "",
    "Example shift: App Earnings + Tips = $120 · Shift Expenses = $28 · Estimated Profit = $92 · Hours Online = 5 · Estimated Profit Per Hour = $18.40.",
    "",
    "Do NOT promise a specific hourly rate. Earnings vary by city, time, demand, traffic, trip mix, vehicle type, platform pricing, incentives, expenses, and driver strategy.",
    "",
    "Do not treat a tax mileage deduction as if it were an actual cash expense. Tax deductions and true vehicle cash/ownership costs are different. For tax treatment, keep accurate records and use current tax guidance or a qualified tax professional.",
  ].join("\n"),
  raiseTip:
    "Raise your personal floor ($/hour and $/mile) after 3 logged test shifts — not by setting a passenger fare. Examples only — not income guarantees.",
  items: [
    {
      id: "example-range",
      label: "Displayed monthly example",
      price: "$600–$3,500 / month",
      notes: "Example range only — not guaranteed",
    },
    {
      id: "shift",
      label: "Example shift (gross then net)",
      price: "$120 gross → $92 profit / 5 hrs = $18.40/hr",
      notes: "After $28 expenses",
    },
    {
      id: "windows",
      label: "Windows to test",
      price: "Commute · nightlife · airport · events",
      notes: "2–4 windows/week — do not drive randomly all day",
    },
  ],
};

/** Exactly 11 hustle-specific steps. No GYSH marketing-channel sequence. */
export const RIDESHARE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Check Whether You and Your Vehicle Qualify",
    desc: "Check the current driver and vehicle requirements for your city on each platform you want to use. Uber: https://www.uber.com/us/en/drive/ · Lyft: https://www.lyft.com/driver. Confirm license, insurance, registration, vehicle age/type, inspection, driving experience, and any local requirements. Do not assume requirements are the same everywhere.",
  },
  {
    title: "Estimate Your Real Cost to Drive",
    desc: "List your likely costs: Fuel/Charging · Insurance/Rideshare Coverage · Maintenance · Tires · Oil/Service · Cleaning · Tolls/Parking · Vehicle Payment if applicable · Other driving expenses. Do not decide whether rideshare is profitable based on gross app earnings alone.",
  },
  {
    title: "Complete Platform Onboarding",
    desc: "Create your driver account, submit required documents, complete identity/background/driving-record steps, complete any required inspection, and set up payouts. Only upload accurate, current documents. Do not drive until the platform confirms you are approved.",
  },
  {
    title: "Prep Your Vehicle",
    desc: "Clean the interior and exterior. Remove personal clutter. Check fuel/charge, tires, lights, mirrors, fluids, phone mount, charging cable, and safety equipment. Keep the vehicle comfortable and professional without buying unnecessary extras.",
  },
  {
    title: "Build Your Peak-Window Plan",
    desc: "Do not plan to drive randomly all day. Choose 2–4 promising driving windows for the week. Possible demand windows: morning commute · evening commute · Friday/Saturday nightlife · airport arrival/departure waves · concerts · sporting events · conventions · festivals · holiday travel. Write: Day | Start Time | End Time | Target Area/Event | Why Demand May Be Higher. Avoid chasing demand so aggressively that you waste fuel or drive unsafely.",
  },
  {
    title: "Learn Your Market",
    desc: "Study your city before trying to maximize hours. Learn airport pickup rules, high-demand neighborhoods, event venues, areas with difficult parking, toll roads, common traffic bottlenecks, safe waiting areas, and areas where pickups/drop-offs are restricted. Use platform heat maps or demand indicators as ONE signal, not a guarantee.",
  },
  {
    title: "Run a Test Shift",
    desc: "Start with a short 2–4 hour shift. Track online time, trips, app earnings, tips, bonuses, miles driven, fuel/charging, tolls/parking, and other costs. At the end, calculate estimated profit. Your first goal is to learn, not to stay online all day.",
  },
  {
    title: "Provide a Safe, Professional Ride",
    desc: "Drive safely. Confirm rider and destination using the platform's safety process. Follow traffic laws. Keep conversation respectful. Do not discriminate. Do not use your phone unsafely while driving. Never drive while impaired or dangerously tired. Use platform safety/emergency tools when needed. Follow local laws and platform rules regarding passengers, minors, service animals, recordings, dash cams, and accessibility.",
  },
  {
    title: "Track Every Shift",
    desc: "After every shift, record: Date · Platform · Online Hours · Trips · Gross/App Earnings · Tips · Bonuses · Total Miles · Fuel/Charging · Tolls/Parking · Other Expenses · Estimated Profit · Profit Per Hour · Profit Per Mile. This turns rideshare from “I think I made money” into a measurable business activity. Log results in Notes and the Revenue Calculator.",
  },
  {
    title: "Improve Your Driving Strategy",
    desc: "Compare your shifts. Ask: Which days paid best? Which hours paid best? Which areas caused too much unpaid driving? Which trips produced good earnings with fewer dead miles? Did airport waiting help or hurt? Did event traffic create profit or just delay? Which platform performed better? Keep the profitable patterns. Reduce the weak ones.",
  },
  {
    title: "Build a Repeatable Weekly Plan",
    desc: "Create a weekly schedule based on your real numbers. Example: Tuesday 6:00–9:00 AM — commute · Friday 5:00–9:00 PM — dinner/events · Saturday 7:00 PM–12:00 AM — nightlife/events · Sunday airport window — only if prior results justify it. Review weekly: Gross Earnings · Expenses · Estimated Profit · Hours · Miles · Best Window · Worst Window. Then adjust the following week.",
  },
];

export function rideshareToolsDisclaimer(): string {
  return "Uber and Lyft supply the rider marketplace — you do not set passenger fares. Driver apps and maps are standard. Your real costs are the vehicle, fuel/charging, insurance, and any gear you buy. Check current local platform requirements before you apply.";
}
