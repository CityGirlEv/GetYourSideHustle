/**
 * Community Teaching & Workshops (`teaching`, Guide #050).
 * Pro Membership. 3 - 10 hrs/week. Displayed $50 – $200 / session (examples).
 * Plain data only — no imports from guide-tools.
 */

export const COMMUNITY_TEACHING_REALITY_CHECK = {
  title: "SELL A LEARNING RESULT, NOT A TWO-HOUR INFORMATION DUMP",
  body: [
    "Turn a practical skill—such as cooking, genealogy, photography, writing, technology, crafts, budgeting basics, or life organization—into a focused class for a library, senior center, faith community, club, nonprofit, business, or online audience. Define one learning result, build a safe and accessible lesson, partner with an appropriate venue, teach it, and improve it from participant feedback.",
    "",
    "A workshop succeeds when participants can do something specific by the end.",
    "",
    "Before booking, define: the target learner; the skill or result; prerequisite knowledge; session length; minimum and maximum attendance; in-person or online format; venue responsibilities; instructor responsibilities; supplies and technology; accessibility and accommodation process; food, tool, movement, photography, and minor-safety rules; registration, refunds, cancellations, and no-shows; recording and material-use permissions; the fee, payment schedule, and approved expenses.",
    "",
    "The instructor should: teach within actual competence; use current and accurate information; provide clear objectives and a timed lesson plan; offer accessible materials and reasonable participation options; test demonstrations, technology, and supplies; state safety limits and refer regulated questions appropriately; protect participant information; collect feedback without guaranteeing outcomes.",
    "",
    "The venue/client should: approve the topic, audience, capacity, room, promotion, registration, and emergency process; identify accessibility needs and venue requirements; confirm insurance, permits, background checks, food rules, waivers, and equipment restrictions when applicable; provide a decision-maker and day-of contact; approve the final materials and promotional claims.",
    "",
    "Do not teach legal, medical, tax, investment, mental-health, licensing, hazardous-tool, food-safety, fitness, or other regulated/high-risk material beyond your qualifications. “I watched three videos” is enthusiasm—not a credential.",
    "",
    "Tagline: Teach One Useful Skill. Help a Community Grow.",
  ].join("\n"),
};

export const COMMUNITY_TEACHING_NOTES_WORKSHEET = `NOTES: WORKSHOP POSITIONING

Skill: ________
Evidence / Credentials: ________
Audience: ________
Learning Result: ________
Boundaries / Referrals: ________

OFFER
Title: ________
Description: ________
Duration: ________
Capacity: ________
Format: ________
Session Fee: $____
Per-Person Fee: $____
Materials Fee: $____
Add-Ons: ________
Cancellation Rule: ________

VENUE
Venue / Contact: ________
Date / Time / Zone: ________
Room / Platform: ________
Accessibility Contact: ________
Equipment: ________
Registration Owner: ________
Minimum Enrollment: ________
Safety / Emergency Rules: ________
Insurance / Permit / Check Requirements: ________
Recording / Photo Rules: ________
Payment Schedule: ________

LESSON
Opening: ________
Demonstration: ________
Practice: ________
Questions: ________
Recap: ________
Next Action: ________
Materials / Backup: ________

RESULTS
Participants: ____
Revenue Invoiced: $____
Revenue Collected: $____
Expenses: $____
Total Hours: ____
Profit: $____
Effective Profit/Hour: $____
Feedback: ________
Improvement: ________
Rebook / Referral: ________

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Venues Contacted: ____
Proposals Sent: ____
Sessions Booked: ____
Referrals: ____

GYSH PRO TIP
DESIGN THE PRACTICE FIRST. THEN TEACH ONLY WHAT PARTICIPANTS NEED TO COMPLETE IT.
If the handout requires binoculars and the agenda needs a shoehorn, the workshop is too full.

Gross revenue is NOT profit. Track invoiced vs. collected revenue separately. Set aside taxes based on qualified advice.

ONE LEARNER + ONE RESULT + ONE TESTED ACTIVITY + ONE CLEAR NEXT STEP = STRONG FIRST WORKSHOP
`;

