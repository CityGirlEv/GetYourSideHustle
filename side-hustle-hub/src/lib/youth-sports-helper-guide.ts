/**
 * Youth Sports Practice Helper (`youth-sports-helper`, Guide #117).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const YOUTH_SPORTS_HELPER_REALITY_CHECK = {
  title: "YOU HELP — THE COACH COACHES",
  body: "Your job is to make practice easier to run. Set up, organize, retrieve equipment, help with check-ins and cleanup, and follow the coach's directions.",
};

/** Practice Helper Planner shown above freeform Notes for this guide. */
export const YOUTH_SPORTS_HELPER_NOTES_WORKSHEET = `Practice Helper Planner

Team / Coach: ________________
Sport: ________________
Age Group: ________________
Coach Phone: ________________

Practice Location: ________________
Practice Days: ________________
Practice Time: ________________
Pay Per Practice: $________

My Responsibilities:
________________________________
________________________________

BEFORE
☐ Check-in
☐ Cones
☐ Balls
☐ Water
☐ Equipment

DURING
Coach Instructions:
________________________________
________________________________

AFTER
☐ Balls
☐ Cones
☐ Equipment
☐ Area cleaned

Marketing Channels Chosen:
1. __________________
2. __________________
3. __________________

Marketing Goals:
________________________________

People/Teams Contacted:
________________________________

Hours Worked: ________
Amount Earned: $________
Next Practice: ________________

Special Instructions:
________________________________

Notes:
________________________________
________________________________

GYSH PRO TIP — BECOME THE COACH'S RIGHT HAND
Arrive early. Learn the routine. Know where equipment goes. Stay organized. Be dependable.
A coach who can count on you may hire you for the entire season.`;

export const YOUTH_SPORTS_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Help youth coaches keep practices organized by setting up cones and equipment, checking players in, organizing water breaks, retrieving balls, resetting drills, and cleaning up. Tagline: You Don't Coach the Team. You Help Practice Run Smoothly. Category: Sports / Youth Services. Best for teens, adults, and seniors / retirees. Beginner · Very low startup · After school / evenings / weekends · Local fields / gyms · Hourly / per practice / recurring.",
  },
  {
    id: "clients",
    label: "Potential clients",
    detail:
      "Youth sports coaches · Parents who coach · Recreation leagues · Sports clubs · Camps · Community programs · Private youth teams. Sports may include soccer, baseball, softball, basketball, football, volleyball, tennis, track, and other youth activities.",
  },
  {
    id: "requirements",
    label: "Basic requirements",
    detail:
      "Dependable and organized · Comfortable around children · Able to follow coach instructions · Able to stand/walk during practice · Smartphone · Reliable transportation / ride plan.",
  },
  {
    id: "tasks",
    label: "Typical tasks",
    detail:
      "Set up cones/equipment · Player check-in · Organize water area · Collect balls · Reset equipment · Distribute pinnies/bibs · Simple attendance · Cleanup.",
  },
  {
    id: "helper-not-coach",
    label: "IMPORTANT — practice helper, not the coach",
    detail:
      "Do not provide unauthorized coaching, make medical decisions, transport players without proper authorization, or take children away from the supervised practice area. Youth organizations may require background checks, training, waivers, or other screening. Follow each organization's requirements.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Become the coach's right hand",
    detail:
      "Arrive early. Learn the routine. Know where equipment goes. Stay organized. Be dependable. A coach who can count on you may hire you for the entire season.",
  },
];

export const YOUTH_SPORTS_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Docs",
    url: "https://docs.google.com/",
    note: "Monthly marketing plan and service materials",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Hours, payments, teams, and outreach tracking",
  },
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Simple flyer or social graphic",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Practices and games",
  },
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Leagues, fields, recreation centers, and travel",
  },
];

