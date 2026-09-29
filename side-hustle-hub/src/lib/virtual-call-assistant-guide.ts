/**
 * Build a Virtual Call Assistant (`virtual-call-assistant`, Guide #041).
 * Elite. 8 - 20 hrs/week. Displayed $20 – $40 / hour or retainer (examples).
 * Plain data only — no imports from guide-tools.
 * Distinct from Virtual Receptionist (#115).
 */

export const VIRTUAL_CALL_ASSISTANT_REALITY_CHECK = {
  title: "BUILD CAPACITY BEFORE YOU SELL AVAILABILITY",
  body: [
    "A call service is a live promise. If two clients ring at once, the internet fails, a caller reports an emergency, or the primary operator is unavailable, the operating plan—not improvisation—must decide what happens.",
    "",
    "Before signing a client, define:",
    "- Separate number/queue and business identity",
    "- Coverage days, hours, time zone, holidays, and outages",
    "- Expected call volume, peaks, and average duration",
    "- Included call types and prohibited advice",
    "- Greeting, qualification, transfer, scheduling, and escalation scripts",
    "- Client response and backup contacts",
    "- Message delivery and callback targets",
    "- Recording/transcription/AI status and lawful notice",
    "- Data, payment, health, and regulated-industry handling",
    "- Retainer allowance, overages, setup, and termination",
    "- Staffing/subcontractor access and supervision",
    "- Service-level reporting and quality review",
    "",
    "Start with one low-risk niche and one or two clients. Do not sell 24/7, emergency, medical, legal, financial, or multilingual coverage that the actual system cannot deliver.",
    "",
    "Tagline: One Niche. One Playbook. Calls Handled Reliably.",
  ].join("\n"),
};

export const VIRTUAL_CALL_ASSISTANT_NOTES_WORKSHEET = `VIRTUAL CALL ASSISTANT NOTES

SERVICE DESIGN
Niche: ________________________________________
Coverage/Time Zone: ____________________________
Maximum Clients/Queues: ________________________
Maximum Expected Calls: ________________________
Concurrent Call/Overflow Rule: _________________
Backup Operator/System: ________________________

CLIENT BUILD
Client/Number/Queue: ___________________________
Business Identity/Greeting: ____________________
Call Types Included/Excluded: __________________
Calendar/CRM: __________________________________
Urgent and Emergency Contacts: _________________
Recording/Transcription Status: ________________
Industry Agreements/Training: __________________

QUALITY AND SECURITY
Required Message Fields: _______________________
Callback Target: _______________________________
Messages Audited/Accurate: ____ / ____
MFA and Minimum Access: Yes / No
Script Version/Approval Date: __________________
Incidents/Open Questions: ______________________

CLIENT PROFITABILITY
Retainer/Included Allowance: ___________________
Calls/Minutes/Overages: ________________________
Revenue Collected: $____
Direct Costs: $____
Owner Hours: ____
Operator Hours: ____
Client Profit: $____

BUSINESS TRACKER
Prospects Contacted: ____
Paid Pilots: ____
Active Clients: ____
Calls Answered: ____
Invoices Sent: $____
Payments Collected: $____
Total Expenses: $____
Monthly Profit: $____
Capacity Utilization: ____%

RED FLAGS — PAUSE OR DECLINE
- Client has no written urgent/emergency route or backup contact
- Recording, transcription, AI, or outbound-call rules are unresolved
- Client wants legal, medical, financial, crisis, or other regulated advice from unqualified operators
- Full card data or sensitive information would enter ordinary notes/recordings
- Retainer promises more coverage or concurrency than the system can provide
- Client wants caller deception, number spoofing, undisclosed AI voice, or unsolicited marketing
- Contractor/operator access is not covered by training, agreements, and least privilege
- Quality drops when adding a new client

GYSH PRO TIP
Scale by cloning the operating system, not by stacking more ringing phones on one person. A new client is ready only when it has a separate queue, approved script, decision tree, secure access, tested backup, and measurable quality target.

STARTER CHALLENGE
Build a five-call-type pilot for one niche today. Include greeting, required fields, booking rule, route, urgent trigger, forbidden promise, and handoff deadline for each call type—then run ten test calls before pitching.`;

