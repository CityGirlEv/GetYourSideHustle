/**
 * AI Social Media Helper (`ai-social-helper`, Guide #026).
 * Elite via AI policy; 3 - 10 hrs/week. Displayed $15 – $50 / project (examples).
 * Plain data only — no imports from guide-tools.
 */

export const AI_SOCIAL_HELPER_REALITY_CHECK = {
  title: "AI CREATES DRAFTS; THE CLIENT OWNS THE FINAL MESSAGE",
  body: [
    "Use AI to help brainstorm, outline, and draft captions, hashtags, and simple content calendars for local businesses or creators. Add client-specific facts and human judgment, verify every claim, use only authorized media, and require the client's approval before anything is scheduled or published.",
    "",
    "Never publish an AI response without checking names, dates, prices, links, policies, product details, claims, tone, rights, and required disclosures. A polished sentence can still be false, private, off-brand, or legally risky.",
    "",
    "Before accepting a project, define: brand voice, audience, offer, and platforms; number and type of posts; source material and fact owner; approved products, prices, events, links, and claims; image, video, music, testimonial, and logo permissions; AI tools the client permits; topics and data that must never enter an AI prompt; review and approval owner; scheduling/publishing authority; revisions, turnaround, payment, and cancellation; comment/message work, if any, as a separate scope.",
    "",
    "The safest beginner offer is a draft-only content pack. The client reviews and publishes from the client-owned account.",
    "",
    "Do not invent a testimonial, review, credential, scarcity claim, statistic, customer story, price, health result, financial result, environmental benefit, comparison, or guarantee. Do not paste customer lists, private messages, health information, financial details, employee records, passwords, unreleased plans, or other confidential material into an AI tool unless the client has approved that exact use and data handling.",
    "",
    "Tagline: Draft Faster. Sound Human. Publish With Approval.",
  ].join("\n"),
};

export const AI_SOCIAL_HELPER_NOTES_WORKSHEET = `AI SOCIAL MEDIA HELPER NOTES

CLIENT BRIEF
Client/Brand: _________________________________
Primary Platform: _____________________________
Audience: ____________________________________
Offer/CTA: ___________________________________
Brand Voice: __________________________________
Final Approver: _______________________________

SOURCE OF TRUTH
Website/Menu/Service List: ____________________
Current Prices/Dates/Locations: _______________
Approved Claims: ______________________________
Claims Needing Proof: _________________________
Testimonials/Permissions: _____________________
Sponsorship/Disclosure Needs: _________________

AI AND ACCESS
Approved AI Tool: _____________________________
Data Never to Enter: __________________________
Platform Access Level: ________________________
MFA Confirmed: Yes / No / Not Applicable
Client Publishes: Yes / No

CONTENT TRACKER
Post/ID: _____________________________________
Platform/Format: ______________________________
Source Checked: _______________________________
Media Rights Confirmed: Yes / No
Disclosure Added: Yes / No / Not Applicable
Status: Draft / Revise / Approved / Scheduled / Published
Approver/Date: ________________________________

BUSINESS TRACKER
Prospects Contacted: ____
Projects Booked: ____
Drafts Submitted: ____
Posts Approved: ____
Invoices Sent: $____
Payments Collected: $____
Expenses: $____
Total Hours: ____
Monthly Profit: $____
Effective Hourly Profit: $____

RED FLAGS — PAUSE OR DECLINE
- Client wants automatic publishing with no human approval
- Request includes fake reviews, fake engagement, impersonation, or hidden sponsorship
- Client cannot support a health, financial, safety, performance, or environmental claim
- Media, testimonial, music, logo, or customer story lacks permission
- Client wants private data pasted into an unapproved AI tool
- Client asks for a full-control password instead of appropriate access
- Platform rules do not permit the proposed content or music
- Client expects guaranteed virality, followers, leads, or sales

GYSH PRO TIP
The differentiator is not that you can generate captions quickly. It is that you can turn verified client facts into a usable, organized calendar that sounds like the client and never goes live without a recorded approval.

STARTER CHALLENGE
Choose one fictional local business and create five posts in a content tracker. For each, add the exact source fact, CTA, media-rights status, human edit, and approval column. Use that system—not raw AI output—as your sample.

VERIFY BEFORE PUBLISHING:
BRIEF → SOURCE FACTS → AI DRAFT → HUMAN EDIT → CLIENT APPROVAL → PUBLISH/HANDOFF`;

