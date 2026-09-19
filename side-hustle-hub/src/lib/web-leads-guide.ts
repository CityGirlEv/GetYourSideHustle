/**
 * Local Website Lead Finder (`web-leads`, Guide #085).
 * Elite Membership. 10 - 20 hrs/week. Displayed $800 - $6,000/mo (examples).
 * Plain data only — no imports from guide-tools.
 */

export const WEB_LEADS_REALITY_CHECK = {
  title: "A LEAD LIST IS NOT PERMISSION TO SPAM",
  body: [
    "Find local businesses with weak or missing websites, then pitch evidence-based audits, modern rebuilds, or done-for-you sites that turn interested visitors into calls, directions, quote requests, or bookings.",
    "",
    "Use public business information responsibly and contact each business with a specific, truthful reason. Do not scrape restricted data, evade platform limits, send deceptive bulk messages, impersonate Google or another company, or claim that a website is “broken” without evidence.",
    "",
    "For U.S. commercial email, review current CAN-SPAM requirements. The FTC says commercial email must use accurate headers and non-deceptive subject lines, identify advertising as required, include a valid physical postal address, provide a clear opt-out method, and honor opt-outs. Business-to-business email is not automatically exempt.",
    "",
    "Automated/prerecorded calls and texts can trigger federal and state consent rules. Do not run mass calling or texting campaigns without qualified legal review and an appropriate consent process. Honor company-specific do-not-contact requests and applicable registries and platform rules.",
    "",
    "A website build also creates privacy, security, accessibility, domain, hosting, form, email, cookie, and legal responsibilities. Put ownership, access, scope, and ongoing support in writing. Do not promise search rankings, accessibility compliance, leads, bookings, revenue, or “100% security.”",
    "",
    "Never request a password by text or email. Use client-owned accounts, delegated access, and multi-factor authentication where available.",
    "",
    "Tagline: Find the Friction. Show the Fix. Build the Result.",
  ].join("\n"),
};

export const WEB_LEADS_NOTES_WORKSHEET = `MY LEAD-FINDER PLAN

Area/Zip Code: __________
Niche(s): __________
Conversion Goal: __________
Audit Price: $____
Build Package: $____
Retainer: $____ / month

My Two or Three Marketing Channels:
1. __________
2. __________
3. __________

LEAD RECORD
Business: __________
Website: __________
Public Contact: __________
Observed Problem: __________
Evidence/Screenshot: __________
Source and Date Checked: __________
Outreach Status: __________
Opt-Out/Do-Not-Contact: __________

PROJECT SCOPE
Client Goal: __________
Pages/Sections: __________
Stack: __________
Forms/Integrations: __________
Accessibility Target/Checks: __________
Privacy/Consent Requirements: __________
Asset/Copy Owner: __________
Revision Limit: __________
Deposit: $____
Launch Acceptance: __________

PROJECT RESULTS
Gross Revenue: $____
Expenses: $____
Estimated Profit: $____
Hours Including Sales: ____
Effective Profit Per Hour: $____
Retainer: ☐ Yes ☐ No
Testimonial/Referral: __________
What Worked: __________
What I Will Improve: __________

GYSH PRO TIP
SELL THE OBSERVED PROBLEM BEFORE THE BIG BUILD.

A clear screenshot, a broken booking path, and a prioritized audit are more credible than telling every owner they need a brand-new website. Evidence earns the discovery call.

SPECIFIC LEAD + REAL EVIDENCE + CLEAR SCOPE + CLIENT-OWNED ACCOUNTS + TESTED LAUNCH = TRUST

BEGINNER CHALLENGE
Complete five audits before sending outreach.
1. Choose one zip code and niche
2. Find five active businesses with public websites
3. Test each site on mobile
4. Capture one factual issue per site
5. Write one prioritized fix
6. Score whether the fix supports calls, bookings, quotes, or directions
7. Remove any lead whose problem is only personal taste
8. Build one fictional before/after demo
9. Review the outreach script against current rules
10. Send no message until every fact and contact record is checked`;

