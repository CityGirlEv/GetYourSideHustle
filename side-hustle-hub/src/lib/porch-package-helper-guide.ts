/**
 * Porch Package Helper (`porch-package-helper`, Guide #094).
 * Move already-delivered packages to one approved safe spot. Plain data only.
 */

export const PORCH_PACKAGE_REALITY_CHECK = {
  title: "VERIFY THE CLIENT, ADDRESS & PACKAGE BEFORE YOU TOUCH ANYTHING",
  body: [
    "This service begins only AFTER a package has been delivered to the client’s address or approved delivery area.",
    "Safest beginner model: move a confirmed delivered package from the porch/approved area to one approved safe spot, then send a private completion update.",
    "",
    "The client owns the address/authorization and carrier accounts. Helper never opens, forwards, reships, intercepts carriers, signs, accesses mailboxes, or uses client carrier logins.",
    "Never accept a job that sends packages to your home and asks you to repackage or forward them. Postal inspectors warn that reshipping schemes can be disguised as work-from-home jobs.",
    "Do not photograph or publish a readable shipping label. Package value is not helper revenue.",
    "",
    "Youth: trusted-neighbor jobs only, daylight, parent/guardian controls payment and transportation, no unoccupied-home entry.",
    "",
    "Tagline: Delivered. Moved. Confirmed.",
  ].join("\n"),
};

export const PORCH_PACKAGE_NOTES_WORKSHEET = `MY PORCH PACKAGE HELPER PLAN

SERVICE SETUP
Service Area: ________
Normal Coverage Hours: ________
Single Package Fee: $____
Multiple Package Fee: $____
Weather/Rush Fee: $____
Five-Visit Package: $____
Travel Add-On: $____
Maximum Weight/Size: ________
Wait/Return-Trip Rule: ________
Cancellation Rule: ________

CLIENT
Client: ________
Private Address: ________
Connection to Address Verified: ________
Approved Recipient Names: ________
Normal Pickup Point: ________
Approved Safe Spot: ________
Exterior / Limited Entry: ________
Pet/Gate/Camera/Alarm Notes: ________
Temporary Access Method: ________
Backup Contact: ________
Written Authorization Saved: ☐
Photo/Data Deletion Rule: ________

JOB
Date: ________
Carrier: ________
Delivery Confirmed: ________
Packages: ____
Approximate Size/Weight: ________
Pickup Point: ________
Safe Spot: ________
Arrival Window: ________
Weather: ________
Fee: $____
Completion Time: ________
Condition Observed: ________
Private Update Sent: ☐
Payment Received: ☐

PROBLEM / ESCALATION
Missing: ☐
Damaged: ☐
Unsafe/Suspicious: ☐
Access Failed: ☐
Wrong Name/Address: ☐
Client Notified: ________
Action Taken: ________
Return Visit Needed: ________

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Prospects: ____
Trial Clients: ____
Recurring Clients: ____

MONTHLY RESULTS
Jobs: ____
Service Revenue: $____
Tips/Add-Ons: $____
Expenses: $____
Estimated Profit: $____
Total Hours: ____
Effective Profit Per Hour: $____
Best Route/Area: ________
Safety/Access Change Needed: ________

GYSH PRO TIP
DO NOT DRIVE 20 MINUTES EACH WAY FOR A $10 PACKAGE MOVE.
Start with trusted neighbors close together and charge for return trips caused by changing delivery windows.
`;

export const PORCH_PACKAGE_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Help trusted neighbors who miss deliveries by moving delivered packages from a porch or approved delivery area to a safer, weather-protected location and sending a private completion update. 8 hrs/week. Displayed $10 – $40 / job is examples only.",
  },
  {
    id: "auth",
    label: "Written authorization before the first job",
    detail:
      "Client proves the address is theirs or they are authorized to manage it. Exact pickup point, approved safe spot, weight/size limit, exterior-only or limited entry, and completion-photo rule in writing.",
  },
  {
    id: "never",
    label: "Never open, forward, or reship",
    detail:
      "Never open, inspect, relabel, forward, or reship. No mailbox access, carrier interception, signing, locker/post-office pickup without official authorization, or client carrier logins. Decline reshipping-scam “work from home” jobs.",
  },
];

