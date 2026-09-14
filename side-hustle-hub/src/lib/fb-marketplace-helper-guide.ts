/**
 * Facebook Marketplace Listing Helper (`fb-marketplace-helper`, Guide #067).
 * Listing preparation + guided posting. Owner keeps the account and sale proceeds.
 * Plain data only (no imports from guide-tools).
 */

export const FB_MARKETPLACE_HELPER_REALITY_CHECK = {
  title: "HELP WITH THE LISTING — DO NOT TAKE OVER THE CLIENT’S ACCOUNT",
  body: [
    "Photograph, organize, research, write, and help neighbors post clear Facebook Marketplace listings. The owner keeps control of the account, sale decisions, payments, and buyer arrangements.",
    "",
    "The client should own or have authority to sell every item, control the Marketplace account, approve every photo/description/price/listing, accept or decline offers, confirm payment, control pickup or delivery, and receive the sale proceeds.",
    "The helper organizes and numbers items, records details, takes honest photos, researches comparables, drafts copy, helps the owner publish approved listings, and provides only the buyer-message or pickup support in the written agreement.",
    "",
    "Never ask for or store a client’s Facebook password, login code, payment verification code, identity document, or financial-account information. Do not impersonate the owner.",
    "In the United States, the Marketplace account holder must be an adult (at least 18). A teen may help an adult with sorting, measurements, photos, and drafts; the eligible adult controls the account and transaction.",
    "Facebook eligibility, features, categories, and Commerce Policies change. Confirm CURRENT official rules before you post.",
    "",
    "HELPER SERVICE REVENUE is what the client pays you. CLIENT SALE PROCEEDS are what buyers pay the owner. Do not count merchandise value or buyer payments as your revenue.",
    "Never hide damage. Never invent a brand, model, age, condition, or price from AI or visual search.",
    "",
    "Tagline: Turn Clutter Into Clear Listings.",
  ].join("\n"),
};

export const FB_MARKETPLACE_HELPER_NOTES_WORKSHEET = `MY FACEBOOK MARKETPLACE LISTING PLAN

MY SERVICE SETUP
Service Area: ________
Single Listing Price: $____
Three-Listing Package: $____
Five-Listing Package: $____
Session Limit/Price: ________
Refresh Price: $____
Message Support Price: $____
Travel/Rush Rule: ________

CLIENT PROJECT
Client: ________
Private Address: ________
Contact: ________
Appointment: ________
Approximate Items: ____
Package/Service: ________
Item or Time Limit: ________
Quoted Price: $____
Payment Due: ________
Who Handles Messages: ________
Who Handles Pickup: ________
Portfolio Permission: ☐ Yes ☐ No

ITEM WORKSHEET
Item Number: ________
Item Name: ________
Brand/Model: ________
Size/Dimensions: ________
Color/Material: ________
Included Accessories: ________
Working/Testing Status: ________
Condition/Flaws: ________
Comparable Prices: Low $____ | Middle $____ | High $____
Owner Asking Price: $____
Owner Minimum Price: $____
Pickup Notes: ________
Approval: Draft / Approved / Posted / Pending / Sold / Removed

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Contacts: ____
Responses: ____
Appointments: ____
Referrals: ____

PROJECT RESULTS
Listings Completed: ____
Base Service Revenue: $____
Add-On Revenue: $____
Expenses: $____
Profit: $____
Total Hours: ____
Effective Profit Per Hour: $____
Review Requested: ☐
Rebooked: ☐
Refresh Date: ________
What Worked: ________
What I Will Improve: ________

GYSH PRO TIP
Do not start with an entire garage.
Start with one trusted adult client and five ordinary household items.
NUMBER ITEMS → RECORD DETAILS → TAKE HONEST PHOTOS → RESEARCH → WRITE → GET APPROVAL → POST → TRACK → REFRESH → REBOOK

STARTER CHALLENGE
Complete one five-item pilot project:
1. Define your service boundary
2. Set one small-package price
3. Create a client intake form
4. Create an item worksheet
5. Choose 2–3 marketing channels
6. Contact 8–12 appropriate prospects/referral sources
7. Screen the client and items
8. Number and photograph five items
9. Research and draft five accurate listings
10. Get written owner approval
11. Help the owner publish without sharing credentials
12. Track time, expenses, profit, and effective hourly rate
13. Set a 7–14 day refresh date
14. Ask for a truthful review and one referral
`;

