/**
 * AI-for-Peers Coffee Chat (`ai-peers`, Guide #028).
 * Friendly beginner AI education — office-hours pace, not tech jargon.
 * Plain data only (no imports from guide-tools).
 */

export const AI_PEERS_REALITY_CHECK = {
  title: "YOU ARE A PATIENT HOST, NOT AN AI ENGINEER",
  body: [
    "This side-hustle is friendly beginner AI education. You host coffee-chat style sessions so peers can try ChatGPT and everyday AI tools at an office-hours pace — not a technical lecture.",
    "",
    "You do not need to be an AI engineer. You do need basic confidence with ChatGPT, patience, plain-language explanations, and the habit of saying “I don’t know — let’s verify that.”",
    "",
    "Teach this workflow: AI DRAFT → HUMAN REVIEW → FACT CHECK → PERSONALIZE → USE/DELIVER.",
    "AI can misunderstand, make factual errors, invent information, be outdated, or be biased. Never guarantee AI accuracy or income.",
    "",
    "Never request or record passwords. Do not paste Social Security numbers, full financial account data, private medical records, confidential workplace or client data, or other unnecessary sensitive information into prompts.",
    "Important medical, legal, financial, tax, benefits, or safety decisions should be verified with appropriate authoritative or professional sources — not with an AI chat alone.",
    "",
    "Tagline: Friendly Pace. Everyday AI. No Jargon.",
  ].join("\n"),
};

export const AI_PEERS_NOTES_WORKSHEET = `AI-FOR-PEERS COFFEE CHAT NOTES

SESSION
Participant/Organization: ________
Date: ________
Format: 1:1 / Small Group / Private Group / Community Workshop / Series / Follow-Up
Participants: ____
Experience Level: ________
Topics: ________
Length: ________
Quote: $____

RESULTS
Revenue: $____
Expenses: $____
Profit: $____
Prep Time: ____ hrs
Teaching Time: ____ hrs
Total Time: ____ hrs
Profit/Hour: $____

SESSION NOTES
Tools Demonstrated: ________
Questions: ________
Topics Needing More Time: ________
Accessibility Needs: ________
Handout Given: ☐
Follow-Up Offered: ________
Feedback: ________
Referral: ________
Next Session: ________
Notes: ________

SAFETY CHECK
Passwords requested or recorded: never
Sensitive data kept out of prompts: ☐
AI DRAFT → HUMAN REVIEW → FACT CHECK explained: ☐
“I don’t know — let’s verify that” used when needed: ☐

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
People Reached: ____
Inquiries: ____
Booked Sessions: ____

GYSH PRO TIP
TEACH ONE EVERYDAY TASK WELL.

A slow, clear coffee chat about email drafts or photo organizing helps more than a jargon-filled tour of every AI tool.

WELCOME → ASK GOALS → PLAIN-LANGUAGE EXPLAIN → DEMO ONE PROMPT → PRACTICE → TAKE-HOME SHEET

ELITE CHALLENGE
Host one complete coffee-chat pilot:
1. Choose 3 beginner topics you can teach without jargon
2. Pick one format (1:1, small group, or workshop)
3. Write a one-page no-jargon lesson
4. Price 1:1, small-group, and one add-on
5. Prepare 2 demo prompts, 1 handout, and 1 privacy example
6. Choose 2–3 marketing channels
7. Make one flyer or post and one take-home prompt sheet
8. Carry out the outreach plan
9. Host at office-hours pace
10. Give practice time and answer questions
11. Collect feedback, track profit, and offer the next learning step
`;

export const AI_PEERS_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Host a friendly coffee-chat style session teaching peers ChatGPT and everyday AI tools — office hours pace, not tech jargon. Formats can include 1:1 chats, small groups, beginner office hours, private groups, community workshops, learning series, and follow-up sessions. Tagline: Friendly Pace. Everyday AI. No Jargon. Category: AI / Education. Best for patient hosts, especially peers and seniors. Beginner · $0 – Low · 2–8 hrs/week · Home / Library / Community Room / Zoom · $15–$40/hour (examples) · Elite Membership. You do NOT need to be an AI engineer.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Basic confidence using ChatGPT · Ability to demonstrate simple prompts · Patience and plain-language communication · Phone, tablet, or laptop · Internet when the session or demo requires it · Practice before teaching · Basic AI privacy and safety knowledge · An accessible setup (readable text, slow demos, extra practice time).",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "A short session outline · Demo prompts with no sensitive data · A one-page handout or digital cheat sheet · Google Calendar for booking · Zoom or Google Meet for virtual sessions · A simple tracker for sessions, revenue, expenses, and profit.",
  },
  {
    id: "host-stance",
    label: "Host stance",
    detail:
      "Be comfortable saying “I don’t know — let’s verify that.” Never pretend to be an AI engineer, clinician, attorney, tax advisor, or certified instructor unless you actually hold those credentials. Participant controls passwords and sensitive account data.",
  },
  {
    id: "safety",
    label: "Privacy and accuracy",
    detail:
      "Never request or record passwords. Do not paste Social Security numbers, full financial account data, private medical records, confidential workplace or client data, or other unnecessary sensitive information into prompts. Teach AI DRAFT → HUMAN REVIEW → FACT CHECK → PERSONALIZE → USE/DELIVER. Never guarantee AI accuracy or income.",
  },
];