export const AI_SOCIAL_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Use AI to help brainstorm, outline, and draft captions, hashtags, and simple content calendars for local businesses or creators. Tagline: Draft Faster. Sound Human. Publish With Approval. Category: AI / Marketing. Best for organized writers who can learn a client's voice, verify facts, and treat AI output as a draft—not an automatic publishing system. Beginner–Intermediate · $0 startup · Project-Based / Weekly Content Batches · Online · Content Calendar / Caption Pack / Monthly Drafting Package · 3 - 10 hrs/week · Elite Membership. Displayed $15 – $50 / project is examples only.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Clear basic writing and proofreading · Ability to match a simple brand voice · Reliable computer or phone and internet · Client brief and source-of-truth folder · AI tool under reviewed current terms · Content calendar and approval tracker · Media-rights and claims checklist · Secure delivery and account-access process · Invoice/payment and profit tracker.",
  },
  {
    id: "before",
    label: "Before drafting",
    detail:
      "Collect the client's current website/menu/service list, audience, location, offers, dates, approved terminology, prohibited topics, CTA, brand assets, and examples of their natural voice. Do not invent testimonials, reviews, credentials, scarcity claims, statistics, customer stories, prices, health results, financial results, environmental benefits, comparisons, or guarantees.",
  },
  {
    id: "confidential",
    label: "Confidential data in AI",
    detail:
      "Do not paste customer lists, private messages, health information, financial details, employee records, passwords, unreleased plans, or other confidential material into an AI tool unless the client has approved that exact use and data handling. Do not pay for a client's full-control password into chat. Use client-granted role or task access where available.",
  },
];

export const AI_SOCIAL_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Meta Page Access Guidance", url: "https://www.facebook.com/help/289207354498410/" },
  { label: "FTC Disclosures 101", url: "https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers" },
  { label: "FTC Endorsements, Influencers, and Reviews", url: "https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews" },
  { label: "TikTok Commercial Music Guidance", url: "https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/commercial-use-of-music-on-tiktok" },
  { label: "LinkedIn AI Content Best Practices", url: "https://www.linkedin.com/help/linkedin/answer/a1481496" },
  { label: "U.S. Copyright Office", url: "https://www.copyright.gov/what-is-copyright/" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
];

