/**
 * Virtual Receptionist (`virtual-receptionist`, Guide #115).
 * Pro Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project (examples).
 * Plain data only — no imports from guide-tools.
 */

export const VIRTUAL_RECEPTIONIST_REALITY_CHECK = {
  title: "A RECEPTIONIST IS A ROUTER, NOT AN UNLICENSED ADVISER OR EMERGENCY DISPATCHER",
  body: [
    "Answer inbound business calls during agreed coverage windows, identify the caller’s purpose, use an approved greeting and decision tree, schedule only within authorized rules, and send accurate messages to the right person. Protect confidential information, never promise what the business has not authorized, and escalate emergencies, threats, complaints, or sensitive requests through the client’s written protocol.",
    "",
    "Your job is to welcome, clarify, capture, schedule, and route. Do not diagnose, quote legal outcomes, make financial promises, confirm private account details, or decide what constitutes professional advice.",
    "",
    "Before coverage begins, require: approved greeting and business identity; coverage hours and time zone; call types and decision tree; staff directory and transfer rules; appointment rules and calendar permissions; required message fields; urgent and emergency definitions; complaint and threat protocol; privacy, verification, recording, and retention rules; payment-taking rules; outage/backup contact; daily handoff and quality-review process.",
    "",
    "If a caller appears to face immediate danger, use the client’s approved emergency script and direct them to the appropriate emergency service. Never imply that monitoring is continuous unless it truly is.",
    "",
    "The receptionist should: follow the approved greeting; capture names, numbers, and reasons accurately; repeat back critical details; stay inside authorized answers; schedule only within calendar rules; transfer or message the correct person; protect caller privacy; log every call; send a complete shift handoff.",
    "",
    "The receptionist should NOT: diagnose medical, legal, or financial situations; quote prices, outcomes, or advice the client has not approved; confirm account, insurance, or identity details beyond the written verification script; take card numbers into ordinary notes, email, chat, recordings, or transcripts; clone a voice or deploy undisclosed AI calling; claim 24/7 coverage, zero missed calls, or industry compliance the service does not actually support.",
    "",
    "Tagline: Answer Clearly. Route Correctly. Protect Every Caller.",
  ].join("\n"),
};

export const VIRTUAL_RECEPTIONIST_NOTES_WORKSHEET = `NOTES: VIRTUAL RECEPTIONIST

CLIENT AND COVERAGE
Business: ____________________________________
Primary Contact: ______________________________
Coverage Days/Hours/Time Zone: _______________
Phone Number/Queue: __________________________
Expected Volume: _____________________________
Package/Overage: _____________________________

SCRIPT AND ROUTING
Approved Greeting: ____________________________
Call Categories: _____________________________
Required Message Fields: ______________________
Transfer Rules: ______________________________
Scheduling Rules: ____________________________
Statements Never to Make: ____________________

URGENT AND EMERGENCY
Urgent Triggers: ______________________________
Primary Escalation: ___________________________
Backup Escalation: ____________________________
Emergency Script: _____________________________
Outage Procedure: _____________________________

PRIVACY AND SYSTEMS
Sensitive Data Expected: ______________________
Approved CRM/Calendar: ________________________
Recording/Transcription: On / Off
Notice/Consent Script Approved: Yes / No / Not Applicable
Payment Information Routed To: _______________
Retention/Deletion Rule: ______________________
MFA Confirmed: Yes / No

SHIFT HANDOFF
Calls Answered: ____
Messages Sent: ____
Transfers: ____
Appointments: ____
Unresolved Callbacks: ____
Incidents/Escalations: ________________________

SERVICE SETUP
Starter Setup / Trial Block: $____
Scheduled Coverage Block: $____
Monthly Overflow / Retainer: $____
After-Hours / Complex Routing: ________
Included Minutes / Calls: ________
Overage Rule: ________
Deposit / Payment Rule: ________
Cancellation Rule: ________
Backup Coverage Plan: ________

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Prospects Contacted: ____
Replies: ____
Discovery Calls: ____
Quotes: ____
Paid Pilots: ____
Clients Won: ____
Referrals: ____

BUSINESS TRACKER
Prospects Contacted: ____
Paid Pilots: ____
Active Clients: ____
Invoices Sent: $____
Payments Collected: $____
Expenses: $____
Total Hours: ____
Monthly Profit: $____
Effective Hourly Profit: $____
Calls Answered: ____
Accurate Messages: ____
Appointments Scheduled: ____
Urgent Escalations Within Target: ____ / ____

RED FLAGS — PAUSE OR DECLINE
- Client has no urgent or emergency escalation contact
- Business asks you to give legal, medical, financial, or other regulated advice
- Recording/transcription is enabled without a confirmed lawful notice/consent policy
- Client wants card data written in ordinary notes, chat, email, or recordings
- Client wants deceptive caller identity, undisclosed AI voice, or unsolicited outbound marketing
- System exposes more caller data than the role needs
- Client claims industry compliance but provides no approved workflow or agreement
- Coverage promise exceeds actual availability or backup capacity

GYSH PRO TIP
The most valuable receptionist is not the one who talks the longest. It is the one who gets the caller’s name, number, reason, urgency, and next action right—then places that information safely in front of the correct person.

STARTER CHALLENGE
Draft one greeting and a five-branch decision tree today: new inquiry, existing customer, appointment request, complaint, and urgent issue. Add required message fields and the exact person each branch reaches.

NAME + NUMBER + REASON + URGENCY + NEXT ACTION + CORRECT PERSON = A USEFUL HANDOFF
`;

