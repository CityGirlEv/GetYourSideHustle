/**
 * Senior Tech Helper / Smartphone Tutor (`tech-helper`, Guide #101).
 * Teach beginners to use their own phone — do not take over or handle money.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const TECH_HELPER_REALITY_CHECK = {
  title: "TEACH, DON'T TAKE OVER",
  body: [
    "The goal is not to grab the phone and do everything for the client.",
    "",
    "Use: SHOW IT → DO IT TOGETHER → LET THEM DO IT → WRITE IT DOWN → PRACTICE AGAIN",
    "",
    "Never ask for or store banking passwords, credit/debit card PINs, Social Security numbers, password-manager master passwords, account recovery codes, or other unnecessary sensitive information.",
    "",
    "Whenever possible, let the client type their own passwords and verification codes.",
    "",
    "Do not move money, purchase gift cards, send cryptocurrency, remotely access financial accounts, or respond to suspicious “urgent” payment requests for the client.",
    "",
    "If something looks like a scam, STOP before clicking, calling, paying, downloading, or sharing information.",
    "",
    "This is tutoring and basic setup — not advanced device repair, cybersecurity investigation, financial management, or professional IT support.",
    "",
    "Tagline: Less Tech Stress. More Confidence. One Tap at a Time.",
  ].join("\n"),
};

export const TECH_HELPER_NOTES_WORKSHEET = `MY TECH-HELP SERVICE

Starter Session: ________
Session Length: ________
Price: $____
Service Area: ________
Travel Fee if any: $____

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT SESSION

Client: ________
Date: ________
Device: ________
Phone Type: ________

TOP 3 GOALS:
1. ________
2. ________
3. ________

Accessibility Needs:
__________

TODAY WE PRACTICED:
☐ Calls
☐ Contacts
☐ Texts
☐ Photos
☐ Video Calls
☐ Wi-Fi
☐ Accessibility
☐ Apps
☐ Maps
☐ Calendar
☐ Games
☐ Scam Safety
☐ Other: ________

SETTINGS CHANGED WITH PERMISSION:
__________

CHEAT SHEET CREATED: ☐

CLIENT COMPLETED TASK ALONE: ☐

NEXT LESSON:
__________

BUSINESS RESULTS

Session Revenue: $____
Expenses: $____
Estimated Profit: $____
Total Time Including Travel/Admin: ____
Effective Profit/Hour: $____

Client Happy:
☐ Yes
☐ Needs More Practice

Rebooked:
☐ Yes
☐ Maybe
☐ No

GYSH PRO TIP
IF YOU TOUCH THE PHONE EVERY TIME THEY GET STUCK, THEY LEARN THAT YOU CAN USE THEIR PHONE.
IF YOU WAIT, COACH, AND LET THEM TAP THE BUTTON THEMSELVES, THEY LEARN THAT THEY CAN USE THEIR PHONE.
Your goal is CONFIDENCE, not speed.
Use: ONE SKILL → SLOW DEMONSTRATION → REPEAT → LARGE-PRINT NOTES → INDEPENDENT PRACTICE

ELITE CHALLENGE
CREATE A 3-SESSION SMARTPHONE CONFIDENCE PROGRAM.
SESSION 1 — PHONE BASICS: calls, contacts, texts, text size, volume
SESSION 2 — STAY CONNECTED: photos, sharing pictures, video calls
SESSION 3 — SMART & SAFE: apps, simple online games, scam awareness, independent practice
Create: intake sheet · 3 lesson plans · large-print cheat-sheet template · scam-safety card · progress checklist · follow-up/rebooking message
Practice teaching each skill WITHOUT taking the phone away from the learner.`;

export const TECH_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Help older adults, grandparents, neighbors, and other beginners become more comfortable with smartphones and everyday technology. Teach practical skills such as sending pictures, making video calls, organizing contacts, adjusting accessibility settings, using common apps, and playing simple online games. Tagline: Less Tech Stress. More Confidence. One Tap at a Time. Category: Tech Help / Personal Tutoring. Best for Teens, Adults, Seniors / Retirees. Beginner to intermediate · Very low startup · Flexible / recurring · Client home / community / remote when appropriate · Per session / package / recurring · 2 - 8 hrs/week · Elite Membership. Displayed pricing: $10 – $25 / hour (examples).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Patience · Clear communication · Basic smartphone knowledge · Familiarity with common iPhone/Android functions · Ability to explain without jargon · Smartphone/computer for demonstrations · Notes/checklist · Reliable transportation if in-person · Safe meeting process.",
  },
  {
    id: "helpful",
    label: "Helpful skills",
    detail:
      "Wi-Fi basics · Contacts · Texting · Photos · Video calling · App installation · Accessibility settings · Basic account/security concepts · Scam awareness · Simple games/apps.",
  },
  {
    id: "before",
    label: "Before a session",
    detail:
      "Ask phone/device type · Ask what the client wants to learn · Choose 1–3 goals · Confirm session length · Confirm price · Ask whether a trusted family member should participate · Avoid promising repair, data recovery, or security outcomes.",
  },
  {
    id: "privacy",
    label: "Privacy & money",
    detail:
      "Never store passwords, PINs, Social Security numbers, recovery codes, or financial account details. Let the client type their own passwords and codes. Do not move money, buy gift cards, send cryptocurrency, or remotely access financial accounts.",
  },
];

export const TECH_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Docs", url: "https://docs.google.com/", note: "Large-print cheat sheets" },
  { label: "Canva", url: "https://www.canva.com/", note: "Easy-to-read flyers and step cards" },
  { label: "Google Meet", url: "https://meet.google.com/", note: "Video-call practice" },
  { label: "Zoom", url: "https://zoom.us/", note: "Video-call practice if the client already uses it" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Session reminders" },
];

export const TECH_HELPER_SUPPLIES = {
  starterKitTotal: "About $5–20 for notes, cheat sheets, and a charger you already own",
  items: [
    { id: "phone", name: "Smartphone", qty: "1", estCost: "$0", notes: "Essential — use yours for demos; client uses theirs" },
    { id: "charger", name: "Charger / cables", qty: "1", estCost: "$0–10", notes: "Essential" },
    { id: "notebook", name: "Notebook or printed lesson sheet", qty: "1", estCost: "$2–6", notes: "Essential" },
    { id: "pen", name: "Pen", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "checklist", name: "Client goal checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "calendar", name: "Calendar", qty: "1", estCost: "$0", notes: "Essential — phone or paper" },
    { id: "transport", name: "Transportation if in-person", qty: "as needed", estCost: "$0", notes: "Essential for home/community visits" },
    { id: "battery", name: "Portable battery", qty: "1", estCost: "$10–25", notes: "Helpful", optional: true },
    { id: "tablet", name: "Tablet / laptop for demonstrations", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "print", name: "Large-print instruction sheets", qty: "1 set", estCost: "$0–5", notes: "Helpful", optional: true },
    { id: "stylus", name: "Stylus", qty: "1", estCost: "$5–15", notes: "Helpful", optional: true },
    { id: "cloth", name: "Screen-cleaning cloth", qty: "1", estCost: "$2–6", notes: "Helpful", optional: true },
    { id: "stand", name: "Phone stand", qty: "1", estCost: "$5–12", notes: "Helpful", optional: true },
    { id: "magnifier", name: "Magnifier", qty: "1", estCost: "$4–10", notes: "Helpful where needed", optional: true },
  ],
};

export const TECH_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "th_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Large-print cheat sheets and lesson notes",
    url: "https://docs.google.com/",
  },
  {
    id: "th_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Session goals and settings you changed with permission",
  },
  {
    id: "th_phone",
    name: "Phone / text / email",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Client communication — no extra app required",
  },
  {
    id: "th_settings",
    name: "iPhone / Android Settings",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Accessibility, contacts, photos, and messaging on the client's device",
  },
  {
    id: "th_facetime",
    name: "FaceTime",
    freePlanAvailable: true,
    costNote: "Video-call practice where supported",
    optional: true,
  },
  {
    id: "th_whatsapp",
    name: "WhatsApp",
    freePlanAvailable: true,
    costNote: "Video only if the client already uses it",
    url: "https://www.whatsapp.com/",
    optional: true,
  },
  {
    id: "th_applecal",
    name: "Apple Calendar",
    freePlanAvailable: true,
    costNote: "Session reminders if the client uses iPhone",
    optional: true,
  },
  {
    id: "th_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Large-print cheat sheets and flyers",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "th_meet",
    name: "Google Meet",
    freePlanAvailable: true,
    costNote: "Video-call practice when FaceTime is not the client’s app",
    url: "https://meet.google.com/",
    optional: true,
  },
  {
    id: "th_zoom",
    name: "Zoom",
    freePlanAvailable: true,
    costNote: "Video-call practice if the client already uses it",
    url: "https://zoom.us/",
    optional: true,
  },
  {
    id: "th_gcal",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Session reminders and rebooks",
    url: "https://calendar.google.com/",
    optional: true,
  },
  {
    id: "th_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Client's Phone + Notes + Large-Print Cheat Sheet + Practice",
  },
];

export const TECH_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Displayed pricing: $10 – $25 / hour (examples).",
    "",
    "Quote the session before beginning. Do not turn a basic tutoring session into unpaid all-day tech support.",
    "",
    "Any paid work for minors should use guardian-approved payment, communication, and client arrangements.",
    "",
    "Pricing varies by market, experience, travel, and scope. Examples only — not income guarantees.",
  ].join("\n"),
  raiseTip:
    "After 3–5 happy clients, raise 10–20% or add a travel fee. Possible packages: 3 sessions at an agreed price. Examples only — not income guarantees.",
  items: [
    { id: "quick", label: "Quick tech lesson (30 minutes)", price: "$15–$25", notes: "One focused skill" },
    { id: "standard", label: "Standard smartphone session (60 minutes)", price: "$25–$45", notes: "Up to 3 learning goals + cheat sheet" },
    { id: "extended", label: "Extended / multi-topic session (90 minutes)", price: "$40–$65+", notes: "Only when the client agrees in advance" },
    { id: "pack", label: "3-session package", price: "Agreed package price", notes: "Basics → stay connected → smart & safe" },
    { id: "addon", label: "Add-ons", price: "Quoted separately", notes: "Printed cheat sheet, extra device, extra household member, travel beyond your area, follow-up, photo organization, accessibility setup" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Never ✓. */
