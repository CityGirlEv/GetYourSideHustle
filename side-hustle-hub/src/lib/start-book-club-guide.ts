/**
 * Start a Book Club (`start-book-club`, Guide #104).
 * Community first, income optional. Club money is not automatically personal profit.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const START_BOOK_CLUB_REALITY_CHECK = {
  title: "THE BOOK IS THE START; THE COMMUNITY IS THE VALUE",
  body: [
    "A great book club does not need to make money. The first goal is a group people enjoy returning to.",
    "",
    "Keep it:",
    "Welcoming",
    "Easy to join",
    "Consistent",
    "Discussion-friendly",
    "Affordable",
    "Accessible",
    "",
    "Optional income should add value without making members feel pressured to buy extras.",
    "",
    "Do NOT automatically treat club money as personal profit. Clearly define whether funds belong to the club, reimburse expenses, fund future activities, or are legitimate organizer/facilitator income.",
    "",
    "Do not photocopy, scan, distribute, or reproduce copyrighted books beyond what applicable law and licenses permit.",
    "Do not imply an author is attending until confirmed.",
    "",
    "Tagline: Read Together. Talk Together. Build Community.",
  ].join("\n"),
};

export const START_BOOK_CLUB_NOTES_WORKSHEET = `MY BOOK CLUB PLAN

CLUB
Name: __________
Theme: __________
Audience: __________
Location: __________
Frequency: __________
Free / dues: __________
Communication: __________

MEMBERS
Name | Contact permission | Genres | Format preference | Accessibility | Attendance
__________
__________
__________

BOOK CALENDAR
Month | Book | Author | Host | Discussion lead | Location
__________
__________
__________

BOOK VOTING
Title | Nominated by | Votes | Selected
__________
__________
__________

MEETING
Date: __________
RSVPs: ____  Attendance: ____
Discussion notes: __________
Member feedback: __________
Next book: __________

MARKETING
Channel 1: __________
Channel 2: __________
Channel 3: __________
Invited: ____  RSVPs: ____  Joined: ____

PAID EXTRAS
Event / kit: __________
Price: $____  Quantity / attendance: ____
Revenue: $____  Expenses: $____  Net: $____

CLUB MONEY
Dues: $____
Events: $____
Kits: $____
Expenses: $____
Funds remaining: $____
Organizer compensation (if applicable): $____

GYSH PRO TIP
The secret is not choosing the “perfect” book.
It is making people want to come back.
GOOD BOOK → WELCOMING ROOM → GREAT QUESTIONS → EVERYONE GETS A VOICE → NEXT DATE IS ALREADY SET → REPEAT.

ELITE CHALLENGE
Launch a 90-day book club pilot:
1. Club name/theme
2. Interest survey
3. First 5–10 prospects
4. Location
5. Simple rules
6. Book-selection system
7. First 3 books/months
8. 10 discussion prompts
9. 2–3 marketing channels
10. Launch flyer
11. First-meeting agenda
12. One sample reading kit
13. One optional author-event plan
14. Budget
15. Attendance/feedback tracker`;

export const START_BOOK_CLUB_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Start a welcoming book club for peers with monthly reads, cozy guided discussions, member voting, themed gatherings, and optional paid author talks, reading kits, or special events. Tagline: Read Together. Talk Together. Build Community. Category: Community / Books / Clubs. Best for Adults, Seniors / Retirees; community groups. Beginner · $0–Low startup · Monthly / Flexible / Recurring · Home / Library / Community Center / Cafe / Online · Optional dues / author events / reading kits / workshops · 2 - 6 hrs/week · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Club purpose/theme · First 5–10 potential members · Meeting location or online option · Monthly schedule · Book-selection method · Communication method · Discussion format · Simple budget.",
  },
  {
    id: "decide",
    label: "Decide before launch",
    detail:
      "Club Name · Who It Serves · Book Types · Meeting Frequency · Meeting Location · Typical Meeting Length · Free or Dues-Based · How Books Are Selected.",
  },
  {
    id: "access",
    label: "Accessibility first",
    detail:
      "Consider large-print, ebook, audiobook, library availability, transportation, seating, hearing/visual needs, and virtual participation where practical.",
  },
  {
    id: "copyright",
    label: "Copyright & club money",
    detail:
      "Do not photocopy, scan, distribute, or reproduce copyrighted books beyond what applicable law and licenses permit. Do not automatically treat club money as personal profit — define whether funds belong to the club, reimburse expenses, fund future activities, or are legitimate organizer/facilitator income.",
  },
];

export const START_BOOK_CLUB_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Forms", url: "https://forms.google.com/", note: "Interest survey, book voting, RSVPs" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Members, attendance, dues, budget" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Agendas, discussion prompts, club rules" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Meetings" },
  { label: "Canva", url: "https://www.canva.com/", note: "Flyers, bookmarks, original club materials" },
  { label: "Facebook", url: "https://www.facebook.com/", note: "Optional private community" },
  { label: "Zoom", url: "https://zoom.us/", note: "Virtual / hybrid option" },
  { label: "Google Meet", url: "https://meet.google.com/", note: "Virtual / hybrid option" },
  { label: "WorldCat", url: "https://search.worldcat.org/", note: "Help members find legal borrowing options" },
  { label: "Libby / OverDrive", url: "https://www.overdrive.com/", note: "Library ebooks and audiobooks" },
];

export const START_BOOK_CLUB_SUPPLIES = {
  starterKitTotal:
    "About $0–25 to start — notebook, sign-in, name tags, and flyers first. Do not buy copies of books for everyone unless there is a clear reimbursement/budget plan.",
  items: [
    { id: "notebook", name: "Notebook / clipboard", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "signin", name: "Member sign-in sheet", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "pens", name: "Pens", qty: "1 pack", estCost: "$2–5", notes: "Essential" },
    { id: "nametags", name: "Name tags", qty: "1 pack", estCost: "$3–8", notes: "Essential" },
    { id: "calendar", name: "Printed / shared calendar", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "questions", name: "Discussion questions", qty: "1 set", estCost: "$0–4", notes: "Essential" },
    { id: "voting", name: "Book-voting sheet", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "phone", name: "Phone / laptop", qty: "1", estCost: "$0", notes: "Essential — use what you own" },
    { id: "flyers", name: "Flyers", qty: "1 set", estCost: "$0–8", notes: "Essential" },
    { id: "refreshments", name: "Refreshments", qty: "as needed", estCost: "$8–20", notes: "Optional", optional: true },
    { id: "bookmarks", name: "Bookmarks", qty: "as needed", estCost: "$3–10", notes: "Original club materials only", optional: true },
    { id: "journals", name: "Reading journals", qty: "as needed", estCost: "$5–15", notes: "Kits / extras", optional: true },
    { id: "cards", name: "Discussion cards", qty: "1 set", estCost: "$4–12", notes: "Original prompts — do not copy book text", optional: true },
    { id: "decor", name: "Table decorations", qty: "as needed", estCost: "$0–15", notes: "Optional", optional: true },
    { id: "tents", name: "Name tents", qty: "1 pack", estCost: "$3–8", notes: "Optional", optional: true },
    { id: "speaker-eq", name: "Speaker equipment", qty: "as needed", estCost: "$0–40", notes: "Author talks — borrow first", optional: true },
    { id: "kit-packaging", name: "Reading-kit packaging", qty: "as needed", estCost: "$4–12", notes: "After demand", optional: true },
  ],
};

export const START_BOOK_CLUB_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "sbc_forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Interest survey, book voting, RSVPs",
    url: "https://forms.google.com/",
  },
  {
    id: "sbc_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Members, attendance, dues, budget",
    url: "https://sheets.google.com/",
  },
  {
    id: "sbc_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Agendas, discussion prompts, club rules",
    url: "https://docs.google.com/",
  },
  {
    id: "sbc_calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Meetings",
    url: "https://calendar.google.com/",
  },
  {
    id: "sbc_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Flyers, bookmarks, original club materials",
    url: "https://www.canva.com/",
  },
  {
    id: "sbc_email",
    name: "Email / text group",
    freePlanAvailable: true,
    costNote: "Reminders — permission required",
  },
  {
    id: "sbc_facebook",
    name: "Facebook Group",
    freePlanAvailable: true,
    costNote: "Optional private community",
    url: "https://www.facebook.com/",
    optional: true,
  },
  {
    id: "sbc_zoom",
    name: "Zoom / Meet",
    freePlanAvailable: true,
    costNote: "Virtual / hybrid option",
    url: "https://zoom.us/",
    optional: true,
  },
  {
    id: "sbc_library",
    name: "Library catalog / apps",
    freePlanAvailable: true,
    costNote: "Help members find legal borrowing options",
    url: "https://search.worldcat.org/",
  },
  {
    id: "sbc_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Google Form + Member Sheet + Calendar + Discussion Guide + Reminder Message",
  },
];

export const START_BOOK_CLUB_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "A great book club does not need to make money. Charge only when members receive clear value.",
    "",
    "FREE CLUB MODEL",
    "Membership: $0",
    "Members obtain/borrow their own books.",
    "Use libraries, personal copies, ebooks, or audiobooks.",
    "",
    "OPTIONAL DUES",
    "Starter example: $3 – $10/month OR $25 – $75/year.",
    "Use dues only for clearly explained club expenses/benefits such as refreshments, room costs, printed club materials, speaker support, or shared activities.",
    "",
    "SPECIAL AUTHOR TALKS / EVENTS",
    "Member Ticket: $5 – $20/person",
    "Premium/Special Event: $15 – $40+/person depending on speaker, venue, refreshments, and format.",
    "",
    "READING KITS",
    "Simple Discussion Kit: $5 – $12",
    "Themed Reading Kit: $12 – $25",
    "Premium Gift/Reading Kit: $25 – $50+ depending on contents.",
    "Kits can include ORIGINAL club-created materials such as bookmarks, journal pages, discussion cards, pens, snacks/tea where appropriate, and themed items the organizer has the right to sell.",
    "Do not reproduce copyrighted book text/artwork without permission.",
    "",
    "OPTIONAL FACILITATED BOOK DISCUSSION / WORKSHOP",
    "$10 – $30/person for an enhanced themed session, writing/reflection activity, or educational discussion where appropriate.",
    "",
    "MONTHLY REVENUE SCENARIOS — EXAMPLES, NOT GUARANTEES",
    "Community-Only Club: $0",
    "Small Dues Club: $30 – $100/month",
    "Dues + Kits: $75 – $250/month",
    "Special Event Month: $150 – $500+/month gross before expenses",
    "",
    "Club Revenue − Venue − Refreshments − Kit Materials − Speaker/Author Fees − Printing − Marketing − Payment Fees − Other Expenses = Net Amount Available.",
    "Do NOT automatically treat club money as personal profit. Clearly define whether funds belong to the club, reimburse expenses, fund future activities, or are legitimate organizer/facilitator income.",
  ].join("\n"),
  raiseTip:
    "Price extras only after the club has traction. Displayed $0 – $500+ / month is example only. Club money is not automatically organizer profit. Examples only — not income guarantees.",
  items: [
    { id: "free", label: "Free club model", price: "$0", notes: "Members obtain/borrow their own books" },
    { id: "dues-mo", label: "Optional monthly dues", price: "$3–$10 / member", notes: "Only for clearly explained club expenses/benefits" },
    { id: "dues-yr", label: "Optional yearly dues", price: "$25–$75 / year", notes: "Starter example" },
    { id: "event", label: "Author talk / event (member ticket)", price: "$5–$20 / person" },
    { id: "premium-event", label: "Premium / special event", price: "$15–$40+ / person" },
    { id: "simple-kit", label: "Simple discussion kit", price: "$5–$12" },
    { id: "themed-kit", label: "Themed reading kit", price: "$12–$25" },
    { id: "premium-kit", label: "Premium gift / reading kit", price: "$25–$50+" },
    { id: "workshop", label: "Facilitated discussion / workshop", price: "$10–$30 / person" },
  ],
};

/** Exactly 11 authored core steps. Marketing stages = steps 6–8. Use ☐ only. */
export const START_BOOK_CLUB_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Book Club",
    desc: [
      "Choose theme and audience.",
      "",
      "Examples:",
      "☐ General Fiction",
      "☐ Mystery / Thriller",
      "☐ Romance",
      "☐ Black Authors",
      "☐ History",
      "☐ Personal Growth",
      "☐ Memoir",
      "☐ Faith-Based",
      "☐ Senior Readers",
      "☐ Banned / Challenged Books where appropriate",
      "☐ Local Authors",
      "☐ Mix-It-Up Monthly",
      "",
      "Write:",
      "“Our book club brings together [WHO] to read and discuss [TYPE OF BOOKS] in a [VIBE] setting.”",
      "",
      "The book is the start; the community is the value. Income is optional.",
    ].join("\n"),
  },
  {
    title: "Find Your First 5–10 Members",
    desc: [
      "Invite peers, neighbors, friends, community-center participants, library patrons where outreach is permitted, church/community contacts, or appropriate local groups.",
      "",
      "Interest form:",
      "Name | Favorite Genres | Preferred Format | Best Day/Time | In-Person/Virtual | Accessibility Needs | Contact Permission",
      "",
      "Start small enough that everyone can participate.",
      "Consider large-print, ebook, audiobook, and library availability when you ask about preferred format.",
    ].join("\n"),
  },
  {
    title: "Choose Location, Frequency & Access",
    desc: [
      "Possible locations:",
      "☐ Library meeting room",
      "☐ Community center",
      "☐ Clubhouse",
      "☐ Cafe / restaurant with permission",
      "☐ Bookstore event space",
      "☐ Church / community room",
      "☐ Member home",
      "☐ Online / hybrid",
      "",
      "Monthly is a strong beginner schedule.",
      "",
      "Check capacity, noise, seating, parking, accessibility, restroom access, food rules, closing time, and reservation requirements.",
      "For home meetings, prefer RSVP-first rather than broadly publishing a private residence address.",
    ].join("\n"),
  },
  {
    title: "Create Club Rules & Book-Selection System",
    desc: [
      "Keep rules simple:",
      "☐ Respect different opinions",
      "☐ No personal attacks",
      "☐ Avoid dominating discussion",
      "☐ Give others room to speak",
      "☐ Spoiler expectations",
      "☐ Attendance / RSVP",
      "☐ Guest policy",
      "☐ Photo permission",
      "☐ Dues / refunds if applicable",
      "",
      "Book selection options:",
      "☐ Member nominations + vote",
      "☐ Rotating member pick",
      "☐ Seasonal theme",
      "☐ Organizer shortlist + member vote",
      "",
      "Set selection 4–8 weeks ahead when possible so members have time to borrow/buy/read.",
      "State clearly whether funds belong to the club, reimburse expenses, fund future activities, or pay a legitimate organizer/facilitator fee.",
      "Do not photocopy, scan, distribute, or reproduce copyrighted books beyond what applicable law and licenses permit.",
    ].join("\n"),
  },
  {
    title: "Plan the First 3 Months",
    desc: [
      "Create:",
      "Month 1 | Book | Host | Location | Discussion Lead",
      "Month 2 | Book | Host | Location | Discussion Lead",
      "Month 3 | Book | Host | Location | Discussion Lead",
      "",
      "For each meeting prepare:",
      "☐ Welcome",
      "☐ Icebreaker",
      "☐ 5–10 discussion prompts",
      "☐ Favorite quote/scene discussion without unlawfully reproducing substantial text",
      "☐ Member reactions",
      "☐ Next-book announcement",
      "☐ Social time",
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
      "☐ Friends / peer referrals",
      "☐ Community center",
      "☐ Library / community board where permitted",
      "☐ Facebook local group",
      "☐ Nextdoor",
      "☐ Church / community group",
      "☐ Senior organization",
      "☐ Bookstore partnership",
      "☐ Local author network",
      "☐ Neighborhood newsletter",
      "",
      "Write ONE measurable goal for each channel.",
      "",
      "Examples:",
      "Invite 20 people",
      "Get 10 RSVPs",
      "Launch with 6 members",
      "",
      "No spam.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a flyer/post:",
      "",
      "LOVE A GOOD BOOK AND A GREAT CONVERSATION?",
      "Join [CLUB NAME]",
      "Monthly reads • Cozy discussions • New connections",
      "First Book: ________",
      "Meeting: ________",
      "Location: ________",
      "Cost: Free / $____",
      "RSVP: ________",
      "",
      "Also create:",
      "☐ Welcome message",
      "☐ Meeting reminder",
      "☐ Book-voting form",
      "☐ Bring-a-friend message",
      "",
      "For home meetings, avoid broadly publishing a private residence address; provide details after RSVP where appropriate.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2 or 3 channels selected.",
      "",
      "At the first meeting:",
      "☐ Welcome everyone",
      "☐ Introduce club purpose",
      "☐ Quick introductions",
      "☐ Use an easy icebreaker",
      "☐ Discuss the book",
      "☐ Invite quieter members into conversation without pressure",
      "☐ Vote / confirm next book",
      "☐ Collect feedback",
      "☐ Announce next date",
      "",
      "Track: Invited | RSVPed | Attended | Joined | Returning.",
      "",
      "Do not skip the first meeting to “get more marketing ready.” Host, then improve.",
    ].join("\n"),
  },
  {
    title: "Create Better Discussions & Member Experiences",
    desc: [
      "Use question types:",
      "☐ What surprised you?",
      "☐ Which character/idea stayed with you?",
      "☐ What did you agree/disagree with?",
      "☐ Did your opinion change?",
      "☐ What theme mattered most?",
      "☐ Who would you recommend this to?",
      "☐ How did the ending work for you?",
      "",
      "Add optional fun:",
      "☐ Theme snack",
      "☐ Book-inspired playlist using lawful services",
      "☐ Trivia",
      "☐ Character vote",
      "☐ Reading journal",
      "☐ Book rating",
      "☐ Member spotlight",
      "",
      "Do not make meetings feel like school. Conversation matters more than “correct” answers.",
      "Do not reproduce substantial copyrighted book text.",
    ].join("\n"),
  },
  {
    title: "Add Optional Author Talks, Kits or Paid Events",
    desc: [
      "After the club has traction, test ONE paid enhancement.",
      "",
      "AUTHOR TALK:",
      "☐ Contact author / representative",
      "☐ Agree on date / format / fee",
      "☐ Confirm recording / photo rights",
      "☐ Set capacity / ticket price",
      "☐ Promote",
      "☐ Collect RSVPs / payment",
      "☐ Host Q&A",
      "",
      "READING KIT:",
      "Create one sample first.",
      "Calculate materials.",
      "Use original / licensed items.",
      "Test preorders before buying inventory.",
      "",
      "SPECIAL EVENT:",
      "Theme night, local-author showcase, facilitated discussion, reading journal workshop, or literary outing.",
      "",
      "Do not imply an author is attending until confirmed.",
      "Do not reproduce copyrighted book text/artwork without permission.",
      "Track legitimate organizer/facilitator compensation separately from club funds.",
    ].join("\n"),
  },
  {
    title: "Review, Retain Members & Build the Next 90 Days",
    desc: [
      "Ask:",
      "☐ Did members enjoy the book?",
      "☐ Was discussion balanced?",
      "☐ Was meeting length right?",
      "☐ Was location comfortable?",
      "☐ Which genres should we read?",
      "☐ What would make members return?",
      "☐ Which paid extras, if any, are wanted?",
      "",
      "Build the next 3-month calendar.",
      "",
      "BOOK CLUB CYCLE:",
      "CHOOSE → READ → MEET → DISCUSS → CONNECT → VOTE → REPEAT.",
    ].join("\n"),
  },
];

