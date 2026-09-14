/**
 * Travel Research Assistant (`travel-research-assistant`, Guide #109).
 * Research-only — client books and pays providers. Plain data only.
 */

export const TRAVEL_RESEARCH_REALITY_CHECK = {
  title: "RESEARCH IS A SNAPSHOT, NOT A RESERVATION",
  body: [
    "Help busy planners compare flights, lodging, transportation, and itinerary ideas, then organize the strongest options into a clear one-page travel brief.",
    "This is a research-and-organization service: the client reviews current terms and completes every reservation and payment directly with the provider.",
    "",
    "Travel prices, availability, schedules, entry rules, advisories, fees, and policies can change between the search and the client’s purchase.",
    "Every brief must show research date/time, currency, assumptions, official links, last-verified time, and “Research only—not booked.”",
    "",
    "Never collect passports, cards, passwords, OTPs, SSN, or unnecessary medical data. Never log into client airline, hotel, bank, email, loyalty, or government accounts.",
    "Do not call a research brief a ticket, reservation, confirmation, guaranteed fare, legal advice, visa advice, medical advice, safety guarantee, or travel-agent service.",
    "",
    "Tagline: Research Less. Compare Clearly. Travel Smarter.",
  ].join("\n"),
};

export const TRAVEL_RESEARCH_NOTES_WORKSHEET = `MY TRAVEL RESEARCH ASSISTANT PLAN

SERVICE SETUP
Quick Comparison Fee: $____
One-Page Brief Fee: $____
Refresh Fee: $____
Rush Fee: $____
Maximum Routes/Dates: ____
Maximum Options: ____
Research Time Cap: ____
Standard Turnaround: ____
Included Revisions: ____
Cancellation Rule: ____
Data-Deletion Rule: ____

CLIENT INTAKE
Client: ________
Trip Purpose: ________
Departure: ________
Destination: ________
Dates / Flexibility: ________
Travelers (count / age categories): ________
Budget (taxes/fees included?): ________
Flight priorities: ________
Lodging priorities: ________
Ground transport: ________
Accessibility needs (if disclosed): ________
Dealbreakers: ________
Loyalty programs to consider (no passwords): ________
Deliverable / Deadline: ________
Research-only acknowledgment: ☐

PROJECT
Confirmation sent: ☐
Last verified: ________
Currency: ________
Options delivered: flights ____ · lodging ____ · local ____
Brief says “Research only—not booked”: ☐
Links checked: ☐
Sensitive data excluded: ☐
Paid: ☐

MONTHLY RESULTS
Quick comparisons: ____
Briefs: ____
Refresh/add-ons: $____
Service revenue: $____
Expenses: $____
Estimated profit: $____
Total hours: ____
Effective profit per hour: $____
`;

export const TRAVEL_RESEARCH_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Compare flights, lodging, and itinerary ideas into a one-page travel brief. Research only — the client books and pays providers. 10 hrs/week. Displayed $15 – $50 / project is examples only.",
  },
  {
    id: "privacy",
    label: "Minimum personal information",
    detail:
      "Use placeholders such as Traveler A. Never collect passport images, SSN, payment-card details, account passwords, security codes, or unnecessary medical information. Never log in to a client’s airline, hotel, bank, email, loyalty, or government account.",
  },
  {
    id: "snapshot",
    label: "Snapshot, not a reservation",
    detail:
      "Every brief shows date/time, currency, assumptions, official links, last-verified time, and “Research only—not booked.” Client rechecks the final price, terms, and availability before booking.",
  },
];

export const TRAVEL_RESEARCH_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Flights", url: "https://www.google.com/travel/flights", note: "Compare, then verify with the airline" },
  { label: "Google Hotels", url: "https://www.google.com/travel/hotels", note: "Verify with the property" },
  { label: "Google Maps", url: "https://maps.google.com", note: "Neighborhoods and realistic routes" },
  { label: "Rome2Rio", url: "https://www.rome2rio.com", note: "Verify with the actual operator" },
  { label: "Timeanddate", url: "https://www.timeanddate.com", note: "Time zones" },
  { label: "U.S. State Department travel checklist", url: "https://travel.state.gov/en/international-travel/planning/checklist.html" },
  { label: "U.S. State Department travel advisories", url: "https://travel.state.gov/en/international-travel/travel-advisories.html" },
  { label: "CDC Travelers’ Health", url: "https://wwwnc.cdc.gov/travel" },
  { label: "TSA", url: "https://www.tsa.gov/travel" },
  { label: "U.S. DOT Aviation Consumer Protection", url: "https://www.transportation.gov/airconsumer" },
  { label: "U.S. DOT traveling with a disability", url: "https://www.transportation.gov/individuals/aviation-consumer-protection/traveling-disability" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Side-by-side comparisons" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "One-page brief" },
  { label: "Canva", url: "https://www.canva.com/", note: "Sample brief graphic" },
];