export const COMMUNITY_TEACHING_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Teach one useful skill in a focused class for a library, senior center, faith community, club, nonprofit, business, or online audience. Pro Membership. 3 - 10 hrs/week. Displayed $50 – $200 / session is examples only, not guarantees. Intermediate / skill-based. Startup $0 – $100. One session, short series, or recurring workshop. Per session, per participant, series, venue contract, and digital-handout add-on.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "A specific skill you can demonstrate and explain · a defined adult or senior audience · one measurable learning objective · lesson outline and timed agenda · practice run · participant handout or resource sheet · venue/client agreement · registration and attendance process · accessibility and accommodation plan · safety and emergency plan appropriate to the topic · supply and equipment checklist · cancellation/refund/no-show policy · invoice/payment method · time, revenue, and expense tracker.",
  },
  {
    id: "before",
    label: "Before accepting a workshop",
    detail:
      "Confirm topic and promised result; participant age range and experience; expected attendance and capacity; date, time, time zone, and duration; in-person, hybrid, or online format; room setup and accessible route; internet, screen, sound, outlets, tables, and seating; materials supplied by instructor, venue, or participants; demonstration risks, allergies, tools, heat, movement, or other hazards; venue insurance, waiver, permit, food, photo, recording, and background-check rules; registration owner and participant data access; accessibility-request contact; marketing owner and approval deadline; payment amount and schedule; cancellation, rescheduling, weather, and minimum-enrollment rules; recording, reuse, and intellectual-property terms.",
  },
  {
    id: "topics",
    label: "Good first workshop topics",
    detail:
      "Smartphone basics · family-history organization · beginner photography · memoir or story writing · basic Canva projects · decluttering systems · garden planning · simple crafts · meal planning or non-hazardous food education within qualifications · job-search organization · everyday computer skills · book or discussion facilitation. Start with one 45–90 minute workshop that solves one small problem. Avoid promising mastery, certification, licensure, employment, health improvement, financial results, or guaranteed transformation.",
  },
  {
    id: "qualifications",
    label: "Stay inside qualifications",
    detail:
      "Do not teach legal, medical, tax, investment, mental-health, licensing, hazardous-tool, food-safety, fitness, or other regulated/high-risk material beyond your qualifications. Teach within actual competence. Use current and accurate information. Adult and senior audiences are the intended first market; if teens or children are involved, the venue must set age rules and a parent/guardian process before you accept the booking.",
  },
];

export const COMMUNITY_TEACHING_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "ADA.gov effective communication", url: "https://www.ada.gov/resources/effective-communication/", note: "Current U.S. accessibility guidance for effective communication" },
  { label: "ADA.gov web accessibility guidance", url: "https://www.ada.gov/resources/web-guidance/", note: "Current U.S. guidance for covered online services" },
  { label: "U.S. Copyright Office", url: "https://www.copyright.gov/what-is-copyright/", note: "Copyright basics for slides, handouts, images, and recordings" },
  { label: "FDA food safety resources for educators", url: "https://www.fda.gov/consumers/consumer-information-audience/educators", note: "Current resources when food instruction is involved" },
  { label: "U.S. Small Business Administration Business Guide", url: "https://www.sba.gov/business-guide", note: "Planning, insurance, and operations" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center", note: "Federal self-employment and estimated-tax starting point" },
];

