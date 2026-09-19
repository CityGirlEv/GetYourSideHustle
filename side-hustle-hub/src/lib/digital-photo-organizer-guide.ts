/**
 * Digital Photo Organizer (`digital-photo-organizer`, Guide #060).
 * Starter Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project (examples).
 * Plain data only — no imports from guide-tools.
 */

export const DIGITAL_PHOTO_ORGANIZER_REALITY_CHECK = {
  title: "NEVER DELETE THE ONLY COPY",
  body: [
    "Help clients inventory, back up, sort, rename, date, group, and organize years of digital photos into a clear folder or album system while protecting originals and requiring client approval before permanent deletion.",
    "",
    "“Remove duplicates” sounds simple until the wrong photo disappears. Use a backup-first, review-first workflow.",
    "",
    "Before touching files confirm: devices and accounts; photo locations; approximate photo/video count; available storage; backup status; desired folder/album system; duplicate definition; screenshot/receipt cleanup rules; sensitive/private content policy; deletion approval process; deliverables; retention/deletion of working copies; price.",
    "",
    "Do not promise data recovery, perfect duplicate detection, complete date accuracy, facial identification, or permanent cloud deletion unless the scope and tools genuinely support it.",
    "",
    "Client signs in and approves access; do not ask for passwords by text/email. Do not upload client photos to AI face recognition, enhancement, or third-party tools without written permission. Do not store client libraries on personal cloud accounts.",
    "",
    "FTC data-security guidance: https://www.ftc.gov/business-guidance/privacy-security/data-security",
    "",
    "Tagline: Protect the Originals. Organize the Memories. Find Photos Faster.",
  ].join("\n"),
};

export const DIGITAL_PHOTO_ORGANIZER_NOTES_WORKSHEET = `DIGITAL PHOTO ORGANIZER NOTES

BUSINESS SETUP
Project Minimum: $____
Hourly Value: $____
Included Photo Count: ____
Additional Source Fee: $____
Working-Copy Retention: ________
Deletion Approval Rule: ________

CLIENT/PROJECT
Client: ________
Photo Goal: ________
Estimated Photos/Videos: ________
Source 1: ________
Source 2: ________
Source 3: ________
Sensitive Content Discussed: ☐
Client-Controlled Login: ☐

BACKUP
Backup Location: ________
Backup Date: ________
Files Spot-Checked: ☐
Videos Spot-Checked: ☐
Working Copy: ________

ORGANIZATION
Folder/Album Structure: ________
Rename Rule: ________

DELIVERY
Guide/Map Delivered: ☐
Payment Collected: ☐
Working Copies Deleted: ☐
Access Removed: ☐

FINANCIAL
Quoted Price: $____
Expenses: $____
Hours: ____
Profit: $____

GYSH PRO TIP
Protect the originals. Organize the memories. Find photos faster.
INVENTORY → VERIFIED BACKUP → WORKING COPY → FOLDER/ALBUM PLAN → CLIENT DELETION REVIEW → DELIVERY LOG.`;

export const DIGITAL_PHOTO_ORGANIZER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help clients inventory, back up, sort, rename, date, group, and organize years of digital photos. Tagline: Protect the Originals. Organize the Memories. Find Photos Faster. Category: Digital Organization / Personal Technology. Best for Teens, Adults, and Seniors who are patient, systematic, privacy-conscious, and comfortable with files and photo apps. Beginner to Intermediate · Very Low startup · Flexible / Project-Based · Remote or Client-Supervised Device Session · Per Project / Per Hour / Photo-Count Packages / Maintenance Plans · 3 - 10 hrs/week · Starter Membership. Displayed $15 – $50 / project is examples only.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer with adequate storage and current security updates · Reliable internet when cloud services are involved · Client-approved file-transfer/access method · External drive or approved backup destination · Photo inventory checklist · Folder/album naming plan · Written deletion-approval rule · Privacy/confidentiality agreement · Calendar and payment method · Income/expense tracking.",
  },
  {
    id: "before",
    label: "Before accepting",
    detail:
      "Ask where photos are stored (phone, computer, memory cards, external drives, Google Photos, iCloud Photos, OneDrive, Dropbox, social exports). Are files already syncing? Does the client have verified backups? Are there confidential, intimate, medical, legal, child, workplace, or location-sensitive images? Are family members disputing ownership or deletion? Are any devices damaged or failing?",
  },
  {
    id: "security",
    label: "Security rules",
    detail:
      "Client signs in and approves access; do not ask for passwords by text/email. Use multi-factor authentication where available. Collect only the data needed. Do not upload client photos to AI face recognition, enhancement, or third-party tools without written permission. Do not store client libraries on personal cloud accounts. Encrypt or secure working devices/storage where appropriate. Agree on deletion of working copies after acceptance. FTC: https://www.ftc.gov/business-guidance/privacy-security/data-security",
  },
];