export const FB_MARKETPLACE_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Photograph, organize, research, write, and help neighbors post clear Facebook Marketplace listings. The owner keeps the account, sale decisions, payments, and buyer arrangements. Tagline: Turn Clutter Into Clear Listings. Category: Local Services / Online Selling Assistance. Beginner · 3 - 10 hrs/week · Displayed $15 – $50 / project (examples only).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Smartphone with a working camera · reliable internet · measuring tape · notes or item worksheet · photo organization system · client intake form · written service/pricing agreement · owner approval process · payment method for YOUR service fee · calendar · revenue/expense/time tracker · safe transportation and appointment plan.",
  },
  {
    id: "before",
    label: "Before you accept a project",
    detail:
      "Confirm the client owns or has authority to sell every item; an eligible adult controls the Marketplace account; approximate item count and types; items appear eligible under current Facebook Commerce Policies; exact services, item/session/revision limits, price and payment timing; who handles messages, offers, payment, pickup, delivery, and unsold items; photo permission; whether anonymous work samples may be used; travel, parking, stairs, pets, lighting, storage, lifting; what happens if the count or condition differs.",
  },
  {
    id: "refuse",
    label: "Do not accept",
    detail:
      "Items that appear stolen, counterfeit, recalled, prohibited, hazardous, contaminated, or unsafe. Jobs where ownership is unclear or the client asks you to hide damage or make false claims. Never collect Facebook passwords, login codes, payment verification codes, identity documents, or financial-account information.",
  },
  {
    id: "privacy",
    label: "Photo and privacy rules",
    detail:
      "Keep house numbers, mail, family photos, children, license plates, keys, alarm panels, identity documents, and other private information out of listing photos. Use a general area, not a public street address.",
  },
  {
    id: "client-provides",
    label: "The client should provide",
    detail:
      "Merchandise, accessories and included parts, manuals, original boxes, receipts or proof of purchase where relevant, safe outlet access if testing is authorized, and ownership, condition, and history information. Do not clean, repair, test, plug in, erase, factory-reset, disassemble, or move an item unless the owner approves the task and it can be done safely. Do not lift heavy items alone.",
  },
  {
    id: "teens",
    label: "Teen assistants",
    detail:
      "Responsible teens may assist only under parent/guardian supervision. The eligible adult (18+) controls the Marketplace account, appointments, public posts, transportation, and the transaction.",
  },
];

export const FB_MARKETPLACE_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Facebook Marketplace", url: "https://www.facebook.com/marketplace/", note: "Publish approved listings from the owner’s account" },
  { label: "Facebook Commerce Policies", url: "https://www.facebook.com/policies_center/commerce", note: "Current prohibited and restricted content" },
  { label: "Facebook Marketplace Eligibility", url: "https://www.facebook.com/help/1968285150185577", note: "Who can currently use Marketplace" },
  { label: "Facebook Marketplace Scam Guidance", url: "https://www.facebook.com/help/2374002556073992/", note: "Current fraud warnings" },
  { label: "Facebook Marketplace Meetup Safety", url: "https://www.facebook.com/help/2329750133711372", note: "Current in-person exchange guidance" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Draft listing copy and reusable replies" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Item number, approval, live link, helper fee, status, expenses, time" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Transfer approved photos without sharing passwords" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Sessions, listing reviews, pickup windows" },
  { label: "Google Lens", url: "https://lens.google/", note: "Research aid only — verify every result against the actual item" },
  { label: "eBay Advanced Search", url: "https://www.ebay.com/sch/ebayadvsearch", note: "Sold/completed comps where useful" },
  { label: "Canva", url: "https://www.canva.com/", note: "Optional service flyer" },
];