export const PORCH_PACKAGE_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "USPS Informed Delivery", url: "https://www.usps.com/manage/informed-delivery.htm", note: "Client-controlled tracking" },
  { label: "USPS Delivery Instructions", url: "https://faq.usps.com/s/article/USPS-Delivery-Instructions-The-Basics", note: "Addressee-controlled" },
  { label: "USPS Hold Mail", url: "https://www.usps.com/manage/hold-mail.htm", note: "Client-controlled option" },
  { label: "U.S. Postal Inspection Service — package theft", url: "https://www.uspis.gov/news/scam-article/mail-package-theft" },
  { label: "U.S. Postal Inspection Service — reshipping scams", url: "https://www.uspis.gov/news/scam-article/work-from-home-scams-and-reshipping-schemes" },
  { label: "UPS My Choice", url: "https://www.ups.com/us/en/track/ups-my-choice", note: "Client-controlled" },
  { label: "FedEx Delivery Manager", url: "https://www.fedex.com/en-us/delivery-manager.html", note: "Client-controlled" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route and service-area limits" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Delivery windows" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Jobs, fees, mileage" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Authorization and agreement" },
  { label: "Canva", url: "https://www.canva.com/", note: "Flyer — no vacancy ads" },
];

export const PORCH_PACKAGE_SUPPLIES = {
  starterKitTotal: "About $0–15 — buy extras only after recurring demand",
  items: [
    { id: "phone", name: "Smartphone + charger", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "shoes", name: "Comfortable closed-toe shoes with traction", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "weather", name: "Weather-appropriate clothing", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "checklist", name: "Job checklist", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "sanitizer", name: "Hand sanitizer", qty: "1", estCost: "$2–5", notes: "Essential" },
    { id: "flashlight", name: "Small flashlight for early evening only where safe", qty: "1", estCost: "$0–8", notes: "Helpful" },
    { id: "charger", name: "Portable phone charger", qty: "1", estCost: "$8–15", notes: "Helpful", optional: true },
    { id: "vest", name: "Reflective vest near driveways after dusk where appropriate", qty: "1", estCost: "$5–12", notes: "Helpful", optional: true },
    { id: "rain", name: "Umbrella or rain jacket", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "gloves", name: "Work gloves for ordinary cardboard packages", qty: "1 pair", estCost: "$4–8", notes: "Helpful", optional: true },
    { id: "cart", name: "Small folding cart only for known, suitable packages", qty: "1", estCost: "$15–30", notes: "Optional — do not buy before demand", optional: true },
  ],
};