export const DIGITAL_PHOTO_ORGANIZER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Photos", url: "https://photos.google.com/", note: "Client-controlled albums when they already use Google" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Client-controlled storage" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake and permissions" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Inventory, project log, revenue, expenses" },
  { label: "FTC data security", url: "https://www.ftc.gov/business-guidance/privacy-security/data-security", note: "Collect only needed information and dispose of it securely" },
];

export const DIGITAL_PHOTO_ORGANIZER_SUPPLIES = {
  starterKitTotal: "About $0–40 — this is primarily a digital service; add a client-approved drive only when needed",
  items: [
    { id: "computer", name: "Computer", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Reliable internet", qty: "1", estCost: "$0", notes: "When cloud services are involved" },
    { id: "drive", name: "External drive for approved working/backup use", qty: "1", estCost: "$0–40", notes: "Client-approved destination" },
    { id: "cables", name: "Charging cables / adapters", qty: "as needed", estCost: "$0–15", notes: "Core" },
    { id: "checklist", name: "Notebook or digital checklist", qty: "1", estCost: "$0–5", notes: "Core" },
    { id: "reader", name: "Memory-card reader", qty: "1", estCost: "$8–20", notes: "Optional", optional: true },
    { id: "usb", name: "USB drive (client-approved only)", qty: "1", estCost: "$8–20", notes: "Optional", optional: true },
    { id: "second-drive", name: "Second external drive for a two-copy workflow", qty: "1", estCost: "$0–40", notes: "Optional", optional: true },
    { id: "labels", name: "Cable labels / drive case", qty: "1 set", estCost: "$3–10", notes: "Optional", optional: true },
    { id: "surge", name: "Surge protector", qty: "1", estCost: "$8–20", notes: "Optional", optional: true },
    { id: "privacy", name: "Privacy screen for in-person work", qty: "1", estCost: "$10–25", notes: "Optional", optional: true },
  ],
};

export const DIGITAL_PHOTO_ORGANIZER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "explorer", name: "File Explorer / Finder", freePlanAvailable: true, planLabelApplicable: false, costNote: "Folder organization on the working computer" },
  { id: "photos-app", name: "Google Photos, Apple Photos, Microsoft Photos, or the client’s chosen app", freePlanAvailable: true, costNote: "Albums and metadata review — client-controlled account", url: "https://photos.google.com/" },
  { id: "drive", name: "Google Drive, iCloud, OneDrive, Dropbox, or approved storage", freePlanAvailable: true, costNote: "Client-controlled storage only", url: "https://drive.google.com/" },
  { id: "dupes", name: "Duplicate-finder tool", freePlanAvailable: true, costNote: "Only after testing and with review-before-delete settings", optional: true },
  { id: "security", name: "Antivirus / security updates", freePlanAvailable: true, planLabelApplicable: false, costNote: "Keep the working device current" },
  { id: "pwm", name: "Password manager + MFA", freePlanAvailable: true, costNote: "Account security — client keeps credentials" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Intake and permissions", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Inventory, project log, revenue, expenses", url: "https://sheets.google.com/" },
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Review and delivery dates", url: "https://calendar.google.com/" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Inventory + Verified Backup + Working Copy + Folder/Album Plan + Client Deletion Review + Delivery Log" },
];

