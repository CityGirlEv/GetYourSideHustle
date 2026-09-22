/**
 * Closet Clean-Out Listing Helper (`closet-cleanout-listing`, Guide #047).
 * Process items AFTER the client decides sell vs donate — photos, details, listings, donations.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const CLOSET_CLEANOUT_LISTING_REALITY_CHECK = {
  title: "THE CLIENT DECIDES WHAT GETS SOLD OR DONATED",
  body: [
    "Your job is to help process items AFTER the client decides what leaves the closet.",
    "",
    "Do not:",
    "- Throw away, donate, or sell anything without approval",
    "- Set final prices without client approval",
    "- Claim an item is authentic unless verified",
    "- Hide stains, damage, alterations, or defects",
    "- Use client marketplace accounts without permission",
    "- Take possession of sale proceeds unless specifically agreed",
    "- Post private information or identifying home details",
    "",
    "For minors, a parent/guardian should approve client meetings, accounts, payments, transportation, and public listings as appropriate.",
    "",
    "Tagline: Clear the Closet. List the Good Stuff. Move the Rest Along.",
  ].join("\n"),
};

export const CLOSET_CLEANOUT_LISTING_NOTES_WORKSHEET = `MY CLOSET LISTING SERVICE

Starter Package: ________
Price: $____
Number of Items Included: ____
Extra Item Price: $____
Service Area: ________

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT PROJECT

Client: ________
Project Date: ________
Marketplace(s): ________
Client Owns Seller Account: ☐
Client Approves Prices: ☐
Who Responds to Buyers: ________
Who Ships/Meets Buyers: ________
Donation Drop-Off Included: ☐

ITEM TRACKER

Item ID | Item | Brand | Size | Condition | Price | Status
------------------------------------------------------------------------
------------------------------------------------------------------------
------------------------------------------------------------------------

PROJECT CHECKLIST

Sell items approved: ☐
Donate items approved: ☐
Photos complete: ☐
Flaws photographed: ☐
Measurements complete: ☐
Descriptions complete: ☐
Prices approved: ☐
Listings published/handed off: ☐
Donation items labeled: ☐
Inventory updated: ☐

MY BUSINESS RESULTS

Project Revenue: $____
Add-Ons: $____
Expenses: $____
Estimated Profit: $____
Hours: ____
Effective Profit/Hour: $____

Client Happy: ☐ Yes ☐ Needs Attention
Rebooked: ☐ Yes ☐ Maybe ☐ No

What Took the Most Time: __________
What I Will Improve: __________

GYSH PRO TIP
THE BOTTLENECK IS OFTEN NOT CLEANING OUT THE CLOSET.
IT’S LISTING THE PILE AFTERWARD.
Make the process fast and repeatable:
ITEM NUMBER → PHOTOS → DETAILS → PRICE APPROVAL → LIST → TRACK
Batch similar tasks together. Photograph several items first, then measure, then write listings. That is usually faster than completing one item from beginning to end before touching the next.

STARTER CHALLENGE
Create a 5-ITEM SAMPLE LISTING BATCH using your own items or items you have permission to use.
For each:
1. Assign an item number
2. Take 5–6 clear photos
3. Record brand/size/condition
4. Take useful measurements
5. Write a title
6. Write a description
7. Research a reasonable price range
8. Put everything into a simple inventory sheet
You now have a sample workflow to show prospective clients without exposing anyone else’s closet.`;

export const CLOSET_CLEANOUT_LISTING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Help clients finish a closet clean-out by sorting the items they already decided to sell or donate, photographing sale items, recording item details, preparing listings, and organizing donation items for drop-off or pickup. Tagline: Clear the Closet. List the Good Stuff. Move the Rest Along. Category: Resale Support / Organization. Best for Teens with parent/guardian approval, Adults, Seniors / Retirees. Beginner · Very low startup · Flexible · Client home / remote listing work · Per project / batch · 3 - 10 hrs/week · Starter Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Smartphone with a good camera · Basic photo skills · Good organization · Basic writing/spelling · Ability to identify visible condition/details · Client-approved listing process · Safe workspace · Parent/guardian involvement for minors.",
  },
  {
    id: "before-starting",
    label: "Before starting, confirm",
    detail:
      "Which items are SELL · Which items are DONATE · Which items remain undecided · Who sets/approves prices · Which marketplace(s) will be used · Who owns/controls the seller account · Who responds to buyers · Who handles payment · Who handles shipping or meetup · Number of listings included · Whether donation drop-off is included · Deadline · Revision limit.",
  },
  {
    id: "minors",
    label: "For minors",
    detail:
      "Parent/guardian approval for client meetings, accounts, payments, transportation, and public listings as appropriate. Age-appropriate items and platforms only. Do not use client marketplace accounts without permission.",
  },
];

export const CLOSET_CLEANOUT_LISTING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Inventory tracker" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Listing drafts" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Photo and file storage" },
  { label: "Canva", url: "https://www.canva.com/", note: "Simple listing graphics" },
];

export const CLOSET_CLEANOUT_LISTING_SUPPLIES = {
  starterKitTotal:
    "About $5–25 to start — do not clean or repair delicate/high-value items without permission",
  items: [
    { id: "phone", name: "Smartphone / camera", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "hangers", name: "Hangers", qty: "1 pack", estCost: "$5–12", notes: "Essential" },
    { id: "background", name: "Clean photo background", qty: "1", estCost: "$0–10", notes: "Essential" },
    { id: "tape", name: "Measuring tape", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "notes", name: "Notes / checklist", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "bags", name: "Bags / boxes for donation", qty: "1 pack", estCost: "$4–10", notes: "Essential" },
    { id: "labels", name: "Labels or sticky notes", qty: "1 pack", estCost: "$2–5", notes: "Essential" },
    { id: "steamer", name: "Garment steamer (where safe)", qty: "1", estCost: "$15–30", notes: "Helpful", optional: true },
    { id: "lint", name: "Lint roller", qty: "1", estCost: "$3–8", notes: "Helpful", optional: true },
    { id: "backdrop", name: "Small photo backdrop", qty: "1", estCost: "$8–20", notes: "Helpful", optional: true },
    { id: "tripod", name: "Tripod", qty: "1", estCost: "$10–25", notes: "Helpful", optional: true },
    { id: "rack", name: "Clothing rack", qty: "1", estCost: "$15–40", notes: "Helpful", optional: true },
    { id: "bins", name: "Storage bins for listed items", qty: "1–2", estCost: "$8–20", notes: "Helpful", optional: true },
  ],
};

export const CLOSET_CLEANOUT_LISTING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "ccl_camera",
    name: "Smartphone camera",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Photograph the actual item being sold",
  },
  {
    id: "ccl_editor",
    name: "Basic photo editor",
    freePlanAvailable: true,
    costNote: "Crop and brighten — do not hide defects",
  },
  {
    id: "ccl_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple graphics if needed",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "ccl_marketplace",
    name: "Client-approved resale marketplace",
    freePlanAvailable: true,
    costNote: "Verify current age, account, fee, shipping, and prohibited-item rules",
  },
  {
    id: "ccl_search",
    name: "Google search",
    freePlanAvailable: true,
    costNote: "Basic product information and comparables",
    url: "https://www.google.com/",
  },
  {
    id: "ccl_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Inventory tracker",
    url: "https://sheets.google.com/",
  },
  {
    id: "ccl_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Listing drafts",
    url: "https://docs.google.com/",
  },
  {
    id: "ccl_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Item details on your phone",
  },
  {
    id: "ccl_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Photos and inventory files",
    url: "https://drive.google.com/",
  },
  {
    id: "ccl_tape",
    name: "Measuring tape",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Chest, length, waist, rise, inseam",
  },
  {
    id: "ccl_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Phone + Measuring Tape + Notes/Sheets + Client’s Approved Marketplace",
  },
];

export const CLOSET_CLEANOUT_LISTING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Keep displayed pricing: $15 – $50 / project (examples).",
    "",
    "Agree on a maximum number of items/listings before starting.",
    "If a client’s jacket sells for $80, that $80 is NOT automatically your business revenue. Your revenue is your agreed listing-helper/service fee plus any separately agreed commission or add-on compensation.",
    "If commission-based compensation is ever used, put the percentage, eligible sales, payment timing, returns/refunds treatment, and marketplace fees in writing before listing.",
  ].join("\n"),
  raiseTip:
    "Possible add-ons: extra listings, measurements, photo retakes, cross-posting, donation bag/box organization, donation drop-off, shipping preparation, inventory spreadsheet. Displayed range: $15 – $50 / project (examples). Examples only — not income guarantees.",
  items: [
    {
      id: "small",
      label: "Small batch",
      price: "$15–$20",
      notes: "About 5 simple items: photos + basic listing details",
    },
    {
      id: "standard",
      label: "Standard batch",
      price: "$25–$35",
      notes: "About 10–15 items with photos, measurements/details, and draft listings",
    },
    {
      id: "larger",
      label: "Larger clean-out support",
      price: "$40–$50+",
      notes: "Larger batch or more detailed items, within clearly defined scope",
    },
    { id: "extra-listings", label: "Add-on: Extra listings", price: "Agree in advance" },
    { id: "measurements", label: "Add-on: Measurements", price: "Agree in advance" },
    { id: "retakes", label: "Add-on: Photo retakes", price: "Agree in advance" },
    { id: "crosspost", label: "Add-on: Cross-posting", price: "Agree in advance" },
    { id: "donate-org", label: "Add-on: Donation bag/box organization", price: "Agree in advance" },
    { id: "dropoff", label: "Add-on: Donation drop-off", price: "Agree in advance" },
    { id: "ship", label: "Add-on: Shipping preparation", price: "Agree in advance" },
    { id: "sheet", label: "Add-on: Inventory spreadsheet", price: "Agree in advance" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only — never ✓. */
