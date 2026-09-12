/**
 * Genealogy & Family History Researcher (`family-history-organizer`, Guide #068).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const GENEALOGY_REALITY_CHECK = {
  title: "RESEARCH FACTS — DON'T GUESS",
  body: "Family stories are valuable clues, but they are not always historically accurate. Separate confirmed records, probable matches, and unverified stories so clients understand exactly what the evidence supports.",
};

/** Family History Research Notebook shown above freeform Notes for this guide. */
export const GENEALOGY_NOTES_WORKSHEET = `Family History Research Notebook

Client / Family Name: ________________________________

Research Goal:
________________________________
________________________________

Primary Family Line:
________________________________

Known Names:
________________________________
________________________________

Known Dates:
________________________________

Known Locations:
________________________________

Research Questions:
________________________________
________________________________

Records Already Available:
________________________________

Websites / Archives Searched:
________________________________
________________________________

Records Found:
________________________________
________________________________

Possible Matches:
________________________________

Unverified Information:
________________________________

Family Stories to Investigate:
________________________________

Missing Information:
________________________________

Next Research Steps:
________________________________
________________________________

Important Contacts / Relatives:
________________________________

Project Hours Used: ________
Client Budget: $________

Additional Notes:
________________________________
________________________________

OPTIONAL BEGINNER CHALLENGE — RESEARCH YOUR OWN FAMILY FIRST
Before taking a client, practice one branch of your own family.
Complete: 3 generations · Basic family tree · Census search · Obituary search · Cemetery search · Research log · Source list · Short written family history summary.`;

export const GENEALOGY_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help clients research family history, organize records, build family trees, locate historical documents, and create easy-to-understand family history reports. Tagline: Turn Family Stories Into Organized History.",
  },
  {
    id: "requirements",
    label: "Basic requirements",
    detail:
      "Computer or tablet · Reliable internet · Strong research skills · Attention to detail · Good organization · Basic writing ability · Ability to handle private family information carefully · Email and document-sharing skills · Basic spreadsheet or record-keeping skills.",
  },
  {
    id: "helpful-skills",
    label: "Helpful skills",
    detail:
      "Genealogy research · Interviewing relatives · Historical record research · Family tree building · Document organization · Writing summaries · Scanning old photos/documents.",
  },
  {
    id: "services",
    label: "Potential services",
    detail:
      "Family tree research · Family history organization · Census research · Birth/marriage/death record research · Obituary research · Military record research · Cemetery research · Newspaper archive research · Family interview organization · Photo/document labeling · Family history reports · Digital family archives.",
  },
  {
    id: "important",
    label: "Important — never guarantee findings",
    detail:
      "Never guarantee that a specific ancestor, record, relationship, or historical answer will be found. Clearly separate: confirmed facts · likely matches · unverified family stories · research leads.",
  },
  {
    id: "beginner-challenge",
    label: "Optional beginner challenge — Research Your Own Family First",
    detail:
      "Before taking a client, practice by researching one branch of your own family. Complete: 3 generations, basic family tree, census search, obituary search, cemetery search, research log, source list, and a short written family history summary.",
  },
];

export const GENEALOGY_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "FamilySearch",
    url: "https://www.familysearch.org/",
    note: "Free genealogy records and family tree tools",
  },
  {
    label: "Ancestry",
    url: "https://www.ancestry.com/",
    note: "Large database — subscription may be required",
  },
  {
    label: "Find a Grave",
    url: "https://www.findagrave.com/",
    note: "Cemetery memorials and burial locations",
  },
  {
    label: "National Archives",
    url: "https://www.archives.gov/",
    note: "U.S. military, census, immigration, and government records",
  },
  {
    label: "Internet Archive",
    url: "https://archive.org/",
    note: "Old books, directories, yearbooks, histories",
  },
];

