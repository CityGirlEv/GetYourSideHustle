/**
 * Family Photo Slideshow Creator (`family-photo-slideshow`, Guide #069).
 * Client photos → slideshow video. Plain data only.
 */

export const FAMILY_PHOTO_SLIDESHOW_REALITY_CHECK = {
  title: "CLIENT PHOTOS STAY PRIVATE — LICENSE THE MUSIC",
  body: [
    "Organize client-provided family photos into a polished slideshow for reunions, birthdays, anniversaries, graduations, or memorials.",
    "",
    "GROSS REVENUE = Base + add-ons + rush + extra revisions + extra versions.",
    "ESTIMATED PROFIT = Gross − software − licensed music − storage − payment fees − advertising − scanning/travel − other.",
    "",
    "Do not publicly share family photos without explicit permission.",
    "A streaming-song subscription does not grant commercial/video sync rights. Use licensed music or client-approved media with rights.",
    "Confirm spelling of names, dates, and captions. Be especially respectful on memorial projects.",
    "Do not promise restoration of badly damaged photos unless you offer that service.",
    "Clarify file retention. Keep a backup while the project is active.",
    "",
    "Tagline: Order the Photos. License the Music. Get Approval Before Export.",
  ].join("\n"),
};

export const FAMILY_PHOTO_SLIDESHOW_NOTES_WORKSHEET = `MY FAMILY PHOTO SLIDESHOW PLAN

CLIENT
Name: ________  Phone/Email: ________
Event: ________  Event date: ________  Deadline: ________

PROJECT
Type: ________  Estimated length: ________
Number of photos: ____  Organized by client: Y / N
Physical photos to scan: Y / N
Theme / orientation: ________

CONTENT
Opening title: ________  Sections: ________
Names / dates / captions: ________
Closing message: ________  Photo order confirmed: ☐

AUDIO
Music requested: ________  Source: ________  Usage rights confirmed: ☐
Voiceover: ________

PRICING
Base: $____  Add-ons: $____  Rush: $____
Included revisions: ____  Extra revision fee: $____
Total: $____  Deposit: $____  Balance: $____

PROOF / DELIVERY
Names, dates, captions, order, audio checked: ☐  Client approved: ☐
Final format / versions: ________  Delivered: ________
Backup retention date: ________  Payment complete: ☐

RESULTS
Gross: $____  Expenses: $____  Profit: $____  Hours: ____  Profit/hour: $____
Testimonial: ☐  Referral: ☐
`;

export const FAMILY_PHOTO_SLIDESHOW_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this side-hustle is", detail: "Turn family photos into a simple slideshow video for reunions and celebrations. 3 - 10 hrs/week. $15 – $50 / project is examples only — price by photo count and editing." },
  { id: "rights", label: "Privacy and music rights", detail: "Client photos only for the agreed project. Licensed or client-approved audio. No public posts without permission." },
];

export const FAMILY_PHOTO_SLIDESHOW_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Beginner slideshow / titles" },
  { label: "CapCut", url: "https://www.capcut.com/", note: "Optional video editor" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Receive and deliver files" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Projects and profit" },
];

export const FAMILY_PHOTO_SLIDESHOW_SUPPLIES = {
  starterKitTotal: "Lean digital kit — about $0–30 if you already have a computer",
  items: [
    { id: "computer", name: "Computer or capable tablet + internet", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "phone", name: "Smartphone", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "storage", name: "Digital storage + backup / cloud", qty: "1", estCost: "$0–12", notes: "Essential" },
    { id: "headphones", name: "Headphones", qty: "1", estCost: "$0–15", notes: "Essential for audio checks" },
    { id: "scan", name: "Optional scanner for physical photographs", qty: "1", estCost: "$0–40", notes: "Add-on", optional: true },
    { id: "drive", name: "Optional external drive / card reader", qty: "1", estCost: "$8–25", notes: "Optional", optional: true },
  ],
};

