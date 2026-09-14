/**
 * Transcription & Notes Helper (`transcription-notes-helper`, Guide #107).
 * Authorized recordings only — automated output is a draft. Plain data only.
 */

export const TRANSCRIPTION_NOTES_REALITY_CHECK = {
  title: "CONFIRM PERMISSION, PRIVACY & THE EXACT DELIVERABLE BEFORE OPENING THE FILE",
  body: [
    "Turn authorized voice memos, interviews, and meeting recordings into organized bullet notes, decisions, action items, edited transcripts, or timestamped summaries.",
    "",
    "The client confirms in writing that they created or control the recording, it was made lawfully, required notices/permissions were obtained, you are authorized to process it, approved tools are named, recipients are identified, and retention/deletion is approved.",
    "Never secretly record a call or meeting. Work only from a client-supplied file after authorization.",
    "",
    "Do not advertise a beginner deliverable as a certified, sworn, verbatim legal, court, medical, accessibility, or compliance transcript.",
    "Automated transcription can omit, invent, or scramble names, dates, prices, and deadlines. Treat it as an unverified draft. Listen and verify.",
    "",
    "Tagline: Listen Carefully. Organize Clearly. Make It Actionable.",
  ].join("\n"),
};

export const TRANSCRIPTION_NOTES_NOTES_WORKSHEET = `MY TRANSCRIPTION & NOTES HELPER PLAN

SERVICE SETUP
Minimum Project Fee: $____
Clean Notes Fee: $____
Summary + Action Items Fee: $____
Edited Transcript Fee: $____
Per-Audio-Minute Rate: $____
Maximum Audio Minutes: ____
Maximum Speakers: ____
Standard Turnaround: ____
Included Revisions: ____
Rush Fee: $____
Complex-Audio Add-On: $____
Cancellation Rule: ____
Retention/Deletion Rule: ____

CLIENT AUTHORIZATION
Client: ________
Client Contact: ________
Authority to Share Confirmed: ☐
Lawful Recording / Required Notice and Permission Confirmed: ☐
Helper Access Authorized: ☐
Approved Tools: ________
Cloud / AI Use Allowed: Yes / No / Limited
Authorized Recipients: ________
Delete / Return By: ________
Written Agreement Saved: ☐

PROJECT
Client Code: ________
Recording Date: ________
General Purpose: ________
File Type / Size: ________
Audio Minutes: ____
Speakers: ____
Audio Quality: ________
Language / Accent Notes: ________
Vocabulary / Names List Received: ☐
Deliverable: ________
Cleanup Level: ________
Timestamp Method: ________
Template / File Format: ________
Deadline / Time Zone: ________
Fee: $____
Payment Due: ________

QUALITY CHECK
Correct File / Client: ☐
Full Agreed Audio Range Covered: ☐
Names Verified: ☐
Numbers / Dates / Deadlines Verified: ☐
Speaker Labels Verified: ☐
Decisions Verified: ☐
Action Owners Verified: ☐
Unclear Audio Marked: ☐
Formatting Consistent: ☐
No Invented Information: ☐
Authorized Recipients Confirmed: ☐
Private Link Tested: ☐

DELIVERY / REVISION / DELETION
Delivered: ________
Private Delivery Method: ________
Client Review Due: ________
Corrections Requested: ________
Corrections Completed: ________
Final Acceptance: ________
Payment Received: ☐
Source Returned / Deleted: ________
Tool Copy Deleted: ________
Temporary Files / Links Removed: ________

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Prospects: ____
Quotes: ____
Projects Booked: ____
Recurring Clients: ____

MONTHLY RESULTS
Flat-Fee Projects: ____
Per-Minute Projects: ____
Audio Minutes Processed: ____
Revenue: $____
Expenses: $____
Estimated Profit: $____
Total Hours: ____
Effective Profit Per Hour: $____
Most Profitable Deliverable: ________
Accuracy / Security / Scope Change Needed: ________

GYSH PRO TIP
DO NOT PRICE ONE HOUR OF AUDIO AS ONE HOUR OF WORK.
A clear 10-minute voice memo may be quick. A noisy meeting with six overlapping speakers can eat an afternoon.

AUTHORIZED AUDIO + DEFINED OUTPUT + AUDIO LIMIT + HUMAN VERIFICATION + PRIVATE DELIVERY + DELETION = PROFESSIONAL SERVICE
`;