export const AI_SOCIAL_HELPER_SUPPLIES = {
  starterKitTotal: "$0 if you use tools you already have — optional Canva or scheduling subscriptions only when a client scope requires them",
  items: [
    { id: "computer", name: "Computer or smartphone", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet access", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "brief", name: "Client brief and source-of-truth folder", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "ai-tool", name: "AI writing tool", qty: "1", estCost: "$0–20/mo", notes: "Essential — client-approved plan" },
    { id: "docs", name: "Word processor/spreadsheet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "calendar", name: "Content calendar and approval tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "checklist", name: "Fact/claim/source checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "media", name: "Media-rights and disclosure checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "cloud", name: "Secure cloud folder", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "tracker", name: "Invoice and revenue/expense tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "canva", name: "Canva or Adobe Express", qty: "1", estCost: "$0–15/mo", notes: "Helpful", optional: true },
    { id: "scheduler", name: "Platform-native scheduler or client-approved scheduling tool", qty: "1", estCost: "$0–25/mo", notes: "Helpful", optional: true },
    { id: "mfa", name: "Password manager and multi-factor authentication", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "accessibility", name: "Accessibility checker and caption tool", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "analytics", name: "Analytics screenshot/report template", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
  ],
};

export const AI_SOCIAL_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "ai", name: "ChatGPT / Client-Approved AI Tool", freePlanAvailable: true, costNote: "Brainstorming and drafting; human review required" },
  { id: "docs", name: "Google Docs / Sheets", freePlanAvailable: true, costNote: "Briefs, calendars, approvals, and source records", url: "https://docs.google.com/" },
  { id: "canva", name: "Canva / Adobe Express", freePlanAvailable: true, costNote: "Simple authorized graphics under current license terms", url: "https://www.canva.com/", optional: true },
  { id: "meta", name: "Meta Page Access Guidance", freePlanAvailable: true, planLabelApplicable: false, costNote: "Official role/access guidance", url: "https://www.facebook.com/help/289207354498410/" },
  { id: "ftc-disclosures", name: "FTC Disclosures 101", freePlanAvailable: true, planLabelApplicable: false, costNote: "Material relationship disclosures", url: "https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers" },
  { id: "ftc-endorsements", name: "FTC Endorsements, Influencers, and Reviews", freePlanAvailable: true, planLabelApplicable: false, costNote: "Advertising and endorsement rules", url: "https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews" },
  { id: "tiktok", name: "TikTok Commercial Music Guidance", freePlanAvailable: true, planLabelApplicable: false, costNote: "Commercial music rules", url: "https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/commercial-use-of-music-on-tiktok" },
  { id: "linkedin", name: "LinkedIn AI Content Best Practices", freePlanAvailable: true, planLabelApplicable: false, costNote: "Human review and transparency", url: "https://www.linkedin.com/help/linkedin/answer/a1481496" },
  { id: "copyright", name: "U.S. Copyright Office", freePlanAvailable: true, planLabelApplicable: false, costNote: "What is copyright", url: "https://www.copyright.gov/what-is-copyright/" },
  { id: "irs", name: "IRS Self-Employed Individuals Tax Center", freePlanAvailable: true, planLabelApplicable: false, costNote: "Recordkeeping and taxes", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Client Type + One Platform + Five Drafts + Client Source Sheet + Human Edit + Approval Tracker + Client Publishes" },
];

export const AI_SOCIAL_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED PRICING: $15 – $50 / project (examples, not guarantees).",
    "Use the displayed range for a tightly limited starter deliverable. Strategy, graphics, multiple platforms, scheduling, community management, analytics, or regulated claims should cost more.",
    "",
    "STARTER CAPTION PACK",
    "$15 – $50",
    "Three to five edited caption drafts for one platform using client-supplied facts, one revision round, and client publishing.",
    "",
    "TWO-WEEK CONTENT CALENDAR",
    "$50 – $150+",
    "Eight to ten post ideas with dates, format, topic, CTA, source note, draft status, and approval column.",
    "",
    "CONTENT CALENDAR + CAPTIONS",
    "$100 – $300+",
    "A defined batch of fully edited drafts, basic hashtag/topic recommendations, one revision round, and organized handoff.",
    "",
    "MONTHLY DRAFTING PACKAGE",
    "$200 – $750+",
    "A fixed number of recurring posts and planning time. Define platforms, formats, approval deadlines, revisions, meetings, and whether scheduling is included.",
    "",
    "POSSIBLE ADD-ONS",
    "- Basic Canva graphics",
    "- Additional platform adaptation",
    "- Short-form video outline or shot list",
    "- Scheduling after written approval",
    "- Analytics summary",
    "- Rush turnaround",
    "- Extra revision round",
    "- Licensed stock or template expense",
    "",
    "PRICING FORMULA",
    "Research/Brief + Draft Count + Human Editing + Platform Adaptation + Graphics + Revisions + Scheduling/Reporting + Direct Costs = Quote",
    "",
    "Do not promise a specific reach, follower count, lead total, sale, or viral result.",
    "",
    "MONTHLY EXAMPLES — NOT GUARANTEES",
    "4 caption packs × $35 = $140 gross/month",
    "2 calendar-and-caption projects × $150 = $300 gross/month",
    "One $300 monthly package + two $50 projects = $400 gross/month",
    "",
    "Gross revenue is NOT profit. Subtract subscriptions, licensed assets, equipment, payment fees, contractors, refunds, and taxes.",
  ].join("\n"),
  raiseTip:
    "Displayed $15 – $50 / project fits a tightly limited starter deliverable. Do not promise reach, followers, leads, sales, or virality.",
  items: [
    { id: "caption-pack", label: "Starter caption pack", price: "$15 – $50", notes: "Displayed range" },
    { id: "two-week", label: "Two-week content calendar", price: "$50 – $150+" },
    { id: "calendar-captions", label: "Content calendar + captions", price: "$100 – $300+" },
    { id: "monthly", label: "Monthly drafting package", price: "$200 – $750+" },
  ],
};