export const FB_MARKETPLACE_HELPER_SUPPLIES = {
  starterKitTotal: "About $0–40 when using a phone and tape you already own",
  items: [
    { id: "phone", name: "Smartphone with camera", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "tape", name: "Measuring tape", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "backdrop", name: "Plain wall, sheet, foam board, or uncluttered surface", qty: "1", estCost: "$0–15", notes: "Essential backdrop" },
    { id: "notebook", name: "Notebook and pen or digital item worksheet", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "labels", name: "Small removable number labels or index cards", qty: "1 pack", estCost: "$2–6", notes: "Essential — same number on notes, photos, draft, and tracker" },
    { id: "cloth", name: "Microfiber cloth and lint roller", qty: "1 each", estCost: "$3–8", notes: "Light surface cleanup with owner approval only" },
    { id: "charger", name: "Phone charger", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "tote", name: "Reusable tote or small bin", qty: "1", estCost: "$0–10", notes: "Organize photographed items without removing them from the property" },
    { id: "powerbank", name: "Portable phone charger", qty: "1", estCost: "$10–25", notes: "Helpful", optional: true },
    { id: "tripod", name: "Small tripod or phone stand", qty: "1", estCost: "$8–20", notes: "Helpful", optional: true },
    { id: "foam", name: "White foam board", qty: "1", estCost: "$4–10", notes: "Background or light bounce", optional: true },
    { id: "gloves", name: "Disposable gloves", qty: "1 pack", estCost: "$3–8", notes: "Dusty garages or storage", optional: true },
    { id: "flashlight", name: "Flashlight", qty: "1", estCost: "$0–8", notes: "Model numbers or dim storage", optional: true },
    { id: "cord", name: "Extension cord only when safe and approved", qty: "1", estCost: "$0–10", notes: "Optional", optional: true },
  ],
};