export const VIRTUAL_CALL_ASSISTANT_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Build a paid service that answers and screens inbound calls, captures qualified messages, and books appointments for local professionals who miss the phone. Productize the work with one niche, separate client numbers and scripts, defined coverage and overflow, least-privilege system access, measured quality, and a documented backup/offboarding plan. Tagline: One Niche. One Playbook. Calls Handled Reliably. Category: Professional / Call-Handling Service Business. Best for adults and seniors who can build a reliable multi-client call operation. Intermediate–Advanced · $0 – $50 to test · Reserved Coverage / Recurring Retainers · Online / Quiet Remote Workspace · Hourly Coverage / Call Package / Monthly Retainer · Elite · 8 - 20 hrs/week · Displayed $20 – $40 / hour or retainer (examples, not guarantees). Distinct from Virtual Receptionist (#115).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Private, quiet workspace · Reliable computer, internet, headset, and tested backup · Business phone/VoIP platform with separate client routing · Strong speaking, listening, typing, and de-escalation skills · Niche-specific script and decision-tree system · Client intake, contract, confidentiality, and service-level agreement · Calendar/CRM/message tools with minimum access · Call log, incident log, quality audit, and shift handoff · Password manager, multi-factor authentication, and offboarding checklist · Invoicing, bookkeeping, time, and capacity tracking.",
  },
  {
    id: "compliance",
    label: "Compliance flags",
    detail:
      "Verify local business registration, insurance, tax, recording/monitoring, employment/contractor, telemarketing, privacy, industry, and accessibility requirements. For healthcare clients, determine with qualified guidance whether business associate agreements and HIPAA safeguards apply. For payment calls, use a client-approved PCI-aligned payment path; never store full card details in ordinary notes, email, recordings, or transcripts. If adding outbound calls, artificial/prerecorded/AI voice, autodialing, or marketing texts, obtain a separate compliance review — FCC TCPA rules may apply.",
  },
];