export const AI_PEERS_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Primary demonstration tool — plans and interface can change" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Session outlines and handouts" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Share take-home resources without collecting passwords" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake and feedback" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Booking and reminders" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Sessions, revenue, expenses, and profit" },
  { label: "Canva", url: "https://www.canva.com/", note: "Handouts and simple flyers" },
  { label: "Zoom", url: "https://zoom.us/", note: "Virtual coffee chats" },
  { label: "Google Meet", url: "https://meet.google.com/", note: "Alternate virtual sessions" },
];

export const AI_PEERS_SUPPLIES = {
  starterKitTotal:
    "About $0–25 if you already have a laptop or tablet. No expensive equipment is required.",
  items: [
    { id: "laptop", name: "Laptop or tablet", qty: "1", estCost: "$0", notes: "Essential — device you already own" },
    { id: "phone", name: "Smartphone", qty: "1", estCost: "$0", notes: "Essential — booking, photos of the room, backup hotspot" },
    { id: "internet", name: "Internet access", qty: "1", estCost: "$0", notes: "Essential when the demo or virtual session needs it" },
    { id: "chargers", name: "Chargers", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "prompts", name: "Demo prompts (no sensitive data)", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "outline", name: "Session outline", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "notebook", name: "Notebook and pen", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "handout", name: "Participant handout or digital cheat sheet", qty: "1 set", estCost: "$0–8", notes: "Essential" },
    { id: "water", name: "Water", qty: "1", estCost: "$0–3", notes: "Essential for you; host-paid refreshments are optional" },
    { id: "projector", name: "Projector or display", qty: "1", estCost: "borrow/venue", notes: "Helpful for groups", optional: true },
    { id: "adapter", name: "Display adapter", qty: "1", estCost: "$0–15", notes: "If the venue screen needs it", optional: true },
    { id: "power", name: "Power strip used safely", qty: "1", estCost: "$0–12", notes: "Do not overload outlets", optional: true },
    { id: "cards", name: "Printed prompt cards", qty: "1 set", estCost: "$0–8", notes: "Optional practice cards", optional: true },
    { id: "nametags", name: "Name tags", qty: "1 pack", estCost: "$0–8", notes: "Small groups and workshops", optional: true },
    { id: "signin", name: "Sign-in sheet", qty: "1", estCost: "$0–3", notes: "If the venue or organization asks", optional: true },
    { id: "access", name: "Accessibility aids", qty: "as needed", estCost: "$0–10", notes: "Large-print handout, extra lighting, seating near the screen", optional: true },
    { id: "hotspot", name: "Mobile hotspot", qty: "1", estCost: "plan", notes: "Backup internet", optional: true },
    { id: "clicker", name: "Clicker / slide remote", qty: "1", estCost: "$0–15", notes: "Optional for workshops", optional: true },
  ],
};

export const AI_PEERS_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    freePlanAvailable: true,
    costNote: "Primary demonstration tool — start on the current free/available plan; features can change",
    url: "https://chatgpt.com/",
  },
  {
    id: "docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Session outlines, take-home steps, and prompt sheets",
    url: "https://docs.google.com/",
  },
  {
    id: "drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Share resources without collecting participant passwords",
    url: "https://drive.google.com/",
  },
  {
    id: "forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Intake and after-session feedback",
    url: "https://forms.google.com/",
    optional: true,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Booking, reminders, and office-hours windows",
    url: "https://calendar.google.com/",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Sessions, participants, revenue, expenses, profit, and hours",
    url: "https://sheets.google.com/",
  },
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple handouts and flyers — no giant AI-tool tour",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "zoom",
    name: "Zoom",
    freePlanAvailable: true,
    costNote: "Virtual coffee chats",
    url: "https://zoom.us/",
    optional: true,
  },
  {
    id: "meet",
    name: "Google Meet",
    freePlanAvailable: true,
    costNote: "Alternate virtual sessions",
    url: "https://meet.google.com/",
    optional: true,
  },
  {
    id: "email-text",
    name: "Email / text",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Confirmations, location details, and follow-up — $0 on devices you already have",
  },
  {
    id: "payment",
    name: "Payment app or invoice",
    freePlanAvailable: true,
    costNote: "Optional — Venmo, PayPal, cash, or organization invoice. Never take over a participant’s account.",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "ChatGPT + Google Docs + Google Calendar + one video tool (Zoom or Meet) + a simple session/profit tracker",
  },
];