export const TECH_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Tech-Help Lessons",
    desc: [
      "Start with everyday skills you can confidently teach.",
      "",
      "Possible lessons:",
      "☐ Make/answer calls",
      "☐ Add contacts",
      "☐ Send text messages",
      "☐ Send pictures",
      "☐ Take better photos",
      "☐ Make video calls",
      "☐ Connect to Wi-Fi",
      "☐ Adjust text size/volume",
      "☐ Use voice assistant/dictation",
      "☐ Download an app safely",
      "☐ Use maps",
      "☐ Set alarms/reminders",
      "☐ Organize photos",
      "☐ Play simple online games",
      "☐ Recognize suspicious messages",
      "☐ Basic privacy/security settings",
      "",
      "Write:",
      "I TEACH: ________",
      "I DO NOT OFFER: ________",
    ].join("\n"),
  },
  {
    title: "Create Your Starter Session",
    desc: [
      "Example:",
      "",
      "SMARTPHONE CONFIDENCE SESSION",
      "- 60 minutes",
      "- Up to 3 learning goals",
      "- Hands-on practice",
      "- Personalized large-print cheat sheet",
      "- Final practice round",
      "",
      "Price: $____",
      "Travel Area: ________",
      "",
      "Ask the client to choose their top 3:",
      "1. ________",
      "2. ________",
      "3. ________",
      "",
      "Avoid trying to teach 15 things in one hour. See Suggested Pricing — $10 – $25 / hour (examples).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3 this month.",
      "",
      "Strong trust-based channels:",
      "☐ Friends/family",
      "☐ Referrals",
      "☐ Neighborhood groups",
      "☐ Senior/community centers",
      "☐ Churches/faith communities",
      "☐ Libraries where permitted",
      "☐ Retirement/community groups",
      "☐ Local bulletin boards",
      "☐ Facebook community groups",
      "",
      "Write:",
      "What I Offer: Friendly Smartphone & Everyday Tech Lessons",
      "Starting Price: $____",
      "Service Area: ________",
      "",
      "Set one measurable goal per channel.",
      "Examples:",
      "- Tell 10 people",
      "- Ask 5 people for referrals",
      "- Contact 3 senior/community organizations",
      "- Post one approved local service announcement",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple, easy-to-read flyer. Use large readable type and plain language.",
      "",
      "Sample:",
      "",
      "PHONE MAKING YOU CRAZY?",
      "",
      "I can help you learn:",
      "- Send Pictures",
      "- Make Video Calls",
      "- Use Text Messages",
      "- Make Text Bigger",
      "- Organize Contacts",
      "- Use Everyday Apps",
      "- Play Simple Online Games",
      "- Spot Suspicious Messages",
      "",
      "Patient, step-by-step help.",
      "You keep control of your phone and passwords.",
      "",
      "Sessions start at $____.",
      "Contact: ________",
      "",
      "Do not imply you are certified IT, cybersecurity, or repair support unless you truly hold those qualifications.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2–3 selected channels.",
      "",
      "This week:",
      "- Contact 8–12 appropriate people/organizations",
      "- Ask for referrals",
      "- Share your flyer",
      "- Respond promptly",
      "- Track inquiries",
      "",
      "Sample:",
      "“Hi! I provide patient, one-on-one smartphone help for people who want to feel more comfortable sending photos, making video calls, using apps, adjusting phone settings, and learning everyday tech. Sessions start at $____.”",
      "",
      "Track:",
      "Date | Person/Organization | Channel | Need | Response | Follow-Up",
      "",
      "Do not market yourself as certified IT/cybersecurity/repair support unless you truly hold those qualifications.",
    ].join("\n"),
  },
  {
    title: "Start with a Tech Confidence Check",
    desc: [
      "At the beginning ask:",
      "“What would you LOVE to be able to do by yourself when I leave?”",
      "",
      "Record:",
      "Device: ________",
      "Phone Type/Model if known: ________",
      "Main Goal: ________",
      "Goal 2: ________",
      "Goal 3: ________",
      "Vision/Hearing/Dexterity Needs: ________",
      "Preferred Learning Style: ________",
      "",
      "Then watch the client try the task before changing anything.",
      "",
      "Do not make unnecessary settings/account changes.",
    ].join("\n"),
  },
  {
    title: "Make the Phone Easier to Use",
    desc: [
      "With permission, review useful accessibility/usability settings such as:",
      "- Text size",
      "- Display zoom",
      "- Brightness",
      "- Volume",
      "- Ringtone",
      "- Haptics/vibration",
      "- Voice typing/dictation",
      "- Voice assistant",
      "- Magnification",
      "- Hearing/accessibility features",
      "- Home-screen organization",
      "",
      "Change ONE thing at a time.",
      "Ask whether the client likes the change.",
      "Document important changes so they can be reversed.",
    ].join("\n"),
  },
  {
    title: "Teach the Core Task Using Repeatable Practice",
    desc: [
      "Use:",
      "1. Explain in plain language",
      "2. Demonstrate slowly",
      "3. Client repeats it",
      "4. Client repeats it WITHOUT your help",
      "5. Write the steps down",
      "",
      "Example — SEND A PHOTO:",
      "1. Open Photos",
      "2. Choose picture",
      "3. Tap Share",
      "4. Choose Messages",
      "5. Choose person",
      "6. Tap Send",
      "",
      "Then say: “Now you do it.”",
      "",
      "Do not rush to touch the screen when the client pauses. Give them time to remember.",
    ].join("\n"),
  },
  {
    title: "Teach Video Calls, Apps & Simple Online Fun",
    desc: [
      "Choose only what the client wants.",
      "",
      "VIDEO CALL:",
      "Practice starting, answering, muting, switching camera, ending call.",
      "",
      "APPS:",
      "Teach how to identify the correct app, review what it does, install only with client authorization, open it, and find it again later.",
      "",
      "GAMES:",
      "Choose age-appropriate simple games the client enjoys.",
      "Teach how to recognize ads/in-app purchases and avoid accidental purchases.",
      "",
      "Before any paid app/subscription:",
      "STOP and let the client review/authorize the purchase themselves.",
    ].join("\n"),
  },
  {
    title: "Add a Scam & Safety Mini-Lesson",
    desc: [
      "Teach a simple rule:",
      "STOP → DON'T PAY → DON'T SHARE → VERIFY ANOTHER WAY",
      "",
      "Red flags:",
      "- “Pay immediately”",
      "- Gift card requests",
      "- Cryptocurrency requests",
      "- “Your account is locked”",
      "- Unexpected remote-access requests",
      "- Fake tech-support popups",
      "- “Your grandchild is in trouble”",
      "- Requests for verification codes",
      "- Unexpected links/attachments",
      "- Pressure to keep something secret",
      "",
      "If a message claims to be from a bank, company, government agency, or family member, verify through a trusted phone number/app/contact method rather than using the suspicious message's link or number.",
      "",
      "Do not personally investigate or guarantee that something is safe.",
    ].join("\n"),
  },
  {
    title: "Create the Cheat Sheet & Rebook",
    desc: [
      "End with a personalized cheat sheet.",
      "",
      "MY PHONE STEPS",
      "",
      "How to Send a Picture:",
      "1. ________",
      "2. ________",
      "3. ________",
      "",
      "How to Make a Video Call:",
      "1. ________",
      "2. ________",
      "3. ________",
      "",
      "My Important Phone Feature:",
      "__________",
      "",
      "SCAM REMINDER:",
      "STOP. DON'T PAY. DON'T SHARE. VERIFY.",
      "",
      "Then have the client complete one task without help.",
      "",
      "Ask: “What would you like to learn next time?”",
      "",
      "Possible next session: photos · video calls · maps · calendar · accessibility · email · online games · photo organization · basic online shopping safety · scam awareness",
      "",
      "SHOW → PRACTICE TOGETHER → CLIENT DOES IT → WRITE IT DOWN → REPEAT → CONFIDENCE",
    ].join("\n"),
  },
];