export const FAMILY_PHOTO_SLIDESHOW_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Titles and simple slideshow — Free plan available", url: "https://www.canva.com/" },
  { id: "capcut", name: "CapCut (or Clipchamp / iMovie)", freePlanAvailable: true, costNote: "Beginner editor — pick one", url: "https://www.capcut.com/" },
  { id: "drive", name: "Google Drive", freePlanAvailable: true, costNote: "Receive / deliver client files", url: "https://drive.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Event, deadline, photo count, music", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Quotes, hours, profit", url: "https://sheets.google.com/" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Deadlines", url: "https://calendar.google.com/" },
  { id: "music", name: "Licensed music / audio source", freePlanAvailable: true, planLabelApplicable: false, costNote: "Do not use streaming-subscription songs as commercial sync" },
  { id: "pay", name: "Payment / invoicing", freePlanAvailable: true, planLabelApplicable: false, costNote: "Deposit and final" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Canva or CapCut + Drive + Forms + Sheets + Calendar + Licensed music + Payment" },
];

export const FAMILY_PHOTO_SLIDESHOW_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "FAMILY PHOTO SLIDESHOW — PROJECT PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not a guarantee.",
    "GROSS = Base + add-ons + rush + extra revisions + extra versions.",
    "PROFIT = Gross − software − licensed music − storage − fees − ads − scanning/travel − other.",
    "",
    "Simple short slideshow: about $25–$50",
    "Medium with titles/transitions/music: about $50–$100",
    "Larger/custom: about $100–$250+",
    "Add-ons: rush, extra revisions, scanning/organization, extra export/version",
  ].join("\n"),
  raiseTip: "Raise after you know minutes per photo. Licensed music is a cost. Examples only.",
  items: [
    { id: "basic", label: "Simple short slideshow", price: "$25–$50", notes: "Organized client photos" },
    { id: "med", label: "Medium slideshow", price: "$50–$100", notes: "Titles, transitions, music" },
    { id: "large", label: "Larger / custom", price: "$100–$250+", notes: "Examples only" },
    { id: "scan", label: "Scanning / organization add-on", price: "Quoted", notes: "Optional" },
    { id: "rush", label: "Rush / extra revision / extra version", price: "Quoted", notes: "Optional" },
  ],
};

export const FAMILY_PHOTO_SLIDESHOW_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Define Packages and Create a Sample Portfolio", desc: "Write length, photo-count bands, included revisions, and formats. Sample video must use media you own or have permission to show." },
  { title: "Build Client Intake and Collect Photos / Media", desc: "Open Google Forms and Drive from the Tools tab. Event, deadline, photo count, captions, music request, scanning need." },
  { title: "Organize Photos and Confirm Names, Dates, and Captions", desc: "Order, spelling, special photos. Ask — do not guess names on memorial projects." },
  { title: "Confirm Style/Theme and Legally Usable Music", desc: "Client-approved look. License music or use client-approved audio with rights. Streaming subscriptions are not sync licenses." },
  { title: "Quote Scope, Revisions, Deadline, and Deposit", desc: "Open Google Sheets. Price from Suggested Pricing examples. Written approval before you edit." },
  { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3: referrals · Facebook · community groups · reunion/event organizers · churches · event planners · memorial contacts (sensitive)." },
  { title: "Make Your Marketing Materials", desc: "Open Canva at https://www.canva.com/. Portfolio clip using permitted media only. Clear packages and contact. Never post client family photos without permission." },
  { title: "Carry Out Your Marketing Plan", desc: "Warm contacts, permitted posts, quote by photo count and whether files arrive organized." },
  { title: "Build and Edit the Slideshow", desc: "Titles, order, transitions, captions, audio. Keep a backup." },
  { title: "Proof, Client Review, Included Revisions, Final Export", desc: "Check names/dates/captions/order/audio. Client approval before final. Extra rounds are add-ons." },
  { title: "Deliver, Set Retention, Collect Payment, and Ask for Referrals", desc: "Deliver agreed formats, note backup date, collect payment, record profit/hours, request testimonial/referral." },
];

export function familyPhotoSlideshowToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Canva or CapCut + Drive + Forms + Sheets + Calendar + Licensed music + Payment.",
    "",
    "Do not use Spotify/Apple Music tracks as commercial video music. Client photos are not portfolio content without permission.",
  ].join("\n");
}

export function computeFamilyPhotoSlideshowProfit(input: {
  slideshowBasicProjects?: number;
  basicPrice?: number;
  largeProjects?: number;
  largePrice?: number;
  scanningAddOns?: number;
  rushFees?: number;
  extraRevisionRevenue?: number;
  extraVersionRevenue?: number;
  softwareAllocation?: number;
  licensedMusic?: number;
  cloudStorage?: number;
  paymentFees?: number;
  advertising?: number;
  scanningTravel?: number;
  otherExpenses?: number;
  laborHours?: number;
  projectsCompleted?: number;
}): {
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerProject: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossRevenue =
    Math.max(0, Number(input.slideshowBasicProjects) || 0) * Math.max(0, Number(input.basicPrice) || 0) +
    Math.max(0, Number(input.largeProjects) || 0) * Math.max(0, Number(input.largePrice) || 0) +
    Math.max(0, Number(input.scanningAddOns) || 0) +
    Math.max(0, Number(input.rushFees) || 0) +
    Math.max(0, Number(input.extraRevisionRevenue) || 0) +
    Math.max(0, Number(input.extraVersionRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.softwareAllocation) || 0) +
    Math.max(0, Number(input.licensedMusic) || 0) +
    Math.max(0, Number(input.cloudStorage) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.scanningTravel) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const projects = Math.max(0, Number(input.projectsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerProject: projects > 0 ? estimatedProfit / projects : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