export const DIGITAL_PHOTO_ORGANIZER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $15 – $50 / project (examples, not guarantees).",
    "That range fits a small, clean batch. Large libraries, multiple devices, video, damaged media, slow uploads, manual date research, or album creation require a larger quote.",
    "",
    "STARTER PACKAGE EXAMPLES",
    "Up to 250 Photos, One Source: $25 – $50",
    "Up to 1,000 Photos, One Source: $60 – $150",
    "1,000–3,000 Photo Organizing Project: $150 – $400",
    "Hourly Sorting/Album Session: $25 – $60/hour",
    "Monthly Photo Inbox Cleanup: $30 – $100",
    "",
    "COMMON ADD-ONS — EXAMPLES",
    "Additional Device/Cloud Source: +$25 – $75",
    "Video Sorting: +$25 – $100 depending on volume",
    "Manual Date/Event Research: hourly",
    "Scanning Physical Photos: separate per-photo or project quote",
    "Slideshow or Photo Book Prep: separate project",
    "External Drive/Storage: client reimbursement with approval",
    "Rush Delivery: +25–50%",
    "",
    "PRICING FORMULA: Inventory/Transfer Time + Backup Verification Time + Sorting/Renaming Time + Client Review Time + Export/Delivery Time × Target Hourly Value + Storage/Drive Costs + Software/Fees = Quote.",
    "",
    "MONTHLY EXAMPLES: 4 small projects × $40 = $160 gross/month · 2 medium libraries × $175 = $350 gross/month · 1 large project at $350 + 4 maintenance clients at $50 = $550 gross/month.",
    "Gross revenue is NOT profit. Do not guarantee earnings.",
  ].join("\n"),
  raiseTip:
    "Quote from actual file count, sources, and review time. Examples only — not income guarantees.",
  items: [
    { id: "small", label: "Up to 250 photos, one source", price: "$25 – $50", notes: "Small clean batch" },
    { id: "1k", label: "Up to 1,000 photos, one source", price: "$60 – $150" },
    { id: "large", label: "1,000–3,000 photo project", price: "$150 – $400" },
    { id: "hourly", label: "Hourly sorting / album session", price: "$25 – $60 / hour" },
    { id: "monthly", label: "Monthly photo inbox cleanup", price: "$30 – $100" },
    { id: "source", label: "Additional device / cloud source", price: "+$25 – $75" },
  ],
};