export const AI_PEERS_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Displayed pricing: $15 – $40 / hour (examples).",
    "",
    "This is beginner AI education and coaching, not software engineering. Revenue is not profit. Examples are not income guarantees. Never promise instant expertise, guaranteed AI accuracy, or a specific income.",
    "",
    "1:1 BEGINNER SESSION — about $20–$50/hour",
    "A coffee-chat or office-hours hour for one person. Price toward the higher end for travel, customization, or extra follow-up.",
    "",
    "SMALL-GROUP COFFEE CHAT — about $10–$30/person",
    "A small beginner group. Keep the group small enough that everyone can practice.",
    "",
    "PRIVATE SMALL GROUP — about $75–$250+/session",
    "A booked group for a family, club, workplace, or organization. Quote after you know length, prep, audience, and customization.",
    "",
    "COMMUNITY / ORGANIZATION WORKSHOP — about $150–$500+",
    "Depends on duration, prep, audience, travel, venue, and how customized the examples are.",
    "",
    "MULTI-SESSION SERIES — about $100–$300/person OR $300–$1,000+ for a private group/organization",
    "Quote after you know session count, homework support, and whether you will customize examples.",
    "",
    "POSSIBLE ADD-ONS",
    "Customized handout · Personalized prompt sheet · Follow-up office hours · Organization-specific examples · Extra time · Private coaching",
    "",
    "Prices vary by length, group size, preparation, customization, travel, venue, materials, experience, and local market. A $200 workshop is not $200 profit after venue, printing, software, travel, payment fees, ads, and host-paid refreshments.",
  ].join("\n"),
  raiseTip:
    "If a session is not covering venue, travel, printing, and your total hours, raise the fee, shorten the offer, or keep the group smaller. Examples only — not income guarantees.",
  items: [
    { id: "one-on-one", label: "1:1 beginner session", price: "$20–$50 / hour", notes: "Coffee-chat / office-hours pace" },
    { id: "small-group", label: "Small-group coffee chat", price: "$10–$30 / person", notes: "Keep groups small enough to practice" },
    { id: "private-group", label: "Private small group", price: "$75–$250+ / session", notes: "Family, club, or organization booking" },
    { id: "workshop", label: "Community / organization workshop", price: "$150–$500+", notes: "Duration, prep, audience, and customization" },
    { id: "series", label: "Multi-session series", price: "$100–$300 / person or $300–$1,000+ private/org", notes: "Quote after session count and support" },
    { id: "handout", label: "Customized handout or prompt sheet", price: "$10–$40 add-on", notes: "Optional" },
    { id: "follow-up", label: "Follow-up office hours / private coaching", price: "$20–$50 / hour", notes: "Optional add-on" },
  ],
};