export const TRANSCRIPTION_NOTES_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Turn authorized voice memos and meeting recordings into clean notes, decisions, action items, or edited transcripts. Starter Membership. 10 hrs/week. Displayed $15 – $50 / project is examples only. Beginner. Startup $0–low. Remote / quiet workspace.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable computer or tablet · stable internet · quality headphones · quiet workspace · strong listening, spelling, grammar, and proofreading · style-guide follow-through · word processing · audio player with pause/rewind/speed · secure file transfer · separate business email · intake form · written scope, confidentiality, and revision terms · calendar and deadline tracker · income/expense and time tracker.",
  },
  {
    id: "before",
    label: "Before accepting a project",
    detail:
      "Confirm the client’s name and contact, authority to share, recording date and purpose, required participant notice/consent, length, file type/size, speakers, audio quality, requested deliverable, formatting, speaker labels, timestamps, vocabulary list, deadline/time zone, revisions, fee/payment, approved software/AI policy, authorized recipients, and deletion date.",
  },
  {
    id: "deliverables",
    label: "Choose the deliverable before quoting",
    detail:
      "Clean bullet notes (not word-for-word) · Summary + action items · Edited transcript (readable, agreed filler cleanup) · Strict/full verbatim (longer; not certified or court-ready for beginners) · Working meeting minutes (client reviews; not an official legal/board record unless the organization formally adopts it).",
  },
  {
    id: "minors",
    label: "For minors",
    detail:
      "Parent/guardian approves every client and project. Trusted clients only. Age-appropriate, non-sensitive recordings only. No medical, legal, HR, financial, school-record, explicit, violent, or confidential business content. Do not join unknown adults’ live meetings. Parent/guardian controls contracts, payment, file transfer, and deletion. Never receive passwords, account access, identity documents, or unnecessary personal information.",
  },
];

export const TRANSCRIPTION_NOTES_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "VLC Media Player", url: "https://www.videolan.org/vlc/", note: "Local playback, pause, rewind, speed" },
  { label: "Microsoft Word", url: "https://www.microsoft.com/microsoft-365/word", note: "Notes and edited transcripts" },
  { label: "Google Docs", url: "https://docs.google.com", note: "Restricted collaborative review" },
  { label: "Otter.ai privacy & security", url: "https://otter.ai/privacy-security", note: "Draft only with client approval" },
  { label: "Descript security", url: "https://www.descript.com/security", note: "Draft only with client approval" },
  { label: "Zoom recording consent", url: "https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0059819", note: "Client-controlled source" },
  { label: "Google Meet transcripts", url: "https://support.google.com/meet/answer/12849897" },
  { label: "Microsoft Teams transcription", url: "https://support.microsoft.com/teams" },
  { label: "NIST small-business cybersecurity", url: "https://www.nist.gov/itl/smallbusinesscyber" },
  { label: "FCC recording telephone conversations", url: "https://www.fcc.gov/consumers/guides/recording-telephone-conversations" },
  { label: "Student privacy (FERPA)", url: "https://studentprivacy.ed.gov" },
  { label: "HHS HIPAA", url: "https://www.hhs.gov/hipaa/index.html" },
];

