/**
 * Start a Gardening Club (`start-gardening-club`, Guide #105).
 * Community first, income optional.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const START_GARDENING_CLUB_REALITY_CHECK = {
  title: "COMMUNITY FIRST, INCOME OPTIONAL",
  body: [
    "A gardening club can stay completely free. Build a useful, welcoming community first. Add monetization only when members see clear value.",
    "",
    "Activities can include monthly meetups, seasonal planting, seed/plant swaps, garden tours, container-gardening demos, beginner lessons, guest speakers, beautification projects, garden challenges, paid workshops, and starter kits.",
    "",
    "Clearly explain dues, paid activities, and how club money is handled.",
    "Get permission before planting or modifying public or community property, collecting money, selling items, or holding regulated events.",
    "",
    "Do NOT automatically treat money collected as personal profit. Define whether funds belong to the club, reimburse expenses, fund activities, or represent legitimate organizer/instructor income. Keep records.",
    "",
    "Tagline: Grow Plants. Grow Skills. Grow Community.",
  ].join("\n"),
};

export const START_GARDENING_CLUB_NOTES_WORKSHEET = `MY GARDENING CLUB PLAN

CLUB
Name: __________
Purpose: __________
Location: __________
Frequency: __________
Free / dues: __________
Communication: __________

MEMBERS
Name | Contact permission | Interests | Attendance | Dues
__________
__________
__________

90-DAY CALENDAR
Month | Activity | Leader | Supplies | Cost | RSVP
__________
__________
__________

MARKETING
Channels (2–3): __________
Invited: ____  RSVPs: ____  Attended: ____  Joined: ____

WORKSHOP / KIT
Topic / product: __________
Price: $____  Capacity / qty: ____
Revenue: $____  Expenses: $____  Net: $____

CLUB MONEY
Dues: $____
Workshop revenue: $____
Kit revenue: $____
Expenses: $____
Funds remaining: $____
Organizer compensation (if applicable): $____

NEXT MEETING
Date: __________
Topic: __________
Requests: __________
Improvements: __________

GYSH PRO TIP
Don't start by buying a shed full of supplies. Start with PEOPLE.
5–10 INTERESTED MEMBERS → SIMPLE MEETUP → ASK WHAT THEY WANT → BUILD CALENDAR → THEN ADD WORKSHOPS/KITS PEOPLE WILL USE.

ELITE CHALLENGE
Launch a 90-day pilot with club name/purpose, interest survey, first 5–10 prospects, location, simple rules, 3-month calendar, first-meetup flyer, 2–3 marketing channels, swap rules, one optional workshop, one sample starter kit, budget, attendance/feedback tracker, and next-quarter plan.`;

export const START_GARDENING_CLUB_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Launch a neighborhood or community-center gardening club with seasonal meetups, gardening education, plant and seed swaps, shared projects, and optional paid workshops or starter kits. Tagline: Grow Plants. Grow Skills. Grow Community. Category: Community / Gardening / Clubs. Best for Adults, Seniors/Retirees; family/community participation where appropriate. Beginner · $0–Low startup · Flexible / Seasonal / Recurring · Neighborhood / Community Center / Garden · Optional dues / workshops / starter kits / events · 3 - 8 hrs/week · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Club purpose · Target members · Meeting location/host · Gardening interest · Schedule · Communication method · Activity ideas · Simple budget · Required property/facility permission.",
  },
  {
    id: "decide",
    label: "Decide before launch",
    detail:
      "Club Name · Who It Serves · Location · Frequency · Free or Dues-Based · Communication Method · First Activity.",
  },
  {
    id: "permission",
    label: "Permission first",
    detail:
      "Get permission before planting/modifying public or community property, collecting money, selling items, or holding regulated events. For home meetings, prefer RSVP-first rather than broadly publishing a private address.",
  },
];

export const START_GARDENING_CLUB_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Docs", url: "https://docs.google.com/", note: "Rules, agendas, workshop sheets" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Members, dues, expenses, inventory" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Interest surveys and RSVPs" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Meetings and events" },
  { label: "Canva", url: "https://www.canva.com/", note: "Flyers and materials" },
  { label: "Facebook", url: "https://www.facebook.com/", note: "Optional group or Page" },
  { label: "Nextdoor", url: "https://nextdoor.com/", note: "Neighborhood invitations where appropriate" },
];

export const START_GARDENING_CLUB_SUPPLIES = {
  starterKitTotal:
    "About $0–40 to start — notebook, sign-in, and flyers first. Buy seeds, pots, and kit inventory only after demand exists.",
  items: [
    { id: "notebook", name: "Notebook / clipboard", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "signin", name: "Member sign-in sheet", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "nametags", name: "Name tags", qty: "1 pack", estCost: "$3–8", notes: "Essential" },
    { id: "pens", name: "Pens", qty: "1 pack", estCost: "$2–5", notes: "Essential" },
    { id: "calendar", name: "Printed / shared calendar", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "phone", name: "Phone", qty: "1", estCost: "$0", notes: "Essential — use what you own" },
    { id: "flyers", name: "Flyers", qty: "1 set", estCost: "$0–8", notes: "Essential" },
    { id: "refs", name: "Gardening references", qty: "1", estCost: "$0–10", notes: "Helpful", optional: true },
    { id: "seeds", name: "Seeds", qty: "as needed", estCost: "$4–15", notes: "As needed — do not buy large inventory first", optional: true },
    { id: "pots", name: "Pots", qty: "as needed", estCost: "$5–20", notes: "As needed", optional: true },
    { id: "soil", name: "Soil", qty: "as needed", estCost: "$6–18", notes: "As needed", optional: true },
    { id: "labels", name: "Plant labels", qty: "1 pack", estCost: "$3–8", notes: "As needed", optional: true },
    { id: "gloves", name: "Gloves", qty: "1 pair", estCost: "$4–10", notes: "As needed", optional: true },
    { id: "tools", name: "Hand tools", qty: "1 set", estCost: "$8–20", notes: "As needed", optional: true },
    { id: "cans", name: "Watering cans", qty: "1–2", estCost: "$6–15", notes: "As needed", optional: true },
    { id: "tables", name: "Tables / containers for demos", qty: "as needed", estCost: "$0–25", notes: "As needed — borrow first", optional: true },
    { id: "demo", name: "Demonstration plants", qty: "as needed", estCost: "$5–20", notes: "As needed", optional: true },
    { id: "kit-seeds", name: "Seed packets for kits / workshops", qty: "as needed", estCost: "$8–15", notes: "After demand", optional: true },
    { id: "starter-pots", name: "Starter pots / soil discs", qty: "as needed", estCost: "$6–18", notes: "After demand", optional: true },
    { id: "cards", name: "Instruction cards / printed guides", qty: "1 set", estCost: "$3–10", notes: "Kits / workshops", optional: true },
    { id: "bags", name: "Bags / boxes for kits", qty: "as needed", estCost: "$4–12", notes: "Kits / workshops", optional: true },
  ],
};

export const START_GARDENING_CLUB_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "sgc_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Rules, agendas, and workshop sheets",
    url: "https://docs.google.com/",
  },
  {
    id: "sgc_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Members, dues, expenses, and inventory",
    url: "https://sheets.google.com/",
  },
  {
    id: "sgc_forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Interest surveys and RSVPs",
    url: "https://forms.google.com/",
  },
  {
    id: "sgc_calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Meetings and events",
    url: "https://calendar.google.com/",
  },
  {
    id: "sgc_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Flyers and materials",
    url: "https://www.canva.com/",
  },
  {
    id: "sgc_email",
    name: "Email / text group",
    freePlanAvailable: true,
    costNote: "Member communication — permission required",
  },
  {
    id: "sgc_facebook",
    name: "Facebook Group / Page",
    freePlanAvailable: true,
    costNote: "Optional community space",
    url: "https://www.facebook.com/",
    optional: true,
  },
  {
    id: "sgc_register",
    name: "Registration / payment tools",
    freePlanAvailable: true,
    costNote: "Optional when dues, workshops, or kits are charged",
    optional: true,
  },
  {
    id: "sgc_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Form + Member Sheet + Calendar + Flyer + Monthly Agenda",
  },
];

export const START_GARDENING_CLUB_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "A gardening club can stay completely free. Charge only when members receive clear value.",
    "",
    "FREE CLUB MODEL",
    "Dues: $0. Free meetups, swaps, projects, and peer learning.",
    "",
    "OPTIONAL DUES (starter examples)",
    "$3–$10/month per member OR $25–$75/year.",
    "Charge only when members receive supplies, demonstrations, meeting costs, speakers, shared tools, or activities.",
    "",
    "PAID WORKSHOPS",
    "Mini Demo: $5–$15/person",
    "Standard Hands-On Workshop: $15–$35/person",
    "Specialty Workshop: $25–$60+/person depending on materials, topic, and instructor.",
    "",
    "STARTER KITS",
    "Simple Seed Starter Kit: $8–$15",
    "Container Garden Kit: $15–$35",
    "Specialty Kit: $25–$60+",
    "",
    "MONTHLY SCENARIOS — EXAMPLES, NOT GUARANTEES",
    "Community-Only Club: $0",
    "Small Dues Club: $50–$150/month",
    "Dues + Small Workshop: $100–$300/month",
    "Growing Workshops/Kits Club: $200–$750+/month gross before expenses.",
    "",
    "Club Revenue − Venue − Materials − Kit Supplies − Printing − Speakers/Instructors − Payment Fees − Insurance/Permits if applicable − Other Expenses = Net Amount Available.",
    "Do NOT automatically treat money collected as personal profit. Keep records.",
  ].join("\n"),
  raiseTip:
    "Price only after demand exists. Displayed $0 – $750+ / month is example only. Club money is not automatically organizer profit. Examples only — not income guarantees.",
  items: [
    { id: "free", label: "Free club model", price: "$0", notes: "Free meetups, swaps, projects, and peer learning" },
    { id: "dues-mo", label: "Optional monthly dues", price: "$3–$10 / member", notes: "Only when members receive clear value" },
    { id: "dues-yr", label: "Optional yearly dues", price: "$25–$75 / year", notes: "Starter example" },
    { id: "mini", label: "Mini demo", price: "$5–$15 / person" },
    { id: "workshop", label: "Standard hands-on workshop", price: "$15–$35 / person" },
    { id: "specialty", label: "Specialty workshop", price: "$25–$60+ / person" },
    { id: "seed-kit", label: "Simple seed starter kit", price: "$8–$15" },
    { id: "container-kit", label: "Container garden kit", price: "$15–$35" },
    { id: "specialty-kit", label: "Specialty kit", price: "$25–$60+" },
  ],
};

/** Exactly 11 authored core steps. Marketing stages = steps 6–8. Use ☐ only. */
export const START_GARDENING_CLUB_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Club Purpose",
    desc: [
      "Write one sentence:",
      "“Our gardening club helps [WHO] learn/share [WHAT] through [ACTIVITIES].”",
      "",
      "Choose only 3–5 core activities at first, such as:",
      "☐ Monthly meetups",
      "☐ Seasonal planting",
      "☐ Seed / plant swaps",
      "☐ Container-gardening demos",
      "☐ Beginner lessons",
      "☐ Garden tours",
      "☐ Shared beautification projects",
      "",
      "Community first. Income is optional.",
    ].join("\n"),
  },
  {
    title: "Find Your First 5–10 Interested Members",
    desc: [
      "Ask neighbors, friends, community-center participants, gardeners, retirees, families, or appropriate local groups.",
      "",
      "Survey:",
      "Name | Gardening experience | Interests | Best day/time | Favorite activity | Contact permission",
      "",
      "Confirm interest before spending heavily. Do not buy a shed of supplies first.",
    ].join("\n"),
  },
  {
    title: "Choose Meeting Place & Schedule",
    desc: [
      "Consider a community center, library room where permitted, clubhouse, community garden, church/community organization, approved member garden, or online planning.",
      "",
      "Start monthly or twice monthly.",
      "",
      "Check: accessibility · parking · restrooms · weather backup · capacity · facility rules.",
      "Get permission before planting, modifying property, collecting money, or holding regulated events.",
      "For home meetings, prefer RSVP-first rather than broadly publishing a private address.",
    ].join("\n"),
  },
  {
    title: "Create Simple Club Rules",
    desc: [
      "Write short rules covering:",
      "☐ Purpose",
      "☐ Eligibility",
      "☐ Schedule",
      "☐ Conduct",
      "☐ Safety",
      "☐ Children / guest rules",
      "☐ Photo permission",
      "☐ Swap expectations",
      "☐ Dues if any",
      "☐ Money handling",
      "☐ Cancellation / weather policy",
      "",
      "State clearly whether funds belong to the club, reimburse expenses, fund activities, or pay a legitimate organizer/instructor fee.",
    ].join("\n"),
  },
  {
    title: "Plan the First 3 Months",
    desc: [
      "Example calendar:",
      "Month 1: Welcome + “What Do You Grow?” + seed swap",
      "Month 2: Container Gardening demo",
      "Month 3: Seasonal planting workshop + plant exchange",
      "",
      "Track: Date | Topic | Leader | Supplies | Cost | RSVP | Backup plan.",
      "",
      "Keep the first season simple. Ask members what they want before adding paid extras.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about the club.",
      "",
      "Pick only 2 or 3 this launch.",
      "",
      "Possible channels:",
      "☐ Community center",
      "☐ Neighborhood referrals",
      "☐ Facebook local group",
      "☐ Nextdoor",
      "☐ Church / community bulletin",
      "☐ Library / community board where permitted",
      "☐ Community garden",
      "☐ Senior / community organizations",
      "☐ Nursery partnership",
      "",
      "Write ONE measurable goal for each channel (examples: invite 20 residents, get 10 RSVPs, recruit first 5 members).",
      "",
      "No spam.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a first-meetup flyer (Canva is fine):",
      "",
      "LOVE PLANTS? COME GROW WITH US!",
      "[CLUB NAME]",
      "Beginner-friendly gardening meetups",
      "Seasonal tips • Plant/seed swaps • Workshops • Community",
      "First Meetup: __________",
      "Location: __________",
      "Cost: Free / $____",
      "RSVP: __________",
      "",
      "Also make: one-line hook · short description · next-date card.",
      "For home meetings, prefer RSVP-first rather than broadly publishing a private address.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2 or 3 channels selected.",
      "",
      "Invite, collect RSVPs, and host the first meetup:",
      "Welcome attendees · explain purpose · introduce members · do one simple activity · ask what they want next · collect contact permission · announce the next date.",
      "",
      "Track: Invited | RSVPed | Attended | Joined | Feedback.",
      "",
      "Do not skip the first meetup to “get more marketing ready.” Host, then improve.",
    ].join("\n"),
  },
  {
    title: "Run Plant Swaps & Seasonal Activities",
    desc: [
      "Swap rules:",
      "☐ Healthy plants only",
      "☐ Label when possible",
      "☐ No known pest-infested material",
      "☐ State free / swap terms",
      "☐ Avoid prohibited / invasive plants where applicable",
      "☐ Clean shared tools and areas",
      "",
      "Seasonal ideas:",
      "Spring seedlings · summer watering / container care · fall bulbs / harvest · winter planning / indoor plants.",
    ].join("\n"),
  },
  {
    title: "Add Optional Paid Workshops or Starter Kits",
    desc: [
      "Add these only after demand exists.",
      "",
      "Workshop ideas: Container Gardening 101 · Seed Starting · Herb Gardens · Houseplants · Raised-Bed Planning · Seasonal Prep.",
      "",
      "Before selling, calculate: materials · capacity · price · inclusions · registration · supplies · expenses.",
      "For kits: make one sample, calculate cost per kit, test demand, then scale.",
      "",
      "Do not buy large inventory before testing demand.",
      "Avoid professional horticultural or pesticide claims outside your expertise.",
    ].join("\n"),
  },
  {
    title: "Review & Build the Next Seasonal Calendar",
    desc: [
      "Ask: what members enjoyed · what should change · what they want next · which events drew attendance · whether paid activities covered costs · what should remain free.",
      "",
      "Build the next 90 days.",
      "",
      "LISTEN → PLAN → MEET → TEACH/SHARE → TRACK → IMPROVE → REPEAT.",
    ].join("\n"),
  },
];