export const WEB_LEADS_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Find local businesses with weak or missing websites, then pitch evidence-based audits, modern rebuilds, or done-for-you sites. Category: Local Services. Best for Adults, Seniors / Retirees with web, audit, sales, and client-communication skills. Intermediate · $100 - $500 startup · Flexible / Client Deadline-Based · Local / Online · Audit / Website Project / Monthly Hosting and Maintenance · 10 - 20 hrs/week · Elite Membership. Displayed $800 - $6,000/mo is examples only. Tagline: Find the Friction. Show the Fix. Build the Result.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable computer and internet · Ability to audit mobile and desktop websites · Basic HTML/CSS/JavaScript or selected no-code/build platform skill · Screenshot and screen-recording ability · Google Sheets or CRM · Written scope, agreement, deposit, and change-order process · Secure account and credential practices · Portfolio or fictional demo · Understanding of outreach rules.",
  },
  {
    id: "before-selling",
    label: "Before selling a build, confirm",
    detail:
      "Exact deliverables and page count · Client’s business, audience, and conversion goal · Who owns the domain, hosting, code, database, analytics, forms, and email service · Who supplies/owns copy, logos, photos, fonts, and legal policies · Accessibility target and test approach · Privacy/consent needs for forms, analytics, cookies, and email · Revision limit, milestone payments, launch acceptance, maintenance, and exit/handoff.",
  },
  {
    id: "security",
    label: "Account security",
    detail: "Never request a password by text or email. Use client-owned accounts, delegated access, and multi-factor authentication where available.",
  },
];

export const WEB_LEADS_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Maps", url: "https://maps.google.com/", note: "Lead research" },
  { label: "PageSpeed Insights", url: "https://pagespeed.web.dev/", note: "Audit performance" },
  { label: "Cloudflare Pages", url: "https://pages.cloudflare.com/", note: "Approved deployment path" },
  { label: "Supabase", url: "https://supabase.com/", note: "Forms, authentication, or data when scope requires" },
  { label: "Resend", url: "https://resend.com/", note: "Transactional/contact email when scope requires" },
  { label: "WCAG 2.2", url: "https://www.w3.org/TR/WCAG22/", note: "Accessibility reference" },
  { label: "ADA.gov web guidance", url: "https://www.ada.gov/resources/web-guidance/", note: "Accessibility guidance" },
  { label: "FTC CAN-SPAM guide", url: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business", note: "Commercial email compliance" },
  { label: "FCC", url: "https://www.fcc.gov/", note: "Consumer/telemarketing rules" },
];