export const COMMUNITY_TEACHING_SUPPLIES = {
  starterKitTotal: "About $0–100 — do not purchase bulk supplies until minimum enrollment and reimbursement terms are confirmed",
  items: [
    { id: "computer", name: "Reliable computer and internet", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Smartphone and charger", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "lesson", name: "Lesson plan + timed facilitator agenda", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "handout", name: "Participant handout", qty: "1", estCost: "$0–10", notes: "Essential" },
    { id: "attendance", name: "Registration / attendance list controlled by the client", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "supply-check", name: "Supply checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "access-check", name: "Accessibility checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "safety", name: "Safety / emergency contacts", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "eval", name: "Evaluation form", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "invoice", name: "Invoice and expense tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "extension", name: "Laptop charger and venue-approved extension cord", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "remote", name: "Presentation remote", qty: "1", estCost: "$10–25", notes: "Helpful", optional: true },
    { id: "backup", name: "Backup copy of slides and handouts", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "pwm", name: "Password manager + multi-factor authentication", qty: "1", estCost: "$0–4/mo", notes: "Helpful", optional: true },
  ],
};

export const COMMUNITY_TEACHING_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "docs", name: "Google Docs / Microsoft Word", freePlanAvailable: true, costNote: "Lesson plans, handouts, agreements, and checklists", url: "https://docs.google.com" },
  { id: "slides", name: "Google Slides / Microsoft PowerPoint / Canva", freePlanAvailable: true, costNote: "Visual instruction and accessible participant materials", url: "https://www.canva.com/" },
  { id: "forms", name: "Google Forms / Microsoft Forms", freePlanAvailable: true, costNote: "Registration questions, accommodation requests routed to the client, and evaluations", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets / Microsoft Excel", freePlanAvailable: true, costNote: "Attendance, supplies, costs, time, and revenue", url: "https://sheets.google.com/" },
  { id: "zoom", name: "Zoom / Google Meet / Microsoft Teams", freePlanAvailable: true, costNote: "Online workshops with captions and approved recording settings", url: "https://zoom.us/" },
  { id: "calendar", name: "Calendly / Google Calendar", freePlanAvailable: true, costNote: "Scheduling, reminders, time zones, and buffers", url: "https://calendar.google.com/" },
  { id: "eventbrite", name: "Eventbrite / client registration system", freePlanAvailable: true, costNote: "Registration only under clear ownership, fee, refund, and data rules", url: "https://www.eventbrite.com/", optional: true },
  { id: "pwm", name: "Password manager + multi-factor authentication", freePlanAvailable: true, costNote: "Protect venue, registration, and teaching accounts", url: "https://bitwarden.com/" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Skill + One Learner + One Learning Result + One Lesson Plan + One Handout + One Practice Run + One Venue Agreement + Accessibility/Safety Check + Evaluation + Profit Tracker" },
];

export const COMMUNITY_TEACHING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "COMMUNITY TEACHING & WORKSHOPS — REPLACE PRICING",
    "",
    "Displayed $50 – $200 / session is examples only, not guarantees.",
    "",
    "45–60 minute introductory session: $50 – $100 — one focused topic, simple handout, limited questions, and basic venue coordination.",
    "75–90 minute hands-on workshop: $100 – $200+ — instruction, guided practice, participant questions, handout, and defined supplies. Complex setup or equipment costs more.",
    "Two-part series: $175 – $400+ — two related sessions with practice between meetings, materials, and a defined follow-up method.",
    "Private group or staff workshop: $150 – $500+ — customized content for one organization. Price by preparation, audience size, risk, customization, and usage rights.",
    "Per-participant model: $10 – $50+ per person — use only when the venue agreement defines registration, minimum enrollment, refunds, payment collection, comps, and revenue split.",
    "Online workshop: $75 – $250+ — includes platform setup, slides or demonstration, participant materials, technology check, and stated replay rights.",
    "",
    "Formula: Preparation Hours × Target Rate + Teaching Time + Setup/Cleanup Time + Materials and Approved Expenses + Travel + Customization/Recording Rights + Admin and Follow-Up = Workshop Quote.",
    "",
    "Monthly examples only: 2 sessions × $75 = $150 gross/month; 4 sessions × $125 = $500 gross/month; 4 sessions × $200 = $800 gross/month.",
    "Gross revenue is NOT profit. Actual earnings depend on preparation, attendance, venue terms, supplies, travel, insurance, platform fees, cancellations, taxes, and repeat bookings. Examples only. Session, two-part series, per-participant, and online workshop prices are planning examples; revenue is not profit.",
  ].join("\n"),
  raiseTip:
    "Define learning objective, session length, capacity, included preparation and materials, venue vs. instructor responsibilities, registration/payment owner, minimum enrollment, cancellation/rescheduling/refund terms, accessibility process, recording/photo rules, material ownership, and extra-time rates in writing. Revenue is not profit. Examples only.",
  items: [
    { id: "intro", label: "45–60 minute introductory session", price: "$50–$100", notes: "One focused topic, simple handout, limited questions, basic venue coordination" },
    { id: "hands-on", label: "75–90 minute hands-on workshop", price: "$100–$200+", notes: "Instruction, guided practice, questions, handout, defined supplies" },
    { id: "series", label: "Two-part series", price: "$175–$400+", notes: "Two related sessions with practice between meetings" },
    { id: "private", label: "Private group or staff workshop", price: "$150–$500+", notes: "Customized content; price by prep, size, risk, usage rights" },
    { id: "per-person", label: "Per-participant model", price: "$10–$50+ / person", notes: "Only with defined registration, minimum, refunds, and split" },
    { id: "online", label: "Online workshop", price: "$75–$250+", notes: "Platform setup, materials, technology check, stated replay rights" },
  ],
};