export const PORCH_PACKAGE_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "phone", name: "Phone / Text", freePlanAvailable: true, planLabelApplicable: false, costNote: "Delivery alert, arrival notice, private completion update" },
  { id: "maps", name: "Google Maps / Apple Maps", freePlanAvailable: true, costNote: "Route planning and service-area limits", url: "https://maps.google.com/" },
  { id: "weather", name: "Weather app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Heat, rain, wind, ice, and storm checks" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Delivery windows and vacation coverage", url: "https://calendar.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Jobs, fees, mileage, time, status, expenses", url: "https://sheets.google.com/" },
  { id: "google_docs", name: "Google Docs / Forms", freePlanAvailable: true, costNote: "Intake, written authorization, service agreement", url: "https://docs.google.com/" },
  { id: "camera", name: "Private photo / approved client message", freePlanAvailable: true, planLabelApplicable: false, costNote: "Completion photo with label and private information hidden" },
  { id: "passwords", name: "Password manager", freePlanAvailable: true, costNote: "Helper’s own accounts only — never store client carrier passwords", url: "https://bitwarden.com/" },
  { id: "usps-id", name: "USPS Informed Delivery", freePlanAvailable: true, costNote: "Client-controlled — helper does not log in", url: "https://www.usps.com/manage/informed-delivery.htm" },
  { id: "usps-theft", name: "USPS Inspection Service package-theft guidance", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current mail/package security", url: "https://www.uspis.gov/news/scam-article/mail-package-theft" },
  { id: "usps-scam", name: "USPS Inspection Service reshipping-scam guidance", freePlanAvailable: true, planLabelApplicable: false, costNote: "Avoid jobs that receive and forward packages", url: "https://www.uspis.gov/news/scam-article/work-from-home-scams-and-reshipping-schemes" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Simple flyer — never advertise that a home is empty", url: "https://www.canva.com/" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Trusted Neighbor + Written Authorization + Phone + Maps + Weather + Calendar + Job Checklist + Completion Message + Income/Expense Tracker" },
];

export const PORCH_PACKAGE_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "PORCH PACKAGE HELPER — REPLACE PRICING",
    "",
    "Displayed $10 – $40 / job is examples only, not guarantees.",
    "Price by travel time, delivery-window commitment, access, stairs, safe package size, weather, and required updates. Do not base the helper’s fee on the value of the package.",
    "",
    "Single small package (nearby): $10 – $15",
    "Multiple packages (same stop): $15 – $25",
    "Limited authorized entry: $15 – $30",
    "Weather / short-notice check: $15 – $25",
    "Larger but safe package: $20 – $40",
    "Vacation day coverage: $20 – $40 per scheduled day (planning example)",
    "Five-visit neighbor package: $50 – $100",
    "",
    "Formula: Base Visit Fee + Travel Time/Mileage + Urgency/Weather Premium + Approved Access Complexity + Additional Safe Package/Stop + Waiting or Return Trip = Job Price.",
    "GROSS is not PROFIT. Package value is not helper revenue.",
  ].join("\n"),
  raiseTip: "Agree in advance whether the fee is earned if the carrier has not delivered, the client cancels after you leave, the package is missing/unsafe, or a second visit is requested. Examples only.",
  items: [
    { id: "single", label: "Single small package — nearby", price: "$10–$15", notes: "Porch to one approved exterior safe spot + completion message" },
    { id: "multi", label: "Multiple packages — same stop", price: "$15–$25", notes: "Small group, same address and time" },
    { id: "entry", label: "Limited authorized entry", price: "$15–$30", notes: "Garage / enclosed entry with written access rules" },
    { id: "weather", label: "Weather / short-notice check", price: "$15–$25", notes: "After confirmed delivery" },
    { id: "larger", label: "Larger but safe package", price: "$20–$40", notes: "Known weight/size; no unauthorized equipment" },
    { id: "vacation", label: "Vacation day coverage", price: "$20–$40 / day", notes: "Not all-day waiting or surveillance" },
    { id: "five", label: "Five-visit neighbor package", price: "$50–$100", notes: "Visit limit, radius, and expiration" },
  ],
};

