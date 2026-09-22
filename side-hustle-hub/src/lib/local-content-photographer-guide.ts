/**
 * Local Business Content Photographer (`local-content-photographer`, Guide #082).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const LOCAL_CONTENT_PHOTO_REALITY_CHECK = {
  title: "YOU DON'T NEED A FANCY CAMERA",
  body: "Local businesses constantly need fresh online content. A clean smartphone photo with good lighting and composition can be much more useful than an outdated photo—or no photo at all. This is NOT professional commercial photography — it is affordable, simple smartphone content businesses can use regularly online.",
};

/** Content Shoot Planner shown above freeform Notes for this guide. */
export const LOCAL_CONTENT_PHOTO_NOTES_WORKSHEET = `Content Shoot Planner

Business Name: ________________
Business Type: ________________
Contact: ________________

Shoot Date: ________  Package: ________________
Price: $________  Number of Photos Promised: ________
Delivery Date: ________

What They Want Photographed:
________________________________
________________________________

SHOT LIST
☐ Storefront
☐ Sign
☐ Interior
☐ Products
☐ Food/Menu Items
☐ Staff
☐ Services
☐ Before/After
☐ Seasonal Content
☐ Vertical Social Photos

Special Requests:
________________________________

Photos Delivered: ________
Client Feedback:
________________________________

Monthly Follow-Up Date: ________

What Worked Well?
________________________________

What Would I Change?
________________________________

GYSH PRO TIP — LOOK FOR BUSINESSES THAT NEED YOU
Before pitching, check their online presence for: few/old photos, poorly lit products, no storefront photo, new products not pictured, inconsistent social content, or no recent food/menu photos.

Sample pitch:
"I noticed you have some great new items, but I didn't see many recent photos online. I offer affordable smartphone content shoots for local businesses."

QUICK SHOT LIST (most local businesses)
☐ Exterior/storefront
☐ Business sign
☐ Entrance
☐ Wide interior
☐ Best-selling products/services
☐ Close-up details
☐ Staff/team if approved
☐ Customer experience/action shot if approved
☐ Seasonal/new item
☐ 3–5 vertical photos for social media

Take MORE photos than purchased — then select and deliver the strongest images.`;

export const LOCAL_CONTENT_PHOTO_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Use your smartphone to take clean, attractive photos of local businesses, products, menus, storefronts, food, displays, staff, and services for their social media and online business profiles. Tagline: Your Phone + Their Business = Fresh Content. Category: Photography / Local Business Services. Best for teens, adults, and seniors / retirees. Beginner · Very low startup · Flexible · Local businesses · Service-based / recurring. IMPORTANT: This is NOT professional commercial photography — affordable, simple smartphone content only.",
  },
  {
    id: "requirements",
    label: "Basic requirements",
    detail:
      "Smartphone with a good camera · Reliable transportation · Basic photo skills · Good eye for clean backgrounds/angles · Dependability · Friendly communication · Ability to transfer digital photos.",
  },
  {
    id: "you-do-not-need",
    label: "You do NOT need",
    detail:
      "Professional camera · Photography degree · Studio · Expensive lighting · Advanced editing skills.",
  },
  {
    id: "clients",
    label: "Potential clients",
    detail:
      "Restaurants · Coffee shops · Bakeries · Boutiques · Salons/barbers · Nail shops · Gyms · Realtors · Auto detailers · Contractors · Florists · Pet groomers · Food trucks · Local retailers · Service businesses.",
  },
  {
    id: "subjects",
    label: "Things you can photograph",
    detail:
      "Storefront · Business sign · Interior · Products · Menu items · Food/drinks · Displays · Staff with permission · Services being performed with permission · Before/after work · Seasonal displays · New inventory.",
  },
  {
    id: "permission",
    label: "IMPORTANT — get permission",
    detail:
      "Always get business permission before photographing staff, customers, private areas, or sensitive information.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Look for businesses that need you",
    detail:
      "Before pitching, look for few/old photos, poorly lit product photos, no storefront photo, new products not pictured, inconsistent social content, or no recent food/menu photos. Then pitch specifically: “I noticed you have some great new items, but I didn't see many recent photos online. I offer affordable smartphone content shoots for local businesses.”",
  },
];

