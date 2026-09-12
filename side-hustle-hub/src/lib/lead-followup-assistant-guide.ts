/**
 * Lead Follow-Up Assistant (`lead-followup-assistant`, Guide #079).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const LEAD_FOLLOWUP_REALITY_CHECK = {
  title: "YOU ARE NOT COLD CALLING",
  body: "This hustle focuses on people who have already shown interest in the client's business. Your job is to provide organized, polite follow-up so warm leads do not get forgotten.",
};

/** Client planner shown above freeform Notes for this guide. */
export const LEAD_FOLLOWUP_NOTES_WORKSHEET = `Lead Follow-Up Client Planner

Client / Business: ________________
Business Type: ________________
Monthly Fee: $________

Lead Sources:
________________________________

Primary Contact Method:
________________________________

Approved Follow-Up Schedule:
________________________________

Follow-Up #1 Timing: ________________
Follow-Up #2 Timing: ________________
Final Follow-Up Timing: ________________

Approved Message Templates:
________________________________
________________________________
________________________________

When Should I Alert the Owner?
________________________________

Lead Status Options:
________________________________

Weekly Report Day: ________________

Client Special Instructions:
________________________________

Do-Not-Contact Rules:
________________________________

Monthly Leads Handled: ________
Replies: ________
Appointments / Callbacks: ________

Notes:
________________________________
________________________________

GYSH PRO TIP — SELL THE PROBLEM YOU SOLVE
Don't pitch: "I send emails and texts."
Pitch: "You already worked to get the lead. I help make sure it doesn't disappear because nobody followed up."

SAMPLE FOLLOW-UP MESSAGES (keep short, friendly, professional, low pressure)

FIRST FOLLOW-UP:
Hi [Name], this is [Business Name]. Just following up on your inquiry about [service]. Are you still interested in getting more information or scheduling a time to talk?

SECOND FOLLOW-UP:
Hi [Name], just checking back in regarding [service]. If you still need help, we'd be happy to answer any questions. Just reply here whenever you're ready.

FINAL FOLLOW-UP:
Hi [Name], one last follow-up regarding your inquiry about [service]. If you'd still like help, feel free to reply anytime. Thanks for considering [Business Name]!`;

export const LEAD_FOLLOWUP_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help busy local professionals stop losing warm leads by sending polite, timely follow-up texts and emails, tracking responses, and letting the business owner know when someone is ready for personal attention. Tagline: They Find the Leads. You Make Sure Nobody Drops the Ball. Category: Virtual Assistance / Sales Support. Best for adults and seniors / retirees. Beginner · Very low startup · Flexible / recurring · Remote · Service-based / recurring income.",
  },
  {
    id: "not-salesperson",
    label: "You do NOT need to be a salesperson",
    detail: "Your job is to keep warm leads from being forgotten — organized follow-up, not cold calling or hard selling.",
  },
  {
    id: "requirements",
    label: "Basic requirements",
    detail:
      "Computer or smartphone · Reliable internet · Professional writing · Good organization · Dependability · Comfortable using email/texting tools · Spreadsheet or basic CRM skills · Ability to follow client instructions · Respect for customer privacy.",
  },
  {
    id: "clients",
    label: "Typical clients",
    detail:
      "Real estate agents · Contractors · Photographers · Cleaning companies · Landscapers · Insurance agents · Auto detailers · Salons/spas · Event professionals · Tutors/coaches · Other local service businesses.",
  },
  {
    id: "tasks",
    label: "Typical tasks",
    detail:
      "Check new/warm lead list · Send approved follow-up messages · Track contact attempts · Record replies · Flag interested leads · Schedule callbacks/appointments if authorized · Remind owner about leads needing personal attention.",
  },
  {
    id: "compliance",
    label: "IMPORTANT — approved messaging & privacy",
    detail:
      "The client should provide or approve messaging and contact procedures. Follow applicable email/text marketing and privacy rules. Do not spam purchased lists or contact people without appropriate permission.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Sell the problem you solve",
    detail:
      "Don't pitch: “I send emails and texts.” Pitch: “You already worked to get the lead. I help make sure it doesn't disappear because nobody followed up.”",
  },
];

export const LEAD_FOLLOWUP_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Lead tracker",
  },
  {
    label: "Gmail",
    url: "https://mail.google.com/",
    note: "Approved follow-up emails",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Callbacks and appointments",
  },
  {
    label: "Calendly",
    url: "https://calendly.com/",
    note: "Optional booking links when authorized",
  },
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Market your own follow-up service",
  },
  {
    label: "ChatGPT",
    url: "https://chatgpt.com/",
    note: "Draft templates for client approval only — never paste confidential data without approval",
  },
];