export const PORCH_PACKAGE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Service & Safety Boundaries",
    desc: [
      "Start with the safest offer: move a confirmed delivered package from the client’s porch or approved property location to one approved safe spot, then send a private completion update.",
      "",
      "Included (pick in writing): exterior porch-to-safe-spot move; garage/enclosed-entry with specific authorization; one completion photo or text; one or more packages from the same delivery; scheduled vacation coverage; weather/short-notice visit.",
      "",
      "Excluded: opening packages; mailbox access; carrier interception; signing for deliveries; locker/post-office pickup without official authorization; package forwarding or reshipping; returns/drop-offs unless separately approved as an errand; hazardous, leaking, suspicious, oversized, or unsafe packages; unlimited waiting or 24/7 availability.",
      "",
      "Set a maximum weight/size based on what can be safely moved alone.",
    ].join("\n"),
  },
  {
    title: "Set Your Service Area, Schedule & Prices",
    desc: [
      "Choose a small area so a $10–$40 job remains profitable.",
      "Write: Normal Service Area · Single Package Fee $____ · Multiple Package Fee $____ · Weather/Rush Fee $____ · Five-Visit Package $____ · Maximum Weight/Size · Normal Coverage Hours · Response-Time Goal · Travel Add-On $____ · Wait/Return-Trip Rule · Cancellation Rule.",
      "Do not promise to arrive the moment a carrier marks “delivered.” Use an honest window such as “within ____ minutes/hours during scheduled coverage after I receive your confirmation.”",
    ].join("\n"),
  },
  {
    title: "Verify the Client, Address & Authorization",
    desc: [
      "Before the first job, complete an intake and written authorization.",
      "Confirm: client name and contact; service address and relationship to the property; approved recipient names; exterior-only or authorized limited-entry; exact pickup and safe-spot locations; gate/garage/key/code process; camera/alarm notice; pet instructions; weight/size limit; excluded contents; completion proof; backup contact; price/payment; data/photo deletion rule.",
      "Do not accept a request from someone who cannot show a legitimate connection to the address or package. Use temporary/single-use codes when possible. Never copy keys or share access information.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about the service. Pick only 2 or 3 this month.",
      "",
      "☐ Trusted neighbors",
      "☐ Friends/family referrals",
      "☐ Neighborhood Facebook groups where promotion is permitted",
      "☐ Nextdoor",
      "☐ Apartment/condo communities with management permission",
      "☐ Senior/community centers where permitted",
      "☐ Local travel groups or pet/house-sitter referrals",
      "☐ Realtors, organizers, or property managers",
      "☐ Simple flyer on an approved community board",
      "",
      "Write one measurable goal per channel.",
      "Examples:",
      "- Tell 10 trusted neighbors",
      "- Ask 5 local service providers for referrals",
      "- Post in 2 approved neighborhood groups",
      "",
      "Begin with people who already know you or can be introduced by someone trusted.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Search Templates for a Flyer (US Letter) you can customize as a SAMPLE (no addresses, no travel dates).",
      "",
      "Headline: MISSING PACKAGE DELIVERIES?",
      "I help approved local neighbors move delivered packages from the porch to a safer, weather-protected spot.",
      "Private Completion Update • Vacation Coverage • Weather Checks",
      "Starting at $____ per completed visit · Service Area: ________ · Contact: ________",
      "",
      "Create: one-sentence service description; price/visit-limit language; service area and hours; weight/size limit; exterior/limited-entry options; written authorization form; referral message; completion-message template.",
      "Do not advertise “I know when homes are empty.” Do not publish client addresses, travel dates, package schedules, access methods, tracking numbers, or label photos.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week use only the 2–3 selected channels.",
      "",
      "Sample:",
      "“Hi! I’m offering a local Porch Package Helper service for trusted neighbors who cannot get home when a delivery arrives. With written permission, I move a confirmed delivered package from the porch to an approved safer spot and send a private update. Visits start at $____. Would you like my service details for workdays or an upcoming trip?”",
      "",
      "Track: Date | Prospect | Channel | Address Verified? | Need | Follow-Up | Trial Booked",
      "Do not reveal current client schedules or use a client’s porch/photo as advertising without written permission.",
      "Do not accept random requests to pick up or forward packages from social-media strangers.",
    ].join("\n"),
  },
  {
    title: "Confirm Each Delivery Job Before Travel",
    desc: [
      "For every visit, confirm: client name, address, recipient name, carrier, tracking status supplied by the client, number of packages, approximate size/weight if known, delivery photo/location if available, approved safe spot, entry/access instruction, deadline/coverage window, weather concern, backup contact, agreed fee.",
      "",
      "Send: “I have your request for ____ package(s) delivered by ____ at [ADDRESS]. I will check the approved delivery area between ____ and ____, move only the matching package(s) to [SAFE SPOT], and send a private completion update. Fee: $____.”",
      "If the carrier estimate changes, apply the written wait/return-trip rule instead of chasing a delivery truck.",
    ].join("\n"),
  },
  {
    title: "Arrive, Verify & Assess Before Touching",
    desc: [
      "At arrival: confirm the address; park or approach legally and safely; check traffic, driveway, stairs, lighting, ice/water, animals, people, construction, and other hazards; compare package count, recipient, carrier, and location without exposing the label; look for crushing, opening, leaking, bulging, smoke, unusual heat, odor, sound, powder, or unknown substance; confirm the package is within the agreed safe weight/size.",
      "Do not touch a suspicious or unsafe package. Keep distance, contact the client, and follow current carrier or emergency guidance.",
      "Do not accuse a neighbor, carrier, or stranger if the package is missing or damaged. Report facts to the client.",
    ].join("\n"),
  },
  {
    title: "Move the Package & Send Private Confirmation",
    desc: [
      "Use safe lifting: test weight carefully; keep the load close; bend at knees/hips; avoid twisting; use two hands; make multiple trips; stop if unstable or too heavy; do not drag a package if that could damage it.",
      "Move the package only to the approved location. Do not explore the property, enter other rooms, handle unrelated mail, or move other items unless specifically authorized.",
      "Completion message: “Completed at [TIME]. I moved ____ package(s) from [APPROVED PICKUP POINT] to [APPROVED SAFE SPOT]. Condition observed without opening: ________. Photo sent: Yes/No. Fee: $____.”",
      "If sending a photo, frame it so the label, tracking barcode, address, access point, and home security details are not readable. Send privately only.",
    ].join("\n"),
  },
  {
    title: "Handle Missing, Damaged, Sensitive or Access Problems",
    desc: [
      "MISSING: Check only the approved property area. Do not enter neighbors’ property or search mailboxes. Notify the client so they can review tracking/cameras and contact the seller or carrier.",
      "DAMAGED: Do not open it. Photograph exterior condition only if requested and safe, then move or leave it according to the client’s written instruction.",
      "LEAKING / SUSPICIOUS: Do not touch, smell closely, shake, carry, or transport it. Move away and follow the client’s emergency plan and official guidance.",
      "MEDICATION / PERISHABLE / TEMPERATURE-SENSITIVE: Follow only pre-agreed, lawful instructions. Do not inspect contents. If safe handling cannot be confirmed, decline.",
      "ACCESS FAILURE: Do not climb a fence, force a door, defeat a lock, borrow a neighbor’s access, or leave an entry unsecured. Notify the client and apply the agreed return-trip rule.",
      "WRONG NAME / WRONG ADDRESS: Do not move it. Notify the client and let the intended recipient and carrier resolve it.",
    ].join("\n"),
  },
  {
    title: "Close Out, Track Profit & Build Recurring Clients",
    desc: [
      "After every job record: Date | Client | Address Code/Area Only | Packages | Fee | Tip | Miles | Travel Time | Service Time | Parking/Tolls | Other Expenses | Status.",
      "Job Profit = Service Fee + Tip − Job Expenses. Effective Profit Per Hour = Job Profit ÷ Total Travel/Service/Admin Hours.",
      "Then: confirm payment; send receipt if appropriate; delete completion photos/access details according to the agreement; report access or safety problems; ask whether the client needs workday or vacation coverage; offer a five-visit package only after a successful trial; ask for a truthful review that does not reveal address/travel details; group nearby clients into efficient routes.",
      "TRUSTED CLIENT → CLEAR AUTHORIZATION → SAFE VISIT → PRIVATE CONFIRMATION → REBOOK → DENSER ROUTE",
    ].join("\n"),
  },
];