export const FB_MARKETPLACE_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "marketplace", name: "Facebook Marketplace", freePlanAvailable: true, costNote: "Publish approved listings from the eligible owner’s account — never take their password", url: "https://www.facebook.com/marketplace/" },
  { id: "commerce", name: "Facebook Commerce Policies", freePlanAvailable: true, planLabelApplicable: false, costNote: "Check current prohibited and restricted content", url: "https://www.facebook.com/policies_center/commerce" },
  { id: "eligibility", name: "Facebook Marketplace Eligibility", freePlanAvailable: true, planLabelApplicable: false, costNote: "Confirm who can currently use Marketplace (U.S. account holder 18+)", url: "https://www.facebook.com/help/1968285150185577" },
  { id: "scams", name: "Facebook Marketplace Scam Guidance", freePlanAvailable: true, planLabelApplicable: false, costNote: "Review current fraud warnings", url: "https://www.facebook.com/help/2374002556073992/" },
  { id: "meetup", name: "Facebook Marketplace Meetup Safety", freePlanAvailable: true, planLabelApplicable: false, costNote: "Review current in-person exchange guidance", url: "https://www.facebook.com/help/2329750133711372" },
  { id: "camera", name: "Phone Camera / Photos App", freePlanAvailable: true, planLabelApplicable: false, costNote: "Take, crop, and organize accurate listing photos" },
  { id: "google_docs", name: "Google Docs / Notes", freePlanAvailable: true, costNote: "Draft listing copy, client instructions, and reusable replies — sign in with Google, or use an account you already have", url: "https://accounts.google.com/ServiceLogin?continue=https://docs.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Item number, price, owner approval, live link, helper fee, status, expenses, time", url: "https://sheets.google.com/" },
  { id: "drive", name: "Google Drive / Shared Album", freePlanAvailable: true, costNote: "Transfer approved photos and copy without sharing account passwords", url: "https://drive.google.com/" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Client sessions, listing reviews, and approved pickup windows", url: "https://calendar.google.com/" },
  { id: "lens", name: "Google Lens", freePlanAvailable: true, costNote: "Research aid only — verify every result against the actual item", url: "https://lens.google/", optional: true },
  { id: "ebay", name: "eBay Advanced Search", freePlanAvailable: true, costNote: "Sold/completed comps where useful — not a guaranteed selling price", url: "https://www.ebay.com/sch/ebayadvsearch", optional: true },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Optional service flyer or social graphic", url: "https://www.canva.com/", optional: true },
  { id: "calc", name: "Calculator / GYSH Calculator", freePlanAvailable: true, planLabelApplicable: false, costNote: "Project fees, expenses, profit, and effective hourly rate" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Phone Camera + Measuring Tape + Item Worksheet + Google Docs + Google Sheets + Shared Photo Folder + Calendar" },
];

export const FB_MARKETPLACE_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "FACEBOOK MARKETPLACE LISTING HELPER — PRICING EXAMPLES",
    "",
    "Displayed $15 – $50 / project is examples only, not a guarantee. Use that range for small starter projects. Show larger bundles, sessions, and optional support separately.",
    "",
    "CLIENT SALE PROCEEDS (what buyers pay the owner) are NOT helper service revenue.",
    "Charge for listing work completed whether or not the item later sells. Do not make the normal service fee depend on buyer behavior or the owner’s later decision to lower, remove, donate, or keep the item.",
    "",
    "STARTER SERVICE EXAMPLES",
    "Single standard listing: $15 – $25 (photos, measurements, basic comps, title, description, owner approval)",
    "Three-listing mini package: $35 – $60 (one scheduled visit)",
    "Five-listing starter bundle: $50 – $90 (one visit, one approval round)",
    "Listing blitz session: $90 – $150 (about 3 hours OR a stated item limit, whichever comes first)",
    "Listing refresh: $10 – $20 per listing",
    "Complex item research: add $5 – $15 per item",
    "Buyer-message support: $20 – $40 per week (owner still makes all price and buyer decisions)",
    "Completed-sale coordination fee: $10 – $20 per completed sale (optional; define when it is earned)",
    "Commission option: 10% – 15% as a planning example only, with a written minimum fee, payment timing, and a definition of a completed sale. Flat or package pricing is usually simpler for beginners.",
    "Rush / extra travel: $10 – $30",
    "",
    "PRICING FORMULA",
    "Estimated Work Hours × Target Labor Rate + Travel/Parking + Supplies + Complex-Item Research + Buyer-Message/Pickup Support + Other Approved Add-Ons = Project Quote.",
    "Then compare with local demand and actual complexity. Use a minimum project fee so a one-item visit still covers setup and travel.",
    "",
    "MONTHLY EXAMPLES — NOT GUARANTEES",
    "4 small projects × $45 = $180 gross/month",
    "6 projects × $65 average = $390 gross/month",
    "8 projects × $90 average = $720 gross/month",
    "Gross is not profit. Earnings depend on demand, item count, complexity, travel, revisions, support, expenses, cancellations, and hours.",
  ].join("\n"),
  raiseTip:
    "Raise after a few clean projects, or add refresh and message-support packages. Displayed $15 – $50 / project is examples only.",
  items: [
    { id: "single", label: "Single standard listing", price: "$15–$25", notes: "Examples only" },
    { id: "three", label: "Three-listing mini package", price: "$35–$60", notes: "Examples only" },
    { id: "five", label: "Five-listing starter bundle", price: "$50–$90", notes: "Examples only" },
    { id: "blitz", label: "Listing blitz session", price: "$90–$150", notes: "~3 hours or stated item limit" },
    { id: "refresh", label: "Listing refresh", price: "$10–$20 / listing", notes: "Examples only" },
    { id: "research", label: "Complex item research", price: "+$5–$15 / item", notes: "Examples only" },
    { id: "messages", label: "Buyer-message support", price: "$20–$40 / week", notes: "Owner still decides" },
    { id: "sale", label: "Completed-sale coordination", price: "$10–$20 / sale", notes: "Optional" },
    { id: "rush", label: "Rush / extra travel", price: "$10–$30", notes: "Examples only" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only. */
export const FB_MARKETPLACE_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Service & Account Boundaries",
    desc: [
      "Choose 2–4 services:",
      "☐ Listing preparation only",
      "☐ Guided posting while the owner controls the account",
      "☐ Closet/garage listing session with an item or time limit",
      "☐ Listing refresh",
      "☐ Limited buyer-message support",
      "",
      "Write:",
      "“I prepare accurate listing materials and help the owner post them. The owner controls the Marketplace account, approves every listing, makes all offer and buyer decisions, receives sale payments, and controls pickup or delivery.”",
      "",
      "Do not collect passwords or verification codes. Avoid posting a client’s merchandise from your own profile — buyers may treat you as the seller.",
    ].join("\n"),
  },
  {
    title: "Set Your Packages, Prices & Written Terms",
    desc: [
      "Choose simple starter prices using Suggested Pricing.",
      "",
      "Write:",
      "Single Listing: $____",
      "Three-Listing Package: $____",
      "Five-Listing Package: $____",
      "Session Limit: ____ hours OR ____ items",
      "Listing Refresh: $____",
      "Complex Research Add-On: $____",
      "Buyer-Message Support: $____",
      "Travel/Rush Add-On: $____",
      "",
      "For each project define item count or time limit, exact tasks, revisions, travel area, payment amount and due date, who manages messages/offers/pickup/unsold items, and what happens when scope increases. Use a minimum project fee so a one-item visit still covers setup and travel.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about the service. Pick only 2 or 3 this month.",
      "",
      "Good channels:",
      "☐ Friends / family / referrals",
      "☐ Trusted neighbors",
      "☐ Neighborhood Facebook groups where promotion is permitted",
      "☐ Nextdoor",
      "☐ Community, church, military-family, senior, or neighborhood contacts",
      "☐ Apartment/condo bulletin boards where permitted",
      "☐ Cleaners, organizers, movers, estate-sale helpers, or real estate contacts",
      "☐ Simple printed flyer",
      "",
      "Write one measurable goal for each.",
      "Examples:",
      "- Tell 10 trusted neighbors or personal contacts.",
      "- Post in 2 approved neighborhood groups.",
      "- Ask 5 organizers, cleaners, movers, or real estate contacts for referrals.",
      "",
      "For a teen assistant, a parent/guardian controls public posts, contact information, appointments, transportation, and client communication.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple flyer/post:",
      "",
      "“CLEARING A CLOSET, GARAGE, OR SPARE ROOM?”",
      "I help turn household items into clear, ready-to-post Facebook Marketplace listings.",
      "Photos • Measurements • Price Research • Descriptions • Guided Posting",
      "Starter projects from $____",
      "Serving: ________",
      "Contact: ________",
      "The item owner keeps control of the Facebook account, approves every listing, receives buyer payment, and makes all final sale decisions.",
      "",
      "Create:",
      "☐ Short service description",
      "☐ Package or starting-price language",
      "☐ Service area",
      "☐ Contact method",
      "☐ Client intake questions",
      "☐ One referral message",
      "☐ One anonymous before/after template only for client-approved work",
      "",
      "Optional: Open Canva at https://www.canva.com/ (Free plan available — sign in at the link or use an account you already have).",
      "Never publish a client’s name, address, home interior, possessions, phone number, sale proceeds, or account information without permission.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week use only the 2–3 channels you selected.",
      "",
      "Warm outreach: contact 8–12 appropriate people or referral sources.",
      "",
      "Sample:",
      "“Hi! I’m opening a few local Facebook Marketplace listing-helper appointments. I organize and photograph household items, research comparable prices, write clear descriptions, and help the owner post the approved listing. The owner keeps control of the account and sale decisions. Starter projects begin at $____. Do you or someone you know have a small batch ready to list?”",
      "",
      "Track: Date | Prospect | Channel | Approximate Items | Response | Follow-Up | Booked",
      "",
      "Do not spam groups or direct messages. Do not broadly publish a private home address or a minor’s personal contact information.",
    ].join("\n"),
  },
  {
    title: "Screen the Client, Items & Work Area",
    desc: [
      "Before booking, ask:",
      "- Does the client own or have authority to sell every item?",
      "- What types of items and approximately how many?",
      "- Are any items heavy, sharp, broken, dirty, infested, recalled, restricted, hazardous, high-value, or possibly counterfeit?",
      "- Are model numbers, receipts, manuals, accessories, or original packaging available?",
      "- Local pickup, shipping, or both?",
      "- Safe space and lighting for photos? Stairs, pets, parking, smoke, mold, pests, lifting?",
      "- Who will be present?",
      "- Deadline, price expectation, and plan for unsold items?",
      "",
      "Use a written text, email, or intake/agreement form for services, item or time limit, price, payment, permissions, responsibilities, cancellation, and portfolio permission.",
      "Decline or pause when ownership is unclear, the work area feels unsafe, an item may violate law or platform policy, or the client asks you to hide a defect or make a false claim.",
    ].join("\n"),
  },
  {
    title: "Inventory Items & Research Asking Prices",
    desc: [
      "Assign each item a simple number. Use the same number in the notes, photo folder, listing draft, approval message, and status tracker.",
      "",
      "Record: short name, brand/model, size/dimensions, color/material, included parts, working or testing status, visible wear/damage/stains/odors/repairs/missing parts, pickup limitations, owner’s preferred asking price and minimum.",
      "",
      "Research several genuinely comparable items (brand, model, size, age, condition, accessories, local pickup). Active asking prices show what sellers want. Sold/completed results, where available, may better show what buyers paid. Record a low, middle, and high comparison, then suggest an asking price. The owner makes the final price decision.",
      "If a fact is unknown, write “unknown” or ask the owner. Do not guess. AI, Lens, and comps are research aids only — verify every detail with the actual item.",
    ].join("\n"),
  },
  {
    title: "Photograph Each Item & Write the Listing",
    desc: [
      "Photo checklist:",
      "☐ Clean the camera lens",
      "☐ Bright, indirect light and an uncluttered background",
      "☐ Strongest full-item view first",
      "☐ Front, back, sides, labels/model numbers, accessories, size/scale, and all flaws",
      "☐ Realistic colors — no filters that misrepresent the item",
      "☐ Private information out of the frame",
      "☐ Keep each item’s photos in its numbered folder or album",
      "",
      "TITLE = [Brand or descriptive name] + [Item] + [Model/Size/Color/Key Feature] + [Condition]",
      "",
      "DESCRIPTION: what it is, overall condition, measurements, material/color, included parts, working/testing status, known wear/damage/repairs/stains/odors/missing parts, general pickup area and limitations, approved price and offer terms.",
      "Use only verified details. Do not copy another seller’s photos or description. Do not hide damage.",
    ].join("\n"),
  },
  {
    title: "Get Owner Approval & Publish Safely",
    desc: [
      "Before publishing, confirm: correct item and photo set, title/category/description/condition, asking price, included/excluded accessories, flaws and testing status, general location only (not a public street address), offer/payment/pickup/delivery terms.",
      "",
      "Approval message:",
      "“Please reply APPROVED for Item ____ at $____ with the attached photos and description, or send the exact changes you want before it is posted.”",
      "",
      "The owner should sign in and control the account. The helper may sit beside the owner, guide the process, or deliver a ready-to-paste package. Never take the password.",
      "Select the closest accurate category, upload approved photos in a useful order, enter the approved details, check every field, and save the live link and post date in the tracker.",
      "If a listing is rejected, read the current notice and Commerce Policies. Correct an honest category or wording mistake or appeal when appropriate. Do not repeatedly repost prohibited content.",
    ].join("\n"),
  },
  {
    title: "Manage Approved Messages, Pickup & Project Profit",
    desc: [
      "Provide buyer-message support only when included in the agreement.",
      "",
      "Message rules: keep communication on Facebook/Messenger when possible; answer only from the item worksheet; send price, hold, delivery, and unusual decisions to the owner; never send verification codes; never trust a payment screenshot; never click unusual buyer payment links; never refund an alleged overpayment until the owner independently verifies the actual account; stop and report suspicious activity.",
      "",
      "Routine reply:",
      "“Yes, it is available. The listed price is $____. Pickup is near [general area]. What day and approximate time are you available? I will confirm the final window with the owner.”",
      "",
      "Pickup: prefer a public, well-lit location for portable items; daylight and another adult for bulky home pickup; keep buyers outside living areas when possible; send the exact address privately only after approval and a confirmed time; the owner verifies payment in the actual account or counts cash before releasing the item; do not lift heavy items alone; cancel if the plan changes, extra people arrive, or anyone feels unsafe.",
      "",
      "After the project record: Service Revenue | Tips | Supplies | Mileage/Travel | Parking | Payment Fees | Advertising | Other Expenses | Total Work/Travel/Admin Time.",
      "Project Profit = Service Revenue − Business Expenses. Effective Profit per Hour = Project Profit ÷ Total Hours.",
      "Do not count the client’s item-sale proceeds as helper service revenue.",
    ].join("\n"),
  },
  {
    title: "Refresh, Close Out, Ask for a Review & Rebook",
    desc: [
      "Update each listing status: Draft | Approved | Active | Pending | Sold | Donated | Expired | Removed.",
      "Give the owner a list of live links and follow-up dates. Archive or delete client photos and private information according to the agreed retention period.",
      "",
      "After 7–14 days with little interest, offer an approved refresh: first photo, title or description, category, comparable prices. Keep, lower, or remove based on the owner’s decision.",
      "",
      "Review request:",
      "“Thank you for letting me prepare your Marketplace listings. If the photos, descriptions, and organization made the process easier, would you be willing to write a short review I can share? Please describe only your real experience.”",
      "",
      "Then ask whether they want another small batch or know one friend or neighbor who needs the service.",
      "SMALL BATCH → CLEAR LISTINGS → OWNER APPROVAL → SAFE SALE PROCESS → REVIEW → REFERRAL → REPEAT CLIENT",
    ].join("\n"),
  },
];