export const WEB_LEADS_SUPPLIES = {
  starterKitTotal: "$100 – $500 initial budget for approved software, domain, hosting, templates, or test devices",
  items: [
    { id: "laptop", name: "Laptop/computer", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "internet", name: "Reliable internet", qty: "1", estCost: "$0+", notes: "Essential" },
    { id: "phone", name: "Phone and charger", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "test-matrix", name: "Browser/device test matrix", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "screenshot", name: "Screenshot and screen-recording tool", qty: "1", estCost: "$0–20", notes: "Essential" },
    { id: "checklist", name: "Audit checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "crm", name: "Lead tracker/CRM", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "templates", name: "Proposal, agreement, invoice, and change-order templates", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "password", name: "Secure password manager", qty: "1", estCost: "$0–15", notes: "Essential" },
    { id: "monitor", name: "External monitor", qty: "1", estCost: "$100–300", notes: "Optional", optional: true },
    { id: "tablet", name: "Test phone/tablet", qty: "1", estCost: "$0 if owned", notes: "Optional", optional: true },
    { id: "domain", name: "Domain for a portfolio", qty: "1", estCost: "$10–20/yr", notes: "Optional", optional: true },
    { id: "email", name: "Professional email address", qty: "1", estCost: "$0–10/mo", notes: "Optional", optional: true },
  ],
};

export const WEB_LEADS_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "maps", name: "Google Maps and Business Profiles", freePlanAvailable: true, costNote: "Lead research", url: "https://maps.google.com/" },
  { id: "bing", name: "Bing Places/search", freePlanAvailable: true, costNote: "Lead research", url: "https://www.bing.com/maps" },
  { id: "sheets", name: "Google Sheets or CRM", freePlanAvailable: true, costNote: "Lead tracker", url: "https://sheets.google.com/" },
  { id: "devtools", name: "Browser developer tools", freePlanAvailable: true, planLabelApplicable: false, costNote: "Audit layout, errors, and performance" },
  { id: "pagespeed", name: "PageSpeed Insights / Lighthouse", freePlanAvailable: true, costNote: "Performance audit", url: "https://pagespeed.web.dev/" },
  { id: "screenshot", name: "Screenshot tool", freePlanAvailable: true, planLabelApplicable: false, costNote: "Evidence capture" },
  { id: "loom", name: "Loom or PDF report", freePlanAvailable: true, costNote: "Audit delivery", url: "https://www.loom.com/" },
  { id: "antigravity", name: "Google Antigravity", freePlanAvailable: true, costNote: "Kick off approved projects where appropriate" },
  { id: "cloudflare", name: "Cloudflare Pages", freePlanAvailable: true, costNote: "Deployment — do not use WordPress for this guide’s approved build path", url: "https://pages.cloudflare.com/" },
  { id: "supabase", name: "Supabase", freePlanAvailable: true, costNote: "Forms, authentication, or data when scope requires", url: "https://supabase.com/", optional: true },
  { id: "resend", name: "Resend", freePlanAvailable: true, costNote: "Transactional/contact email when scope requires", url: "https://resend.com/", optional: true },
  { id: "git", name: "Git-based version control", freePlanAvailable: true, costNote: "Source control and release history" },
  { id: "wcag", name: "W3C Web Content Accessibility Guidelines", freePlanAvailable: true, costNote: "Accessibility reference", url: "https://www.w3.org/TR/WCAG22/" },
  { id: "can-spam", name: "FTC CAN-SPAM compliance guide", freePlanAvailable: true, costNote: "Commercial email rules", url: "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Maps + Google Sheets + Browser DevTools + Loom/PDF + Antigravity + Cloudflare Pages + Supabase/Resend as Needed" },
];

export const WEB_LEADS_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "LOCAL WEBSITE LEAD FINDER PRICING EXAMPLES",
    "",
    "Website Audit: $150 – $400",
    "Evidence-based mobile/desktop review with screenshots, 3–10 prioritized findings, and a short action plan.",
    "",
    "Focused Landing Page / Starter Site: $800 – $1,500",
    "Defined page/section count, responsive build, clear calls to action, basic form, and one or two revision rounds.",
    "",
    "Small-Business Website Build: $1,500 – $3,500+",
    "Defined multi-page scope, client-approved copy/assets, forms, basic SEO setup, accessibility checks, analytics/consent setup as agreed, testing, and launch.",
    "",
    "Hosting + Light Edits: $49 – $149 / month",
    "Define hosting, backups, monitoring, update requests, response time, and monthly hour/request caps.",
    "",
    "Possible add-ons: copywriting; photography; booking or payment integration; additional form/database work; additional page or language; rush launch; extra revision.",
    "",
    "Agree before work:",
    "Scope + Stack + Ownership + Content Responsibilities + Accessibility/Privacy Requirements + Milestones + Revision Limit + Change Orders + Deposit + Launch Acceptance + Maintenance + Handoff",
    "",
    "The displayed $800 - $6,000/mo is an example range, not a guarantee. One project may take several weeks, and expenses, refunds, sales time, taxes, and unpaid revisions reduce profit.",
  ].join("\n"),
  raiseTip:
    "Sell the audit before the big build. Displayed $800 - $6,000/mo is examples only — not income guarantees.",
  items: [
    { id: "audit", label: "Website audit", price: "$150 – $400", notes: "Examples only" },
    { id: "landing", label: "Focused landing page / starter site", price: "$800 – $1,500", notes: "Examples only" },
    { id: "build", label: "Small-business website build", price: "$1,500 – $3,500+", notes: "Examples only" },
    { id: "retainer", label: "Hosting + light edits", price: "$49 – $149 / month", notes: "Examples only" },
  ],
};