export const GENEALOGY_SUPPLIES = {
  starterKitTotal:
    "About $20–60 for notebooks, folders, and backup storage if you already have a computer and phone — start lean with free research sites",
  items: [
    {
      id: "computer",
      name: "Computer or tablet",
      qty: "1",
      estCost: "$0",
      notes: "Essential — use what you own",
    },
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential for scanning / photos / interviews",
    },
    {
      id: "internet",
      name: "Reliable internet",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "notebook",
      name: "Notebook",
      qty: "1",
      estCost: "$3–8",
      notes: "Essential for research notes",
    },
    {
      id: "pens",
      name: "Pens",
      qty: "1–3",
      estCost: "$2–5",
      notes: "Essential",
    },
    {
      id: "folders",
      name: "File folders",
      qty: "1 pack",
      estCost: "$4–10",
      notes: "Essential",
    },
    {
      id: "storage",
      name: "External drive or secure digital storage",
      qty: "1",
      estCost: "$15–40",
      notes: "Essential for client file backup",
    },
    {
      id: "scanner",
      name: "Scanner or scanning app",
      qty: "1",
      estCost: "$0–80",
      notes: "Essential — phone app is fine to start",
    },
    {
      id: "printer",
      name: "Printer",
      qty: "1",
      estCost: "$0–80",
      optional: true,
      notes: "Optional",
    },
    {
      id: "sleeves",
      name: "Document sleeves",
      qty: "1 pack",
      estCost: "$6–15",
      optional: true,
      notes: "Helpful",
    },
    {
      id: "archival",
      name: "Archival-safe folders",
      qty: "1 pack",
      estCost: "$8–18",
      optional: true,
      notes: "Helpful",
    },
    {
      id: "labels",
      name: "Labels",
      qty: "1 pack",
      estCost: "$3–8",
      optional: true,
      notes: "Helpful",
    },
    {
      id: "usb",
      name: "USB drive",
      qty: "1",
      estCost: "$8–15",
      optional: true,
      notes: "Helpful for handoff",
    },
    {
      id: "portable-scanner",
      name: "Portable scanner",
      qty: "1",
      estCost: "$50–120",
      optional: true,
      notes: "Helpful — buy after income justifies",
    },
    {
      id: "headphones",
      name: "Headphones for interviews",
      qty: "1",
      estCost: "$10–30",
      optional: true,
      notes: "Helpful",
    },
    {
      id: "recorder",
      name: "Voice recorder / phone recording app",
      qty: "1",
      estCost: "$0–40",
      optional: true,
      notes: "Helpful — only with permission",
    },
    {
      id: "local-shoes",
      name: "Comfortable shoes (local research)",
      qty: "1 pair",
      estCost: "$0",
      optional: true,
      notes: "For archives / cemeteries — use what you own",
    },
    {
      id: "local-charger",
      name: "Portable charger (local research)",
      qty: "1",
      estCost: "$15–30",
      optional: true,
      notes: "For library / cemetery days",
    },
    {
      id: "local-flashlight",
      name: "Small flashlight (cemetery markers)",
      qty: "1",
      estCost: "$5–12",
      optional: true,
      notes: "If appropriate for cemetery research",
    },
  ],
};