export const LOCAL_CONTENT_PHOTO_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Crop, resize, simple social graphics",
  },
  {
    label: "Snapseed",
    url: "https://snapseed.online/",
    note: "Optional mobile photo editing (also available in app stores)",
  },
  {
    label: "Google Photos",
    url: "https://photos.google.com/",
    note: "Organize, select, simple edits",
  },
  {
    label: "Google Drive",
    url: "https://drive.google.com/",
    note: "Deliver client photo folders",
  },
  {
    label: "Dropbox",
    url: "https://www.dropbox.com/",
    note: "Alternate delivery folder",
  },
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Find businesses and plan routes",
  },
  {
    label: "Google Business Profile",
    url: "https://business.google.com/",
    note: "Review common business photo types",
  },
];

export const LOCAL_CONTENT_PHOTO_SUPPLIES = {
  starterKitTotal:
    "About $0–25 to start if you already have a phone — do NOT buy expensive equipment; upgrade only after the side hustle makes money",
  items: [
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential — your main camera; use what you own",
    },
    {
      id: "charger",
      name: "Charger",
      qty: "1",
      estCost: "$0–15",
      notes: "Essential",
    },
    {
      id: "battery",
      name: "Portable battery",
      qty: "1",
      estCost: "$15–30",
      notes: "Essential for longer shoots",
    },
    {
      id: "cloth",
      name: "Lens cleaning cloth",
      qty: "1",
      estCost: "$2–6",
      notes: "Essential",
    },
    {
      id: "bag",
      name: "Small bag",
      qty: "1",
      estCost: "$0–15",
      notes: "Essential — tote you already own is fine",
    },
    {
      id: "storage",
      name: "Reliable cloud / file storage",
      qty: "1",
      estCost: "$0–10/mo",
      notes: "Essential — Google Photos / Drive free tiers to start",
    },
    {
      id: "tripod",
      name: "Small phone tripod",
      qty: "1",
      estCost: "$10–25",
      optional: true,
      notes: "Helpful — buy after first paid shoots if needed",
    },
    {
      id: "stabilizer",
      name: "Phone stabilizer",
      qty: "1",
      estCost: "$20–50",
      optional: true,
      notes: "Helpful",
    },
    {
      id: "light",
      name: "Small portable light",
      qty: "1",
      estCost: "$15–35",
      optional: true,
      notes: "Helpful when business lighting is poor",
    },
    {
      id: "reflector",
      name: "Reflector",
      qty: "1",
      estCost: "$10–25",
      optional: true,
      notes: "Helpful",
    },
    {
      id: "cable",
      name: "Backup charging cable",
      qty: "1",
      estCost: "$5–12",
      optional: true,
      notes: "Helpful",
    },
  ],
};

/**
 * Simple Content Photography Tools — Tools tab.
 */