export const TRANSCRIPTION_NOTES_SUPPLIES = {
  starterKitTotal: "About $0–25 — prove paid work before buying a foot pedal or extra hardware",
  items: [
    { id: "computer", name: "Computer or tablet", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Reliable internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "headphones", name: "Over-ear or comfortable closed-back headphones", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "player", name: "Audio player with variable speed", qty: "1", estCost: "$0", notes: "Essential — VLC" },
    { id: "word", name: "Word-processing software", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "tracker", name: "Spreadsheet or job tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "email", name: "Separate business email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "intake", name: "Client intake form + scope/confidentiality agreement", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "folder", name: "Secure delivery folder", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "checklist", name: "Quality-check checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "invoice", name: "Invoice / payment tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "keyboard", name: "External keyboard", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "pedal", name: "Foot pedal for playback", qty: "1", estCost: "quoted later", notes: "Helpful after recurring demand", optional: true },
    { id: "pwm", name: "Password manager + MFA", qty: "1", estCost: "$0–4/mo", notes: "Helpful", optional: true },
  ],
};

export const TRANSCRIPTION_NOTES_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "vlc", name: "VLC Media Player", freePlanAvailable: true, costNote: "Local playback, pause, rewind, speed for common audio/video", url: "https://www.videolan.org/vlc/" },
  { id: "word", name: "Microsoft Word", freePlanAvailable: true, costNote: "Notes, edited transcripts, styles, comments", url: "https://www.microsoft.com/microsoft-365/word" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Collaborative notes with restricted sharing", url: "https://docs.google.com" },
  { id: "sheets", name: "Google Sheets / Microsoft Excel", freePlanAvailable: true, costNote: "Job, time, audio-minute, revenue, and expense tracking", url: "https://sheets.google.com/" },
  { id: "drive", name: "Google Drive / OneDrive / Dropbox", freePlanAvailable: true, costNote: "Private file transfer only when the client approves restricted access" },
  { id: "zoom", name: "Zoom", freePlanAvailable: true, costNote: "Client-controlled recording/transcription source — consent prompts", url: "https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0059819" },
  { id: "meet", name: "Google Meet Transcripts", freePlanAvailable: true, planLabelApplicable: false, costNote: "Client-controlled transcript source — verify sharing and storage", url: "https://support.google.com/meet/answer/12849897" },
  { id: "teams", name: "Microsoft Teams Transcription", freePlanAvailable: true, planLabelApplicable: false, costNote: "Client-controlled source — verify notice, access, and retention", url: "https://support.microsoft.com/teams" },
  { id: "otter", name: "Otter.ai", freePlanAvailable: true, costNote: "Automated draft only with client approval and current privacy review", url: "https://otter.ai/privacy-security", optional: true },
  { id: "descript", name: "Descript", freePlanAvailable: true, costNote: "Audio/video transcription and editing only with client approval", url: "https://www.descript.com/security", optional: true },
  { id: "nist", name: "NIST Small Business Cybersecurity", freePlanAvailable: true, planLabelApplicable: false, costNote: "Protecting client information", url: "https://www.nist.gov/itl/smallbusinesscyber" },
  { id: "fcc", name: "FCC Recording Telephone Conversations", freePlanAvailable: true, planLabelApplicable: false, costNote: "Recording rules may differ by state and situation", url: "https://www.fcc.gov/consumers/guides/recording-telephone-conversations" },
  { id: "ferpa", name: "U.S. Department of Education Student Privacy", freePlanAvailable: true, planLabelApplicable: false, costNote: "FERPA / student-data starting point", url: "https://studentprivacy.ed.gov" },
  { id: "hipaa", name: "U.S. HHS Health Information Privacy", freePlanAvailable: true, planLabelApplicable: false, costNote: "HIPAA privacy/security information", url: "https://www.hhs.gov/hipaa/index.html" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Authorized Recording + Intake/Agreement + VLC + Headphones + Word/Docs + Manual Quality Check + Restricted Delivery Link + Time/Income Tracker + Confirmed Deletion" },
];

export const TRANSCRIPTION_NOTES_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "TRANSCRIPTION & NOTES HELPER — REPLACE PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not guarantees.",
    "Price by AUDIO length, speakers, audio quality, deliverable type, terminology, timestamps, formatting, turnaround, and revision limit — not by pages produced.",
    "",
    "Short voice memo — clean bullet notes: $15 – $25 (up to 15 minutes, one speaker).",
    "Short meeting — summary + action items: $25 – $40 (up to 30 minutes, 1–3 speakers).",
    "Timestamped action brief: $35 – $50 (up to 30 minutes).",
    "Edited transcript — short recording: $25 – $50 (up to 20 minutes).",
    "Voice-memo bundle: $40 – $75 (defined combined minutes).",
    "Recurring weekly notes: $100 – $250 / month as a planning example.",
    "",
    "Optional per-audio-minute (planning examples): clean notes/summary $0.75 – $1.50 · edited transcript $1.25 – $2.50 · complex/multi-speaker $2.00 – $3.50+.",
    "Do not charge both a full flat project fee and a full per-audio-minute fee for the same base work.",
    "Formula: Base Project Fee or Audio Minutes × Rate + Speaker/Audio Complexity + Timestamp/Formatting + Rush + Extra Revision = Project Price.",
  ].join("\n"),
  raiseTip:
    "If the file is longer, noisier, more technical, or more sensitive than described, pause and revise the quote. Set a minimum project fee so setup, file handling, delivery, and billing are covered. Examples only.",
  items: [
    { id: "memo", label: "Short voice memo — clean bullet notes", price: "$15–$25", notes: "Up to 15 minutes, one speaker" },
    { id: "summary", label: "Short meeting — summary + action items", price: "$25–$40", notes: "Up to 30 minutes, 1–3 speakers" },
    { id: "stamp", label: "Timestamped action brief", price: "$35–$50", notes: "Up to 30 minutes" },
    { id: "edited", label: "Edited transcript — short recording", price: "$25–$50", notes: "Up to 20 minutes" },
    { id: "bundle", label: "Voice-memo bundle", price: "$40–$75", notes: "Defined combined minutes + one deadline" },
    { id: "month", label: "Recurring weekly notes package", price: "$100–$250 / mo", notes: "Planning example with minute/revision limits" },
  ],
};

