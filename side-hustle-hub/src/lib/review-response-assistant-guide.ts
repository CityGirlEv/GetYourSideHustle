/**
 * Customer Review Response Assistant (`review-response-assistant`, Guide #057).
 * Public replies are customer service with an audience. Plain data only.
 */

export const REVIEW_RESPONSE_REALITY_CHECK = {
  title: "A PUBLIC REPLY IS CUSTOMER SERVICE WITH AN AUDIENCE",
  body: [
    "Draft short, professional, on-brand replies to Google, Yelp, and other public customer reviews for local businesses. Organize the review queue, follow an approved tone and escalation playbook, protect customer privacy, obtain client approval, publish through authorized access, and report recurring feedback themes.",
    "",
    "The reply is not written only for the reviewer. Future customers, employees, partners, and platforms may read it too.",
    "",
    "Before work begins, define: platforms and business locations; brand voice; response-time goal; who may draft, approve, and publish; account roles and access; complaints requiring escalation; refund, safety, legal, medical, discrimination, employee, fraud, and privacy boundaries; approved contact channel for offline resolution; words, promises, and admissions to avoid; recordkeeping and deletion rules; price, batch limit, and revisions.",
    "",
    "The assistant should: acknowledge the reviewer without arguing; use facts authorized by the business; keep replies brief and specific; move private account details offline; escalate serious or uncertain reviews; use current platform policies; log approvals and publication status.",
    "",
    "The assistant should NOT: invent customer facts; reveal order, appointment, medical, financial, employee, or contact information; admit liability or promise compensation without authorization; threaten, shame, diagnose, investigate, or identify the reviewer; post fake reviews or manipulate ratings; offer incentives for positive reviews, revisions, or removals; promise that a platform will remove a review.",
    "",
    "Tagline: Respond Calmly. Protect Trust. Learn From Feedback.",
  ].join("\n"),
};

export const REVIEW_RESPONSE_NOTES_WORKSHEET = `MY CUSTOMER REVIEW RESPONSE ASSISTANT PLAN

CLIENT
Business / Location: ________
Platform(s): ________
Approver: ________
Escalation Contact: ________
Offline Contact Route: ________
Tone: ________
Response Window: ________

PACKAGE
Review Limit: ____
Fee: $____
Platforms / Locations: ________
Revisions: ____
Publishing Included: Yes / No
Overage: $____
Cancellation Rule: ________

RESPONSE CHECK
Review ID / Date: ________
Category: ________
Facts Verified: ☐
Private Data Removed: ☐
Promise Authorized: ☐
Escalation Required: ☐
Client Approved: ☐
Published: ☐

MONTHLY RESULTS
Reviews Received: ____
Responses Drafted: ____
Responses Published: ____
Escalations: ____
Revenue Invoiced: $____
Revenue Collected: $____
Expenses: $____
Profit: $____
Total Hours: ____
Effective Profit/Hour: $____
Main Theme: ________
Process Change: ________

GYSH PRO TIP
THE BEST NEGATIVE-REVIEW RESPONSE DOES NOT WIN AN ARGUMENT. IT SHOWS FUTURE CUSTOMERS HOW THE BUSINESS HANDLES A PROBLEM.

Short, specific, calm, and authorized beats a five-paragraph courtroom drama in the review section.

ACKNOWLEDGE + SAFE FACT + OFFLINE NEXT STEP + CLIENT APPROVAL = PROFESSIONAL RESPONSE

STARTER CHALLENGE
Build and test one Customer Review Response Assistant offer:
1. Choose one business type and platform
2. Create a tone guide
3. Build an escalation matrix
4. Write five fictional review examples
5. Draft positive, mixed, and complaint responses
6. Set batch size, price, revision, and turnaround
7. Create a response tracker
8. Create an approval message
9. Choose 2–3 marketing channels
10. Contact 10 suitable prospects
11. Offer one paid starter batch
12. Track every minute
13. Deliver a theme report
14. Calculate effective profit per hour
15. Ask for feedback and a rebooking
`;