/** Exactly 11 authored core steps. Marketing is steps 6–8. Never ✓. */
export const AI_PEERS_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose the Beginner AI Topics You Can Confidently Teach",
    desc: [
      "Pick 3–5 beginner topics you can demonstrate slowly, in plain language, without pretending to be an engineer.",
      "",
      "Good beginner topics:",
      "- Draft a polite email",
      "- Rewrite a paragraph so it is clearer",
      "- Make a shopping or packing list",
      "- Plan a simple weekly schedule",
      "- Summarize a long article the participant already has",
      "- Brainstorm questions for a doctor/pharmacist visit (then verify with a professional)",
      "- Organize photo-album ideas",
      "- Spot common scam-style messages (without fear-based marketing)",
      "",
      "Skip topics you cannot verify: medical diagnosis, legal advice, tax/benefits decisions, workplace confidential data, or “how to get rich with AI.”",
      "",
      "Practice each chosen topic once before you teach it. If you get stuck, say “I don’t know — let’s verify that” and write it on your follow-up list.",
    ].join("\n"),
  },
  {
    title: "Choose Your Session Format and Audience",
    desc: [
      "Choose ONE starting format so you can host well:",
      "☐ 1:1 coffee chat",
      "☐ Small-group coffee chat",
      "☐ Beginner office hours",
      "☐ Private small group",
      "☐ Community / organization workshop",
      "☐ Short learning series",
      "",
      "Choose the audience you can serve kindly: peers, seniors, neighbors, club members, or a community organization that invited you.",
      "",
      "Decide in-person, virtual, or hybrid. In-person needs a readable screen and seating. Virtual needs a quiet connection and a simple join link.",
      "",
      "Accessibility: large readable text, slow clear demonstrations, one task at a time, extra practice, written take-home steps, respectful repetition, and permission before touching anyone’s device.",
      "Never request or record passwords. The participant controls their own accounts.",
    ].join("\n"),
  },
  {
    title: "Build a Simple No-Jargon Coffee-Chat Lesson",
    desc: [
      "Write a one-page lesson. Office-hours pace — not a product tour.",
      "",
      "Session flow:",
      "WELCOME → ASK GOALS → EXPLAIN AI IN PLAIN LANGUAGE → DEMO A SIMPLE PROMPT → SHOW FOLLOW-UPS → PARTICIPANT PRACTICE → 2–3 EVERYDAY USE CASES → PRIVACY / AI MISTAKES → PRACTICE → QUESTIONS → TAKE-HOME PROMPT SHEET / NEXT STEP",
      "",
      "Explain in one sentence: ChatGPT is a drafting helper. You still review, fact-check, and decide.",
      "",
      "Timebox the hour (adjust for a longer workshop):",
      "- Welcome and goals: 8 minutes",
      "- Plain-language explanation: 7 minutes",
      "- Demo + follow-ups: 12 minutes",
      "- Participant practice: 15 minutes",
      "- Everyday use cases + privacy: 10 minutes",
      "- Questions and take-home: 8 minutes",
      "",
      "Leave white space. If the group is lost, drop a use case and keep practice.",
    ].join("\n"),
  },
  {
    title: "Create Pricing and Session Options",
    desc: [
      "Write 2–3 offers you can actually deliver:",
      "- 1:1 beginner session: $20–$50/hour (example)",
      "- Small-group coffee chat: $10–$30/person (example)",
      "- One add-on: customized handout, prompt sheet, extra time, or follow-up office hours",
      "",
      "If an organization asks for a private group or workshop, quote after you know length, prep, travel, venue, and customization. Community workshops often run $150–$500+. A series may be $100–$300/person or $300–$1,000+ for a private group/organization.",
      "",
      "Write what is included and what is not:",
      "- Included: beginner demo, practice time, take-home prompt sheet",
      "- Not included: doing their work for them, logging into their accounts, guaranteed AI accuracy, medical/legal/tax advice",
      "",
      "Revenue is not profit. Track venue, printing, software, travel/parking, payment fees, ads, and host-paid refreshments.",
      "Examples only — not income guarantees.",
    ].join("\n"),
  },
  {
    title: "Prepare Demonstrations, Handouts and Safety Examples",
    desc: [
      "Prepare two live demos with no sensitive data.",
      "",
      "Demo 1 — weak vs. better prompt:",
      "WEAK: “Write an email.”",
      "BETTER: “Write a short, friendly email to the library asking if the community room is free next Tuesday 10–11 a.m. for a beginner AI coffee chat. Keep it under 120 words. Leave blanks for my name and phone.”",
      "",
      "Demo 2 — follow-up: “Make it shorter.” “Make it more polite.” “Turn this into a checklist.”",
      "",
      "Teach the safety workflow on the handout:",
      "AI DRAFT → HUMAN REVIEW → FACT CHECK → PERSONALIZE → USE/DELIVER",
      "",
      "Say out loud: AI can misunderstand, invent facts, be outdated, or be biased. Do not paste passwords, Social Security numbers, full financial account data, private medical records, or confidential workplace/client data.",
      "",
      "Print or share a one-page cheat sheet: 5-part prompt (task, context, details, format, constraints), 5 follow-ups, and the privacy list.",
      "Never request or record passwords. Ask permission before touching someone’s device.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2–3 initial channels. Do not try to be everywhere.",
      "",
      "Good channels:",
      "- Peer / friend networks",
      "- Facebook or community groups (post where you already belong; follow group rules)",
      "- Senior centers, libraries, churches/faith communities, and clubs — where permitted",
      "- Retirement communities, neighborhood groups, professional associations, and referrals",
      "",
      "Ask permission before posting at a venue. Do not scrape private member lists. Do not use fear-based marketing or promise instant expertise.",
      "",
      "Positioning example:",
      "- Curious about ChatGPT but don’t want a tech lecture? Join a friendly AI Coffee Chat and learn practical everyday uses at your own pace.",
      "",
      "Write your 2–3 channels, the person who can introduce you, and the date you will reach out.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Make one flyer or post and one take-home prompt sheet. Keep both in large, readable type.",
      "",
      "Include:",
      "- What it is: a friendly beginner AI coffee chat",
      "- Who it is for: peers who want everyday uses, not a tech lecture",
      "- What they will practice: 1–2 concrete tasks",
      "- When / where / how to sign up",
      "- Price or “ask for current session options”",
      "- What you will not do: take over accounts, record passwords, or promise instant expertise",
      "",
      "Sample line:",
      "- Curious about ChatGPT but don’t want a tech lecture? Join a friendly AI Coffee Chat and learn practical everyday uses at your own pace.",
      "",
      "Do not use scare headlines about being “left behind.” Do not claim you are certified, licensed, or an AI engineer unless that is true.",
      "Do not invent a Facebook Page just to look official. Start with people and groups you already know.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, do the outreach — do not wait until the lesson is “perfect.”",
      "",
      "Carry-out checklist:",
      "- Tell 5 people you actually know",
      "- Ask one venue or group (library, senior center, club, faith community) if a beginner session is allowed",
      "- Post once in a community group you already belong to, following their rules",
      "- Offer one sample 20-minute demo to a trusted peer if they want to see the pace first",
      "",
      "Track: people reached, inquiries, booked seats, and referrals. Stop after 2–3 channels until you have hosted once.",
      "",
      "If nobody books, ask one trusted person what was unclear: time, price, topic, or location. Adjust one thing. Do not add five new tools to the flyer.",
    ].join("\n"),
  },
  {
    title: "Host the Session at an Office-Hours Pace",
    desc: [
      "Arrive early. Test the screen, volume, and ChatGPT login on YOUR device. Participants use their own devices if they want to practice.",
      "",
      "Run the flow slowly:",
      "WELCOME → ASK GOALS → EXPLAIN AI IN PLAIN LANGUAGE → DEMO A SIMPLE PROMPT → SHOW FOLLOW-UPS → PARTICIPANT PRACTICE",
      "",
      "Speak in short sentences. Repeat the steps. Invite questions after each demo, not only at the end.",
      "",
      "If someone wants you to log into their email, bank, medical portal, or workplace system: decline. They keep the keyboard. You can coach from beside them after they unlock it themselves.",
      "",
      "Never request or record passwords. Never make unauthorized purchases, applications, or form submissions. Never impersonate the participant.",
      "If a question is outside beginner everyday AI, write it down and help them find an authoritative source later.",
    ].join("\n"),
  },
  {
    title: "Give Participants Practice Time and Answer Questions",
    desc: [
      "Protect practice time. Watching you type is not the same as trying one prompt.",
      "",
      "Give one starter prompt they can copy, then one follow-up of their own.",
      "Stay nearby. Answer “what do I type next?” more than “let me do it.”",
      "",
      "Cover 2–3 everyday use cases they chose at the start. Then cover privacy and AI mistakes:",
      "- AI can be wrong or outdated",
      "- AI can invent sources",
      "- Do not paste secrets",
      "- Important medical/legal/financial/tax/benefits/safety decisions need a qualified source",
      "",
      "Workflow to leave on the board:",
      "AI DRAFT → HUMAN REVIEW → FACT CHECK → PERSONALIZE → USE/DELIVER",
      "",
      "End with questions, the take-home prompt sheet, and one optional next step (office hours, series session 2, or a 1:1).",
    ].join("\n"),
  },
  {
    title: "Collect Feedback, Track Profit and Offer the Next Learning Step",
    desc: [
      "After the session, write notes while they are fresh: questions asked, topics that needed more time, accessibility needs, and what to slow down.",
      "",
      "Ask 3 feedback questions:",
      "- What was useful?",
      "- What was too fast or too confusing?",
      "- What should we practice next time?",
      "",
      "Track in your sheet:",
      "Participants/session · revenue/session · expenses/session · profit/session · prep + teaching + travel + setup/cleanup + follow-up hours · repeats · referrals",
      "",
      "Profit = 1:1 + small-group + private groups + workshops + series + add-ons − venue − printing − software − travel/parking − payment fees − ads − host-paid refreshments − other.",
      "Profit per total hour = profit ÷ all of those hours — not teaching minutes only.",
      "",
      "Offer one next step: a follow-up office hour, a second beginner topic, or a small series. Do not pressure. Examples only — not income guarantees.",
    ].join("\n"),
  },
];