export const TRANSCRIPTION_NOTES_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Services, Outputs & Boundaries",
    desc: [
      "Promise: “I turn authorized voice memos and meeting recordings into organized notes clients can review and act on.”",
      "Offer in writing: clean bullet notes; summary + action items; decision log; timestamped topic outline; edited transcript; voice-memo bundle; working meeting minutes.",
      "Excluded: secret recording; joining live meetings without approval and participant notice; certified, sworn, court, deposition, legal, medical, or official transcription; real-time accessibility captioning; translation unless genuinely qualified; legal/medical/HR/financial/compliance advice; guessing inaudible content; storing files indefinitely; sharing with unapproved people or tools.",
      "Safest starter: short, clear, authorized recordings with 1–3 speakers and ordinary vocabulary.",
    ].join("\n"),
  },
  {
    title: "Set Prices, Audio Limits, Turnaround & Revisions",
    desc: [
      "Create 2–3 starter packages with clear limits.",
      "Write: Minimum Project Fee $____ · Clean Notes $____ · Summary + Action Items $____ · Edited Transcript $____ · Maximum Audio Minutes · Maximum Speakers · Standard Turnaround · Included Revisions · Rush $____ · Complex-Audio Add-On $____ · Cancellation Rule.",
      "Sample scope: “Up to 30 minutes of clear English-language audio with no more than 3 speakers, one summary with key points, decisions, action items, and open questions, delivered as a Word or Google document within 3 business days. One correction round included.”",
      "Listen to a short sample before finalizing a complex quote. Ten minutes of clear voice memo is not the same job as ten minutes of six people talking over a coffee grinder.",
    ].join("\n"),
  },
  {
    title: "Create the Consent, Privacy & Secure-File Process",
    desc: [
      "Authorization: “I confirm that I created or control this recording, it was obtained lawfully, all required participant notices/permissions were handled, and I authorize [HELPER NAME] to access it solely to create the agreed deliverable. Approved tools: ________. Authorized recipients: ________. Delete/return files by: ________.”",
      "Set rules for transfer method, device/storage, who may access files, whether automated transcription/AI or cloud processing is permitted, local-only if required, file naming without sensitive personal details, backup, delivery, retention, secure deletion, and misdirected-link response.",
      "If the client cannot confirm authorization, the recording appears secretly or illegally obtained, or the content is outside your approved scope, decline.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about the service. Pick only 2 or 3 this month.",
      "Good channels: friends and family referrals; local small-business owners; coaches and consultants; virtual assistants; content creators and podcasters; nonprofits; real estate or service professionals; LinkedIn; freelance platforms with clear privacy rules; approved business networking groups; a simple service page or portfolio.",
      "Write one measurable goal per channel. Examples: tell 15 trusted contacts; contact 5 virtual assistants or consultants; post one service example on LinkedIn.",
      "Begin with low-risk clients and ordinary productivity recordings. Do not target medical offices, law firms, schools, government, HR, or financial businesses until you understand their security, contracting, qualification, and compliance requirements.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Post: “TOO MANY VOICE MEMOS OR MEETING RECORDINGS?” I turn authorized recordings into clean bullet notes, decisions, action items, and readable summaries. Private File Handling · Clear Deliverables · Human Quality Check. Projects from $____. Contact: ________",
      "Create: one-sentence description; 2–3 packages; fictional or self-recorded before/after sample; intake form; authorization/confidentiality statement; style-choice checklist; delivery email; referral message.",
      "Use only your own practice recording, public-domain material, or content you have permission to display. Never put a real client’s recording, transcript, names, or meeting details in a portfolio without written permission and a complete privacy review.",
      "Do not claim “100% accurate,” “certified,” “HIPAA compliant,” “court ready,” or “fully confidential” unless the claim is true, documented, and appropriate for the exact service, tools, agreements, and jurisdiction.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use only the 2–3 selected channels.",
      "Sample: “Hi! I’m offering a Transcription & Notes Helper service for people with authorized voice memos or meeting recordings they do not have time to organize. I create clean bullet notes, decisions, action items, and edited summaries with a human quality check. Starter projects begin at $____ for up to ____ audio minutes. Would you like to see a fictional sample and service details?”",
      "Track: Date | Prospect | Channel | Recording Type | Audio Minutes | Need | Quote | Follow-Up | Project Booked",
      "Do not invite prospects to send sensitive recordings through public posts, ordinary social-media DMs, or unsecured links. Do not accept files from unknown senders before verifying the client. Unexpected audio/video, compressed files, links, and “special player” downloads can carry malware.",
    ].join("\n"),
  },
  {
    title: "Complete Intake, Review a Sample & Confirm the Job",
    desc: [
      "Before accepting the full recording: written authorization; length; format/size; short representative sample where appropriate; speakers; audio-quality issues; language/accent; vocabulary/name list; deliverable; formatting example; timestamp rules; deadline/time zone; approved tools; authorized recipients; retention/deletion date; fee/payment terms.",
      "Confirmation: “I will turn up to ____ minutes of authorized audio with up to ____ speakers into [DELIVERABLE]. I will use [APPROVED TOOLS], deliver through [PRIVATE METHOD] by [DEADLINE], include ____ correction round(s), and delete/return working files by [DATE/EVENT]. Fee: $____.”",
      "Scan unfamiliar files with current device security tools before opening. Do not install a client-supplied program or browser extension to access a recording.",
      "If the actual file is longer, noisier, more technical, more sensitive, or structurally different than described, pause and revise the scope.",
    ].join("\n"),
  },
  {
    title: "Prepare the Audio & Create a Controlled First Draft",
    desc: [
      "Copy the source only to the approved workspace. Confirm the file opens, exact duration, correct recording and client code. Review agenda, speaker list, vocabulary, and template. Set playback speed for accuracy. Close unrelated apps. Keep the document access-restricted.",
      "If manual: work in short sections. Pause, rewind, and capture meaning carefully.",
      "If using approved automated transcription: confirm the correct client account/tool/settings; upload only the authorized file; do not enable automatic public sharing; treat the output as an unverified draft; correct speaker labels manually; compare the transcript to the audio.",
      "Uncertainty markers: [inaudible 00:12:44] · [unclear word 00:18:09] · [crosstalk] · [speaker not identified]. Never invent a word because it “probably” sounds right.",
    ].join("\n"),
  },
  {
    title: "Turn the Draft into Clean, Actionable Notes",
    desc: [
      "MEETING SNAPSHOT: Date | Purpose | Participants/Speaker Labels | Recording Length | Prepared By",
      "KEY POINTS — main facts, updates, context, ideas.",
      "DECISIONS — Decision | Decision Maker if clear | Timestamp if requested.",
      "ACTION ITEMS — Task | Owner | Due Date | Status/Dependency.",
      "OPEN QUESTIONS — Question | Person/Team to Resolve | Needed By.",
      "NEXT MEETING / FOLLOW-UP — Date/time if stated | Preparation needed | Outstanding items.",
      "For edited transcripts: apply agreed filler/false-start rules; preserve meaning; do not “improve” facts; consistent speaker names and timestamps; keep uncertainty markers.",
      "If the audio does not identify an owner or due date, write “Owner not assigned” or “Due date not stated.” Do not promote a hopeful suggestion into a binding decision.",
    ].join("\n"),
  },
  {
    title: "Perform the Human Quality Check & Deliver Securely",
    desc: [
      "Listen again to every section with names, speaker identity, phone numbers, addresses, dates, deadlines, prices, quantities, account/product/project names, decisions, action-item owners, medical/legal/technical terms, and unclear audio.",
      "Quality-check: correct client and file; correct deliverable; complete agreed audio range; accurate speaker labels; consistent formatting; decisions separated from discussion; action items include only stated owners/dates; unclear audio marked; no invented information; sharing restricted to authorized recipients; working links tested.",
      "Delivery: “Your [DELIVERABLE] for [CLIENT CODE / MEETING DATE] is ready at the private link below. Please review names, specialized terms, decisions, action owners, deadlines, and marked unclear sections by [REVISION DEADLINE]. One correction round is included. The source and working files will be deleted/returned according to our agreement on [DATE/EVENT].”",
      "Double-check the recipient before sending.",
    ].join("\n"),
  },
  {
    title: "Handle Corrections, Delete Files & Build Recurring Work",
    desc: [
      "Included correction round: correct genuine transcription errors; ask the client to resolve inaudible names or specialized terms; track style changes; quote added audio, new formats, rewrites, or extra revisions separately; confirm final acceptance.",
      "Close out: confirm payment; send a receipt if appropriate; return or delete source files as agreed; delete automated-tool copies where the account allows; empty temporary folders/trash; remove expired sharing access; retain only required business records; record time, revenue, expenses, and project type; ask for a truthful review without revealing private content; offer a recurring package only after the workflow succeeds.",
      "Track: Date | Client Code | Deliverable | Audio Minutes | Speakers | Fee | Add-Ons | Expenses | Work Hours | Revision Hours | Deleted/Returned | Status",
      "Project Profit = Project Fee + Add-Ons − Project Expenses. Effective Profit Per Hour = Project Profit ÷ Total Intake/Processing/Editing/Delivery/Admin Hours.",
      "AUTHORIZED FILE → CLEAR SCOPE → CONTROLLED DRAFT → HUMAN CHECK → PRIVATE DELIVERY → CONFIRMED DELETION → REBOOK",
    ].join("\n"),
  },
];

