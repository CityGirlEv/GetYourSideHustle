/**
 * Kids Party Game Host (`kids-party-game-host`, Guide #078).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const KIDS_PARTY_GAME_HOST_REALITY_CHECK = {
  title: "YOUR JOB IS TO KEEP THE FUN MOVING!",
  body: "Great party hosts do not need complicated games. Choose simple activities, explain them quickly, involve everyone, watch the group's energy, and always have a backup game ready.",
};

/** Party Host Planner shown above freeform Notes for this guide. */
export const KIDS_PARTY_GAME_HOST_NOTES_WORKSHEET = `My Party Host Planner

My Party Packages
________________________________
________________________________
________________________________

My Best Games
________________________________
________________________________
________________________________

Games by Age
Ages 4–6:
________________________________
Ages 7–9:
________________________________
Ages 10–12:
________________________________

Party
Client Name: ________________
Date: ________  Time: ________
Location: ________________
Birthday Child Age: ________
Number of Kids: ________
Theme: ________________
Indoor / Outdoor: ________

Planned Games
1. ________________________________
2. ________________________________
3. ________________________________
4. ________________________________
5. ________________________________

Backup Games
1. ________________________________
2. ________________________________

Supplies Needed
________________________________
________________________________

Special Requests
________________________________

Amount Charged: $________
Expenses: $________
Profit: $________

Client Feedback
________________________________

What Worked Best?
________________________________

What Would I Change?
________________________________

BEGINNER CHALLENGE — HOST A PRACTICE PARTY
Before charging your first client, host 30 minutes of games for family or friends.
Practice: explaining rules, starting/stopping games, managing teams, keeping kids involved, changing activities, and watching the clock.
Ask the adults for feedback afterward.`;

export const KIDS_PARTY_GAME_HOST_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Get paid to lead fun, age-appropriate games and activities at children's birthday parties, family celebrations, reunions, and community events. Tagline: You Bring the Fun. Parents Enjoy the Party. Category: Events / Kids Services. Best for teens and adults. Beginner-friendly · Low startup cost · Weekends / flexible · Client location / local · Service-based income.",
  },
  {
    id: "you-do-not-need",
    label: "You do not need",
    detail: "You do not need to be a professional entertainer.",
  },
  {
    id: "you-do-need",
    label: "You DO need",
    detail:
      "Friendly, energetic personality · Comfortable working with children · Ability to explain simple rules · Patience · Dependability · Basic organization · Transportation or a reliable ride · Smartphone · Age-appropriate game ideas.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "Experience with children · Babysitting or camp experience · First aid / CPR knowledge · Public speaking confidence.",
  },
  {
    id: "not-childcare",
    label: "IMPORTANT — entertainment, not childcare",
    detail:
      "A parent/guardian or responsible adult should remain responsible for supervising children unless separately contracted and legally permitted. This service is entertainment / game hosting, NOT childcare.",
  },
  {
    id: "teen-hosts",
    label: "For teen hosts",
    detail:
      "A parent/guardian should help establish appropriate safety, transportation, payment, and client-contact procedures.",
  },
  {
    id: "beginner-challenge",
    label: "Beginner challenge — Host a Practice Party",
    detail:
      "Before charging your first client, host 30 minutes of games for family or friends. Practice explaining rules, starting/stopping games, managing teams, keeping kids involved, changing activities, and watching the clock. Ask the adults for feedback afterward.",
  },
];

export const KIDS_PARTY_GAME_HOST_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Flyers, game cards, scorecards, package graphics",
  },
  {
    label: "Google Forms",
    url: "https://docs.google.com/forms/",
    note: "Client intake form",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Bookings and party times",
  },
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Travel time to the party",
  },
];