export const REVIEW_RESPONSE_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Draft short, professional, on-brand replies to Google, Yelp, and other public customer reviews for local businesses. Pro Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project is examples only. Category: Marketing / Reputation Support. Beginner–Intermediate. Startup $0–low. Online. Per project / per response batch / hourly / monthly retainer. Best for careful writers, customer-service professionals, Adults and Seniors/Retirees; responsible Teens only with parent/guardian approval and no access to sensitive complaints.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Strong writing, spelling, and judgment · client-approved brand voice · review-response playbook · escalation matrix · approved offline contact route · secure account-access method · response tracker · written approval/publishing process · confidentiality and retention rules · invoice/payment method · time, revenue, and expense tracker.",
  },
  {
    id: "before",
    label: "Before accepting a client",
    detail:
      "Confirm business name and locations, platforms, average review volume, languages, existing response backlog, target response window, whether the assistant drafts only or also publishes, required approval level, sensitive industries or protected data, refund/credit authority, legal/safety/harassment/discrimination/threat/fraud/employee escalation contact, tone examples, prohibited phrases or claims, reporting frequency, fee, batch size, revisions, and cancellation terms.",
  },
  {
    id: "categories",
    label: "Create response categories",
    detail:
      "Positive · Positive with suggestion · Neutral/mixed · Service complaint · Product complaint · Delay or communication complaint · Billing/refund complaint · Safety or injury allegation · Discrimination/harassment allegation · Legal threat · Employee complaint · Spam/fake/conflict concern · Wrong business/location. Only routine categories should use standard templates. High-risk categories require client review before any public response.",
  },
  {
    id: "teens",
    label: "For teens",
    detail:
      "Responsible Teens only with parent/guardian approval. No access to sensitive complaints. Parent/guardian controls contracts, payment, and account access. Do not handle medical, legal, financial, discrimination, safety, employee, or fraud reviews.",
  },
  {
    id: "never",
    label: "Never do this",
    detail:
      "Never post fake reviews or manipulate ratings. Never offer incentives for positive reviews, revisions, or removals. Never reveal order, appointment, medical, financial, employee, or contact information. Never invent customer facts, admit unauthorized liability, threaten, shame, diagnose, or identify the reviewer. Never promise that a platform will remove a review.",
  },
];

export const REVIEW_RESPONSE_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Business Profile — Manage customer reviews", url: "https://support.google.com/business/answer/3474050", note: "Current reply and flagging workflow" },
  { label: "Google tips to get more reviews", url: "https://support.google.com/business/answer/3474122", note: "Current reply guidance and review-request practices" },
  { label: "Google Maps user-generated content policy", url: "https://support.google.com/contributionpolicy/answer/7422880", note: "Prohibited/restricted content and fake-engagement rules" },
  { label: "Google — Report inappropriate reviews", url: "https://support.google.com/business/answer/4596773", note: "Current reporting and appeal process" },
  { label: "FTC endorsements, influencers, and reviews", url: "https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews", note: "U.S. review, testimonial, and endorsement guidance" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { label: "Google Business Profile", url: "https://business.google.com/", note: "Authorized access only" },
  { label: "Yelp for Business", url: "https://business.yelp.com/", note: "Current Yelp review and response tools" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Queue, categories, approvals, themes" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Tone guide, playbook, and drafts" },
];