export const VIRTUAL_RECEPTIONIST_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Answer inbound business calls during reserved coverage windows, identify the caller’s purpose, follow an approved greeting and decision tree, schedule only within authorized rules, and send accurate messages to the right person. Category: Customer Service / Remote Call Handling. Best for calm, clear communicators who can follow scripts, capture details accurately, protect caller privacy, and escalate without improvising. Beginner–Intermediate; regulated industries require client-approved training and systems. Startup $0 – low. Schedule: reserved coverage blocks / after-hours / overflow. Quiet remote workspace. Income type: coverage block / hourly / call package / monthly retainer. Pro Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project is examples only, not guarantees.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Quiet, private workspace · reliable computer, internet, headset, and backup contact method · clear speaking and active-listening skills · accurate spelling, number, and message capture · client-approved greeting, FAQ, directory, calendar rules, and escalation tree · secure phone/CRM/calendar access · call-log, message, incident, and handoff templates · confidentiality, retention, and offboarding process · invoice/payment and time-tracking system.",
  },
  {
    id: "before",
    label: "Before coverage begins",
    detail:
      "Require an approved greeting and business identity; coverage hours and time zone; call types and decision tree; staff directory and transfer rules; appointment rules and calendar permissions; required message fields; urgent and emergency definitions; complaint and threat protocol; privacy, verification, recording, and retention rules; payment-taking rules; outage/backup contact; daily handoff and quality-review process. Confirm whether calls may be recorded, transcribed, monitored, or summarized by AI. Consent and notice requirements vary by jurisdiction and context. The client must provide a lawful policy; when uncertain, do not record and flag the question.",
  },
  {
    id: "regulated",
    label: "Regulated industries, payments, and recording",
    detail:
      "For healthcare, legal, financial, insurance, government, education, or other regulated clients, determine whether special agreements, training, access controls, scripts, or secure systems apply before receiving caller information. HHS explains that a service provider handling protected health information for a covered entity may be a HIPAA business associate. Do not accept card numbers into ordinary notes, email, chat, recordings, or transcripts. Use the client’s approved payment workflow and current PCI requirements, or route the caller to authorized staff. This guide does not establish compliance for every client or state.",
  },
  {
    id: "clients",
    label: "Possible clients and safe first niches",
    detail:
      "Start with straightforward inbound calls for a low-risk business: local service companies, independent professionals, small offices that need overflow or after-hours message capture, and appointment routing with clear calendar rules. Define whether you offer greetings, message capture, transfers, FAQs, appointment scheduling, order-status routing, or overflow. Exclude sales, collections, regulated advice, crisis counseling, and complex intake until qualified. Decline clients with no urgent or emergency contact, requests for unlicensed advice, card data in ordinary notes, deceptive caller identity, undisclosed AI voice, unsolicited outbound marketing, or coverage promises that exceed actual availability.",
  },
  {
    id: "teens",
    label: "For teens / parent or guardian approval",
    detail:
      "If the receptionist is under 18, a parent or guardian should approve the client, contract, communications, payment method, coverage hours, and any after-hours work. A teen should not privately handle healthcare, legal, financial, insurance, government, or other regulated caller information, crisis calls, or payment-card data. Parent/guardian approval is required for teens before accepting a live coverage client.",
  },
];