export const CLOSET_CLEANOUT_LISTING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Listing-Helper Service",
    desc: [
      "Choose what you offer:",
      "☐ Sort approved sell/donate items",
      "☐ Photograph sale items",
      "☐ Record brand/size/condition",
      "☐ Take basic measurements",
      "☐ Draft titles/descriptions",
      "☐ Help research comparable prices",
      "☐ Enter listings with authorization",
      "☐ Organize donation bags/boxes",
      "☐ Create inventory tracker",
      "",
      "Write:",
      "I OFFER: ________",
      "I DO NOT OFFER: ________",
      "",
      "This is listing/clean-out support, not ownership of the client’s merchandise.",
    ].join("\n"),
  },
  {
    title: "Create Your Starter Package",
    desc: [
      "Example:",
      "",
      "CLOSET LISTING STARTER",
      "- Up to 10 approved sale items",
      "- Basic photos",
      "- Brand/size/condition notes",
      "- Draft listing title/description",
      "- Price field for client approval",
      "- Simple inventory sheet",
      "",
      "Starting Price: $____",
      "",
      "Define:",
      "Number of items",
      "Number of photos/item",
      "Measurements included?",
      "Platform entry included?",
      "Donation organization included?",
      "Delivery time",
      "Revision limit",
      "",
      "See Suggested Pricing — $15 – $50 / project (examples).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about your service. Pick only 2 or 3 this month.",
      "",
      "Good channels:",
      "☐ Friends/family",
      "☐ Referrals",
      "☐ Neighborhood/community groups",
      "☐ Facebook",
      "☐ Nextdoor",
      "☐ Local organizers",
      "☐ Senior/community networks",
      "☐ Parent/family networks",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write:",
      "What I Offer: Closet Clean-Out Listing Help",
      "Starting Price: $____",
      "Service Area: ________",
      "",
      "Set ONE measurable goal per channel. Examples:",
      "- Tell 10 people",
      "- Ask 5 contacts for referrals",
      "- Connect with 3 local organizers",
      "- Share one approved before/after sample using your own or fictional items",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple flyer/message.",
      "",
      "Sample:",
      "",
      "CLOSET CLEANED OUT — NOW WHO’S GOING TO LIST ALL THAT STUFF?",
      "",
      "I help with:",
      "- Clothing Photos",
      "- Item Details",
      "- Listing Drafts",
      "- Measurements",
      "- Simple Inventory",
      "- Donation Organization",
      "",
      "Projects start at $____.",
      "",
      "You approve what gets sold, donated, and priced.",
      "",
      "Contact: ________",
      "",
      "Never use client closet/home photos in marketing without permission.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2–3 channels selected.",
      "",
      "This week:",
      "- Contact 8–12 appropriate prospects",
      "- Ask for referrals",
      "- Connect with local organizers where appropriate",
      "- Share your service message",
      "- Follow up professionally",
      "",
      "Sample:",
      "“Hi! I help people finish the last part of a closet clean-out — photographing approved sale items, recording details, drafting listings, and organizing donation items. My starter projects begin at $____.”",
      "",
      "Track: Date | Prospect | Channel | Need | Response | Follow-Up",
    ].join("\n"),
  },
  {
    title: "Sort the Approved Items Into Work Zones",
    desc: [
      "The client makes the decisions.",
      "",
      "Create:",
      "SELL",
      "DONATE",
      "KEEP / NOT PART OF PROJECT",
      "ASK CLIENT",
      "",
      "For SELL items, assign an item number:",
      "CL-001",
      "CL-002",
      "CL-003",
      "",
      "Record: Item ID | Item | Brand | Size | Condition | Client Price Approval | Listing Status",
      "",
      "Never move an uncertain item into Sell or Donate without asking.",
    ].join("\n"),
  },
  {
    title: "Prep & Photograph Each Sale Item",
    desc: [
      "Before photographing:",
      "- Check pockets with client permission",
      "- Remove lint where appropriate",
      "- Smooth/steam only when safe and approved",
      "- Use a clean background",
      "- Use good lighting",
      "",
      "Useful photos:",
      "1. Full front",
      "2. Full back",
      "3. Brand label",
      "4. Size/material label",
      "5. Detail/features",
      "6. Any flaw/damage",
      "",
      "Photograph the ACTUAL item being sold. Do not hide defects.",
      "",
      "Avoid showing:",
      "- Client address",
      "- Mail",
      "- Family photos",
      "- Children",
      "- Reflections containing private information",
      "- Other identifying details",
    ].join("\n"),
  },
  {
    title: "Record Details, Condition & Measurements",
    desc: [
      "For each item record:",
      "Item ID: ________",
      "Brand: ________",
      "Item Type: ________",
      "Color: ________",
      "Tagged Size: ________",
      "Material if shown: ________",
      "Condition: ________",
      "Visible Flaws: ________",
      "Measurements: ________",
      "",
      "Possible clothing measurements:",
      "- Chest/pit-to-pit",
      "- Length",
      "- Waist",
      "- Rise",
      "- Inseam",
      "",
      "Only state facts you can verify. If you do not know the material/model/authenticity, do not guess.",
    ].join("\n"),
  },
  {
    title: "Research & Draft the Listing",
    desc: [
      "Research similar items where useful.",
      "",
      "Look at:",
      "- Same/similar brand",
      "- Item type",
      "- Condition",
      "- Sold/comparable prices where available",
      "- Platform fees/shipping considerations",
      "",
      "Do not assume an asking price means an item actually sells for that amount.",
      "",
      "Draft:",
      "",
      "TITLE: Brand + Item + Size + Key Detail",
      "",
      "DESCRIPTION:",
      "- Brand",
      "- Size",
      "- Color",
      "- Condition",
      "- Measurements",
      "- Features",
      "- Disclosed flaws",
      "",
      "PRICE:",
      "Suggested range: $____ – $____",
      "Client-approved list price: $____",
      "",
      "The client approves the final price.",
    ].join("\n"),
  },
  {
    title: "List or Hand Off & Organize Donations",
    desc: [
      "Depending on scope:",
      "",
      "LISTING:",
      "- Upload approved photos",
      "- Enter accurate details",
      "- Use client-approved price",
      "- Review before publishing",
      "- Confirm shipping/meetup settings with client",
      "",
      "OR",
      "",
      "HANDOFF: Deliver photos + descriptions + inventory sheet so the client can publish.",
      "",
      "DONATIONS:",
      "- Bag/box approved donation items",
      "- Label clearly",
      "- Create count/list if requested",
      "- Arrange approved drop-off/pickup if included",
      "",
      "Do not provide tax-deduction valuations or tax advice. Donation documentation/valuation decisions belong to the client and qualified tax professionals where needed.",
    ].join("\n"),
  },
  {
    title: "Track Status & Close the Project",
    desc: [
      "Update each item:",
      "DRAFTED",
      "LISTED",
      "SOLD",
      "DONATED",
      "RETURNED TO CLIENT",
      "NEEDS DECISION",
      "",
      "For sold items, if included:",
      "- Mark sale price",
      "- Record platform fees",
      "- Record shipping cost",
      "- Mark handoff/shipping complete",
      "",
      "For your own business, track YOUR service fee separately from the client’s merchandise proceeds.",
      "",
      "Ask: “Would you like help with another closet, seasonal clean-out, or relisting unsold items?”",
      "",
      "CLEAN OUT → PHOTOGRAPH → DESCRIBE → LIST → TRACK → DONATE/SELL → REPEAT",
    ].join("\n"),
  },
];

export function closetCleanoutListingToolsDisclaimer(): string {
  return "Beginner stack: Phone + Measuring Tape + Notes/Sheets + Client’s Approved Marketplace. Verify each marketplace’s current age, account, fee, shipping, prohibited-item, authenticity, and seller rules before listing. The client decides sell vs donate and approves prices. Parent/guardian involvement for minors.";
}

/** Weekly closet listing-helper profit math. Client merchandise proceeds are not service revenue. */
export function computeClosetCleanoutListingProfit(input: {
  averageProjectFee: number;
  projectsPerWeek: number;
  addOnRevenue?: number;
  travel?: number;
  supplies?: number;
  advertising?: number;
  otherExpenses?: number;
  averageHoursPerProject?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.averageProjectFee) || 0);
  const projects = Math.max(0, Number(input.projectsPerWeek) || 0);
  const addOns = Math.max(0, Number(input.addOnRevenue) || 0);
  const weeklyRevenue = fee * projects + addOns;
  const weeklyExpenses =
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const hoursPer = Math.max(0, Number(input.averageHoursPerProject) || 0);
  const weeklyHours = hoursPer * projects;
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