export const YOUTH_SPORTS_HELPER_SUPPLIES = {
  starterKitTotal:
    "About $0–25 for personal gear if you already have athletic clothes and a phone — most team equipment is provided by the coach; do not purchase team equipment unless agreed upon",
  items: [
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential — use what you own",
    },
    {
      id: "water",
      name: "Water bottle",
      qty: "1",
      estCost: "$0–10",
      notes: "Essential — for you",
    },
    {
      id: "clothes",
      name: "Athletic clothing",
      qty: "1 set",
      estCost: "$0",
      notes: "Essential — comfortable for practice",
    },
    {
      id: "shoes",
      name: "Appropriate shoes",
      qty: "1 pair",
      estCost: "$0",
      notes: "Essential — field/gym appropriate",
    },
    {
      id: "sunscreen",
      name: "Sunscreen (outdoor practices)",
      qty: "1",
      estCost: "$5–12",
      notes: "Essential for outdoor practices",
    },
    {
      id: "notebook",
      name: "Notebook / pen",
      qty: "1",
      estCost: "$2–5",
      notes: "Essential",
    },
    {
      id: "clipboard",
      name: "Clipboard",
      qty: "1",
      estCost: "$3–8",
      optional: true,
      notes: "Helpful for check-in / attendance",
    },
    {
      id: "battery",
      name: "Portable charger",
      qty: "1",
      estCost: "$0–25",
      optional: true,
      notes: "Helpful for long practices",
    },
    {
      id: "stopwatch",
      name: "Stopwatch",
      qty: "1",
      estCost: "$0–10",
      optional: true,
      notes: "Helpful — phone timer works",
    },
    {
      id: "checklist",
      name: "Equipment checklist",
      qty: "1",
      estCost: "$0–3",
      optional: true,
      notes: "Helpful — print or Notes app",
    },
  ],
};

export const YOUTH_SPORTS_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "ysh_timer",
    name: "Phone Timer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Practice segments and water breaks when directed · $0 on your phone",
  },
  {
    id: "ysh_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Track practices and games",
    url: "https://calendar.google.com/",
  },
  {
    id: "ysh_notes",
    name: "Notes App",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Coach instructions · $0 on your phone",
  },
  {
    id: "ysh_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Hours, payments, teams, and outreach tracking",
    url: "https://sheets.google.com/",
  },
  {
    id: "ysh_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Create monthly marketing plan and simple service materials",
    url: "https://docs.google.com/",
  },
  {
    id: "ysh_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Create a simple flyer or social graphic",
    url: "https://www.canva.com/",
  },
  {
    id: "ysh_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Locate leagues, fields, recreation centers, and plan travel",
    url: "https://maps.google.com/",
  },
  {
    id: "ysh_weather",
    name: "Weather App",
    freePlanAvailable: true,
    costNote: "Outdoor conditions · free on phone",
  },
  {
    id: "ysh_team",
    name: "Team Communication App",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Use the team's system when authorized (TeamSnap, GroupMe, text thread, etc.)",
  },
  {
    id: "ysh_stack",
    name: "Beginner Tool Stack + GYSH Rule",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "1) Coach's Practice Plan · 2) Equipment Checklist · 3) Attendance List · 4) Phone Timer · 5) Google Docs/Sheets · 6) Canva. GYSH RULE: Follow the coach's system instead of creating your own rules for the team.",
  },
];

export const YOUTH_SPORTS_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Example beginner rates — not income guarantees. Pricing varies by location, age, experience, time, and responsibilities.",
    "",
    "GYSH tip: Recurring teams can create predictable income for an entire season.",
  ].join("\n"),
  raiseTip:
    "After a few dependable practices, ask about a season package or tournament/event help. Examples only — not income guarantees.",
  items: [
    {
      id: "per-practice",
      label: "PER PRACTICE — 60–90 minutes",
      price: "$20–$35",
      notes: "Common beginner booking",
    },
    {
      id: "longer",
      label: "LONGER PRACTICE — 90–120 minutes",
      price: "$30–$50",
      notes: "More setup / cleanup time",
    },
    {
      id: "hourly",
      label: "HOURLY",
      price: "$15–$25/hour",
      notes: "Example beginner range",
    },
    {
      id: "recurring",
      label: "RECURRING TEAM — 2 practices/week × 4 weeks",
      price: "$160–$280+/month",
      notes: "Depends on time and responsibilities",
    },
    {
      id: "tournament",
      label: "Add-on: Tournament / event help",
      price: "Additional fee",
    },
    {
      id: "extra-time",
      label: "Add-on: Extra setup / cleanup",
      price: "Additional fee",
    },
    {
      id: "equip",
      label: "Add-on: Equipment organization",
      price: "Additional fee",
    },
    {
      id: "checkin",
      label: "Add-on: Team check-in assistance",
      price: "Often included · or additional fee",
    },
  ],
};