export const REVIEW_RESPONSE_SUPPLIES = {
  starterKitTotal: "About $0–20",
  items: [
    { id: "computer", name: "Reliable computer and internet", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Smartphone and charger", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "email", name: "Separate work email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "voice", name: "Client voice guide", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "playbook", name: "Review-response playbook", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "escalation", name: "Escalation matrix", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "tracker", name: "Response tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "approval", name: "Approval record", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "pwm", name: "Secure password manager + multi-factor authentication", qty: "1", estCost: "$0–4/mo", notes: "Essential" },
    { id: "invoice", name: "Invoice and time tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "replies", name: "Saved-reply library", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "style", name: "Style guide", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "filters", name: "Spreadsheet filters", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "grammar", name: "Grammar checker", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "portal", name: "Secure client portal", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "theme", name: "Monthly theme-report template", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "translation", name: "Approved translation resource", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
  ],
};

export const REVIEW_RESPONSE_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "gbp", name: "Google Business Profile", freePlanAvailable: true, planLabelApplicable: false, costNote: "Read and reply to Google reviews through authorized access", url: "https://business.google.com/" },
  { id: "yelp", name: "Yelp for Business", freePlanAvailable: true, planLabelApplicable: false, costNote: "Review and response tools under current Yelp rules", url: "https://business.yelp.com/" },
  { id: "sheets", name: "Google Sheets / Microsoft Excel", freePlanAvailable: true, costNote: "Queue, categories, approvals, dates, themes, time, and revenue", url: "https://sheets.google.com/" },
  { id: "docs", name: "Google Docs / Microsoft Word", freePlanAvailable: true, costNote: "Tone guide, playbook, and drafts", url: "https://docs.google.com/" },
  { id: "pwm", name: "Password Manager + Multi-Factor Authentication", freePlanAvailable: true, costNote: "Secure client accounts — never request the owner’s primary password when a role or invitation is available", url: "https://bitwarden.com/" },
  { id: "gbp-reviews", name: "Google Business Profile Help: Manage Customer Reviews", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current reply and flagging workflow", url: "https://support.google.com/business/answer/3474050" },
  { id: "gbp-more", name: "Google Tips to Get More Reviews", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current reply guidance and review-request practices", url: "https://support.google.com/business/answer/3474122" },
  { id: "maps-ugc", name: "Google Maps User-Generated Content Policy", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current prohibited/restricted content and fake-engagement rules", url: "https://support.google.com/contributionpolicy/answer/7422880" },
  { id: "gbp-report", name: "Google Report Inappropriate Reviews", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current reporting and appeal process — not a removal guarantee", url: "https://support.google.com/business/answer/4596773" },
  { id: "ftc", name: "FTC Reviews and Endorsements", freePlanAvailable: true, planLabelApplicable: false, costNote: "Current U.S. review, testimonial, and endorsement guidance", url: "https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews" },
  { id: "irs", name: "IRS Self-Employed Individuals Tax Center", freePlanAvailable: true, planLabelApplicable: false, costNote: "Federal self-employment and estimated-tax starting point", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Business + One Platform + Tone Guide + Escalation Matrix + Draft Tracker + Client Approval + Secure Access + Monthly Theme Report" },
];

export const REVIEW_RESPONSE_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "CUSTOMER REVIEW RESPONSE ASSISTANT — REPLACE PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not guarantees.",
    "",
    "5 routine review drafts: $15 – $30. Draft five short replies using client-provided facts and tone. Publishing and sensitive reviews excluded.",
    "10-review response batch: $30 – $50. Categorize and draft up to ten routine responses with one client revision round.",
    "Tone & saved-reply starter kit: $40 – $100+. Short voice guide plus positive, mixed, negative, wrong-location, and offline-resolution templates.",
    "Backlog cleanup — 20 reviews: $40 – $100+. Audit, categorize, draft, and track up to twenty reviews. High-risk responses remain pending client approval.",
    "Monthly review replies retainer: $75 – $250+. Defined platform/location count, monthly review limit, response window, approval flow, report, and overage rate.",
    "",
    "Possible add-ons: additional platform or location; additional review batch; rush or weekend coverage; bilingual drafting or qualified translation; tone playbook; FAQ/escalation sheet; monthly theme report; review-request link/QR setup under current platform rules; publication through client-approved access.",
    "",
    "Formula: Number of Reviews × Average Draft/Research Time + Setup and Tone Training + Approval/Revision Time + Platform/Location Complexity + Reporting + Approved Add-Ons = Project or Retainer Quote.",
    "Define review count, platforms, locations, response time, included revisions, publishing responsibility, sensitive-review exclusions, overage fee, and cancellation terms.",
    "",
    "Monthly examples — not guarantees: 4 five-review batches × $25 = $100 gross/month · 2 backlog projects × $75 = $150 gross/month · one monthly retainer = $200 gross/month.",
    "",
    "Never post fake reviews. Never offer incentives for positive reviews, revisions, or removals. Never manipulate ratings. Never promise rating improvement or review removal.",
    "Gross revenue is NOT profit. Examples only; not guaranteed. Track invoiced and collected amounts separately. Set aside taxes based on qualified advice.",
  ].join("\n"),
  raiseTip:
    "If volume, platforms, languages, or risk are higher than described, pause and revise the quote. Sensitive reviews stay pending client approval. Examples only.",
  items: [
    { id: "five", label: "5 routine review drafts", price: "$15–$30", notes: "Client-provided facts and tone; publishing and sensitive reviews excluded" },
    { id: "ten", label: "10-review response batch", price: "$30–$50", notes: "Categorize and draft up to ten routine responses; one revision round" },
    { id: "tone", label: "Tone & saved-reply starter kit", price: "$40–$100+", notes: "Voice guide plus positive, mixed, negative, wrong-location, and offline-resolution templates" },
    { id: "backlog", label: "Backlog cleanup — 20 reviews", price: "$40–$100+", notes: "Audit, categorize, draft, and track; high-risk pending client approval" },
    { id: "retainer", label: "Monthly review replies", price: "$75–$250+", notes: "Defined platforms/locations, review limit, response window, approval, report, overage" },
  ],
};

export const REVIEW_RESPONSE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose the Client, Platform & Service Boundary",
    desc: [
      "Write: Business Type: ________ · Platform(s): ________ · Locations: ________ · Average Reviews/Month: ____ · Draft Only or Publish: ________ · Routine Categories: ________ · Escalation Categories: ________",
      "Start with one low-risk local business and one platform. Avoid health, legal, financial, childcare, crisis, or other sensitive industries until the process and boundaries are strong.",
      "Promise: “I draft short, professional responses to public customer reviews using your approved tone, facts, and escalation rules.”",
      "Never reveal order, appointment, medical, financial, employee, or contact information in a public reply. Never post fake reviews.",
    ].join("\n"),
  },
  {
    title: "Build the Package, Price & Agreement",
    desc: [
      "Define: Reviews Included: ____ · Platforms/Locations: ________ · Response Window: ________ · Revisions: ____ · Approval Method: ________ · Publishing Included: Yes / No · Report Included: ________ · Fee: $____ · Overage: $____",
      "Choose starter packages from the Suggested Pricing section. Use the displayed $15 – $50 / project range for small, clearly limited starter batches.",
      "Agreement should address access, confidentiality, client facts, approvals, sensitive-review exclusions, refunds/promises, ownership, retention, payment, cancellation, and no guarantee of rating or removal.",
      "Never offer incentives for positive reviews, revisions, or removals.",
    ].join("\n"),
  },
  {
    title: "Create the Tone Guide & Escalation Playbook",
    desc: [
      "Document: Voice: Warm / Direct / Formal / Friendly / Other · Preferred Greeting: ________ · Approved Offline Contact: ________ · Approved Apology Language: ________ · Promises Allowed: ________ · Never Say: ________",
      "Escalate safety, injury, discrimination, harassment, legal threats, chargebacks, fraud, privacy, employee disputes, media inquiries, regulatory complaints, and any review whose facts cannot be verified.",
      "Only routine categories should use standard templates. High-risk categories require client review before any public response.",
      "The assistant should acknowledge the reviewer without arguing, use authorized facts, keep replies brief, and move private details offline.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about the service. Pick only 2 or 3 this month.",
      "",
      "☐ Local business networking groups",
      "☐ Chambers or merchant associations",
      "☐ Web designers and marketing agencies",
      "☐ Bookkeepers or virtual assistants",
      "☐ Direct outreach to businesses with unanswered reviews",
      "☐ LinkedIn",
      "☐ Referrals",
      "",
      "Set measurable weekly goals. Do not shame a prospect publicly for unanswered reviews.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create: one-sentence offer; two defined packages; fictional positive, mixed, and complaint response samples; tone-guide sample; queue/report sample; client questionnaire; call-to-action.",
      "Sample offer: “I help local businesses reply to customer reviews with short, on-brand, approved responses so future customers see how the business handles feedback.”",
      "Use fictional reviews or written permission. Do not copy real reviewer names or private details into a public portfolio.",
      "Do not claim rating improvement, review removal, or “reputation management guarantees.” Never display real order, medical, or financial details in samples.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use only the 2–3 selected channels.",
      "",
      "Sample message:",
      "“I help local [BUSINESS TYPE] businesses draft short, professional responses to customer reviews. My $____ starter batch includes up to ____ routine replies, a tone check, and one revision round. Sensitive complaints are flagged for owner review.”",
      "",
      "Track outreach, replies, calls, quotes, clients, and follow-ups. Never promise a higher rating or review removal. Never post fake reviews to “show results.”",
    ].join("\n"),
  },
  {
    title: "Onboard the Client & Secure Access",
    desc: [
      "Confirm the correct business, location, platform, permissions, approver, escalation contacts, response window, and offline contact path.",
      "Use an official user invitation or role. Enable multi-factor authentication. Do not share credentials in ordinary text or email. Never request the owner’s primary password when a platform role or invitation is available. Use the least permission needed.",
      "Test access without changing live content.",
      "Confirm whether you draft only or also publish after approval.",
    ].join("\n"),
  },
  {
    title: "Audit & Categorize the Review Queue",
    desc: [
      "For each review record: Platform | Location | Reviewer Display Name | Date | Rating | Topic | Risk Category | Facts Needed | Draft Status | Approval | Published",
      "Do not copy more personal information than necessary. Never reveal order, medical, or financial details in notes that could leak into a public reply.",
      "Flag possible policy violations through the current official process; do not organize retaliation or mass reporting.",
      "Reporting a review is not a removal guarantee. A negative opinion is not automatically fake, defamatory, or removable.",
    ].join("\n"),
  },
  {
    title: "Draft & Quality-Check Each Response",
    desc: [
      "Routine structure:",
      "1. Thank or acknowledge",
      "2. Refer to one safe, specific point",
      "3. State the approved next step",
      "4. Move private resolution offline when needed",
      "5. Sign in the approved business voice",
      "",
      "Check tone, accuracy, privacy, promises, length, spelling, platform rules, and escalation status.",
      "Avoid copy-paste replies that make five different customers feel like the same customer wearing different hats.",
      "Never invent customer facts. Never admit liability or promise compensation without authorization. Never threaten, shame, diagnose, investigate, or identify the reviewer.",
    ].join("\n"),
  },
  {
    title: "Get Approval, Publish & Document",
    desc: [
      "Send drafts in one organized batch. Require approval for sensitive responses and any compensation, factual dispute, apology, or promise.",
      "Before publishing, confirm business/location, review, final text, approver, platform, and account.",
      "Record publication date and link/status. If the client edits the response, store the final approved wording.",
      "Do not publish until the client approves high-risk or uncertain replies. Never post fake reviews from the business account.",
    ].join("\n"),
  },
  {
    title: "Report Themes, Close & Rebook",
    desc: [
      "Report: Review Count | Response Count | Response Time | Positive Themes | Complaint Themes | Escalations | Unanswered | Recommended Client Action",
      "Do not diagnose operations from a tiny sample. Present patterns as signals.",
      "Track profit and total hours. Track invoiced vs. collected revenue separately. Ask for honest feedback, permission before using a testimonial, and a recurring engagement only when the volume supports it.",
      "REVIEW → CATEGORY → APPROVED FACTS → HUMAN DRAFT → CLIENT APPROVAL → PUBLIC REPLY → THEME REPORT",
    ].join("\n"),
  },
];

export function reviewResponseAssistantToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: One Business + One Platform + Tone Guide + Escalation Matrix + Draft Tracker + Client Approval + Secure Access + Monthly Theme Report.",
    "Platform tools and policies change. Verify current official instructions before publishing, flagging, appealing, requesting reviews, or changing access.",
    "Reporting a review is not a removal guarantee. The platform decides whether content violates its policy. A negative opinion is not automatically fake, defamatory, or removable.",
    "AI may help produce alternatives, but it can sound robotic, invent facts, over-apologize, expose private information, or create an unauthorized promise. Do not upload protected customer data or confidential business material without written approval. Human review and client authorization remain required.",
  ].join("\n");
}