export const VIRTUAL_CALL_ASSISTANT_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "FTC Cybersecurity for Small Business", url: "https://www.ftc.gov/business-guidance/small-businesses/cybersecurity" },
  { label: "FTC Data Breach Response Guide", url: "https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business" },
  { label: "FCC TCPA Rules", url: "https://www.fcc.gov/sites/default/files/tcpa-rules.pdf" },
  { label: "FCC AI-Generated Voice Ruling", url: "https://www.fcc.gov/document/fcc-confirms-tcpa-applies-ai-technologies-generate-human-voices" },
  { label: "HHS Business Associates Guidance", url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html" },
  { label: "HHS Sample Business Associate Agreement Provisions", url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html" },
  { label: "PCI Security Standards Council", url: "https://www.pcisecuritystandards.org/" },
  { label: "SBA Licenses and Permits", url: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
];

export const VIRTUAL_CALL_ASSISTANT_SUPPLIES = {
  starterKitTotal:
    "About $0–50 to test if you already own a computer, headset, and internet — operating software, insurance, and backup coverage can increase cost",
  items: [
    { id: "computer", name: "Computer, headset, charger, and private workspace", qty: "1", estCost: "$0 (usually owned)", notes: "Essential" },
    { id: "internet", name: "Stable internet and tested backup connection", qty: "1", estCost: "$0–50/mo", notes: "Essential" },
    { id: "voip", name: "Multi-client VoIP/phone platform", qty: "1", estCost: "$15–50/mo", notes: "Core" },
    { id: "queues", name: "Separate number/queue and caller-ID rules per client", qty: "Per client", estCost: "Varies", notes: "Core" },
    { id: "crm", name: "Client-approved CRM/calendar/message delivery", qty: "1+", estCost: "$0–30/mo", notes: "Core" },
    { id: "templates", name: "Intake, contract, confidentiality, and service-level templates", qty: "1 set", estCost: "$0", notes: "Core" },
    { id: "scripts", name: "Greeting, FAQ, qualification, scheduling, transfer, escalation, outage, and closing scripts", qty: "1 set per client", estCost: "$0", notes: "Core" },
    { id: "logs", name: "Call/incident/quality/handoff logs", qty: "1 system", estCost: "$0", notes: "Core" },
    { id: "security", name: "Password manager and MFA", qty: "1", estCost: "$0–10/mo", notes: "Core" },
    { id: "tracker", name: "Revenue, cost, time, call-volume, and capacity tracker", qty: "1", estCost: "$0", notes: "Core" },
    { id: "monitor", name: "Second monitor", qty: "1", estCost: "$80–200+", notes: "Helpful", optional: true },
    { id: "noise", name: "Noise-control equipment", qty: "1", estCost: "$20–80", notes: "Helpful", optional: true },
    { id: "status", name: "Status-monitoring page", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "privacy-filter", name: "Secure screen/privacy filter", qty: "1", estCost: "$15–40", notes: "Helpful", optional: true },
    { id: "kb", name: "Knowledge base with version/date owner", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "backup-op", name: "Trained backup operator and coverage calendar", qty: "1", estCost: "Varies", notes: "Helpful", optional: true },
    { id: "insurance", name: "Professional liability/cyber insurance review", qty: "1", estCost: "Varies", notes: "Helpful", optional: true },
  ],
};

export const VIRTUAL_CALL_ASSISTANT_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "voip", name: "Business VoIP / Call Queue Platform", freePlanAvailable: true, costNote: "Separate numbers, routing, voicemail, analytics, and permissions" },
  { id: "crm", name: "Client CRM / Calendar", freePlanAvailable: true, costNote: "Approved intake and scheduling with minimum access" },
  { id: "ftc-cyber", name: "FTC Cybersecurity for Small Business", freePlanAvailable: true, costNote: "MFA and access controls", url: "https://www.ftc.gov/business-guidance/small-businesses/cybersecurity" },
  { id: "ftc-breach", name: "FTC Data Breach Response Guide", freePlanAvailable: true, costNote: "Incident response planning", url: "https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business" },
  { id: "fcc-tcpa", name: "FCC TCPA Rules", freePlanAvailable: true, costNote: "Outbound/autodial rules — separate review if applicable", url: "https://www.fcc.gov/sites/default/files/tcpa-rules.pdf" },
  { id: "fcc-ai", name: "FCC AI-Generated Voice Ruling", freePlanAvailable: true, costNote: "AI voice and TCPA", url: "https://www.fcc.gov/document/fcc-confirms-tcpa-applies-ai-technologies-generate-human-voices" },
  { id: "hhs-ba", name: "HHS Business Associates Guidance", freePlanAvailable: true, costNote: "Healthcare clients — qualified review", url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html" },
  { id: "hhs-sample", name: "HHS Sample Business Associate Agreement Provisions", freePlanAvailable: true, costNote: "BAA reference only", url: "https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html" },
  { id: "pci", name: "PCI Security Standards Council", freePlanAvailable: true, costNote: "Payment-call handling", url: "https://www.pcisecuritystandards.org/" },
  { id: "sba", name: "SBA Licenses and Permits", freePlanAvailable: true, costNote: "Local business rules", url: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits" },
  { id: "irs", name: "IRS Self-Employed Individuals Tax Center", freePlanAvailable: true, costNote: "Income and expense records", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Low-Risk Niche + One Client Queue + One Decision Tree + One Paid Pilot + One Backup Plan + Daily QA + Monthly Retainer" },
];

export const VIRTUAL_CALL_ASSISTANT_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $20 – $40 / hour or retainer (examples, not guarantees).",
    "Price reserved availability, setup, actual call workload, complexity, reporting, backup, and risk. Talk time alone understates the cost of maintaining coverage.",
    "",
    "PAID PILOT",
    "$50 – $150+",
    "Script setup and a short limited coverage test with a call/time cap, daily handoff, and review meeting.",
    "",
    "SCHEDULED COVERAGE",
    "$20 – $40+ per reserved hour",
    "Defined inbound coverage for one client and one queue, with message capture and approved routing.",
    "",
    "STARTER RETAINER",
    "$250 – $750+ per month",
    "Recurring coverage blocks or a call/minute allowance, basic reporting, and defined overage.",
    "",
    "MULTI-LOCATION OR COMPLEX RETAINER",
    "$750 – $2,500+ per month",
    "Multiple locations, detailed qualification, calendar rules, call trees, reporting, and tested backup. Regulated or high-risk work may cost more or be declined.",
    "",
    "POSSIBLE ADD-ONS",
    "- Initial call-flow design",
    "- Additional number/location/department",
    "- Appointment scheduling",
    "- After-hours/weekend/holiday coverage",
    "- Bilingual coverage by a qualified operator",
    "- CRM integration/data cleanup",
    "- Detailed daily report",
    "- Additional trained operator",
    "- Rush onboarding",
    "",
    "PRICING FORMULA: Reserved Coverage + Expected Call Work + Setup/Training + Reporting/QA + Backup Capacity + Software/Direct Costs + Add-Ons = Quote.",
    "Define what counts as a call/minute, spam/wrong numbers, holds, transfers, voicemail, after-call notes, concurrent calls, overages, and rollover. Set a capacity ceiling before adding clients.",
    "",
    "MONTHLY EXAMPLES — NOT GUARANTEES",
    "10 reserved hours × $25 = $250 gross/month",
    "Two $400 retainers = $800 gross/month",
    "Three $600 retainers = $1,800 gross/month",
    "",
    "Gross revenue is NOT profit. Subtract phone/CRM/software, equipment, internet, backup operators, payroll/contractors, insurance, payment fees, professional services, and taxes.",
  ].join("\n"),
  raiseTip:
    "Raise retainers after documented QA and stable backup coverage. Displayed $20 – $40 / hour examples are not income guarantees.",
  items: [
    { id: "pilot", label: "Paid pilot", price: "$50 – $150+", notes: "Limited coverage test with review" },
    { id: "hourly", label: "Scheduled coverage", price: "$20 – $40+/hr", notes: "Reserved inbound coverage" },
    { id: "starter", label: "Starter retainer", price: "$250 – $750+/mo", notes: "Coverage blocks or call/minute allowance" },
    { id: "complex", label: "Multi-location or complex retainer", price: "$750 – $2,500+/mo", notes: "Tested backup required" },
  ],
};

export const VIRTUAL_CALL_ASSISTANT_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose One Low-Risk Client Niche",
    desc: [
      "Choose a niche with repeatable inbound calls, such as home services or appointment-based local professionals.",
      "Map typical callers, peak hours, appointment types, urgent issues, and statements you must never make.",
    ].join("\n"),
  },
  {
    title: "Design the Service and Capacity Limit",
    desc: [
      "Set coverage, time zone, maximum clients/queues, expected calls, maximum average handle time, concurrent-call rule, voicemail/overflow, response targets, backup, exclusions, and stop-selling threshold.",
    ].join("\n"),
  },
  {
    title: "Build Packages, Pricing, and Agreements",
    desc: [
      "Define setup, retainer allowance, overage, reserved hours, call/minute definitions, software, client responsibilities, service levels, data, recording, regulated work, contractors, payment, and termination.",
    ].join("\n"),
  },
  {
    title: "Build the Repeatable Call Operating System",
    desc: [
      "Create intake, number/queue, greeting, knowledge base, decision tree, qualification, calendar rules, transfer, urgent escalation, message form, outage plan, incident report, handoff, and version control.",
    ].join("\n"),
  },
  {
    title: "Secure and Test the Technology",
    desc: [
      "Use separate client permissions, MFA, minimum access, private workspace, and approved storage.",
      "Test call quality, queues, caller ID, transfers, voicemail, calendars, duplicate bookings, dropped calls, internet failure, and backup routing.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: warm referrals; local business groups; professional associations; agency partners; direct outreach.",
      "Set measurable goals such as: contact 10 prospects; attend 1 networking event; send 5 pilot offers.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "State niche, coverage, included call types, reports, pilot, retainer approach, and CTA.",
      "Sample: “I provide scheduled inbound call coverage for [NICHE]. The paid pilot includes one client number, an approved decision tree, qualified messages, and a daily report.”",
      "Do not claim 24/7, “never miss a call,” compliance certification, AI capability, emergency dispatch, or guaranteed bookings unless true and supportable.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels you chose.",
      "☐ Warm referrals — ask trusted contacts for introductions.",
      "☐ Local groups — share your pilot offer and readiness checklist.",
      "☐ Direct outreach — send personalized messages to qualified prospects.",
      "Track: Date | Prospect | Channel | Response | Pilot Sent | Follow-Up.",
      "Verify business identity, call source/volume, industry, data, budget, urgent protocol, and decision-maker before onboarding.",
    ].join("\n"),
  },
  {
    title: "Map Calls, Run a Paid Pilot & Go Live with QA",
    desc: [
      "Review recent call types without taking unnecessary personal data. Build the approved script, route map, appointment rules, and escalation tree.",
      "Run a limited paid pilot block; record outcomes and every unanswered question.",
      "Go live: answer with the correct identity, verify essential details, follow the client script, schedule within constraints, timestamp messages, and separate clients.",
      "Audit message accuracy, required fields, routes, and callback deadlines each day.",
    ].join("\n"),
  },
  {
    title: "Add Backup or Operators Safely",
    desc: [
      "Before adding capacity, document training, confidentiality, background checks if appropriate, access, supervision, QA, scheduling, payroll/contractor classification questions, and breach/offboarding steps.",
      "Never share a personal login.",
    ].join("\n"),
  },
  {
    title: "Report, Reconcile, and Scale Carefully",
    desc: [
      "Send service-level reports, reconcile calls/minutes/coverage and overages, invoice and collect, update scripts with client approval, and track margin per client.",
      "Add a client only if peak capacity, backup, security, and quality remain within target.",
      "Pattern: NICHE → CAPACITY → PLAYBOOK → PILOT → QA → BACKUP → RETAINER → SCALE.",
    ].join("\n"),
  },
];