export function startBookClubToolsDisclaimer(): string {
  return "Beginner stack: Google Form + Member Sheet + Calendar + Discussion Guide + Reminder Message. Start on free plans. Community first — add payment tools only when dues, kits, or events are charged. Club money is not automatically personal profit. Do not photocopy copyrighted books. Do not imply an author is attending until confirmed.";
}

/** Monthly club-money math. Net is not automatically personal profit. */
export function computeStartBookClubProfit(input: {
  payingMembers?: number;
  monthlyDues?: number;
  eventAttendees?: number;
  eventPrice?: number;
  kitsSold?: number;
  kitPrice?: number;
  workshopRevenue?: number;
  otherRevenue?: number;
  venue?: number;
  refreshments?: number;
  kitMaterials?: number;
  authorSpeaker?: number;
  printing?: number;
  marketing?: number;
  paymentFees?: number;
  otherExpenses?: number;
}): {
  duesRevenue: number;
  eventRevenue: number;
  kitRevenue: number;
  workshopRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyNet: number;
} {
  const duesRevenue =
    Math.max(0, Number(input.payingMembers) || 0) * Math.max(0, Number(input.monthlyDues) || 0);
  const eventRevenue =
    Math.max(0, Number(input.eventAttendees) || 0) * Math.max(0, Number(input.eventPrice) || 0);
  const kitRevenue = Math.max(0, Number(input.kitsSold) || 0) * Math.max(0, Number(input.kitPrice) || 0);
  const workshopRevenue = Math.max(0, Number(input.workshopRevenue) || 0);
  const monthlyRevenue =
    duesRevenue + eventRevenue + kitRevenue + workshopRevenue + Math.max(0, Number(input.otherRevenue) || 0);
  const monthlyExpenses =
    Math.max(0, Number(input.venue) || 0) +
    Math.max(0, Number(input.refreshments) || 0) +
    Math.max(0, Number(input.kitMaterials) || 0) +
    Math.max(0, Number(input.authorSpeaker) || 0) +
    Math.max(0, Number(input.printing) || 0) +
    Math.max(0, Number(input.marketing) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  return {
    duesRevenue,
    eventRevenue,
    kitRevenue,
    workshopRevenue,
    monthlyRevenue,
    monthlyExpenses,
    monthlyNet: monthlyRevenue - monthlyExpenses,
  };
}