export const TRAVEL_RESEARCH_SUPPLIES = {
  starterKitTotal: "About $0–25 — free official sources are enough to test",
  items: [
    { id: "computer", name: "Computer or tablet with reliable internet", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Smartphone for backup access and client communication", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "headphones", name: "Headphones for focused research or client calls", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "email", name: "Separate business email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "intake", name: "Intake questionnaire + research checklist", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "template", name: "One-page travel-brief template", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "folder", name: "Secure cloud folder", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "monitor", name: "Second monitor", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "pdf", name: "PDF export / screenshot tool", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
  ],
};

export const TRAVEL_RESEARCH_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "flights", name: "Google Flights", freePlanAvailable: true, costNote: "Compare routes, dates, stops, and fare trends; verify with the operating airline", url: "https://www.google.com/travel/flights" },
  { id: "hotels", name: "Google Hotels", freePlanAvailable: true, costNote: "Initial lodging comparison; verify with the property", url: "https://www.google.com/travel/hotels" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Neighborhoods, routes, transit, distances", url: "https://maps.google.com" },
  { id: "rome2rio", name: "Rome2Rio", freePlanAvailable: true, costNote: "Ground-transport ideas — verify with the operator", url: "https://www.rome2rio.com" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Side-by-side cost, timing, feature, and tradeoff comparisons", url: "https://sheets.google.com/" },
  { id: "google_docs", name: "Google Docs / Microsoft Word", freePlanAvailable: true, costNote: "One-page brief and client-ready notes", url: "https://docs.google.com/" },
  { id: "drive", name: "Google Drive / OneDrive", freePlanAvailable: true, costNote: "Private delivery with restricted access" },
  { id: "time", name: "Timeanddate", freePlanAvailable: true, costNote: "Time-zone and local-time checks", url: "https://www.timeanddate.com" },
  { id: "state", name: "U.S. Department of State travel checklist", freePlanAvailable: true, planLabelApplicable: false, costNote: "Passport, visa, entry starting point for U.S. travelers", url: "https://travel.state.gov/en/international-travel/planning/checklist.html" },
  { id: "advisories", name: "U.S. Department of State travel advisories", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current destination advisory information", url: "https://travel.state.gov/en/international-travel/travel-advisories.html" },
  { id: "cdc", name: "CDC Travelers’ Health", freePlanAvailable: true, planLabelApplicable: false, costNote: "Destination health notices", url: "https://wwwnc.cdc.gov/travel" },
  { id: "tsa", name: "TSA", freePlanAvailable: true, planLabelApplicable: false, costNote: "Airport screening, ID, baggage", url: "https://www.tsa.gov/travel" },
  { id: "dot", name: "U.S. DOT Aviation Consumer Protection", freePlanAvailable: true, planLabelApplicable: false, costNote: "Airline consumer information", url: "https://www.transportation.gov/airconsumer" },
  { id: "disability", name: "U.S. DOT traveling with a disability", freePlanAvailable: true, planLabelApplicable: false, costNote: "Air-travel accessibility", url: "https://www.transportation.gov/individuals/aviation-consumer-protection/traveling-disability" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Fictional sample brief — never real client itineraries", url: "https://www.canva.com/" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Client Intake + Google Flights + Official Airline Sites + Google Hotels + Official Property Sites + Maps + Official Government Sources + Google Sheets + One-Page Brief + Secure Delivery + Income/Expense Tracker" },
];

export const TRAVEL_RESEARCH_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "TRAVEL RESEARCH ASSISTANT — REPLACE PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not guarantees.",
    "Price by research scope, travelers, destinations, date flexibility, comparison depth, deliverable length, deadline, and revision limit. Do not promise unlimited searching until a magical fare appears.",
    "",
    "Quick flight comparison: $15 – $25",
    "Lodging shortlist: $20 – $35",
    "Activity or local-transport shortlist: $15 – $30",
    "One-page travel brief: $35 – $50",
    "Flexible-date comparison: $35 – $50",
    "Travel-brief update: $15 – $30",
    "",
    "Formula: Base Project Fee + Additional Route/Date/Destination + Research Complexity + Additional Option or Itinerary Detail + Rush Fee + Extra Revision or Refresh = Project Price.",
    "Do not count flight/hotel prices as helper revenue. The client books and pays providers directly.",
  ].join("\n"),
  raiseTip: "If a project cannot be completed carefully within the $15–$50 starter scope, narrow it or give a custom quote before beginning. Examples only.",
  items: [
    { id: "flight", label: "Quick flight comparison", price: "$15–$25", notes: "Up to 3 realistic options for one route/date set" },
    { id: "lodging", label: "Lodging shortlist", price: "$20–$35", notes: "Up to 3 options in one destination" },
    { id: "activity", label: "Activity or local-transport shortlist", price: "$15–$30", notes: "Defined set for one destination" },
    { id: "brief", label: "One-page travel brief", price: "$35–$50", notes: "Limited flight + lodging + transport + outline" },
    { id: "flex", label: "Flexible-date comparison", price: "$35–$50", notes: "Limited date window" },
    { id: "refresh", label: "Travel-brief update", price: "$15–$30", notes: "Same scope, new last-verified time" },
  ],
};

export const TRAVEL_RESEARCH_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Research-Only Service & Boundaries",
    desc: [
      "Promise: “I compare travel options and organize the best matches into a concise brief so you can make the final decision and book directly.”",
      "Included (pick in writing): flight comparison; lodging shortlist; ground-transport comparison; activity/restaurant ideas; simple itinerary outline; accessibility-feature research; one-page travel brief; one scheduled refresh.",
      "Excluded: booking, ticketing, or paying providers; holding client money; logging in to client accounts; applying for passports/visas; guaranteeing entry, safety, weather, price, availability, or refunds; legal, immigration, medical, insurance, or financial advice; managing emergencies or disputes; presenting research as a confirmed reservation.",
      "Beginner niche if helpful: weekend getaways, family road trips, simple domestic flights, senior-friendly comparison, budget lodging shortlists, event-weekend briefs.",
    ].join("\n"),
  },
  {
    title: "Set Prices, Scope, Turnaround & Revisions",
    desc: [
      "Create 2–3 starter offers with hard limits.",
      "Write: Quick Comparison Fee $____ · One-Page Brief Fee $____ · Maximum Routes/Dates · Maximum Options Per Category · Research Time Cap · Standard Turnaround · Included Revisions · Refresh Fee $____ · Rush Fee $____ · Cancellation Rule.",
      "Sample scope: “Up to 3 flight options and 3 lodging options for one destination/date set, one one-page PDF brief, one clarification round, delivered within 3 business days. Research snapshot only; client books and pays providers directly.”",
      "Do not sell unlimited options, unlimited revisions, or unlimited price monitoring for one flat fee.",
    ].join("\n"),
  },
  {
    title: "Build the Client Intake, Privacy & Agreement Process",
    desc: [
      "Create one intake form that asks only for information needed to research: trip purpose, departure and destination, dates or flexibility, traveler count and age categories, budget, flight/lodging priorities, location needs, ground transportation, accessibility needs the client chooses to disclose, loyalty memberships without passwords, dealbreakers, deliverable, deadline, revision limit, research-only acknowledgment.",
      "Agreement language: prices and availability are not held; client verifies traveler-specific requirements; client completes every booking/payment; brief is informational and time-stamped; no safety, price, entry, or availability guarantee; scope, deadline, revision, payment, cancellation, and data-deletion rules.",
      "Use traveler labels rather than sensitive identity data. Delete unnecessary client information after the agreed retention period.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about the service. Pick only 2 or 3 this month.",
      "",
      "☐ Friends and family referrals",
      "☐ Busy parents and professionals",
      "☐ Retiree/community groups where promotion is permitted",
      "☐ Neighborhood Facebook groups",
      "☐ LinkedIn",
      "☐ Local wedding or event communities",
      "☐ Travel-interest groups where services are allowed",
      "☐ Administrative assistants or virtual assistants",
      "☐ Realtors, event planners, photographers, or organizers",
      "☐ Simple service page or portfolio",
      "",
      "Write one measurable goal per channel.",
      "Examples:",
      "- Tell 15 trusted contacts",
      "- Post in 2 approved local groups",
      "- Contact 5 complementary service providers",
      "",
      "Do not spam travel groups, impersonate a travel agent, or advertise guarantees.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "",
      "Headline: TOO MANY TRAVEL TABS OPEN?",
      "I compare flights, lodging, local transportation, and itinerary ideas, then organize the best matches into a clear one-page travel brief.",
      "Research Only • Direct Source Links • Client Books Directly",
      "Projects from $____ · Contact: ________",
      "",
      "Create: one-sentence service description; 2–3 defined packages; sample one-page brief using a fictional trip; intake form; scope/disclaimer paragraph; delivery email template; referral message.",
      "The sample brief should show client priorities, 2–3 options per category, comparable prices, key tradeoffs, source links, last-verified date/time, and “Research only—not booked.”",
      "Never use a real client’s itinerary, dates, confirmation numbers, or personal information in a portfolio without specific written permission and thorough redaction.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use only the 2–3 selected channels.",
      "",
      "Sample message:",
      "“Hi! I’m offering a Travel Research Assistant service for busy people who do not want to compare dozens of tabs. I organize a limited set of flight, lodging, and itinerary options into a clear one-page brief with direct links and tradeoffs. You make all final decisions and bookings. Starter projects begin at $____. Would a sample brief be helpful?”",
      "",
      "Track: Date | Prospect | Channel | Trip Type | Need | Quote | Follow-Up | Project Booked",
      "Follow platform rules. Do not publish a client’s travel dates or announce that a home will be empty.",
      "Do not accept “research” jobs that ask you to use stolen accounts, evade travel restrictions, obtain documents improperly, conceal identity, book with someone else’s card, or move money.",
    ].join("\n"),
  },
  {
    title: "Confirm the Project & Freeze the Search Criteria",
    desc: [
      "Before research begins, send a written project confirmation: destination and departure; dates/flexibility; traveler count/age categories; budget; must-haves; dealbreakers; routes/airports; number of options; deliverable format; research deadline; last-verified format; included revision; fee/payment timing; client-books-directly boundary.",
      "Confirmation: “I will research up to ____ flight options, ____ lodging options, and ____ local-transport/itinerary items for [DESTINATION] on [DATES/FLEXIBILITY]. I will deliver a one-page research brief by [DEADLINE]. Prices and availability are not held. You will verify traveler requirements and complete all bookings/payments directly. Fee: $____.”",
      "If the client changes destination, dates, budget, traveler count, or core priorities after research begins, pause and quote the added scope.",
    ].join("\n"),
  },
  {
    title: "Research Flights Using the Client’s Real Priorities",
    desc: [
      "Search with the agreed criteria, then compare like with like. Record airline and operating carrier, airports, local times, overnight segments, stops, total travel time, layover, fare type, baggage/seat assumptions, change/cancellation notes, displayed total and currency, direct source link, date/time verified.",
      "Flag tradeoffs: cheapest vs. shortest; nonstop vs. connection; main vs. distant airport; separate tickets vs. protected through-ticket; basic-economy restrictions; overnight arrival; tight or self-transfer connection; airport-change requirement.",
      "Do not describe separate tickets, self-transfers, or very tight connections as equivalent to a protected single-ticket itinerary. Do not assume baggage transfers automatically.",
      "The client enters the traveler’s legal name and document details and confirms the final itinerary during booking.",
    ].join("\n"),
  },
  {
    title: "Research Lodging, Transportation & Itinerary Fit",
    desc: [
      "For each lodging option record: property name and type; neighborhood; realistic travel time to the priority location; room/bed setup; occupancy assumptions; displayed nightly and estimated stay total; taxes/mandatory-fee notes; cancellation/payment terms; check-in/out; parking or resort fees; accessibility details to confirm; guest-rating source; direct property/source link; date/time verified.",
      "For ground transportation compare airport transfer, public transit, rail/bus/ferry, rental car, rideshare/taxi estimate, parking/tolls/fuel, operating hours, luggage and accessibility.",
      "For itinerary ideas, confirm current operating days, seasonal closures, reservation needs, age/height restrictions, accessibility, travel time, and official ticket source. Leave realistic buffer time.",
      "Do not recommend unsafe, illegal, age-inappropriate, or clearly unrealistic plans. Label reviews and subjective impressions as opinions, not facts.",
    ].join("\n"),
  },
  {
    title: "Build, Verify & Deliver the One-Page Travel Brief",
    desc: [
      "Structure: TRIP SNAPSHOT (destination, dates, travelers, budget, priorities, research date/time, currency) · BEST MATCH · FLIGHT OPTIONS (up to 3) · LODGING OPTIONS · LOCAL LOGISTICS / ITINERARY · VERIFY BEFORE BOOKING (current total, availability, traveler names, documents, entry/transit rules, baggage, seats, cancellation, accessibility, insurance decision).",
      "Before delivery check: links open; dates and traveler count match; airports and local times are clear; currency is labeled; taxes/fees are not hidden by inconsistent comparisons; totals use the same assumptions; official sources verify material details; opinions are labeled; no sensitive personal data appears; brief says “Research only—not booked”; last-verified date/time is visible.",
      "Deliver through a private link or attached PDF/document. Do not send a public link containing the client’s travel plan.",
    ].join("\n"),
  },
  {
    title: "Handle Revisions, Close Out & Build Recurring Clients",
    desc: [
      "After delivery: invite one included clarification/revision within the agreed window; correct research errors promptly; treat changed dates, destinations, budgets, or scope as a new quote; remind the client to recheck live details before booking; confirm payment; send a receipt if appropriate; delete sensitive or unnecessary information on schedule; record project revenue, expenses, and total time; ask for a truthful review that does not reveal trip details; offer a paid refresh or future research project.",
      "Track: Date | Client Code | Project Type | Fee | Add-Ons | Expenses | Research Hours | Admin Hours | Revision Hours | Status.",
      "Project Profit = Project Fee + Add-Ons − Project Expenses. Effective Profit Per Hour = Project Profit ÷ Total Research/Admin/Revision Hours.",
      "TRUSTED CLIENT → CLEAR CRITERIA → VERIFIED COMPARISON → ONE-PAGE BRIEF → CLIENT BOOKS → FOLLOW-UP PROJECT",
    ].join("\n"),
  },
];