export function computeReviewResponseAssistantProfit(input: {
  reviewResponsesCompletedPerMonth?: number;
  averageFeePerReviewOrBatch?: number;
  backlogProjectRevenue?: number;
  tonePlaybookSetupRevenue?: number;
  monthlyRetainerRevenue?: number;
  otherEarnedIncome?: number;
  phoneInternet?: number;
  softwareStorage?: number;
  paymentFees?: number;
  advertising?: number;
  professionalServicesInsurance?: number;
  otherExpenses?: number;
  setupOnboardingHours?: number;
  reviewAuditHours?: number;
  draftingHours?: number;
  approvalRevisionHours?: number;
  publishingReportingHours?: number;
  marketingAdminHours?: number;
}): {
  baseReviewRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
  averageRevenuePerCompletedResponse: number | null;
} {
  const reviews = Math.max(0, Number(input.reviewResponsesCompletedPerMonth) || 0);
  const baseReviewRevenue = reviews * Math.max(0, Number(input.averageFeePerReviewOrBatch) || 0);
  const grossServiceRevenue =
    baseReviewRevenue +
    Math.max(0, Number(input.backlogProjectRevenue) || 0) +
    Math.max(0, Number(input.tonePlaybookSetupRevenue) || 0) +
    Math.max(0, Number(input.monthlyRetainerRevenue) || 0) +
    Math.max(0, Number(input.otherEarnedIncome) || 0);
  const totalExpenses =
    Math.max(0, Number(input.phoneInternet) || 0) +
    Math.max(0, Number(input.softwareStorage) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.professionalServicesInsurance) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.setupOnboardingHours) || 0) +
    Math.max(0, Number(input.reviewAuditHours) || 0) +
    Math.max(0, Number(input.draftingHours) || 0) +
    Math.max(0, Number(input.approvalRevisionHours) || 0) +
    Math.max(0, Number(input.publishingReportingHours) || 0) +
    Math.max(0, Number(input.marketingAdminHours) || 0);
  return {
    baseReviewRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
    averageRevenuePerCompletedResponse: reviews > 0 ? baseReviewRevenue / reviews : null,
  };
}