export const LEAD_FOLLOWUP_SUPPLIES = {
  starterKitTotal:
    "About $0–20 if you already have a computer/phone and internet — do not purchase expensive software before getting clients",
  items: [
    {
      id: "computer",
      name: "Computer / laptop",
      qty: "1",
      estCost: "$0",
      notes: "Essential — use what you own",
    },
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential — use what you own",
    },
    {
      id: "internet",
      name: "Reliable internet",
      qty: "1",
      estCost: "$0–60/mo",
      notes: "Essential — home/mobile plan you already have",
    },
    {
      id: "email",
      name: "Email account",
      qty: "1",
      estCost: "$0",
      notes: "Essential — Gmail/Outlook free tiers",
    },
    {
      id: "calendar",
      name: "Calendar",
      qty: "1",
      estCost: "$0",
      notes: "Essential — Google Calendar or similar",
    },
    {
      id: "tracker",
      name: "Spreadsheet or CRM access",
      qty: "1",
      estCost: "$0",
      notes: "Essential — Sheets/Excel or client's CRM",
    },
    {
      id: "notebook",
      name: "Notebook",
      qty: "1",
      estCost: "$2–8",
      optional: true,
      notes: "Optional",
    },
    {
      id: "headset",
      name: "Headset",
      qty: "1",
      estCost: "$15–40",
      optional: true,
      notes: "Optional — for calls if authorized",
    },
  ],
};

/**
 * Lead Follow-Up Tools — apps + beginner stack (Tools tab).
 */
export const LEAD_FOLLOWUP_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "lf_sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Track leads, contact attempts, responses, and next actions",
    url: "https://sheets.google.com/",
  },
  {
    id: "lf_email",
    name: "Gmail / Outlook",
    freePlanAvailable: true,
    costNote: "Send approved follow-up emails",
    url: "https://mail.google.com/",
  },
  {
    id: "lf_calendar",
    name: "Google Calendar / Calendly",
    freePlanAvailable: true,
    costNote: "Schedule appointments or callbacks when authorized",
    url: "https://calendar.google.com/",
  },
  {
    id: "lf_crm",
    name: "Client CRM",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote:
      "Examples: HubSpot, Zoho, Salesforce, GoHighLevel, or the client's existing system — client normally provides access",
  },
  {
    id: "lf_phone",
    name: "Business Phone / Text System",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Use the client's approved business texting system when provided — do not text from a personal number without approval",
  },
  {
    id: "lf_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Create simple service flyers/social posts to market your own Lead Follow-Up Assistant service",
    url: "https://www.canva.com/",
  },
  {
    id: "lf_chatgpt",
    name: "ChatGPT",
    freePlanAvailable: true,
    costNote:
      "Help draft professional follow-up message templates for client approval. IMPORTANT: Never paste confidential client/customer information into an AI tool unless the client has approved the workflow and the tool is appropriate for that data.",
    url: "https://chatgpt.com/",
  },
  {
    id: "lf_stack",
    name: "Beginner Tool Stack + Lead Tracker Columns",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "1) Google Sheets — Track leads · 2) Gmail — Send follow-ups · 3) Calendar — Track callbacks · 4) Client CRM — Update lead status · 5) Approved Message Templates — Follow up consistently. Tracker columns: Lead Name · Contact Info · Date Received · Service Interested In · Last Contact · Follow-Up # · Response · Lead Status · Next Action · Next Follow-Up Date · Notes",
  },
];

export const LEAD_FOLLOWUP_PRICING = {
  tabLabel: "Simple Follow-Up Packages",
  intro: [
    "Example beginner pricing — not income guarantees. Recurring monthly packages are attractive because lead follow-up is an ongoing business need.",
    "",
    "Pricing formula: Estimated Monthly Hours × Hourly Rate + Software/Other Costs = Minimum Monthly Price.",
  ].join("\n"),
  raiseTip:
    "After 2–3 months of clean reporting, raise the retainer or add scheduling / CRM-cleanup add-ons. Examples only — not income guarantees.",
  items: [
    {
      id: "light",
      label: "LIGHT FOLLOW-UP — Up to 25 warm leads/month",
      price: "$75–$125/month",
      notes: "Beginner starter package",
    },
    {
      id: "standard",
      label: "STANDARD FOLLOW-UP — Up to 75 warm leads/month",
      price: "$150–$250/month",
      notes: "Most common retainer starting point",
    },
    {
      id: "active",
      label: "ACTIVE FOLLOW-UP — Up to 150 warm leads/month",
      price: "$300–$500/month",
      notes: "Higher volume / more touchpoints",
    },
    {
      id: "hourly",
      label: "Hourly (beginner example range)",
      price: "$20–$35/hour",
      notes: "Useful while you learn client workflows",
    },
    {
      id: "addon-appt",
      label: "Add-on: Appointment scheduling",
      price: "Additional fee",
    },
    {
      id: "addon-crm",
      label: "Add-on: CRM cleanup",
      price: "Additional fee",
    },
    {
      id: "addon-report",
      label: "Add-on: Lead status reporting",
      price: "Often included · or additional fee",
    },
    {
      id: "addon-templates",
      label: "Add-on: Custom follow-up templates",
      price: "Additional fee",
    },
    {
      id: "addon-volume",
      label: "Add-on: Additional lead volume",
      price: "Additional fee",
    },
  ],
};