export function startGardeningClubToolsDisclaimer(): string {
  return "Beginner stack: Form + Member Sheet + Calendar + Flyer + Monthly Agenda. Start on free plans. Community first — add registration or payment tools only when dues, workshops, or kits are charged. Get venue/property permission before you plant, collect money, or sell.";
}

/** Monthly club-money math. Net is not automatically personal profit. */
export function computeStartGardeningClubNet(input: {
  payingMembers?: number;
  monthlyDues?: number;
  workshopAttendees?: number;
  workshopPrice?: number;
  kitsSold?: number;
  kitPrice?: number;
  otherRevenue?: number;
  venue?: number;
  workshopMaterials?: number;
  kitMaterials?: number;
  printingMarketing?: number;
  speakerInstructor?: number;
  paymentFees?: number;
  insurancePermits?: number;
  otherExpenses?: number;
}): {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyNet: number;
  duesRevenue: number;
  workshopRevenue: number;
  kitRevenue: number;
} {
  const duesRevenue =
    Math.max(0, Number(input.payingMembers) || 0) * Math.max(0, Number(input.monthlyDues) || 0);
  const workshopRevenue =
    Math.max(0, Number(input.workshopAttendees) || 0) * Math.max(0, Number(input.workshopPrice) || 0);
  const kitRevenue = Math.max(0, Number(input.kitsSold) || 0) * Math.max(0, Number(input.kitPrice) || 0);
  const monthlyRevenue = duesRevenue + workshopRevenue + kitRevenue + Math.max(0, Number(input.otherRevenue) || 0);
  const monthlyExpenses =
    Math.max(0, Number(input.venue) || 0) +
    Math.max(0, Number(input.workshopMaterials) || 0) +
    Math.max(0, Number(input.kitMaterials) || 0) +
    Math.max(0, Number(input.printingMarketing) || 0) +
    Math.max(0, Number(input.speakerInstructor) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.insurancePermits) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  return {
    duesRevenue,
    workshopRevenue,
    kitRevenue,
    monthlyRevenue,
    monthlyExpenses,
    monthlyNet: monthlyRevenue - monthlyExpenses,
  };
}