export const KIDS_PARTY_GAME_HOST_SUPPLIES = {
  starterKitTotal:
    "About $15–50 for a reusable Party Game Kit — start lean with inexpensive supplies you can reuse at multiple parties",
  items: [
    {
      id: "tote",
      name: "Large tote / bin",
      qty: "1",
      estCost: "$5–15",
      notes: "Basics — holds the whole kit",
    },
    {
      id: "cones",
      name: "Cones",
      qty: "4–8",
      estCost: "$6–15",
      notes: "Basics",
    },
    {
      id: "balloons",
      name: "Balloons",
      qty: "1 pack",
      estCost: "$3–8",
      notes: "Basics",
    },
    {
      id: "soft-balls",
      name: "Soft balls",
      qty: "2–4",
      estCost: "$5–12",
      notes: "Basics",
    },
    {
      id: "bean-bags",
      name: "Bean bags",
      qty: "1 set",
      estCost: "$5–12",
      notes: "Basics",
    },
    {
      id: "hula",
      name: "Hula hoops",
      qty: "2–4",
      estCost: "$8–18",
      notes: "Basics",
    },
    {
      id: "jump-ropes",
      name: "Jump ropes",
      qty: "2–4",
      estCost: "$5–12",
      notes: "Basics",
    },
    {
      id: "cups",
      name: "Plastic cups",
      qty: "1 pack",
      estCost: "$2–6",
      notes: "Basics",
    },
    {
      id: "spoons",
      name: "Spoons",
      qty: "1 pack",
      estCost: "$2–5",
      notes: "Basics",
    },
    {
      id: "tape",
      name: "Painter's tape",
      qty: "1 roll",
      estCost: "$3–8",
      notes: "Basics",
    },
    {
      id: "index",
      name: "Index cards",
      qty: "1 pack",
      estCost: "$2–5",
      notes: "Basics",
    },
    {
      id: "markers",
      name: "Markers",
      qty: "1 pack",
      estCost: "$3–8",
      notes: "Basics",
    },
    {
      id: "speaker",
      name: "Music speaker",
      qty: "1",
      estCost: "$15–40",
      notes: "Basics — phone speaker works to start",
    },
    {
      id: "timer",
      name: "Stopwatch / timer",
      qty: "1",
      estCost: "$0–8",
      notes: "Basics — phone timer is fine",
    },
    {
      id: "prizes",
      name: "Small prizes / stickers",
      qty: "1 pack",
      estCost: "$4–12",
      notes: "Basics",
    },
    {
      id: "sanitizer",
      name: "Hand sanitizer",
      qty: "1",
      estCost: "$2–5",
      notes: "Basics",
    },
    {
      id: "parachute",
      name: "Parachute",
      qty: "1",
      estCost: "$20–40",
      optional: true,
      notes: "Optional",
    },
    {
      id: "limbo",
      name: "Limbo stick",
      qty: "1",
      estCost: "$5–12",
      optional: true,
      notes: "Optional",
    },
    {
      id: "props",
      name: "Themed props",
      qty: "Assorted",
      estCost: "$5–20",
      optional: true,
      notes: "Optional",
    },
    {
      id: "medals",
      name: "Medals / ribbons",
      qty: "1 pack",
      estCost: "$5–15",
      optional: true,
      notes: "Optional",
    },
    {
      id: "game-cards",
      name: "Printable game cards",
      qty: "1 set",
      estCost: "$0–5",
      optional: true,
      notes: "Optional — print at home",
    },
    {
      id: "costume",
      name: "Costume accessories",
      qty: "Assorted",
      estCost: "$5–20",
      optional: true,
      notes: "Optional",
    },
  ],
};

/**
 * Party Host Tools — lives on the Tools tab (apps + host toolkit).
 */
export const KIDS_PARTY_GAME_HOST_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "party_spotify",
    name: "Spotify / Apple Music",
    freePlanAvailable: true,
    costNote: "Create kid-friendly party playlists · free tiers available (verify in app)",
    url: "https://open.spotify.com/",
  },
  {
    id: "party_timer",
    name: "Phone Timer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Keep games moving — prevent one activity from taking too much party time · $0 on your phone",
  },
  {
    id: "party_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Track bookings and party times",
    url: "https://calendar.google.com/",
  },
  {
    id: "party_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Plan travel time to the party",
    url: "https://maps.google.com/",
  },
  {
    id: "party_forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Simple client intake form",
    url: "https://docs.google.com/forms/",
  },
  {
    id: "party_pay",
    name: "Venmo / Cash App / PayPal",
    freePlanAvailable: true,
    costNote: "Possible payment options where appropriate and permitted · verify age / parent rules",
    url: "https://venmo.com/",
  },
  {
    id: "party_notes",
    name: "Notes App",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Keep game lists and backup activities ready · $0 on your phone",
  },
  {
    id: "party_weather",
    name: "Weather App",
    freePlanAvailable: true,
    costNote: "Important for outdoor parties · free on phone",
  },
  {
    id: "party_toolkit",
    name: "GYSH Party Host Toolkit",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "1) Game List — What will we play? · 2) Timer — Keep things moving · 3) Music Playlist — Keep the energy up · 4) Client Intake Form — Know the party details · 5) Backup Game List — Always have Plan B",
  },
];

export const KIDS_PARTY_GAME_HOST_PRICING = {
  tabLabel: "Simple Party Packages",
  intro: [
    "Example starting prices — not income guarantees. Pricing varies by location, experience, group size, supplies, and party requirements.",
    "",
    "Quote formula: Time + Supplies + Travel + Special Requests + Desired Profit = Party Price.",
    "",
    "Do not underprice large groups. Hosting games for 25 children requires more work than hosting 6.",
  ].join("\n"),
  raiseTip:
    "After 3–5 happy parties, raise 10–20% or add a rush / large-group fee. Examples only — not income guarantees.",
  items: [
    {
      id: "mini",
      label: "MINI PARTY — 30–45 minutes · 3–4 games",
      price: "$40–$60",
      notes: "Starter package",
    },
    {
      id: "classic",
      label: "CLASSIC PARTY — 60 minutes · 5–6 games",
      price: "$60–$100",
      notes: "Most common starter booking",
    },
    {
      id: "plus",
      label: "PARTY PLUS — 90 minutes · 6–8 games",
      price: "$90–$150",
      notes: "Longer celebrations / larger energy",
    },
    {
      id: "extra-time",
      label: "Add-on: Extra 30 minutes",
      price: "$25–$50",
    },
    {
      id: "themed",
      label: "Add-on: Themed games",
      price: "$15–$30",
    },
    {
      id: "prizes",
      label: "Add-on: Small prizes",
      price: "Cost + markup",
    },
    {
      id: "large",
      label: "Add-on: Large party / group",
      price: "Additional fee",
      notes: "Price for headcount — don’t underprice 20+ kids",
    },
    {
      id: "travel",
      label: "Add-on: Travel outside normal service area",
      price: "Additional fee",
    },
  ],
};