export const VIRTUAL_RECEPTIONIST_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "FTC Cybersecurity for Small Business", url: "https://www.ftc.gov/business-guidance/small-businesses/cybersecurity", note: "Current small-business cybersecurity practices for phones, accounts, and caller data" },
  { label: "FCC Telephone Consumer Protection Act rules", url: "https://www.fcc.gov/sites/default/files/tcpa-rules.pdf", note: "Current TCPA rules; inbound coverage is not automatically every outbound telemarketing rule" },
  { label: "FCC AI-generated voices in robocalls", url: "https://www.fcc.gov/document/fcc-makes-ai-generated-voices-robocalls-illegal", note: "AI-generated voices can fall within artificial or prerecorded-voice restrictions" },
  { label: "HHS Business Associates guidance", url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html", note: "A provider handling protected health information for a covered entity may be a business associate" },
  { label: "HHS sample Business Associate Agreement provisions", url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html", note: "Sample provisions only — not a completed agreement or compliance determination" },
  { label: "PCI Security Standards Council", url: "https://www.pcisecuritystandards.org/", note: "Current payment-card security starting point; do not capture card data in ordinary notes" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center", note: "Federal self-employment and estimated-tax starting point" },
  { label: "U.S. Small Business Administration Business Guide", url: "https://www.sba.gov/business-guide", note: "Business planning, launch, management, and growth resources" },
];

export const VIRTUAL_RECEPTIONIST_SUPPLIES = {
  starterKitTotal: "About $0–40",
  items: [
    { id: "computer", name: "Reliable computer", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Stable internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "headset", name: "Noise-reducing headset and charger", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "workspace", name: "Quiet private workspace", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "voip", name: "Client-approved phone / VoIP system", qty: "1", estCost: "$0–25/mo", notes: "Essential — never a personal number unless approved in writing" },
    { id: "calendar", name: "Calendar / CRM access with minimum permissions", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "scripts", name: "Greeting, FAQ, directory, decision tree, scheduling, and escalation scripts", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "call-log", name: "Call log, message form, incident report, and shift handoff", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "pwm", name: "Password manager and multi-factor authentication", qty: "1", estCost: "$0–4/mo", notes: "Essential" },
    { id: "tracker", name: "Time, revenue, and expense tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "invoice", name: "Invoice / payment method", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "backup-net", name: "Backup internet or phone plan", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "monitor", name: "Second monitor", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "outage", name: "Status page or outage checklist", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "pronunciation", name: "Pronunciation guide", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "relay", name: "Accessibility / relay-call procedure supplied by client", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "privacy-filter", name: "Secure screen / privacy filter", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
  ],
};

export const VIRTUAL_RECEPTIONIST_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "voip", name: "Client-Approved VoIP / Business Phone Platform", freePlanAvailable: false, planLabelApplicable: false, costNote: "Calls, transfers, queues, and voicemail under current terms — never a personal number unless the client has approved privacy, security, notice, and retention in writing" },
  { id: "calendar", name: "Client CRM / Calendar", freePlanAvailable: true, costNote: "Minimum-permission message and appointment handling on the client’s approved system", url: "https://calendar.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Call log, coverage tracker, quality audit, time, and revenue — no card numbers or extra sensitive data", url: "https://sheets.google.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Greeting, decision tree, emergency script, and shift-handoff templates", url: "https://docs.google.com/" },
  { id: "pwm", name: "Password manager + multi-factor authentication", freePlanAvailable: true, costNote: "Protect phone, CRM, and calendar access — never share the client’s master password", url: "https://bitwarden.com/" },
  { id: "ftc-cyber", name: "FTC Cybersecurity for Small Business", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current small-business cybersecurity practices", url: "https://www.ftc.gov/business-guidance/small-businesses/cybersecurity" },
  { id: "fcc-tcpa", name: "FCC Telephone Consumer Protection Act Rules", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current TCPA rules for callbacks, autodialing, prerecorded messages, texts, and AI-generated voice", url: "https://www.fcc.gov/sites/default/files/tcpa-rules.pdf" },
  { id: "fcc-ai", name: "FCC AI-Generated Voices in Robocalls", freePlanAvailable: true, planLabelApplicable: false, costNote: "Never clone a business owner’s voice or deploy AI calling because a vendor says it is compliant", url: "https://www.fcc.gov/document/fcc-makes-ai-generated-voices-robocalls-illegal" },
  { id: "hhs-ba", name: "HHS Business Associates Guidance", freePlanAvailable: true, planLabelApplicable: false, costNote: "Flag HIPAA business-associate questions before receiving protected health information", url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html" },
  { id: "hhs-baa", name: "HHS Sample Business Associate Agreement Provisions", freePlanAvailable: true, planLabelApplicable: false, costNote: "Sample provisions — not a completed agreement or a compliance certificate", url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html" },
  { id: "pci", name: "PCI Security Standards Council", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current payment-card security starting point; route payments through the client’s approved workflow", url: "https://www.pcisecuritystandards.org/" },
  { id: "irs", name: "IRS Self-Employed Individuals Tax Center", freePlanAvailable: true, planLabelApplicable: false, costNote: "Federal self-employment and estimated-tax starting point", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Client + One Number/Queue + One Greeting + One Decision Tree + One Calendar Rule Set + One Escalation Contact + One Handoff Report" },
];

export const VIRTUAL_RECEPTIONIST_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "VIRTUAL RECEPTIONIST — REPLACE PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not guarantees.",
    "Use $15–$50 for a short, tightly defined setup or trial block. Ongoing live coverage should reflect reserved availability, call volume, complexity, systems, training, and after-hours requirements.",
    "",
    "Starter setup or trial: $15 – $50 — one limited script/decision-tree review or a short paid test block with a firm call/time cap.",
    "Scheduled coverage block: $25 – $75+ per block — a defined 1–2 hour inbound coverage window with approved greeting, message capture, and end-of-block handoff.",
    "Monthly overflow package: $150 – $600+ — reserved recurring blocks or a call allowance. Define included minutes/calls, overage, concurrent calls, scheduling, and reporting.",
    "After-hours or complex routing: custom quote — price higher for nights/weekends, urgent escalation, multiple departments, bilingual service, regulated data, detailed intake, or specialized software.",
    "",
    "Possible add-ons: script and decision-tree setup; calendar scheduling; bilingual coverage by a truly proficient speaker; weekend/holiday/after-hours coverage; additional location or department; detailed intake form; daily report or quality audit; rush onboarding.",
    "",
    "Formula: Reserved Coverage Time + Expected Call Work + Setup/Reporting + Complexity/Risk + Software/Direct Costs + Add-Ons = Quote.",
    "State whether a package is priced by scheduled block, talk minute, answered call, qualified message, or monthly retainer. Define spam calls, wrong numbers, hold time, abandoned calls, transfers, and overages before work begins.",
    "",
    "Monthly examples — not guarantees: 4 trial blocks × $40 = $160 gross/month; 8 coverage blocks × $50 = $400 gross/month; one $300 overflow retainer + two $50 blocks = $400 gross/month.",
    "",
    "Gross revenue is NOT profit. Subtract phone software, equipment, internet allocation, payment fees, insurance, training, subcontracting, and taxes. Track invoiced and collected amounts separately. Examples only; not guaranteed.",
  ].join("\n"),
  raiseTip:
    "Define coverage hours, time zone, included calls/minutes, overage, after-hours price, cancellation, backup coverage, and reporting in writing. Track reserved hours, not only talk time. Examples only — not guarantees.",
  items: [
    { id: "trial", label: "Starter setup or trial", price: "$15–$50", notes: "Limited script/decision-tree review or a short paid test block with a firm call/time cap" },
    { id: "block", label: "Scheduled coverage block", price: "$25–$75+", notes: "Defined 1–2 hour inbound window with greeting, message capture, and end-of-block handoff" },
    { id: "overflow", label: "Monthly overflow package", price: "$150–$600+", notes: "Reserved recurring blocks or call allowance; define minutes/calls, overage, concurrent calls, scheduling, reporting" },
    { id: "after-hours", label: "After-hours or complex routing", price: "Custom quote", notes: "Nights/weekends, urgent escalation, multiple departments, bilingual, regulated data, detailed intake, specialized software" },
    { id: "script-setup", label: "Script and decision-tree setup add-on", price: "Quote", notes: "Greeting, categories, approved answers, transfer rules, required fields, forbidden statements" },
    { id: "report-audit", label: "Daily report or quality audit add-on", price: "Quote", notes: "Shift handoff plus sampled message-accuracy review" },
  ],
};

export const VIRTUAL_RECEPTIONIST_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose a Safe Call-Handling Niche",
    desc: [
      "Start with straightforward inbound calls for a low-risk business.",
      "Write: Business Type: ________ · Call Types Offered: Greeting / Message Capture / Transfer / FAQ / Appointment Scheduling / Order-Status Routing / Overflow · Languages: ________ · After-Hours: Yes / No · Regulated Data Expected: Yes / No · Exclusions: ________",
      "Define whether you offer greetings, message capture, transfers, FAQs, appointment scheduling, order-status routing, or overflow. Exclude sales, collections, regulated advice, crisis counseling, and complex intake until qualified.",
      "Promise: “I answer inbound calls during agreed coverage hours, follow your approved greeting and decision tree, capture accurate messages, and route callers to the right person. I do not diagnose, quote legal or financial outcomes, or act as emergency dispatch.”",
      "A receptionist is a router. Do not diagnose, quote legal outcomes, make financial promises, confirm private account details, or decide what constitutes professional advice.",
    ].join("\n"),
  },
  {
    title: "Define Coverage and Price",
    desc: [
      "Set days, hours, time zone, languages, call/time allowance, average call length, hold/transfer handling, scheduling, reporting, overage, after-hours price, and cancellation rules.",
      "Write: Package Name: ________ · Coverage Days: ________ · Hours / Time Zone: ________ · Included Minutes / Calls: ________ · Average Call Length: ________ · Concurrent Calls: ________ · Hold / Transfer Handling: ________ · Scheduling Included: Yes / No · Report Included: ________ · Overage: $____ · After-Hours Price: ________ · Cancellation: ________ · Fee: $____",
      "Use the displayed $15 – $50 / project range for a short, tightly defined setup or trial block. Price reserved live coverage for availability, volume, complexity, systems, training, and after-hours requirements—not talk time alone.",
      "State whether the package is priced by scheduled block, talk minute, answered call, qualified message, or monthly retainer. Define spam calls, wrong numbers, hold time, abandoned calls, transfers, and overages before work begins.",
    ].join("\n"),
  },
  {
    title: "Build the Script and Decision Tree",
    desc: [
      "Document greeting, caller-verification steps, reason categories, approved answers, transfer rules, required message fields, appointment limits, urgent triggers, forbidden statements, and closing.",
      "Required message fields: Date/Time | Caller Name (spelled) | Return Number (repeated back) | Business / Account if authorized | Reason Category | Urgency | Approved Next Action | Person Routed To | Call Outcome.",
      "Five-branch starter tree: (1) new inquiry; (2) existing customer; (3) appointment request; (4) complaint; (5) urgent issue. Name the exact person or queue each branch reaches.",
      "Write statements never to make: medical, legal, or financial advice; unauthorized prices or guarantees; confirmation of private account details beyond the verification script; “we are monitoring 24/7” unless that is true; any promise the business has not authorized.",
      "Keep the script short enough to follow live. A decision tree that cannot be used on a ringing line is a document, not a system.",
    ].join("\n"),
  },
  {
    title: "Build Privacy, Recording, and Emergency Rules",
    desc: [
      "Identify data received, approved system, access level, retention, recording/transcription status, notice language, payment path, regulated-industry obligations, and incident response. Get the client’s written emergency and outage instructions.",
      "Write: Sensitive Data Expected: ________ · Approved System: ________ · Access Level: ________ · Retention/Deletion: ________ · Recording / Transcription / AI Summary: On / Off · Notice/Consent Script Approved: Yes / No / Not Applicable · Payment Path: ________ · Incident Contact: ________",
      "Confirm whether calls may be recorded, transcribed, monitored, or summarized by AI. Consent and notice requirements vary by jurisdiction and context. The client must provide a lawful policy; when uncertain, do not record and flag the question. Call-recording and monitoring laws can differ by state and by the locations of people on the call.",
      "If a caller appears to face immediate danger, use the client’s approved emergency script and direct them to the appropriate emergency service. Never imply that monitoring is continuous unless it truly is. Never act as an unlicensed adviser or emergency dispatcher.",
      "Do not accept card numbers into ordinary notes, email, chat, recordings, or transcripts. Use the client’s approved payment workflow and current PCI requirements, or route the caller to authorized staff. For healthcare, legal, financial, insurance, government, education, or other regulated clients, determine whether special agreements, training, access controls, scripts, or secure systems apply before receiving caller information.",
    ].join("\n"),
  },
  {
    title: "Test the Phone and Handoff System",
    desc: [
      "Run test calls for greeting, caller ID, transfers, voicemail, calendar conflicts, accessibility scenarios, internet failure, dropped calls, urgent escalation, and daily report delivery. Correct every failure before going live.",
      "Test checklist: greeting plays/speaks as approved; caller ID and business identity are correct; transfers reach the named person or queue; voicemail and after-hours path work; calendar conflicts and appointment limits are enforced; accessibility/relay procedure supplied by the client is usable; backup internet or phone plan is known; dropped-call callback rule is written; urgent escalation reaches a live person; handoff report arrives in the approved location.",
      "Do not use a personal phone number, personal voicemail, or consumer recording/transcription tool for client calls unless the client has approved the privacy, security, notice, and retention setup in writing.",
      "An inbound answering service is not automatically subject to every outbound telemarketing rule. Do not add outbound marketing, automated dialing, prerecorded messages, texts, or AI-generated voice to an inbound scope without the client’s documented legal review and approved process. Never clone a business owner’s voice.",
    ].join("\n"),
  },
  {
    title: "Create Honest Marketing Materials",
    desc: [
      "Marketing is this step. Complete all three GYSH marketing stages here before onboarding a live client.",
      "",
      "Stage 1 — Choose 2 or 3 channels this month. A channel is one way potential clients discover the service.",
      "Good channels: local service businesses that miss overflow calls; independent professionals with a single line; small offices that need reserved coverage blocks; virtual-assistant and bookkeeper referral partners; chambers or merchant groups; LinkedIn or a simple service page; referrals from web designers and office managers.",
      "Write one measurable goal per channel. Examples: contact 10 local service businesses about overflow coverage; ask 5 bookkeepers or virtual assistants for an introduction; share 3 message-accuracy tips; request 3 referrals from complementary providers.",
      "Do not scrape directories or add strangers to a promotional list without permission. Do not threaten businesses with missed-call fear. Never claim 24/7 coverage, HIPAA compliance, bilingual fluency, emergency response, or zero missed calls unless the complete service actually supports that claim.",
      "",
      "Stage 2 — Create honest materials.",
      "State the exact coverage, call types, time zone, reporting, and starting price.",
      "Service description: “I answer inbound [BUSINESS TYPE] calls during [DAYS/HOURS TIME ZONE]. I use your approved greeting and decision tree, capture [REQUIRED FIELDS], schedule only within your rules, and send a shift handoff. Starter trial is $____ for [EXACT SCOPE].”",
      "Create: one-page service sheet; short biography; trial-block and coverage-block packages; starting price and add-ons; fictional greeting and five-branch tree sample; sample call log and handoff; client questionnaire; emergency/outage questions; call-to-action.",
      "Portfolio safety: use fictional names, numbers, and businesses unless permission is documented; label mockups as samples; never publish real caller information, recordings, or regulated data.",
      "",
      "Stage 3 — Carry out the plan this week on only the 2–3 selected channels.",
      "Sample outreach: “Hi! I provide reserved inbound call coverage for [BUSINESS TYPE]. I follow an approved greeting and decision tree, capture accurate messages, and send a shift handoff. My $____ trial is [EXACT HOURS/CALL CAP]. I do not diagnose, quote legal or financial outcomes, or replace emergency services. Would a one-page coverage sheet be useful?”",
      "Track: Date | Prospect | Business Type | Channel | Coverage Need | Quote | Paid Pilot | Won/Lost | Reason.",
      "Do not offer a free live coverage shift to “prove” the service. A short fictional sample or paid pilot demonstrates the process without donating reserved hours.",
    ].join("\n"),
  },
  {
    title: "Qualify and Onboard the Client",
    desc: [
      "Verify the business, owner, phone number, call volume, business hours, industry, systems, data, staff directory, escalation contacts, and payment. Sign scope/confidentiality documents and any required industry agreement before access.",
      "Confirm: authorized owner/contact; coverage days/hours/time zone; number/queue; expected volume; greeting; decision tree; directory and transfer rules; calendar permissions; required message fields; urgent and emergency definitions; complaint and threat protocol; recording/notice policy; payment-taking rules; outage/backup contact; daily handoff; fee, overage, and cancellation.",
      "Use the least phone, CRM, and calendar permission needed. Prefer an individual user seat or role instead of a shared password. Enable multi-factor authentication and remove access when the engagement ends.",
      "Pause or decline if the client has no urgent or emergency escalation contact; asks you to give legal, medical, financial, or other regulated advice; enables recording/transcription without a confirmed lawful notice/consent policy; wants card data in ordinary notes; wants deceptive caller identity, undisclosed AI voice, or unsolicited outbound marketing; exposes more caller data than the role needs; claims industry compliance without an approved workflow or agreement; or promises coverage beyond actual availability or backup capacity.",
    ].join("\n"),
  },
  {
    title: "Complete a Paid Pilot Shift",
    desc: [
      "Use a short, low-volume block. Follow the script exactly, timestamp every call, repeat back names/numbers, and flag missing FAQs or routing gaps. Do not improvise promises.",
      "Pilot log: Time | Caller Purpose | Script Branch Used | Message Fields Complete | Transfer / Appointment / Handoff | Issue Flagged | Minutes.",
      "Repeat back names and numbers. If a detail is unclear, ask once more. A guessed spelling is not a professional message.",
      "After the pilot: send the shift handoff; list script gaps; list routing gaps; confirm whether the client wants a reserved coverage package. Do not expand into sales, collections, regulated advice, or crisis counseling during a trial.",
    ].join("\n"),
  },
  {
    title: "Answer, Clarify, and Route",
    desc: [
      "Identify the business, listen, confirm key details, classify the call, provide only approved information, schedule only within rules, and transfer or send the message securely. Stay calm with frustrated callers and never argue.",
      "Live-call flow: Answer with the approved greeting → identify the caller’s purpose → verify only the fields the script allows → classify the branch → give only approved answers → schedule only within calendar rules → transfer or send the message → close and log.",
      "Required capture: name (spelled) · return number (repeated back) · reason · urgency · next action · person or queue routed to.",
      "Stay inside the decision tree. If the caller asks for a diagnosis, legal outcome, financial promise, private account confirmation, or any statement that is not approved, use the client’s redirect language and route to the named person. Never argue. Never invent an answer to sound helpful.",
    ].join("\n"),
  },
  {
    title: "Escalate and Hand Off Accurately",
    desc: [
      "Use the urgent path for threats, safety concerns, service outages, legal notices, media calls, privacy incidents, or specified high-value callers. Send a shift report showing calls, messages, appointments, transfers, unresolved items, incidents, and callback deadlines.",
      "If a caller appears to face immediate danger, use the client’s approved emergency script and direct them to the appropriate emergency service. Then notify the client’s named escalation contact. Do not stay on the line as a substitute for emergency services. Do not decide that a situation is “probably fine.”",
      "Handoff report: Coverage Window | Time Zone | Calls Answered | Messages Sent | Transfers | Appointments | Unresolved Callbacks (with deadlines) | Incidents/Escalations | Script Gaps | System Issues | Backup/Outage Notes.",
      "Place the information safely in front of the correct person. A long conversation that never reaches the owner is not a completed job.",
    ].join("\n"),
  },
  {
    title: "Review Quality, Invoice, and Improve",
    desc: [
      "Audit a sample of permitted records, correct script gaps, reconcile coverage and overages, invoice, confirm payment, and update the decision tree with client approval. Track missed-call causes, message accuracy, escalation timing, profit, and client retention.",
      "Quality metrics: Calls Answered | Accurate Messages | Appointments Scheduled | Urgent Escalations Within Target. Message Accuracy Rate = Accurate Messages ÷ Audited Messages × 100. Do not divide only by talk time. Reserved availability, setup, call notes, escalation, and reporting are real work.",
      "Track: Client | Blocks Completed | Retainer / Overages / Add-Ons | Phone/VoIP/CRM Cost | Equipment/Internet | Payment Fees | Training/Insurance | Backup/Subcontractors | Reserved Coverage Hours | Setup/Training/Reporting Hours | Marketing/Admin Hours | Collected Revenue | Expenses | Profit | Effective Hourly Profit.",
      "Track invoiced vs. collected revenue separately. Set aside taxes based on qualified advice. Ask for honest feedback and permission before using a testimonial. Update the decision tree only with client approval.",
      "SCRIPT → TEST → PILOT → ANSWER → VERIFY → ROUTE → ESCALATE → HANDOFF",
    ].join("\n"),
  },
];

export function virtualReceptionistToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: One Client + One Number/Queue + One Greeting + One Decision Tree + One Calendar Rule Set + One Escalation Contact + One Handoff Report.",
    "An inbound answering service is not automatically subject to every outbound telemarketing rule. However, any outbound callback, automated dialing, prerecorded message, text, or AI-generated voice can trigger different consent and disclosure requirements. Do not add outbound marketing or automated calling to an inbound scope without the client’s documented legal review and approved process.",
    "The FCC has confirmed that AI-generated voices fall within TCPA restrictions on artificial or prerecorded voice calls. Never clone a business owner’s voice or deploy AI calling because a software vendor says it is compliant.",
    "Call-recording and monitoring laws can differ by state and by the locations of people on the call. Flag the jurisdiction and obtain client-approved notice/consent wording instead of guessing. When uncertain, do not record.",
    "This guide does not establish compliance for every client or state. Healthcare, legal, financial, insurance, government, education, payment-card, privacy, and recording requirements change. Check current official FTC, FCC, HHS, PCI, IRS, and client-specific rules before receiving caller information.",
    "If a caller appears to face immediate danger, use the client’s approved emergency script and direct them to the appropriate emergency service. Never diagnose, quote legal outcomes, make financial promises, or imply that monitoring is continuous unless it truly is.",
    "AI tools may help organize an approved decision tree or draft a fictional sample greeting, but they can invent answers, expose caller information, and sound like unauthorized advice. Do not upload caller recordings, transcripts, health, legal, financial, or payment data to an AI tool without written approval of the exact tool, account, settings, purpose, recipients, retention, and deletion process. Every live call needs a human following the client’s script.",
  ].join("\n");
}

export function computeVirtualReceptionistProfit(input: {
  vrCoverageBlocksCompleted?: number;
  averageFeePerBlock?: number;
  monthlyRetainerRevenueCollected?: number;
  overageAfterHoursRevenue?: number;
  setupReportingAddOnRevenue?: number;
  otherEarnedRevenue?: number;
  phoneVoipCrmSoftware?: number;
  equipmentInternetAllocation?: number;
  paymentFees?: number;
  trainingInsuranceProfessionalServices?: number;
  backupCoverageSubcontractors?: number;
  otherExpenses?: number;
  reservedCoverageHours?: number;
  setupTrainingReportingHours?: number;
  marketingAdminHours?: number;
}): {
  blockRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const blockRevenue =
    Math.max(0, Number(input.vrCoverageBlocksCompleted) || 0) *
    Math.max(0, Number(input.averageFeePerBlock) || 0);
  const grossServiceRevenue =
    blockRevenue +
    Math.max(0, Number(input.monthlyRetainerRevenueCollected) || 0) +
    Math.max(0, Number(input.overageAfterHoursRevenue) || 0) +
    Math.max(0, Number(input.setupReportingAddOnRevenue) || 0) +
    Math.max(0, Number(input.otherEarnedRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.phoneVoipCrmSoftware) || 0) +
    Math.max(0, Number(input.equipmentInternetAllocation) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.trainingInsuranceProfessionalServices) || 0) +
    Math.max(0, Number(input.backupCoverageSubcontractors) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.reservedCoverageHours) || 0) +
    Math.max(0, Number(input.setupTrainingReportingHours) || 0) +
    Math.max(0, Number(input.marketingAdminHours) || 0);
  return {
    blockRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