export function porchPackageHelperToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Trusted Neighbor + Written Authorization + Phone + Maps + Weather + Calendar + Job Checklist + Completion Message + Income/Expense Tracker.",
    "",
    "Carrier services, authorization rules, tracking features, pickup options, fees, and delivery instructions change. The client should use the CURRENT official carrier process. The helper should not sign in to a client’s carrier, retailer, email, payment, or identity account.",
    "Texts claiming a delivery problem or small redelivery fee may be phishing. Do not click links from unexpected messages. Confirm delivery through the client and the carrier’s official site/app.",
  ].join("\n");
}

export function computePorchPackageHelperProfit(input: {
  porchStandardJobsPerWeek?: number;
  averageStandardJobFee?: number;
  vacationPackageRevenue?: number;
  weatherRushAddOnRevenue?: number;
  tipsOtherEarnedIncome?: number;
  mileageTransportation?: number;
  parkingTolls?: number;
  phoneInternet?: number;
  supplies?: number;
  advertisingPrinting?: number;
  paymentFees?: number;
  insuranceLicensing?: number;
  otherExpenses?: number;
  travelHours?: number;
  serviceHours?: number;
  waitingHours?: number;
  adminHours?: number;
}): {
  weeklyStandardRevenue: number;
  monthlyStandardRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const weeklyStandardRevenue =
    Math.max(0, Number(input.porchStandardJobsPerWeek) || 0) *
    Math.max(0, Number(input.averageStandardJobFee) || 0);
  const monthlyStandardRevenue = weeklyStandardRevenue * 4.33;
  const grossServiceRevenue =
    monthlyStandardRevenue +
    Math.max(0, Number(input.vacationPackageRevenue) || 0) +
    Math.max(0, Number(input.weatherRushAddOnRevenue) || 0) +
    Math.max(0, Number(input.tipsOtherEarnedIncome) || 0);
  const totalExpenses =
    Math.max(0, Number(input.mileageTransportation) || 0) +
    Math.max(0, Number(input.parkingTolls) || 0) +
    Math.max(0, Number(input.phoneInternet) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.advertisingPrinting) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.insuranceLicensing) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.travelHours) || 0) +
    Math.max(0, Number(input.serviceHours) || 0) +
    Math.max(0, Number(input.waitingHours) || 0) +
    Math.max(0, Number(input.adminHours) || 0);
  return {
    weeklyStandardRevenue,
    monthlyStandardRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