export function techHelperToolsDisclaimer(): string {
  return "Beginner stack: Client's Phone + Notes + Large-Print Cheat Sheet + Practice. Use the client's actual device whenever possible because buttons and settings differ by model. Let the client type their own passwords. Do not store credentials or handle money.";
}

/** Weekly Senior Tech Helper profit math. */
export function computeTechHelperProfit(input: {
  averageSessionFee: number;
  sessionsPerWeek: number;
  packageFollowUpRevenue?: number;
  travelFuel?: number;
  printing?: number;
  advertising?: number;
  supplies?: number;
  otherBusinessExpenses?: number;
  averageSessionHours?: number;
  averageTravelAdminHoursPerSession?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.averageSessionFee) || 0);
  const sessions = Math.max(0, Number(input.sessionsPerWeek) || 0);
  const addOns = Math.max(0, Number(input.packageFollowUpRevenue) || 0);
  const weeklyRevenue = fee * sessions + addOns;
  const weeklyExpenses =
    Math.max(0, Number(input.travelFuel) || 0) +
    Math.max(0, Number(input.printing) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.otherBusinessExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const hoursPer =
    Math.max(0, Number(input.averageSessionHours) || 0) +
    Math.max(0, Number(input.averageTravelAdminHoursPerSession) || 0);
  const weeklyHours = hoursPer * sessions;
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