export const GENEALOGY_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  alternatives?: string;
  optional?: boolean;
}[] = [
  {
    id: "gen_familysearch",
    name: "FamilySearch",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Free genealogy database with historical records and family tree tools",
    url: "https://www.familysearch.org/",
  },
  {
    id: "gen_ancestry",
    name: "Ancestry",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Large genealogy research database · subscription may be required",
    url: "https://www.ancestry.com/",
  },
  {
    id: "gen_myheritage",
    name: "MyHeritage",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Family tree and genealogy research platform · paid features may apply",
    url: "https://www.myheritage.com/",
    optional: true,
  },
  {
    id: "gen_findagrave",
    name: "Find a Grave",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Cemetery records, memorials, burial locations, and family connections",
    url: "https://www.findagrave.com/",
  },
  {
    id: "gen_newspapers",
    name: "Newspapers.com",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Historical newspaper archive · subscription may apply",
    url: "https://www.newspapers.com/",
    optional: true,
  },
  {
    id: "gen_google",
    name: "Google",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Names, locations, obituaries, historical organizations, churches, cemeteries, public records",
    url: "https://www.google.com/",
  },
  {
    id: "gen_google_books",
    name: "Google Books",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Local histories, family histories, city directories, and historical references",
    url: "https://books.google.com/",
  },
  {
    id: "gen_archive",
    name: "Internet Archive",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Old books, directories, yearbooks, histories, and public-domain materials",
    url: "https://archive.org/",
  },
  {
    id: "gen_nara",
    name: "National Archives",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "U.S. military, census, immigration, and government historical records",
    url: "https://www.archives.gov/",
  },
  {
    id: "gen_state_archives",
    name: "State / County Archives",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Local records, deeds, probate, court records, and historical documents — search your state/county sites",
  },
  {
    id: "gen_library",
    name: "Library genealogy resources",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote:
      "Local libraries may provide access to genealogy databases, newspapers, city directories, and historical collections",
  },
  {
    id: "gen_drive",
    name: "Google Drive / Dropbox / OneDrive",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Organize client files and share deliverables securely",
    url: "https://drive.google.com/",
    alternatives: "Dropbox, OneDrive",
  },
  {
    id: "gen_sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Research log — record searched, site, terms, date, result, citation, next step",
    url: "https://sheets.google.com/",
    alternatives: "Microsoft Excel",
  },
  {
    id: "gen_docs",
    name: "Google Docs / Word",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Research summaries, timelines, and family history reports",
    url: "https://docs.google.com/",
    alternatives: "Microsoft Word",
  },
  {
    id: "gen_gramps",
    name: "Gramps / Family Tree Maker",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Optional desktop family tree tools if available to you",
    url: "https://gramps-project.org/",
    optional: true,
  },
  {
    id: "gen_scan",
    name: "Adobe Scan / Microsoft Lens",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Smartphone scanning for photos and documents · flatbed scanner optional",
    url: "https://www.adobe.com/acrobat/mobile/scanner-app.html",
    alternatives: "Microsoft Lens, phone camera",
  },
];

export const GENEALOGY_PRICING = {
  tabLabel: "Pricing Your Research Services",
  intro: [
    "Possible pricing models:",
    "",
    "Hourly research (beginner example): $20–$40/hour.",
    "",
    "Project packages:",
    "· Starter Family Search — $75–$150 (example: 2–3 hours of research plus short findings summary).",
    "· Family Branch Research — $150–$350+ (research one family line, organize records, provide findings).",
    "· Family History Organization — $100–$300+ (organize client-provided documents, photos, names, dates, and tree info).",
    "· Custom Family History Report — $200–$500+ (depth, writing, images, and documentation).",
    "· Digital Archive Organization — price by project or hourly.",
    "",
    "Pricing formula: Estimated Hours × Hourly Rate + Paid Research Costs + Printing/Scanning + Travel + Special Record Fees = Client Price.",
    "",
    "Paid genealogy databases, government record fees, travel, copies, and archive charges should either be included in the quote or clearly listed as additional client expenses.",
    "",
    "Avoid unlimited research packages. Set a clear research-hour limit and project scope.",
  ].join("\n"),
  raiseTip:
    "After 5–10 delivered projects, raise hourly or package rates 10–20% — or add rush fees. Examples only — not income guarantees.",
  items: [
    {
      id: "hourly",
      label: "Hourly research (beginner)",
      price: "$20–$40 / hr",
      notes: "Cap hours in the written scope",
    },
    {
      id: "starter",
      label: "Starter Family Search",
      price: "$75–$150",
      notes: "2–3 hours + short findings summary",
    },
    {
      id: "branch",
      label: "Family Branch Research",
      price: "$150–$350+",
      notes: "One family line + organized findings",
    },
    {
      id: "organize",
      label: "Family History Organization",
      price: "$100–$300+",
      notes: "Client-provided docs / photos / tree data",
    },
    {
      id: "report",
      label: "Custom Family History Report",
      price: "$200–$500+",
      notes: "Depends on depth, writing, and images",
    },
  ],
};