/**
 * Core launch steps (exactly 11 playbook steps).
 * Foundation + marketing titles + closing are applied by finalize.
 */
export const LEAD_FOLLOWUP_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose the types of businesses you want to serve",
    desc: "Pick 2–3 niches you understand or can research quickly (for example real estate, contractors, salons, photographers, cleaning companies). Narrow focus makes your pitch and templates clearer.",
  },
  {
    title: "Create a simple Lead Follow-Up Assistant offer",
    desc: "Write one clear offer: you send polite, approved follow-ups to warm leads, track replies, and alert the owner when someone needs personal attention. Include Light / Standard package options from Suggested Pricing.",
  },
  {
    title: "Decide whether to charge hourly or monthly",
    desc: "Monthly retainers fit ongoing lead flow; hourly works while you learn a client's process. Use Estimated Monthly Hours × Hourly Rate + Software/Other Costs to set a minimum monthly price.",
  },
  {
    title: "Find potential clients who regularly receive inquiries/leads",
    desc: "Look for local pros who get website forms, Facebook messages, ad leads, or referrals but often respond late. Warm outreach: people you know, Chamber/networking groups, and parent-approved local business groups.",
  },
  {
    title: "Explain the value without sounding like a salesperson",
    desc: "Pitch the problem you solve: “I help make sure warm leads don't get forgotten when you're busy.” Don’t pitch “I send emails and texts.” Pitch: “You already worked to get the lead. I help make sure it doesn't disappear because nobody followed up.”",
  },
  {
    title: "Ask how leads currently arrive",
    desc: "Map the pipeline with the client: website, Facebook, email, phone, ads, referrals, CRM, walk-ins, etc. Note who owns each inbox and what “warm” means for them.",
  },
  {
    title: "Agree on the follow-up process",
    desc: "Document in writing: who to contact, when, how often, approved messages, when to stop, and when to alert the owner. Client provides or approves messaging and contact procedures. Follow email/text marketing and privacy rules — no purchased spam lists.",
  },
  {
    title: "Create or use the client's lead tracker/CRM",
    desc: "Set up Google Sheets/Excel or the client's CRM with columns: Lead Name, Contact Info, Date Received, Service Interested In, Last Contact, Follow-Up #, Response, Lead Status, Next Action, Next Follow-Up Date, Notes. Client normally provides CRM/phone/email access.",
  },
  {
    title: "Send polite approved follow-ups and record every contact attempt",
    desc: [
      "Use short, friendly, professional, low-pressure messages the client approved. Sample pattern:",
      "FIRST: Hi [Name], this is [Business Name]. Just following up on your inquiry about [service]. Are you still interested in getting more information or scheduling a time to talk?",
      "SECOND: Hi [Name], just checking back in regarding [service]. If you still need help, we'd be happy to answer any questions. Just reply here whenever you're ready.",
      "FINAL: Hi [Name], one last follow-up regarding your inquiry about [service]. If you'd still like help, feel free to reply anytime. Thanks for considering [Business Name]!",
      "Log every attempt in the tracker the same day.",
    ].join("\n"),
  },
  {
    title: "Flag replies with clear lead statuses",
    desc: "Tag each reply as: Interested · Needs Callback · Appointment Requested · Not Interested · No Response · Do Not Contact. Escalate Interested / Needs Callback / Appointment Requested to the owner per the agreed rules.",
  },
  {
    title: "Send the client a simple weekly or monthly summary",
    desc: "Report: Leads Followed Up · Replies · Appointments/Callbacks · No Responses · Leads Needing Owner Attention. Keep it short so the owner can act. Log hours, fee, and expenses in Notes and the Revenue Calculator.",
  },
  {
    title: "Pick how you will tell people about your side hustle",
    desc: "Choose 2–3 channels this month: warm intros to local service owners, a one-page Canva flyer/social post, and networking or Chamber-style groups. Lead with the forgotten-lead problem, not your tools.",
  },
  {
    title: "Make your marketing materials",
    desc: "Create a Canva flyer, a short text/email pitch, Light/Standard package price sheet, and a sample tracker screenshot (fake data only). Keep sample follow-up templates ready for client approval meetings.",
  },
  {
    title: "Carry out the marketing plan",
    desc: "Contact 5–10 local businesses that get inquiries, offer a short trial week if helpful, and follow up once. After each client month, ask for a short review/referral and refine your packages using the Revenue Calculator.",
  },
];

export function leadFollowupToolsDisclaimer(): string {
  return [
    "Lead Follow-Up Tools — track warm leads, send approved messages, and update status.",
    "",
    "BEGINNER TOOL STACK",
    "1. Google Sheets — Track leads",
    "2. Gmail — Send follow-ups",
    "3. Calendar — Track callbacks",
    "4. Client CRM — Update lead status",
    "5. Approved Message Templates — Follow up consistently",
    "",
    "Never paste confidential client/customer information into an AI tool unless the client has approved the workflow.",
  ].join("\n");
}