/**
 * Core launch steps (exactly 11). Steps 3–5 are the required marketing block
 * (Choose channels / Make materials / Carry out), tailored to practice helping.
 * Foundation + closing are applied by finalize.
 */
export const YOUTH_SPORTS_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose what you will help with",
    desc: [
      "Choose sports and age groups you're comfortable around.",
      "",
      "Services can include:",
      "☐ Practice setup",
      "☐ Player check-in",
      "☐ Equipment organization",
      "☐ Ball retrieval",
      "☐ Water-break setup",
      "☐ Drill reset",
      "☐ Practice cleanup",
      "☐ Tournament/event support",
      "",
      "Remember: You help. The coach coaches.",
    ].join("\n"),
  },
  {
    title: "Set your price",
    desc: [
      "Choose:",
      "☐ Per-practice rate",
      "☐ Hourly rate",
      "☐ Recurring team package",
      "",
      "Write your starter offer:",
      "“I provide youth sports practice support for $________.”",
      "",
      "See Suggested Pricing tab for starter prices.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about you — like a text, flyer, Facebook group, or talking directly with a coach.",
      "",
      "Do not try every way at once. Pick only 2 or 3 for this month.",
      "",
      "Checklist:",
      "☐ Open Google Docs from the Tools tab and start a new page for this month's marketing plan.",
      "☐ Write what you offer and your price at the top:",
      "“I help youth sports coaches with practice setup, player check-ins, equipment, water breaks, and cleanup.”",
      "“My starting price is $________ per practice.”",
      "“See the Suggested Pricing tab for starter prices.”",
      "",
      "☐ Check exactly 2 or 3 marketing channels:",
      "☐ Tell coaches/parents you already know",
      "☐ Text messages",
      "☐ Email local coaches/leagues",
      "☐ Printed flyer",
      "☐ Facebook community/parent groups",
      "☐ Nextdoor",
      "☐ Local recreation centers",
      "☐ Community bulletin boards",
      "☐ Youth sports clubs/leagues",
      "☐ Schools/community organizations where appropriate",
      "",
      "Write one measurable goal for each:",
      "☐ Goal 1: _______________________________",
      "Example: Contact 5 local youth coaches.",
      "☐ Goal 2: _______________________________",
      "Example: Post in 2 local community groups.",
      "☐ Goal 3 (optional): ____________________",
      "Example: Give 10 flyers to local sports programs.",
      "",
      "☐ Save the Doc and check activities off as you complete them.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create ONE simple flyer or social graphic in Canva (https://www.canva.com/).",
      "",
      "Include:",
      "YOUTH SPORTS PRACTICE HELPER",
      "Need an Extra Set of Hands at Practice?",
      "",
      "I can help with:",
      "☐ Practice setup",
      "☐ Cones & equipment",
      "☐ Player check-in",
      "☐ Water breaks",
      "☐ Ball retrieval",
      "☐ Drill resets",
      "☐ Cleanup",
      "",
      "Starting at $_____ per practice.",
      "Serving: ______________________",
      "Contact: ______________________________",
      "",
      "Add: “Practice support only — coaching remains with the team coach.”",
      "",
      "Also create one short message:",
      "“Hi! I offer youth sports practice help for local coaches. I can assist with setup, player check-in, equipment, water breaks, and cleanup so the coach can focus on coaching. My starting rate is $____ per practice. Message me if your team could use an extra set of hands.”",
      "",
      "For teen helpers: Have a parent/guardian review contact information and marketing plans before public posting.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, ONLY use the 2 or 3 channels you selected.",
      "",
      "Warm Contacts:",
      "☐ Contact 8–12 people you already know who may know coaches, sports parents, leagues, or youth programs.",
      "",
      "Sample message:",
      "“Hi! I’m offering youth sports practice help for local teams. I help with setup, check-ins, equipment, water breaks, and cleanup. If you know a coach who could use an extra set of hands, please send them my information.”",
      "",
      "Local Outreach:",
      "☐ Contact coaches, recreation programs, or sports clubs.",
      "☐ Ask permission before leaving flyers at fields, recreation centers, schools, or community facilities.",
      "",
      "Social:",
      "☐ Post in appropriate local Facebook/community groups.",
      "☐ Optional: Create a Facebook Page for your service.",
      "☐ Optional: Post on Nextdoor where appropriate.",
      "",
      "Safety:",
      "☐ Keep your full street address off public posts.",
      "☐ Teen helpers should involve a parent/guardian in public contact and meeting arrangements.",
      "",
      "Track and Follow Up:",
      "☐ Write each contact in Google Sheets: Date | Person/Organization | Channel | Response | Follow-Up",
      "☐ Reply promptly when someone responds.",
      "☐ Follow up politely with interested coaches.",
      "☐ Refresh your post/flyer as needed.",
    ].join("\n"),
  },
  {
    title: "Talk with the coach",
    desc: [
      "Ask:",
      "☐ Sport",
      "☐ Age group",
      "☐ Practice schedule",
      "☐ Location",
      "☐ Number of players",
      "☐ Practice length",
      "☐ What help is needed?",
      "☐ Who supervises players?",
      "☐ Any league/helper requirements?",
      "☐ Pay/rate",
      "",
      "Clearly agree on your responsibilities.",
    ].join("\n"),
  },
  {
    title: "Confirm the first practice",
    desc: [
      "Confirm: Date · Time · Location · Coach contact · Transportation · Pay · Arrival time · Responsibilities.",
      "",
      "Plan to arrive 15–20 minutes early.",
    ].join("\n"),
  },
  {
    title: "Set up practice",
    desc: [
      "Follow the coach's directions.",
      "",
      "Possible tasks:",
      "☐ Set cones",
      "☐ Set out balls",
      "☐ Prepare equipment",
      "☐ Organize water area",
      "☐ Prepare check-in list",
      "☐ Distribute pinnies/bibs",
    ].join("\n"),
  },
  {
    title: "Help during practice",
    desc: [
      "Stay available and organized.",
      "",
      "As directed:",
      "☐ Retrieve balls",
      "☐ Reset cones",
      "☐ Move equipment",
      "☐ Help with water breaks",
      "☐ Track attendance",
      "☐ Keep equipment area organized",
      "",
      "Do not take over coaching.",
    ].join("\n"),
  },
  {
    title: "Clean up",
    desc: [
      "After practice:",
      "☐ Collect balls",
      "☐ Collect cones",
      "☐ Gather equipment",
      "☐ Check that equipment is accounted for",
      "☐ Clean practice area",
      "☐ Ask coach if anything else is needed",
    ].join("\n"),
  },
  {
    title: "Get rebooked",
    desc: [
      "Confirm payment and record your earnings.",
      "",
      "Then ask: “Would you like me to help at your next practice?”",
      "",
      "If the coach is happy, offer recurring help: “I can also reserve your regular practice days each week.”",
      "",
      "Ask for a referral to another coach when appropriate.",
    ].join("\n"),
  },
];

export function youthSportsHelperToolsDisclaimer(): string {
  return [
    "Practice Helper Tools — follow the coach's system.",
    "",
    "BEGINNER TOOL STACK",
    "1. Coach's Practice Plan",
    "2. Equipment Checklist",
    "3. Attendance List",
    "4. Phone Timer",
    "5. Google Docs/Sheets",
    "6. Canva",
    "",
    "GYSH RULE: Follow the coach's system instead of creating your own rules for the team.",
  ].join("\n");
}