export const WEB_LEADS_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick a Zip Code & Niche Lane",
    desc: [
      "Choose one local area and one or two business types you understand.",
      "Area/Zip Code: __________  Radius: ____ miles  Niche 1: __________  Niche 2: __________",
      "Ideal Conversion Goal: ☐ Calls ☐ Quote Requests ☐ Bookings ☐ Directions ☐ Email Signups",
      "Avoid regulated or complex niches until you understand their content, privacy, accessibility, and advertising requirements.",
    ].join("\n"),
  },
  {
    title: "Define the Audit & Build Offers",
    desc: [
      "Create two separate offers.",
      "AUDIT OFFER: Pages/Flows Reviewed · Findings · Delivery · Price: $____",
      "BUILD OFFER: Pages/Sections · Stack: Cloudflare Pages + __________ · Forms/Data/Email · Revisions · Timeline · Price: $____",
      "State what is excluded. Never hide a full rebuild inside a small audit fee.",
    ].join("\n"),
  },
  {
    title: "Build the Lead Scorecard",
    desc: [
      "Score only observable conditions.",
      "Lead Criteria: no website or expired domain; site fails to load or has broken links; poor mobile layout; business name/address/phone inconsistency; missing or unclear primary call to action; quote/booking/contact flow is confusing or fails; important services/hours are outdated; accessibility barriers visible in a basic audit; missing HTTPS or obvious security warning.",
      "Do not label design taste as a “bug.” Separate facts, usability concerns, and optional improvements.",
    ].join("\n"),
  },
  {
    title: "Build a Qualified Lead List",
    desc: [
      "Use Maps, search, public directories, and business websites.",
      "Track: Business | Contact Name | Public Business Email/Phone | Website | Problem Observed | Screenshot | Source URL | Date Checked | Outreach Status | Opt-Out",
      "Verify the business is active and the issue still exists before contacting it.",
      "Do not collect private personal data, bypass access controls, or use prohibited scraping/automation.",
    ].join("\n"),
  },
  {
    title: "Run a 60-Second Audit & Select the Best Leads",
    desc: [
      "Check: mobile first impression; main call to action; phone/booking/contact flow; page speed and visible errors; business information consistency; basic keyboard, contrast, label, and alt-text concerns.",
      "Capture only what supports the finding.",
      "Prioritize businesses where the problem is real, the business appears active, the fix supports a clear customer action, and the project fits your skills.",
      "Do not send a frightening automated report or exaggerate risk to force a sale.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Choose exactly 2 or 3:",
      "☐ Warm referrals",
      "☐ Personalized compliant email",
      "☐ Phone call consistent with applicable rules",
      "☐ In-person introduction",
      "☐ Chamber/local networking",
      "☐ LinkedIn",
      "☐ Partner referrals from photographers, marketers, or IT providers",
      "",
      "Set one measurable goal for each.",
      "Examples: ask 10 trusted contacts for introductions; send 10 individually researched emails; attend 1 local business event.",
      "Do not use automated texting or prerecorded outreach without appropriate consent and legal review.",
    ].join("\n"),
  },
  {
    title: "Make & Carry Out the Marketing Plan",
    desc: [
      "Create: one-page audit sample; short portfolio/demo link; personalized email/call script; audit and build rate card; clear opt-out/do-not-contact process.",
      "",
      "Sample:",
      "“I checked your public website on mobile and noticed that the quote button leads to ________. I captured one screenshot and can provide a short prioritized audit for $____. If you are not interested, I will not follow up.”",
      "",
      "Follow current email and calling rules. Track every contact, response, follow-up, and opt-out. Stop contacting anyone who asks.",
    ].join("\n"),
  },
  {
    title: "Run Discovery, Propose & Collect a Deposit",
    desc: [
      "Ask: what should the visitor do; which services/locations matter most; what is wrong with the current site; who approves copy and design; what systems must connect; what privacy, accessibility, or industry requirements apply; who owns the domain and accounts; what is the budget and deadline.",
      "Send a written proposal and agreement. Do not begin a full build without the agreed deposit and access process.",
    ].join("\n"),
  },
  {
    title: "Build in Client-Owned Systems",
    desc: [
      "Kick off the approved project in Antigravity where appropriate, deploy on Cloudflare Pages, and use Supabase and Resend only when the scope requires them.",
      "Build: responsive layout; clear navigation and calls to action; consistent business name, address, and phone; client-approved copy and licensed assets; accessible semantic structure, labels, focus, contrast, and alternative text; secure, minimal forms; spam protection and appropriate consent notice; transactional email with authenticated sending domain where required; analytics/cookies only as approved.",
      "Use client-owned domains/services and least-privilege delegated access. Never place secrets in public code. Do not use WordPress for this guide’s approved build path.",
    ].join("\n"),
  },
  {
    title: "Test, Approve & Launch",
    desc: [
      "Test: mobile, tablet, and desktop layouts; current major browsers agreed in scope; navigation, buttons, forms, email delivery, booking, and phone links; keyboard use and focus order; labels, headings, contrast, alternative text, and zoom; page titles, descriptions, social preview, sitemap, and robots settings; HTTPS, redirects, error page, analytics/consent, and backups.",
      "Have the client verify every business fact, legal policy, price, claim, and destination email/phone.",
      "Launch only after written acceptance. Save the release version, DNS records, service ownership, and rollback plan.",
    ].join("\n"),
  },
  {
    title: "Hand Off, Retain & Ask for Referrals",
    desc: [
      "Deliver: live URL; client-owned account list; source/repository access; content update instructions; form and email test instructions; backup/rollback information; license/asset list; known limitations; maintenance options.",
      "Offer a defined $49 – $149/month hosting/light-edits plan with caps and response times.",
      "After the client confirms the launch: “May I request a short testimonial and two introductions to local businesses that may need an audit?”",
      "QUALIFIED LEAD → EVIDENCE-BASED AUDIT → SIGNED SCOPE → CONTROLLED BUILD → TESTED LAUNCH → RETAINER",
    ].join("\n"),
  },
];