export const LOCAL_CONTENT_PHOTO_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "lcp_camera",
    name: "Smartphone Camera",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Your main tool — shoot with the phone you already own",
  },
  {
    id: "lcp_photos",
    name: "Google Photos / Apple Photos",
    freePlanAvailable: true,
    costNote: "Organize, select, and make simple edits",
    url: "https://photos.google.com/",
  },
  {
    id: "lcp_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Crop, resize, and create simple social media graphics",
    url: "https://www.canva.com/",
  },
  {
    id: "lcp_snapseed",
    name: "Snapseed",
    freePlanAvailable: true,
    costNote: "Optional mobile photo editing",
    url: "https://snapseed.online/",
    optional: true,
  },
  {
    id: "lcp_drive",
    name: "Google Drive / Dropbox",
    freePlanAvailable: true,
    costNote: "Deliver client photo folders",
    url: "https://drive.google.com/",
  },
  {
    id: "lcp_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Find businesses and plan your route",
    url: "https://maps.google.com/",
  },
  {
    id: "lcp_social",
    name: "Instagram / Facebook",
    freePlanAvailable: true,
    costNote: "Research the business's current content and identify what photos they may be missing",
  },
  {
    id: "lcp_gbp",
    name: "Google Business Profile",
    freePlanAvailable: true,
    costNote: "Review the types of business photos commonly displayed in Google Search/Maps",
    url: "https://business.google.com/",
  },
  {
    id: "lcp_tripod",
    name: "Phone Tripod",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Helpful for steady shots · ~$10–25 if buying later",
    optional: true,
  },
  {
    id: "lcp_light",
    name: "Portable Light",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Useful when business lighting is poor · ~$15–35 if buying later",
    optional: true,
  },
  {
    id: "lcp_stack",
    name: "Beginner Tool Stack + GYSH Rule",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "1) Smartphone Camera — Shoot · 2) Natural Light — Improve the shot · 3) Canva/Snapseed — Simple cleanup · 4) Google Drive — Deliver · 5) Google Maps — Find potential clients. GYSH RULE: Do not over-edit. Photos should accurately represent the business, food, products, and services.",
  },
];

export const LOCAL_CONTENT_PHOTO_PRICING = {
  tabLabel: "Simple Content Packages",
  intro: [
    "Example beginner pricing — not income guarantees. This is affordable smartphone content, not professional commercial photography.",
    "",
    "Pricing formula: Shoot Time + Editing/Selection Time + Travel + Expenses + Desired Profit = Client Price.",
    "",
    "Pricing varies by market, experience, deliverables, and travel.",
  ].join("\n"),
  raiseTip:
    "After 3–5 happy clients, raise 10–20% or add a monthly Content Refresh retainer. Examples only — not income guarantees.",
  items: [
    {
      id: "quick",
      label: "QUICK CONTENT DROP — 10 edited/select photos · 20–30 minute visit",
      price: "$40–$60",
      notes: "Starter package",
    },
    {
      id: "refresh",
      label: "CONTENT REFRESH — 20–25 photos · 45–60 minute visit",
      price: "$75–$125",
      notes: "Most common starter booking",
    },
    {
      id: "bank",
      label: "CONTENT BANK — 40–50 photos · 60–90 minute visit",
      price: "$125–$200",
      notes: "Larger content library for the client",
    },
    {
      id: "monthly",
      label: "MONTHLY CONTENT REFRESH — 1 scheduled visit each month",
      price: "$100–$200+/month",
      notes: "Depends on photos, time, and editing",
    },
    {
      id: "extra",
      label: "Add-on: Extra photos",
      price: "Additional fee",
    },
    {
      id: "video",
      label: "Add-on: Short vertical video clips",
      price: "Additional fee",
    },
    {
      id: "before-after",
      label: "Add-on: Before/after sets",
      price: "Additional fee",
    },
    {
      id: "location",
      label: "Add-on: Additional location",
      price: "Additional fee",
    },
    {
      id: "rush",
      label: "Add-on: Rush delivery",
      price: "Additional fee",
    },
    {
      id: "canva",
      label: "Add-on: Simple Canva graphics",
      price: "Additional fee",
    },
  ],
};

/**
 * Core launch steps (exactly 11 playbook steps).
 * Foundation + marketing titles + closing are applied by finalize.
 */