export function fbMarketplaceHelperToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Phone Camera + Measuring Tape + Item Worksheet + Google Docs + Google Sheets + Shared Photo Folder + Calendar.",
    "",
    "AI, visual search, and comparable listings are research aids only. Never let a tool invent a brand, model, material, age, condition, authenticity, feature, or selling price.",
    "The owner controls the Marketplace account. Never collect passwords, login codes, or payment verification codes.",
  ].join("\n");
}

/** Monthly listing-helper profit. Do not count client merchandise sale proceeds. */
export function computeFbMarketplaceHelperProfit(input: {
  fbMarketplaceProjects?: number;
  averageBaseProjectFee?: number;
  listingRefreshIncome?: number;
  complexResearchIncome?: number;
  buyerMessageSupportIncome?: number;
  rushTravelAddOnIncome?: number;
  otherEarnedServiceIncome?: number;
  supplies?: number;
  mileageTransportation?: number;
  parking?: number;
  softwarePhone?: number;
  advertisingPrinting?: number;
  paymentFees?: number;
  otherExpenses?: number;
  clientSessionHours?: number;
  travelHours?: number;
  researchWritingPostingHours?: number;
  messageFollowUpAdminHours?: number;
}): {
  baseRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const projects = Math.max(0, Number(input.fbMarketplaceProjects) || 0);
  const baseRevenue = projects * Math.max(0, Number(input.averageBaseProjectFee) || 0);
  const grossServiceRevenue =
    baseRevenue +
    Math.max(0, Number(input.listingRefreshIncome) || 0) +
    Math.max(0, Number(input.complexResearchIncome) || 0) +
    Math.max(0, Number(input.buyerMessageSupportIncome) || 0) +
    Math.max(0, Number(input.rushTravelAddOnIncome) || 0) +
    Math.max(0, Number(input.otherEarnedServiceIncome) || 0);
  const totalExpenses =
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.mileageTransportation) || 0) +
    Math.max(0, Number(input.parking) || 0) +
    Math.max(0, Number(input.softwarePhone) || 0) +
    Math.max(0, Number(input.advertisingPrinting) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.clientSessionHours) || 0) +
    Math.max(0, Number(input.travelHours) || 0) +
    Math.max(0, Number(input.researchWritingPostingHours) || 0) +
    Math.max(0, Number(input.messageFollowUpAdminHours) || 0);
  return {
    baseRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