/**
 * Core launch steps (exactly 11 playbook steps).
 * Foundation + marketing titles + closing are applied by finalize.
 */
export const KIDS_PARTY_GAME_HOST_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose the age groups you are comfortable hosting",
    desc: "Decide which ages you can lead well (for example 4–6, 7–9, 10–12). Stick to groups you can keep safe, engaged, and moving — with a parent/guardian present for supervision.",
  },
  {
    title: "Create a list of 15–20 easy games",
    desc: [
      "Build a reusable menu of simple, age-fit activities. Examples:",
      "Freeze Dance · Simon Says · Musical Chairs · Relay Races · Balloon Keep-Up · Hot Potato · Scavenger Hunt · Red Light Green Light · Bean Bag Toss · Limbo.",
      "Write your full list in Notes (My Best Games + Games by Age).",
    ].join("\n"),
  },
  {
    title: "Build a small reusable Party Game Kit",
    desc: "Pack a tote with basics from the Supply List (cones, balloons, soft balls, bean bags, tape, prizes, sanitizer, speaker/timer). GYSH tip: do not buy everything at once — start with inexpensive supplies you can reuse at multiple parties.",
  },
  {
    title: "Create 2–3 simple party packages",
    desc: "Offer Mini (30–45 min), Classic (60 min), and optionally Party Plus (90 min) with clear game counts and prices. Use Suggested Pricing as a starting point, then adjust for your market and group size.",
  },
  {
    title: "Make a basic flyer/social post advertising your service",
    desc: "In Canva, create one flyer or social post: service name, package options, ages you host, service area, and how to book. Share with family, neighbors parents know, school/community boards, and parent-approved local groups.",
  },
  {
    title: "Ask the client for party details",
    desc: "Before you confirm: child’s age · number of children · party location · indoor/outdoor · party theme · available space · party length · special requests. Use Google Forms or Notes for intake. Confirm a parent/guardian will remain responsible for supervising children.",
  },
  {
    title: "Choose games appropriate for the ages, space, and group size",
    desc: "Match games to the birthday child’s age, headcount, indoor/outdoor setup, and theme. Skip games that need more space or calm than the party can support.",
  },
  {
    title: "Create a simple party game schedule plus 2 backup games",
    desc: "Write a timed run-of-show (warm-up → high energy → calmer → finale) and always list 2 backup games if energy drops, weather changes, or a game flops. Keep the timer ready.",
  },
  {
    title: "Arrive 15–20 minutes early and set up",
    desc: "Check in with the hosting adult, stage your kit, set cones/tape lines, cue music, and confirm where kids should gather. Be ready before guests arrive.",
  },
  {
    title: "Host the games",
    desc: "Explain rules simply, keep everyone involved, encourage kids, watch the time, and smoothly switch games when energy drops. Your job is to keep the fun moving — not to invent complicated new games on the spot.",
  },
  {
    title: "Clean up, collect payment, and thank the client",
    desc: "Pack your supplies, collect payment as agreed (cash or parent-approved Venmo/Cash App/PayPal where permitted), thank the client, and ask for a review plus a referral to other parents. Log amount charged, expenses, and profit in Notes and the Revenue Calculator.",
  },
  {
    title: "Pick how you will tell people about your side hustle",
    desc: "Choose 2–3 warm channels this month: family/friends of parents, school or community boards (with approval), local parent Facebook/Nextdoor groups (parent-approved), and your flyer/social post. Focus on birthday parties and family celebrations in your service area.",
  },
  {
    title: "Make your marketing materials",
    desc: "Finish your Canva flyer, a short text-message pitch, package price sheet, and Google Form intake. Keep a printed game list + backup list in your tote so you look prepared on every booking.",
  },
  {
    title: "Carry out the marketing plan",
    desc: "Send your flyer/pitch to 5–10 warm contacts, post where parents already look (with approval), and follow up once. After each party, ask for a review/referral and log what worked in your Party Host Planner.",
  },
];

export function kidsPartyGameHostToolsDisclaimer(): string {
  return [
    "Party Host Tools — apps and habits that keep parties on time and kids engaged.",
    "",
    "GYSH PARTY HOST TOOLKIT",
    "1. Game List — What will we play?",
    "2. Timer — Keep things moving.",
    "3. Music Playlist — Keep the energy up.",
    "4. Client Intake Form — Know the party details.",
    "5. Backup Game List — Always have Plan B.",
  ].join("\n");
}