export const LOCAL_CONTENT_PHOTO_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Practice taking clean smartphone photos",
    desc: "Practice storefronts, food, products, rooms, displays, and signs. Use natural light, clean backgrounds, and steady hands. You do not need a fancy camera — clean phone photos with good lighting are the goal.",
  },
  {
    title: "Create a small sample portfolio",
    desc: "Shoot your own items or businesses where you have permission. Build 8–12 strong sample images that show storefront, product, food/menu, and interior styles you can deliver.",
  },
  {
    title: "Choose 2–3 simple content packages",
    desc: "Offer Quick Content Drop, Content Refresh, and optionally Content Bank or Monthly Content Refresh from Suggested Pricing. Keep deliverables and visit length clear.",
  },
  {
    title: "Find local businesses whose online photos are outdated, limited, or inconsistent",
    desc: "Look for few photos, old photos, poorly lit product photos, no storefront photo, new products not pictured, inconsistent social content, or no recent food/menu photos. Use Google Maps, Instagram, Facebook, and Google Business Profile to scout.",
  },
  {
    title: "Introduce your service with a simple pitch",
    desc: "“I help local businesses get fresh photos for social media and their online profiles using simple smartphone content packages.” When you can, make it specific: “I noticed you have some great new items, but I didn't see many recent photos online.”",
  },
  {
    title: "Ask what they need photographed",
    desc: "Products, food, storefront, interior, staff, services, new inventory, seasonal displays, before/after — always get permission before photographing staff, customers, private areas, or sensitive information.",
  },
  {
    title: "Agree on price, photos, timing, and delivery",
    desc: "Confirm price, number of photos, shoot length, location, delivery date, and usage expectations in writing before you arrive. Log the agreement in your Content Shoot Planner.",
  },
  {
    title: "Create a simple shot list before arriving",
    desc: [
      "For most local businesses capture:",
      "☐ Exterior/storefront · ☐ Business sign · ☐ Entrance · ☐ Wide interior · ☐ Best-selling products/services · ☐ Close-up details · ☐ Staff/team if approved · ☐ Customer experience/action shot if approved · ☐ Seasonal/new item · ☐ 3–5 vertical photos for social media.",
      "Take MORE photos than the client purchased — then select the strongest images.",
    ].join("\n"),
  },
  {
    title: "Shoot multiple angles using clean backgrounds and good lighting",
    desc: "Arrive on time, work the shot list, and prioritize natural light. Move clutter out of frame when allowed. Do not over-edit later — photos should accurately represent the business.",
  },
  {
    title: "Select, lightly edit, and deliver through a shared folder",
    desc: "Pick the best photos, make light edits in Google/Apple Photos, Snapseed, or Canva, and deliver the agreed number via Google Drive or Dropbox by the promised date.",
  },
  {
    title: "Ask for feedback, a testimonial, and a monthly refresh",
    desc: "Ask what worked, request a short testimonial/referral, and offer a Monthly Content Refresh so they keep getting fresh photos. Log results in Notes and the Revenue Calculator.",
  },
  {
    title: "Pick how you will tell people about your side hustle",
    desc: "Choose 2–3 channels this month: warm intros to local owners, a Canva flyer/social post of your sample work, and walking a main street with outdated Google/social photos. Pitch the missing/outdated photo problem — not “professional photography.”",
  },
  {
    title: "Make your marketing materials",
    desc: "Create a Canva flyer, package price sheet (Quick / Refresh / Bank), and a sample portfolio folder with permission-cleared images. Keep a printed shot list checklist in your bag.",
  },
  {
    title: "Carry out the marketing plan",
    desc: "Contact 5–10 businesses that need fresher photos, show 3–5 sample images, and follow up once. After each shoot, ask for a review/referral and track profit in the Revenue Calculator.",
  },
];

export function localContentPhotoToolsDisclaimer(): string {
  return [
    "Simple Content Photography Tools — smartphone content for local businesses, not commercial studio work.",
    "",
    "BEGINNER TOOL STACK",
    "1. Smartphone Camera — Shoot",
    "2. Natural Light — Improve the shot",
    "3. Canva/Snapseed — Simple cleanup",
    "4. Google Drive — Deliver",
    "5. Google Maps — Find potential clients",
    "",
    "GYSH RULE: Do not over-edit. Photos should accurately represent the business, food, products, and services.",
  ].join("\n");
}