export const DIGITAL_PHOTO_ORGANIZER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Photo-Organizing Services",
    desc: [
      "Choose 2–4 offers: Small Camera-Roll Cleanup · Folder/Album Organization · Multi-Device Consolidation · Monthly Photo Maintenance.",
      "Separate scanning, restoration, editing, slideshow creation, photo books, and data recovery from basic organizing.",
    ].join("\n"),
  },
  {
    title: "Set Privacy, Access & Deletion Rules",
    desc: [
      "Write rules for: client-controlled login; no password collection; confidential content; no AI/tool upload without permission; secure working storage; no deletion without client approval; working-copy retention/deletion; incident notification.",
      "Decline illegal content and stop/escalate appropriately if the work creates a safety or legal concern.",
    ].join("\n"),
  },
  {
    title: "Build Your Pricing & Scope System",
    desc: [
      "Quote from: photo/video count; number of devices/accounts; transfer speed; backup condition; duplicate review; metadata/date work; folder/album complexity; client-review time; storage needs.",
      "Set a project cap and change-order rule if the actual library is much larger than described.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: friends/family referrals; senior/community groups; family historians/genealogists; professional organizers; photographers; local technology-help referrals; portfolio website without client images.",
      "Goals: contact 10 trusted prospects. Ask 3 referral partners. Create one sample library using your own photos.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a privacy-first message:",
      "“THOUSANDS OF PHOTOS—NOTHING EASY TO FIND?”",
      "Backup Check • Albums • Folders • Duplicate Review",
      "Packages from: $____",
      "Your account stays under your control.",
      "Book: ________",
      "Never show client images, filenames, dates, faces, locations, or stories without written permission.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels you chose. Contact the 10 trusted prospects and 3 referral partners with the privacy-first message.",
      "Show the sample library made from your own photos — not a client’s library.",
      "Track: Date | Prospect | Channel | Response | Follow-Up.",
      "Honor opt-outs. Do not scrape contact lists or add people to a promotional list without permission.",
    ].join("\n"),
  },
  {
    title: "Inventory Every Source",
    desc: [
      "Create a source list: phone · tablet · computer · memory cards · external drives · cloud libraries · shared albums · social exports.",
      "Record estimated counts, formats, storage size, sync status, and last backup. Do not begin deletion during inventory.",
    ].join("\n"),
  },
  {
    title: "Verify Backup & Create a Working Copy",
    desc: [
      "Confirm at least one separate, readable backup before major changes. Spot-check files from multiple dates/folders. Confirm videos open. Document backup location and date. Work from the approved copy when possible.",
      "A sync service can copy deletions across devices; syncing is not automatically the same as an independent backup.",
    ].join("\n"),
  },
  {
    title: "Build the Folder/Album System & Review Cleanup Candidates",
    desc: [
      "Choose one simple structure, for example YEAR → YEAR-MONTH EVENT, or client-approved albums: Family · Travel · Holidays · School · Work · Favorites · To Print.",
      "Keep original filenames unless renaming is in scope. Preserve metadata where possible.",
      "Review categories: Exact Duplicate · Near Duplicate/Burst · Screenshot · Receipt/Document · Blurry/Accidental · Needs Client Decision.",
      "Move candidates into a review area or album. Let the client approve permanent deletions. Keep a recovery window if the platform supports one.",
    ].join("\n"),
  },
  {
    title: "Deliver, Get Paid & Track Profit",
    desc: [
      "Final checks: counts make sense; sample files open; videos play; folders/albums are clear; client can find key events; backup remains intact; deletion decisions are documented.",
      "Deliver the guide/map to the system. Collect payment. Record revenue, storage, software, transfer supplies, payment fees, and all work/admin time.",
    ].join("\n"),
  },
  {
    title: "Delete Working Copies & Offer Maintenance",
    desc: [
      "After written acceptance and the agreed waiting period: return client media; remove access; sign out of client accounts; delete local/cloud working copies securely; document completion.",
      "Offer a monthly or quarterly photo-inbox cleanup. Ask for a privacy-safe review that does not reveal family details.",
    ].join("\n"),
  },
];

export function digitalPhotoOrganizerToolsDisclaimer(): string {
  return "Beginner stack: Inventory + Verified Backup + Working Copy + Folder/Album Plan + Client Deletion Review + Delivery Log. Client keeps account credentials. Never mix multiple clients’ files in one unlabeled folder or drive. Never use an unknown client USB device without reasonable malware precautions.";
}

export function computeDigitalPhotoOrganizerProfit(input: {
  dpoSmallProjects?: number;
  dpoAvgSmallPrice?: number;
  dpoLargeProjects?: number;
  dpoAvgLargePrice?: number;
  dpoMaintenanceRevenue?: number;
  dpoAddOnRevenue?: number;
  dpoStorageDrives?: number;
  dpoSoftware?: number;
  dpoCablesAdapters?: number;
  dpoPaymentFees?: number;
  dpoAdvertising?: number;
  dpoTravel?: number;
  dpoOtherExpenses?: number;
  dpoInventoryTransferHours?: number;
  dpoSortingReviewHours?: number;
  dpoDeliveryAdminHours?: number;
}): {
  smallRevenue: number;
  largerRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const smallRevenue = n(input.dpoSmallProjects) * n(input.dpoAvgSmallPrice);
  const largerRevenue = n(input.dpoLargeProjects) * n(input.dpoAvgLargePrice);
  const grossServiceRevenue =
    smallRevenue + largerRevenue + n(input.dpoMaintenanceRevenue) + n(input.dpoAddOnRevenue);
  const totalExpenses =
    n(input.dpoStorageDrives) +
    n(input.dpoSoftware) +
    n(input.dpoCablesAdapters) +
    n(input.dpoPaymentFees) +
    n(input.dpoAdvertising) +
    n(input.dpoTravel) +
    n(input.dpoOtherExpenses);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    n(input.dpoInventoryTransferHours) + n(input.dpoSortingReviewHours) + n(input.dpoDeliveryAdminHours);
  return {
    smallRevenue,
    largerRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