export function virtualCallAssistantToolsDisclaimer(): string {
  return "Beginner stack: One Low-Risk Niche + One Client Queue + One Decision Tree + One Paid Pilot + One Backup Plan + Daily QA + Monthly Retainer. Recording consent rules vary by jurisdiction — client must approve lawful notice. Apply MFA and least privilege to every operator. Distinct from Virtual Receptionist (#115).";
}

/** Example: two $500 retainers + $150 setup/overage = $1,150; $350 expenses; $800 profit; 32 owner hrs → $25/hr */
export function computeVirtualCallAssistantProfit(input: {
  vcaHourlyRevenue?: number;
  vcaRetainerRevenue?: number;
  vcaSetupPilotRevenue?: number;
  vcaOverageAddOnRevenue?: number;
  vcaOtherRevenue?: number;
  vcaVoipCrmSoftware?: number;
  vcaEquipmentInternetBackup?: number;
  vcaOperatorPayrollContractors?: number;
  vcaInsuranceLegalCompliance?: number;
  vcaPaymentFeesMarketing?: number;
  vcaOtherExpenses?: number;
  vcaReservedCoverageHours?: number;
  vcaSetupTrainingReportingHours?: number;
  vcaOwnerAdminMarketingHours?: number;
  vcaOperatorHoursPaid?: number;
  vcaCallsAnswered?: number;
  vcaAvgHandleAfterCallMinutes?: number;
  vcaPeakConcurrentCalls?: number;
}): {
  totalCollectedRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  ownerTotalHours: number;
  ownerProfitPerHour: number | null;
  profitMarginPercent: number;
  revenuePerAnsweredCall: number | null;
  directLaborMarginPercent: number | null;
  approximateCallWorkHours: number;
  capacityUtilizationPercent: number | null;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const totalCollectedRevenue =
    n(input.vcaHourlyRevenue) +
    n(input.vcaRetainerRevenue) +
    n(input.vcaSetupPilotRevenue) +
    n(input.vcaOverageAddOnRevenue) +
    n(input.vcaOtherRevenue);
  const totalExpenses =
    n(input.vcaVoipCrmSoftware) +
    n(input.vcaEquipmentInternetBackup) +
    n(input.vcaOperatorPayrollContractors) +
    n(input.vcaInsuranceLegalCompliance) +
    n(input.vcaPaymentFeesMarketing) +
    n(input.vcaOtherExpenses);
  const estimatedProfit = totalCollectedRevenue - totalExpenses;
  const ownerTotalHours =
    n(input.vcaSetupTrainingReportingHours) + n(input.vcaOwnerAdminMarketingHours);
  const calls = n(input.vcaCallsAnswered);
  const avgMinutes = n(input.vcaAvgHandleAfterCallMinutes);
  const approximateCallWorkHours = (calls * avgMinutes) / 60;
  const availableCoverage = n(input.vcaReservedCoverageHours);
  const operatorPayroll = n(input.vcaOperatorPayrollContractors);
  return {
    totalCollectedRevenue,
    totalExpenses,
    estimatedProfit,
    ownerTotalHours,
    ownerProfitPerHour: ownerTotalHours > 0 ? estimatedProfit / ownerTotalHours : null,
    profitMarginPercent: totalCollectedRevenue > 0 ? (estimatedProfit / totalCollectedRevenue) * 100 : 0,
    revenuePerAnsweredCall: calls > 0 ? totalCollectedRevenue / calls : null,
    directLaborMarginPercent:
      totalCollectedRevenue > 0
        ? ((totalCollectedRevenue - operatorPayroll) / totalCollectedRevenue) * 100
        : null,
    approximateCallWorkHours,
    capacityUtilizationPercent:
      availableCoverage > 0 ? (approximateCallWorkHours / availableCoverage) * 100 : null,
  };
}