export function aiPeersToolsDisclaimer(): string {
  return "Beginner stack: ChatGPT + Google Docs + Google Calendar + one video tool (Zoom or Meet) + a simple session/profit tracker. Do not dump a giant AI-tool list on beginners. ChatGPT plans, limits, and screens can change — verify current options. Never request or record passwords. Do not paste Social Security numbers, full financial details, private medical records, or confidential workplace/client data into prompts. AI output is a draft until the human reviews, fact-checks, and personalizes it.";
}

/** Coffee-chat profit. Unique key: aiPeersOneOnOneSessions. */
export function computeAiPeersProfit(input: {
  aiPeersOneOnOneSessions?: number;
  aiPeersOneOnOneRate?: number;
  aiPeersSmallGroupParticipants?: number;
  aiPeersSmallGroupPricePerPerson?: number;
  aiPeersPrivateGroupSessions?: number;
  aiPeersPrivateGroupFee?: number;
  aiPeersWorkshopSessions?: number;
  aiPeersWorkshopFee?: number;
  aiPeersSeriesRevenue?: number;
  aiPeersAddOnRevenue?: number;
  aiPeersVenueCost?: number;
  aiPeersPrintingCost?: number;
  aiPeersSoftwareSubscriptions?: number;
  aiPeersTravelParking?: number;
  aiPeersPaymentFees?: number;
  aiPeersAds?: number;
  aiPeersHostPaidRefreshments?: number;
  aiPeersOtherExpenses?: number;
  aiPeersTeachingHours?: number;
  aiPeersPrepHours?: number;
  aiPeersTravelHours?: number;
  aiPeersSetupCleanupHours?: number;
  aiPeersFollowUpAdminHours?: number;
}): {
  oneOnOneRevenue: number;
  smallGroupRevenue: number;
  privateGroupRevenue: number;
  workshopRevenue: number;
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const oneOnOneRevenue =
    Math.max(0, Number(input.aiPeersOneOnOneSessions) || 0) *
    Math.max(0, Number(input.aiPeersOneOnOneRate) || 0);
  const smallGroupRevenue =
    Math.max(0, Number(input.aiPeersSmallGroupParticipants) || 0) *
    Math.max(0, Number(input.aiPeersSmallGroupPricePerPerson) || 0);
  const privateGroupRevenue =
    Math.max(0, Number(input.aiPeersPrivateGroupSessions) || 0) *
    Math.max(0, Number(input.aiPeersPrivateGroupFee) || 0);
  const workshopRevenue =
    Math.max(0, Number(input.aiPeersWorkshopSessions) || 0) *
    Math.max(0, Number(input.aiPeersWorkshopFee) || 0);
  const series = Math.max(0, Number(input.aiPeersSeriesRevenue) || 0);
  const addOns = Math.max(0, Number(input.aiPeersAddOnRevenue) || 0);
  const grossRevenue = oneOnOneRevenue + smallGroupRevenue + privateGroupRevenue + workshopRevenue + series + addOns;
  const totalExpenses =
    Math.max(0, Number(input.aiPeersVenueCost) || 0) +
    Math.max(0, Number(input.aiPeersPrintingCost) || 0) +
    Math.max(0, Number(input.aiPeersSoftwareSubscriptions) || 0) +
    Math.max(0, Number(input.aiPeersTravelParking) || 0) +
    Math.max(0, Number(input.aiPeersPaymentFees) || 0) +
    Math.max(0, Number(input.aiPeersAds) || 0) +
    Math.max(0, Number(input.aiPeersHostPaidRefreshments) || 0) +
    Math.max(0, Number(input.aiPeersOtherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.aiPeersTeachingHours) || 0) +
    Math.max(0, Number(input.aiPeersPrepHours) || 0) +
    Math.max(0, Number(input.aiPeersTravelHours) || 0) +
    Math.max(0, Number(input.aiPeersSetupCleanupHours) || 0) +
    Math.max(0, Number(input.aiPeersFollowUpAdminHours) || 0);
  return {
    oneOnOneRevenue,
    smallGroupRevenue,
    privateGroupRevenue,
    workshopRevenue,
    grossRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