export function transcriptionNotesHelperToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Authorized Recording + Intake/Agreement + VLC + Headphones + Word/Docs + Manual Quality Check + Restricted Delivery Link + Time/Income Tracker + Confirmed Deletion.",
    "Tool features, free limits, security, data retention, AI-training terms, and pricing change. Recheck CURRENT terms before each sensitive project.",
    "An AI meeting assistant that joins a live meeting is not the same as privately typing notes from an authorized file. Do not connect a bot unless the client approves it, participants receive required notice/consent, and the organization’s rules permit it.",
    "Do not upload medical, legal, HR, financial, student, government, trade-secret, or other regulated/confidential recordings to a consumer AI or transcription tool unless the client approved the exact tool, account, plan, settings, agreement, storage, recipients, and deletion process.",
  ].join("\n");
}

export function computeTranscriptionNotesHelperProfit(input: {
  transcriptionFlatFeeProjectsPerWeek?: number;
  averageFlatFeeProjectPrice?: number;
  perAudioMinuteProjectsPerMonth?: number;
  averageAudioMinutesPerPerMinuteProject?: number;
  averageRatePerAudioMinute?: number;
  recurringPackageRevenue?: number;
  timestampRushFormattingAddOns?: number;
  tipsOtherEarnedServiceIncome?: number;
  internetPhone?: number;
  softwareTools?: number;
  cloudStorage?: number;
  equipment?: number;
  advertisingPortfolio?: number;
  paymentFees?: number;
  registrationInsurance?: number;
  otherExpenses?: number;
  intakeHours?: number;
  listeningDraftHours?: number;
  editingQualityHours?: number;
  revisionHours?: number;
  fileDeliveryHours?: number;
  marketingAdminHours?: number;
}): {
  weeklyFlatFeeRevenue: number;
  monthlyFlatFeeRevenue: number;
  perMinuteRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const weeklyFlatFeeRevenue =
    Math.max(0, Number(input.transcriptionFlatFeeProjectsPerWeek) || 0) *
    Math.max(0, Number(input.averageFlatFeeProjectPrice) || 0);
  const monthlyFlatFeeRevenue = weeklyFlatFeeRevenue * 4.33;
  const perMinuteRevenue =
    Math.max(0, Number(input.perAudioMinuteProjectsPerMonth) || 0) *
    Math.max(0, Number(input.averageAudioMinutesPerPerMinuteProject) || 0) *
    Math.max(0, Number(input.averageRatePerAudioMinute) || 0);
  const grossServiceRevenue =
    monthlyFlatFeeRevenue +
    perMinuteRevenue +
    Math.max(0, Number(input.recurringPackageRevenue) || 0) +
    Math.max(0, Number(input.timestampRushFormattingAddOns) || 0) +
    Math.max(0, Number(input.tipsOtherEarnedServiceIncome) || 0);
  const totalExpenses =
    Math.max(0, Number(input.internetPhone) || 0) +
    Math.max(0, Number(input.softwareTools) || 0) +
    Math.max(0, Number(input.cloudStorage) || 0) +
    Math.max(0, Number(input.equipment) || 0) +
    Math.max(0, Number(input.advertisingPortfolio) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.registrationInsurance) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.intakeHours) || 0) +
    Math.max(0, Number(input.listeningDraftHours) || 0) +
    Math.max(0, Number(input.editingQualityHours) || 0) +
    Math.max(0, Number(input.revisionHours) || 0) +
    Math.max(0, Number(input.fileDeliveryHours) || 0) +
    Math.max(0, Number(input.marketingAdminHours) || 0);
  return {
    weeklyFlatFeeRevenue,
    monthlyFlatFeeRevenue,
    perMinuteRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