/** Core launch steps (foundation + marketing titles + closing are applied by finalize). */
export const GENEALOGY_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose your services",
    desc: "Decide what you will offer. Examples: family tree research, record searches, organization, reports, photo/document archiving. Write your menu in Notes.",
  },
  {
    title: "Pick a niche if desired",
    desc: "Optional focus examples: beginner family trees, African American genealogy, military research, local history, immigrant families, cemetery research. A niche makes marketing clearer.",
  },
  {
    title: "Create a simple client intake form",
    desc: "Collect names, dates, locations, known relatives, goals, and existing records. Use Google Docs/Forms or a simple PDF. Store intakes in your client Drive folder.",
  },
  {
    title: "Define the project scope",
    desc: "Agree in writing on research hours, family branch, generations, deliverables, budget, and deadline. Cap hours — never sell unlimited research.",
  },
  {
    title: "Start with known facts",
    desc: "Begin with the client and work backward using confirmed names, dates, places, and relationships. Treat family stories as clues until records confirm them.",
  },
  {
    title: "Build a research log",
    desc: "Track every search: record searched, website/archive, search terms, date searched, result, source link or citation, and next research step. Google Sheets or Excel works well.",
  },
  {
    title: "Search historical records",
    desc: "Examples: census, birth, marriage, death, military, immigration, obituaries, newspapers, cemetery, directories, probate, church records. Use FamilySearch, Find a Grave, archives, and libraries.",
  },
  {
    title: "Verify findings",
    desc: "Compare multiple records before treating relationships or dates as confirmed. Never rely on one record alone when important facts are uncertain.",
  },
  {
    title: "Organize the evidence",
    desc: "Create folders by family line, person, record type, or generation. Keep confirmed facts, likely matches, unverified stories, and research leads clearly labeled.",
  },
  {
    title: "Prepare the client deliverable",
    desc: "Possible deliverables: family tree, research summary, timeline, record copies, source list, digital archive, or family history report. Match what you scoped.",
  },
  {
    title: "Review and deliver",
    desc: "Explain what was confirmed, what remains uncertain, what could not be found, and recommended next research steps. Invite questions and log hours/expenses in the Revenue Calculator.",
  },
  {
    title: "Pick how you will tell people about your side hustle",
    desc: "Pick 2–3 channels this month (warm referrals, local Facebook groups, library bulletin boards, or a simple Facebook Page). Genealogy clients often come from seniors, churches, historical societies, and word of mouth.",
  },
  {
    title: "Make your marketing materials",
    desc: "Create a one-page service menu (packages + hourly + what is / isn’t included), a sample research summary from your own family practice project, and a short privacy note about careful handling of family information.",
  },
  {
    title: "Carry out the marketing plan",
    desc: "Reach out to warm leads, post your menu where allowed, and follow up weekly. After each paid project, ask for a short review and whether they know another relative who wants a branch researched.",
  },
];

export function genealogyToolsDisclaimer(): string {
  return [
    "Genealogy Research & Organization Tools — use free sources first, then paid databases when the project budget covers them.",
    "",
    "BEGINNER TOOL STACK",
    "1. FamilySearch — Free record research",
    "2. Google — General research",
    "3. Find a Grave — Cemetery research",
    "4. Google Sheets — Research log",
    "5. Google Drive — Organize client files",
    "",
    "Important research rule: Never rely on one record alone when important relationships or dates are uncertain. Compare multiple sources whenever possible.",
    "Do not overspend when starting — most beginners can start with a computer, internet, and free research resources.",
  ].join("\n");
}