export const AI_SOCIAL_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose One Client Type and One Platform",
    desc: [
      "Select a niche you understand and one primary platform.",
      "Start with low-risk local businesses or creators whose offers can be verified easily.",
      "Avoid regulated or high-stakes claims until qualified.",
    ].join("\n"),
  },
  {
    title: "Build One Clear Package and Price",
    desc: [
      "Define number of ideas/captions, platform, length, graphics, research, hashtags, revisions, turnaround, approval deadline, scheduling authority, and exclusions.",
      "The safest beginner offer is a draft-only content pack with client publishing.",
    ].join("\n"),
  },
  {
    title: "Create the Brief and Source Sheet",
    desc: [
      "Collect brand voice, audience, offer, services, prices, dates, links, CTA, approved claims, forbidden topics, disclosure needs, media rights, and fact owner.",
      "Date each source. Do not invent missing facts.",
    ].join("\n"),
  },
  {
    title: "Create an Honest Sample Calendar",
    desc: [
      "Build a fictional or permission-based seven-day sample showing date, platform, format, topic, goal, CTA, source, draft, and approval.",
      "Do not imply that a real brand hired you when it did not.",
    ].join("\n"),
  },
  {
    title: "Create Your Marketing Materials",
    desc: [
      "Write a niche statement, package details, sample preview, starting price, process, turnaround, and CTA.",
      "Explain that AI assists drafting and every deliverable receives human editing.",
      "Do not promise guaranteed reach, followers, leads, sales, or virality.",
    ].join("\n"),
  },
  {
    title: "Contact Suitable Clients",
    desc: [
      "Choose 2–3 channels: warm referrals, local business groups, professional networks, creator communities, or direct outreach.",
      "",
      "Sample message:",
      "“I help [CLIENT TYPE] turn approved business facts into a clear [PLATFORM] content calendar. My $____ package includes [NUMBER] human-edited drafts, one revision, and an approval tracker. You approve before publishing.”",
      "",
      "Track prospects, replies, briefs, quotes, deposits, drafts, approvals, invoices, and payments.",
    ].join("\n"),
  },
  {
    title: "Qualify the Client and Content Risk",
    desc: [
      "Verify the business/contact, account owner, products, audience, platform, source facts, claims, testimonials, sponsorships, rights, sensitive topics, access method, and final approver.",
      "Refuse fake reviews, impersonation, harassment, undisclosed ads, stolen media, or unsupported claims.",
    ].join("\n"),
  },
  {
    title: "Brainstorm and Draft with AI",
    desc: [
      "Use a sanitized prompt containing only approved information.",
      "Ask for options, not final truth.",
      "Select the useful ideas, add the client's real expertise and local detail, remove clichés, and preserve the client's voice.",
    ].join("\n"),
  },
  {
    title: "Human-Edit and Verify Every Post",
    desc: [
      "Check facts, dates, prices, spelling, links, claims, names, locations, CTA, disclosure, rights, platform fit, accessibility, and tone.",
      "Verify quotations and statistics from the original source.",
    ].join("\n"),
  },
  {
    title: "Obtain Approval and Hand Off or Schedule",
    desc: [
      "Place every draft in an approval tracker.",
      "Record approve/revise/reject, approver, date, final text, media, and publish date.",
      "If scheduling is included, schedule only the approved version from authorized client access.",
    ].join("\n"),
  },
  {
    title: "Report, Invoice, and Improve",
    desc: [
      "Deliver the final calendar, source notes, and status report.",
      "Track actual time, revisions, collected payment, and—if included—reach, saves, clicks, or inquiries without promising causation.",
      "Propose one specific next batch.",
      "",
      "BRIEF → SOURCE FACTS → AI DRAFT → HUMAN EDIT → CLIENT APPROVAL → PUBLISH/HANDOFF",
    ].join("\n"),
  },
];