export const COMMUNITY_TEACHING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose One Skill, Learner & Learning Result",
    desc: [
      "Write: Skill I Can Teach: ________ · Evidence of Competence: ________ · Target Learner: ________ · Starting Knowledge: ________ · By the End, Participants Can: ________ · Topics I Will Not Cover: ________",
      "Use an observable result: create, identify, organize, practice, compare, draft, or complete.",
      "Weak: “Understand photography.” Clear: “Use three phone-camera settings and take one better-lit portrait.”",
      "Do not teach legal, medical, tax, investment, mental-health, licensing, hazardous-tool, food-safety, fitness, or other regulated/high-risk material beyond your qualifications.",
    ].join("\n"),
  },
  {
    title: "Build the Session, Price & Agreement",
    desc: [
      "Create: Workshop Title: ________ · Promise: ________ · Duration: ________ · Capacity: ________ · Format: ________ · Fee: $____ · Materials Included: ________ · Participant Brings: ________ · Venue Provides: ________ · Cancellation Rule: ________ · Recording Rights: ________",
      "Build a timed agenda: Welcome → Objective → Demonstration → Guided Practice → Questions → Recap → Next Action → Evaluation.",
      "Put scope, responsibilities, accessibility, safety, payment, cancellation, ownership, and recording terms in writing.",
    ].join("\n"),
  },
  {
    title: "Create & Test the Lesson Materials",
    desc: [
      "Build: facilitator guide; participant handout; demonstration example; practice activity; resource list; accessibility alternatives; supply checklist; evaluation form.",
      "Practice with a timer and one test learner. Remove unnecessary material until the session fits with a question buffer. Test every link, file, demonstration, recipe, device, and instruction.",
      "Do not assume “educational use” makes copyrighted slides, books, photographs, videos, worksheets, music, or online course material free to copy. Use original, licensed, public-domain, or properly authorized materials and keep license records.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential venues or clients discover the workshop. Choose only 2 or 3 this month.",
      "Good channels: libraries; senior centers; faith communities; recreation centers; clubs and associations; nonprofits; community colleges/continuing education; local businesses; chambers and networking groups; online community groups; referrals from prior participants.",
      "Write one measurable goal per channel, such as contacting 10 venues, submitting 3 proposals, or attending 2 community events.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create: one-sentence instructor positioning; workshop title and learning result; short description; audience and prerequisites; duration and format; capacity; fee or venue quote; instructor biography with truthful credentials; fictional or permission-based sample handout; venue proposal; booking call-to-action.",
      "Do not claim accreditation, certification, endorsement, or outcomes you cannot prove. Do not guarantee mastery, certification, employment, health, financial, attendance, or other results.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2–3 selected channels this week.",
      "Sample message: “I teach a [LENGTH] workshop for [AUDIENCE] called [TITLE]. Participants leave able to [SPECIFIC RESULT]. I provide [MATERIALS], and the venue provides [NEEDS]. The session fee is $____. May I send the one-page proposal?”",
      "Track: Date | Venue | Contact | Channel | Topic | Audience | Response | Proposal | Follow-Up | Booked.",
      "Follow up once or twice politely. Do not add venue contacts to unrelated marketing lists.",
    ].join("\n"),
  },
  {
    title: "Qualify the Venue & Confirm Logistics",
    desc: [
      "Confirm audience, accessibility, room/platform, equipment, capacity, registration, safety, insurance, permits, payment, promotion, cancellations, recording, participant data, and day-of contact.",
      "Conduct an in-person or virtual site check. Document the final setup and arrival/login time. Decline a venue that cannot safely support the activity.",
    ].join("\n"),
  },
  {
    title: "Rehearse & Prepare the Final Workshop",
    desc: [
      "Run the entire session at real speed.",
      "Check: content accuracy; plain-language instructions; demonstration visibility; captions and readable materials; supply quantities; technology and backups; safety statements; accommodation plan; emergency contact; opening and closing; time buffer.",
      "Send final participant instructions and approved materials through the venue’s authorized system.",
    ].join("\n"),
  },
  {
    title: "Deliver the Workshop",
    desc: [
      "Arrive/log in early. Confirm the room, exits, equipment, captions, materials, attendance process, photo/recording rules, and venue contact.",
      "During the session: state the objective and boundaries; explain before demonstrating; check understanding; invite participation without forcing disclosure; use respectful, inclusive language; keep personal participant information private; pause unsafe activity; stay on time; refer questions outside scope.",
      "Do not photograph or record participants without the required permissions. Do not teach regulated or high-risk material beyond your qualifications.",
    ].join("\n"),
  },
  {
    title: "Close, Evaluate & Hand Off",
    desc: [
      "End with: key steps recap; one action participants can take today; resource list; clear limits and referral sources; evaluation; venue-approved next step.",
      "Afterward, count supplies, clean the area, report incidents, deliver promised files, invoice, and store or delete participant information according to the agreement.",
    ].join("\n"),
  },
  {
    title: "Measure Profit, Improve & Rebook",
    desc: [
      "Track: Workshop | Venue | Participants | Preparation Hours | Teaching Hours | Admin/Travel Hours | Revenue | Expenses | Feedback | Rebook.",
      "Workshop Profit = Collected Revenue − Direct Expenses. Effective Profit Per Total Hour = Workshop Profit ÷ All Preparation/Teaching/Admin/Travel Hours.",
      "Review learning evidence, timing, accessibility requests, confusion points, safety issues, supply waste, and venue feedback. Improve one element before offering the session again. Ask for an honest review and permission before using a testimonial or photo.",
      "SKILL → LEARNING RESULT → TESTED LESSON → SAFE ACCESSIBLE DELIVERY → FEEDBACK → IMPROVEMENT → REBOOK",
    ].join("\n"),
  },
];

export function communityTeachingWorkshopsToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: One Skill + One Learner + One Learning Result + One Lesson Plan + One Handout + One Practice Run + One Venue Agreement + Accessibility/Safety Check + Evaluation + Profit Tracker.",
    "Accessibility, food handling, insurance, background checks, room capacity, fire rules, professional licensing, permits, taxes, and recording consent vary by topic and location. Verify current official requirements before advertising or accepting payment.",
    "Do not assume “educational use” makes copyrighted slides, books, photographs, videos, worksheets, music, or online course material free to copy. Use original, licensed, public-domain, or properly authorized materials and keep license records.",
    "AI may help outline a lesson or generate practice questions, but it can invent facts, citations, instructions, and safety guidance. Do not upload participant information or confidential venue material without written approval. Verify every factual or safety-critical statement and teach from human-reviewed materials.",
    "Do not teach legal, medical, tax, investment, mental-health, licensing, hazardous-tool, food-safety, fitness, or other regulated/high-risk material beyond your qualifications.",
  ].join("\n");
}

export function computeCommunityTeachingProfit(input: {
  workshopSessionsPerMonth?: number;
  averageSessionFee?: number;
  perParticipantRevenue?: number;
  seriesPrivateGroupRevenue?: number;
  workbookMaterialsRevenue?: number;
  otherEarnedWorkshopIncome?: number;
  materialsSupplies?: number;
  printing?: number;
  venuePlatformFees?: number;
  insurancePermitsChecks?: number;
  travelParking?: number;
  softwareEquipment?: number;
  paymentFees?: number;
  advertising?: number;
  otherExpenses?: number;
  curriculumPrepHours?: number;
  marketingSalesHours?: number;
  venueCoordinationHours?: number;
  setupCleanupHours?: number;
  teachingHours?: number;
  travelHours?: number;
  followUpAdminHours?: number;
}): {
  monthlySessionRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const monthlySessionRevenue =
    Math.max(0, Number(input.workshopSessionsPerMonth) || 0) *
    Math.max(0, Number(input.averageSessionFee) || 0);
  const grossServiceRevenue =
    monthlySessionRevenue +
    Math.max(0, Number(input.perParticipantRevenue) || 0) +
    Math.max(0, Number(input.seriesPrivateGroupRevenue) || 0) +
    Math.max(0, Number(input.workbookMaterialsRevenue) || 0) +
    Math.max(0, Number(input.otherEarnedWorkshopIncome) || 0);
  const totalExpenses =
    Math.max(0, Number(input.materialsSupplies) || 0) +
    Math.max(0, Number(input.printing) || 0) +
    Math.max(0, Number(input.venuePlatformFees) || 0) +
    Math.max(0, Number(input.insurancePermitsChecks) || 0) +
    Math.max(0, Number(input.travelParking) || 0) +
    Math.max(0, Number(input.softwareEquipment) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.curriculumPrepHours) || 0) +
    Math.max(0, Number(input.marketingSalesHours) || 0) +
    Math.max(0, Number(input.venueCoordinationHours) || 0) +
    Math.max(0, Number(input.setupCleanupHours) || 0) +
    Math.max(0, Number(input.teachingHours) || 0) +
    Math.max(0, Number(input.travelHours) || 0) +
    Math.max(0, Number(input.followUpAdminHours) || 0);
  return {
    monthlySessionRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