export function travelResearchAssistantToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Client Intake + Google Flights + Official Airline Sites + Google Hotels + Official Property Sites + Maps + Official Government Sources + Google Sheets + One-Page Brief + Secure Delivery + Income/Expense Tracker.",
    "",
    "Search results, aggregators, blogs, social media, AI summaries, review sites, and map listings are leads—not final proof. Verify the decisive details on official provider or government pages and record the date/time checked.",
    "AI tools may invent routes, schedules, policies, or entry rules. If used, treat the output as a draft idea list and verify every material claim. Never paste private client information into an AI tool without the client’s permission.",
  ].join("\n");
}

export function computeTravelResearchAssistantProfit(input: {
  travelQuickComparisonsPerWeek?: number;
  averageQuickComparisonFee?: number;
  onePageBriefsPerMonth?: number;
  averageOnePageBriefFee?: number;
  refreshAddOnRevenue?: number;
  tipsOtherResearchIncome?: number;
  internetPhone?: number;
  softwareStorage?: number;
  advertisingPortfolio?: number;
  paymentFees?: number;
  registrationInsurance?: number;
  supplies?: number;
  otherExpenses?: number;
  intakeHours?: number;
  researchHours?: number;
  briefHours?: number;
  revisionHours?: number;
  marketingAdminHours?: number;
}): {
  weeklyQuickRevenue: number;
  monthlyQuickRevenue: number;
  monthlyBriefRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const weeklyQuickRevenue =
    Math.max(0, Number(input.travelQuickComparisonsPerWeek) || 0) *
    Math.max(0, Number(input.averageQuickComparisonFee) || 0);
  const monthlyQuickRevenue = weeklyQuickRevenue * 4.33;
  const monthlyBriefRevenue =
    Math.max(0, Number(input.onePageBriefsPerMonth) || 0) *
    Math.max(0, Number(input.averageOnePageBriefFee) || 0);
  const grossServiceRevenue =
    monthlyQuickRevenue +
    monthlyBriefRevenue +
    Math.max(0, Number(input.refreshAddOnRevenue) || 0) +
    Math.max(0, Number(input.tipsOtherResearchIncome) || 0);
  const totalExpenses =
    Math.max(0, Number(input.internetPhone) || 0) +
    Math.max(0, Number(input.softwareStorage) || 0) +
    Math.max(0, Number(input.advertisingPortfolio) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.registrationInsurance) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.intakeHours) || 0) +
    Math.max(0, Number(input.researchHours) || 0) +
    Math.max(0, Number(input.briefHours) || 0) +
    Math.max(0, Number(input.revisionHours) || 0) +
    Math.max(0, Number(input.marketingAdminHours) || 0);
  return {
    weeklyQuickRevenue,
    monthlyQuickRevenue,
    monthlyBriefRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