export function aiSocialHelperToolsDisclaimer(): string {
  return "Beginner stack: One Client Type + One Platform + Five Drafts + Client Source Sheet + Human Edit + Approval Tracker + Client Publishes. Platform settings, music libraries, AI labels, ad policies, branded-content rules, disclosure tools, and account roles change — check the current rule before scheduling or publishing. Never publish without client approval.";
}

export function computeAiSocialHelperProfit(input: {
  ashCaptionPacks?: number;
  ashAvgPackFee?: number;
  ashCalendarCaptionRevenue?: number;
  ashMonthlyPackageRevenue?: number;
  ashAddOnRevenue?: number;
  ashOtherRevenue?: number;
  ashAiDesignTools?: number;
  ashLicensedMedia?: number;
  ashEquipmentInternet?: number;
  ashPaymentFees?: number;
  ashContractors?: number;
  ashOtherExpenses?: number;
  ashBriefResearchHours?: number;
  ashDraftEditHours?: number;
  ashApprovalRevisionHours?: number;
  ashMarketingAdminHours?: number;
  ashApprovedPosts?: number;
  ashDraftsSubmitted?: number;
  ashPostsRequiringRevision?: number;
}): {
  starterRevenue: number;
  totalCollectedRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
  avgRevenuePerApprovedPost: number | null;
  revisionRatePercent: number | null;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const starterRevenue = n(input.ashCaptionPacks) * n(input.ashAvgPackFee);
  const totalCollectedRevenue =
    starterRevenue +
    n(input.ashCalendarCaptionRevenue) +
    n(input.ashMonthlyPackageRevenue) +
    n(input.ashAddOnRevenue) +
    n(input.ashOtherRevenue);
  const totalExpenses =
    n(input.ashAiDesignTools) +
    n(input.ashLicensedMedia) +
    n(input.ashEquipmentInternet) +
    n(input.ashPaymentFees) +
    n(input.ashContractors) +
    n(input.ashOtherExpenses);
  const estimatedProfit = totalCollectedRevenue - totalExpenses;
  const totalHours =
    n(input.ashBriefResearchHours) +
    n(input.ashDraftEditHours) +
    n(input.ashApprovalRevisionHours) +
    n(input.ashMarketingAdminHours);
  const approvedPosts = n(input.ashApprovedPosts);
  const draftsSubmitted = n(input.ashDraftsSubmitted);
  return {
    starterRevenue,
    totalCollectedRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: totalCollectedRevenue > 0 ? (estimatedProfit / totalCollectedRevenue) * 100 : 0,
    avgRevenuePerApprovedPost: approvedPosts > 0 ? totalCollectedRevenue / approvedPosts : null,
    revisionRatePercent: draftsSubmitted > 0 ? (n(input.ashPostsRequiringRevision) / draftsSubmitted) * 100 : null,
  };
}