export function webLeadsToolsDisclaimer(): string {
  return "Beginner stack: Maps + Google Sheets + Browser DevTools + Loom/PDF + Antigravity + Cloudflare Pages + Supabase/Resend as Needed. A lead list is not permission to spam. Do not use WordPress for this guide’s approved build path. Never request passwords by text or email.";
}

export function computeWebLeadsProfit(input: {
  wlAuditsPerMonth?: number;
  wlAvgAuditPrice?: number;
  wlBuildsPerMonth?: number;
  wlAvgBuildPrice?: number;
  wlRetainerRevenue?: number;
  wlSoftwareHosting?: number;
  wlContractorCosts?: number;
  wlPaymentFeesRefunds?: number;
  wlOutreachTravel?: number;
  wlOtherExpenses?: number;
  wlTotalHours?: number;
}): {
  auditRevenue: number;
  buildRevenue: number;
  monthlyGrossRevenue: number;
  monthlyExpenses: number;
  estimatedMonthlyProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const auditRevenue = n(input.wlAuditsPerMonth) * n(input.wlAvgAuditPrice);
  const buildRevenue = n(input.wlBuildsPerMonth) * n(input.wlAvgBuildPrice);
  const monthlyGrossRevenue = auditRevenue + buildRevenue + n(input.wlRetainerRevenue);
  const monthlyExpenses =
    n(input.wlSoftwareHosting) +
    n(input.wlContractorCosts) +
    n(input.wlPaymentFeesRefunds) +
    n(input.wlOutreachTravel) +
    n(input.wlOtherExpenses);
  const estimatedMonthlyProfit = monthlyGrossRevenue - monthlyExpenses;
  const totalHours = n(input.wlTotalHours);
  return {
    auditRevenue,
    buildRevenue,
    monthlyGrossRevenue,
    monthlyExpenses,
    estimatedMonthlyProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedMonthlyProfit / totalHours : null,
    profitMarginPercent: monthlyGrossRevenue > 0 ? (estimatedMonthlyProfit / monthlyGrossRevenue) * 100 : 0,
  };
}
