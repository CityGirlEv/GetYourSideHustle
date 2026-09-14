/**
 * Website Tester (`website-tester`, Guide #116).
 * Authorized public-page / approved-journey testing — not security testing. Plain data only.
 */

export const WEBSITE_TESTER_REALITY_CHECK = {
  title: "GET WRITTEN AUTHORIZATION & TEST LIMITS BEFORE YOU CLICK",
  body: [
    "Click through authorized small-business websites and deliver a clear bug-and-clarity checklist with screenshots, reproduction steps, device/browser details, and practical priorities.",
    "",
    "A website being visible on the internet does not mean every page, account, form, checkout, tool, or technical test is open for unrestricted testing.",
    "Stay inside the approved domain, URLs, environment, journeys, devices, test account, test data, and testing window.",
    "",
    "This beginner service does NOT include penetration testing, vulnerability scanning, password guessing, bypassing authentication, inspecting another user’s data, changing code/settings, load/stress/exploit testing, or legal/security/accessibility certification.",
    "If you unexpectedly see another person’s private data, an exposed credential, or a possible security weakness: STOP. Do not explore or prove impact. Notify the authorized client contact privately.",
    "",
    "Tagline: Click It. Catch It. Explain It Clearly.",
  ].join("\n"),
};

export const WEBSITE_TESTER_NOTES_WORKSHEET = `MY WEBSITE TESTER PLAN

SERVICE SETUP
Quick Check Fee: $____
Small-Site Check Fee: $____
Mobile + Desktop Fee: $____
Approved Form-Flow Fee: $____
Retest Fee: $____
Maximum Pages: ____
Maximum Journeys: ____
Browsers Included: ____
Devices / Viewports Included: ____
Maximum Findings: ____
Standard Turnaround: ____
Included Retest / Window: ________
Rush Fee: $____
Cancellation Rule: ________

CLIENT AUTHORIZATION
Client: ________
Business: ________
Authorized Contact: ________
Authority Over Domain Confirmed: ☐
Domain: ________
Environment: Production / Staging / Preview
Included URLs: ________
Excluded URLs / Actions: ________
Testing Window: ________
Test Account Role: ________
Temporary Credentials Received Privately: ☐
Approved Test Data: ________
Forms / Messages / Orders Allowed: ________
Screenshot Rules: ________
Stop Conditions: ________
Emergency Contact: ________
Written Authorization Saved: ☐

TEST MATRIX
Project ID: ________
Page / Journey: ________
Expected User Goal: ________
Browser / Version: ________
Operating System: ________
Device / Viewport: ________
Login Role: ________
Expected Result: ________
Actual Result: ________
Status: Pass / Fail / Unable to Test

ISSUE
Issue ID: ________
Title: ________
Severity: Blocker / Major / Minor / Suggestion
URL: ________
Environment: ________
Browser / Device: ________
Date / Time: ________
Precondition: ________
Reproduction Steps: ________
Expected: ________
Actual: ________
Frequency: ________
User Impact: ________
Screenshot / Video: ________
Sensitive Information Redacted: ☐

DELIVERY / RETEST / CLOSEOUT
Report Delivered: ________
Private Delivery Link: ________
Client Questions: ________
Retest Requested: ________
Retest Completed: ________
Fixed: ____
Still Present: ____
Changed: ____
Unable to Retest: ____
Temporary Credentials Removed: ☐
Private Screenshots / Test Data Deleted: ☐
Payment Received: ☐

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Prospects: ____
Quotes: ____
Projects Booked: ____
Recurring Clients: ____

MONTHLY RESULTS
Quick Checks: ____
Expanded Projects: ____
Retests: ____
Pages Tested: ____
Journeys Tested: ____
Findings Delivered: ____
Revenue: $____
Expenses: $____
Estimated Profit: $____
Total Hours: ____
Effective Profit Per Hour: $____
Most Profitable Package: ________
Scope / Quality / Safety Change Needed: ________

GYSH PRO TIP
A SCREENSHOT OF “IT’S BROKEN” IS NOT A BUG REPORT.
The client needs the exact page, browser/device, reproduction steps, expected result, actual result, user impact, and readable evidence.

WRITTEN SCOPE + REPEATABLE STEPS + CLEAN SCREENSHOT + CLEAR PRIORITY + SAFE RETEST = VALUABLE WEBSITE TESTING
`;

export const WEBSITE_TESTER_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Authorized small-business website click-throughs with a prioritized bug-and-clarity checklist. Starter Membership. 10 hrs/week. Displayed $15 – $50 / project is examples only. Safest beginner work: public pages, mobile usability, content clarity, forms, links, and approved customer journeys — not security testing.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable computer · stable internet · current browsers · smartphone or tablet for at least one real-device check when available · screenshot and annotation tool · spreadsheet or issue tracker · report tool · attention to detail · clear writing · ability to follow test instructions · intake form · written authorization and scope · test checklist · secure method for credentials and report delivery · calendar, time tracker, and income/expense tracker.",
  },
  {
    id: "before",
    label: "Before accepting a project",
    detail:
      "Confirm client name, business, authorized contact, authority over the website, exact domain and URLs, production/staging/preview, project goal, target customers, priority pages/flows, browsers/devices, whether login is required, test-account role, whether forms/purchases/bookings/emails may be triggered, approved test data, screenshot/privacy rules, known limitations, deliverable, deadline, included retest, fee, and payment timing.",
  },
  {
    id: "skills",
    label: "Basic skills to practice",
    detail:
      "Opening links in new/private sessions · clearing cache/cookies when instructed · identifying browser and OS versions · resizing windows and using device emulation · testing with a real keyboard · capturing/annotating screenshots · writing exact reproduction steps · separating a bug from a preference · prioritizing blockers, major issues, minor issues, and suggestions. Automated accessibility scores do not prove WCAG conformance.",
  },
  {
    id: "minors",
    label: "For minors",
    detail:
      "Parent/guardian approves every client, domain, test account, and test plan. Trusted clients only. Public-page or supervised test-environment work only. No admin panels, private customer data, payment processing, adult content, medical/legal/school/financial/government systems. No live purchases, bookings, form submissions, messages, or account creation without direct adult supervision and client approval. Parent/guardian controls communication, credentials, contracts, and payment.",
  },
];

export const WEBSITE_TESTER_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Chrome", url: "https://www.google.com/chrome/" },
  { label: "Chrome DevTools Device Mode", url: "https://developer.chrome.com/docs/devtools/device-mode", note: "Approximate mobile viewports" },
  { label: "Mozilla Firefox", url: "https://www.mozilla.org/firefox/" },
  { label: "Microsoft Edge", url: "https://www.microsoft.com/edge" },
  { label: "Safari", url: "https://www.apple.com/safari/", note: "When you have approved Apple hardware" },
  { label: "PageSpeed Insights", url: "https://pagespeed.web.dev" },
  { label: "Chrome Lighthouse", url: "https://developer.chrome.com/docs/lighthouse/overview" },
  { label: "W3C WCAG 2.2", url: "https://www.w3.org/WAI/standards-guidelines/wcag/" },
  { label: "W3C Easy Checks", url: "https://www.w3.org/WAI/test-evaluate/preliminary/" },
  { label: "U.S. DOJ web accessibility guidance", url: "https://www.ada.gov/resources/web-guidance/" },
  { label: "W3C Markup Validation Service", url: "https://validator.w3.org" },
  { label: "W3C Link Checker", url: "https://validator.w3.org/checklink" },
  { label: "WebAIM Contrast Checker", url: "https://webaim.org/resources/contrastchecker/" },
  { label: "Microsoft Accessibility Insights", url: "https://accessibilityinsights.io" },
  { label: "Loom", url: "https://www.loom.com", note: "Client-approved short recordings" },
];

export const WEBSITE_TESTER_SUPPLIES = {
  starterKitTotal: "About $0–20 — current browsers, one real phone, and a checklist are enough to start",
  items: [
    { id: "computer", name: "Computer", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Reliable internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "browsers", name: "Current Chrome, Firefox, and Edge", qty: "1 each where available", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Smartphone or tablet for real-device checks", qty: "1 when available", estCost: "$0 if owned", notes: "Essential when possible" },
    { id: "screenshot", name: "Screenshot + simple annotation tool", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "docs", name: "Word-processing software", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "sheets", name: "Spreadsheet or issue tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "auth", name: "Client intake form + written authorization and test plan", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "template", name: "Bug-report template", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "folder", name: "Secure client-delivery folder", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "email", name: "Separate business email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "monitor", name: "Second monitor", qty: "1", estCost: "$0 if owned", notes: "Helpful", optional: true },
    { id: "pwm", name: "Password manager for approved test credentials", qty: "1", estCost: "$0–4/mo", notes: "Helpful", optional: true },
    { id: "loom", name: "Screen-recording tool (client-approved)", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
  ],
};

export const WEBSITE_TESTER_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "chrome", name: "Google Chrome", freePlanAvailable: true, costNote: "General website testing and developer tools", url: "https://www.google.com/chrome/" },
  { id: "device", name: "Chrome DevTools Device Mode", freePlanAvailable: true, planLabelApplicable: false, costNote: "Approximate mobile viewports — confirm high-priority findings on a real device", url: "https://developer.chrome.com/docs/devtools/device-mode" },
  { id: "firefox", name: "Mozilla Firefox", freePlanAvailable: true, costNote: "Cross-browser testing", url: "https://www.mozilla.org/firefox/" },
  { id: "edge", name: "Microsoft Edge", freePlanAvailable: true, costNote: "Cross-browser testing", url: "https://www.microsoft.com/edge" },
  { id: "safari", name: "Safari", freePlanAvailable: true, costNote: "Apple-browser testing when you have approved Apple hardware", url: "https://www.apple.com/safari/", optional: true },
  { id: "psi", name: "PageSpeed Insights", freePlanAvailable: true, planLabelApplicable: false, costNote: "Performance and UX diagnostic information — not a ranking promise", url: "https://pagespeed.web.dev" },
  { id: "lighthouse", name: "Chrome Lighthouse", freePlanAvailable: true, planLabelApplicable: false, costNote: "Automated clues that require interpretation and manual follow-up", url: "https://developer.chrome.com/docs/lighthouse/overview" },
  { id: "wcag", name: "W3C WCAG 2.2 Overview", freePlanAvailable: true, planLabelApplicable: false, costNote: "Accessibility standard and supporting resources", url: "https://www.w3.org/WAI/standards-guidelines/wcag/" },
  { id: "easy", name: "W3C Easy Checks", freePlanAvailable: true, planLabelApplicable: false, costNote: "Beginner-friendly accessibility review starting points", url: "https://www.w3.org/WAI/test-evaluate/preliminary/" },
  { id: "doj", name: "U.S. DOJ Web Accessibility Guidance", freePlanAvailable: true, planLabelApplicable: false, costNote: "ADA website-accessibility information", url: "https://www.ada.gov/resources/web-guidance/" },
  { id: "validator", name: "W3C Markup Validation Service", freePlanAvailable: true, planLabelApplicable: false, costNote: "Possible HTML markup problems on public pages", url: "https://validator.w3.org" },
  { id: "links", name: "W3C Link Checker", freePlanAvailable: true, planLabelApplicable: false, costNote: "Public-page links when in scope", url: "https://validator.w3.org/checklink" },
  { id: "contrast", name: "WebAIM Contrast Checker", freePlanAvailable: true, planLabelApplicable: false, costNote: "Selected foreground/background combinations", url: "https://webaim.org/resources/contrastchecker/" },
  { id: "insights", name: "Microsoft Accessibility Insights", freePlanAvailable: true, planLabelApplicable: false, costNote: "Guided and automated accessibility checks", url: "https://accessibilityinsights.io" },
  { id: "snip", name: "Windows Snipping Tool / macOS Screenshot", freePlanAvailable: false, planLabelApplicable: false, costNote: "Capture evidence without extra software" },
  { id: "loom", name: "Loom", freePlanAvailable: true, costNote: "Client-approved short recordings for hard-to-show issues", url: "https://www.loom.com", optional: true },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Bug list, priority, status, and retest tracking", url: "https://sheets.google.com/" },
  { id: "docs", name: "Google Docs / Microsoft Word", freePlanAvailable: true, costNote: "Client-ready report", url: "https://docs.google.com" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Written Scope + Current Browsers + One Real Phone + DevTools Device Mode + Keyboard Check + Screenshot Tool + Google Sheets Bug List + Private PDF/Document Delivery + Time/Profit Tracker" },
];

export const WEBSITE_TESTER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "WEBSITE TESTER — REPLACE PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not guarantees.",
    "Price by pages, journeys, browsers/devices, login level, form/checkout complexity, screenshot/report detail, turnaround, and whether a retest is included.",
    "",
    "Quick public-page check: $15 – $25 (up to 3 public pages, one desktop browser).",
    "Small-site click-through: $25 – $40 (up to 5 public pages and one basic journey).",
    "Mobile + desktop clarity check: $35 – $50 (up to 5 pages, one desktop + one mobile size).",
    "Approved form-flow check: $25 – $50 (client must approve every submission).",
    "E-commerce mini check: $35 – $50 (product-to-cart without a live charge unless sandbox is approved).",
    "Retest after fixes: $15 – $30.",
    "Recurring monthly check: $100 – $250 / month as a planning example.",
    "",
    "Formula: Base Page/Journey Package + Additional Browser/Device + Login/Form/Checkout Complexity + Screenshot/Report Detail + Rush + Additional Retest = Project Price.",
    "“Test my whole website” is not a scope. If it cannot be tested carefully within $15–$50, reduce the page/journey list or give a custom quote.",
  ].join("\n"),
  raiseTip:
    "Never use your personal payment card, identity information, real customer details, or someone else’s account for client testing. Examples only — not income guarantees.",
  items: [
    { id: "quick", label: "Quick public-page check", price: "$15–$25", notes: "Up to 3 public pages, one desktop browser" },
    { id: "small", label: "Small-site click-through", price: "$25–$40", notes: "Up to 5 pages + one basic journey" },
    { id: "mobile", label: "Mobile + desktop clarity check", price: "$35–$50", notes: "Up to 5 pages" },
    { id: "form", label: "Approved form-flow check", price: "$25–$50", notes: "Client approves every submission" },
    { id: "ecom", label: "E-commerce mini check", price: "$35–$50", notes: "No live charge unless sandbox is approved" },
    { id: "retest", label: "Retest after fixes", price: "$15–$30", notes: "Previously reported issues only" },
  ],
};

export const WEBSITE_TESTER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Website-Testing Service & Boundaries",
    desc: [
      "Promise: “I click through approved small-business website pages and customer journeys, then deliver a prioritized bug-and-clarity checklist with screenshots and reproduction steps.”",
      "Included (pick in writing): public-page click-through; navigation and link checks; mobile and desktop layout observations; content and CTA clarity; missing images; keyboard and basic accessibility observations; approved form flow; approved cart flow without live payment; PageSpeed/Lighthouse snapshot; fix verification/retest.",
      "Excluded: penetration or vulnerability testing; password guessing; permission/authentication bypass; security exploits; source-code or database changes; load/stress testing; real customer data; unapproved submissions, messages, purchases, bookings, cancellations, or public posts; formal accessibility, legal, privacy, security, SEO, or performance certification; fixing the website unless separately qualified and contracted.",
      "Beginner niche if helpful: local service-business sites, coach/consultant sites, simple portfolios, restaurant information sites, small online stores, nonprofit information sites.",
    ].join("\n"),
  },
  {
    title: "Set Packages, Page Limits, Turnaround & Retest Rules",
    desc: [
      "Create 2–3 starter packages with hard limits.",
      "Write: Quick Check Fee $____ · Small-Site Check $____ · Mobile + Desktop $____ · Maximum Pages · Maximum Journeys · Browsers Included · Devices/Viewports · Maximum Issues Documented · Standard Turnaround · Included Retest Yes/No · Retest Window · Additional Retest Fee $____ · Rush $____ · Cancellation Rule.",
      "Sample scope: “Test up to 5 named public pages and one contact journey in current Chrome on desktop plus one emulated mobile viewport. Deliver up to 15 prioritized findings with screenshots within 3 business days. One retest of reported issues within 14 days is included. No security testing, live payment, admin access, or unapproved submission.”",
      "Do not promise every browser, device, page, flow, issue, or legal standard for one starter fee.",
    ].join("\n"),
  },
  {
    title: "Create the Authorization, Test Plan & Data-Safety Process",
    desc: [
      "Authorization: “I confirm that I am authorized to approve testing for [DOMAIN/ENVIRONMENT]. [HELPER NAME] may test only the URLs, accounts, actions, browsers/devices, and dates listed below. Prohibited actions and stop conditions are: ________. Approved test data: ________. Authorized report recipients: ________.”",
      "Document: domain and environment; included/excluded pages; journeys; test dates/window; browsers/devices; login role; credentials delivery method; approved form/order/booking behavior; approved test data; screenshot/redaction rules; message/automation expectations; stop conditions; emergency contact; report recipients; credential/report deletion date.",
      "Use the lowest-permission test account that can complete the approved journey. Never request an owner’s main password. Credentials should be temporary, unique, delivered privately, and removed or changed after the project.",
      "If authorization is unclear, the domain/client connection cannot be verified, or the request asks for access beyond the client’s authority, decline.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about the service. Pick only 2 or 3 this month.",
      "Good channels: friends and family referrals; local small-business groups; chamber or networking groups where promotion is allowed; web designers and developers; virtual assistants; social-media managers; marketing consultants; ecommerce business owners; LinkedIn; freelance platforms; a simple service page or portfolio.",
      "Write one measurable goal per channel. Examples: tell 15 trusted business owners; contact 5 web designers or virtual assistants; post one fictional sample checklist on LinkedIn.",
      "Do not cold-message businesses with frightening “your site is hacked” claims. This service finds ordinary website bugs and clarity problems; it is not fear-based security sales.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Post: “IS YOUR WEBSITE CONFUSING CUSTOMERS?” I click through approved small-business websites and deliver a clear bug-and-clarity checklist with screenshots, reproduction steps, and priorities. Desktop + Mobile Checks · Links · Forms · Navigation · Clear Reporting. Projects from $____. Contact: ________",
      "Create: one-sentence description; 2–3 packages; fictional or personally owned sample website report; intake form; authorization/test-scope form; bug-report template; delivery email; referral message.",
      "Sample portfolio findings should show: issue title; page/URL; browser/device; severity; reproduction steps; expected vs. actual result; annotated screenshot; suggested next check.",
      "Do not publish a real client’s private staging URL, login page, test credentials, customer data, analytics, unpublished product, internal error, or possible vulnerability. Use a fictional example or obtain written permission and fully remove sensitive information.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use only the 2–3 selected channels.",
      "Sample: “Hi! I’m offering a Website Tester service for small businesses. With written permission, I test a defined set of pages and customer actions, then deliver a prioritized checklist with screenshots and exact reproduction steps. Starter projects begin at $____ for up to ____ pages. Would you like to see a sample report?”",
      "Track: Date | Prospect | Channel | Website Type | Need | Scope | Quote | Follow-Up | Project Booked",
      "Do not perform an unsolicited deep test to “prove” your value. A paid project begins only after the owner or authorized representative approves the scope.",
      "Watch for scam clients asking you to pay an application fee, deposit a check and return money, buy gift cards or cryptocurrency, share banking/identity/password information, download unknown remote-access software, test a bank/government/school/medical/large-company system they do not control, or keep the project secret from the site owner.",
    ].join("\n"),
  },
  {
    title: "Complete Intake & Build the Test Matrix",
    desc: [
      "Record: Project ID · Domain/environment · Testing window/time zone · Page or journey · Expected user goal · Browser/version · OS · Device or viewport · Login role · Approved test data · Submission/transaction permission · Expected result · Screenshot permission · Stop condition.",
      "Prioritize critical journeys: find the main offer; understand price or next step; use navigation; find contact/location/hours; submit approved contact or quote request; create an approved test account; add approved product to cart; begin approved checkout without live charge; request approved booking.",
      "Confirm whether the site is under maintenance or changing during the test. If developers deploy changes mid-project, record the time and version/build information if available so results are not mixed together.",
    ].join("\n"),
  },
  {
    title: "Run the Public-Page, Content & Navigation Check",
    desc: [
      "Start in a clean browser session and record the exact environment.",
      "Check each approved page: loads without obvious error; correct title/topic; logo and brand consistency; main navigation; mobile menu opens/closes; links go where labels suggest; buttons behave like buttons; images load; text is readable; headings are scannable; contact information is consistent; hours/address/prices/policies are understandable; main CTA is clear; footer and social links work; 404 is useful when included; no obvious placeholder content.",
      "Clarity questions: What does this business sell? Who is it for? What should the visitor do next? Is the price or quote process understandable? Are important limits visible before commitment? Can the visitor find help?",
      "Do not report personal design taste as a defect. Label it “Clarity Suggestion” or “Visual Suggestion” and explain the user impact.",
    ].join("\n"),
  },
  {
    title: "Test Approved Forms, Responsive Views, Accessibility & Performance",
    desc: [
      "FORMS: labels visible; required fields identifiable; valid approved test data submits; invalid data produces useful errors; confirmation appears; approved email/text arrives once; no unexpected public exposure.",
      "COMMERCE / BOOKING: product/service matches approved expectation; variant/date/quantity controls work; cart updates; fees/shipping/tax timing is understandable; checkout only as authorized; no live charge, order, inventory change, reservation, or cancellation unless specifically approved.",
      "RESPONSIVE / MOBILE: no broken horizontal scroll; menus/popups do not trap the screen; buttons can be tapped; text and forms fit; sticky bars do not hide essential controls; zoom remains usable.",
      "BASIC ACCESSIBILITY OBSERVATIONS: keyboard can reach and operate controls; visible focus; logical order; no keyboard trap; understandable labels; useful text alternatives where inspectable; headings; contrast concerns documented; captions where expected.",
      "PERFORMANCE SNAPSHOT: record PageSpeed/Lighthouse tool, date/time, and mobile/desktop context. Do not claim WCAG, ADA, SEO, security, or performance guarantees.",
    ].join("\n"),
  },
  {
    title: "Document Each Issue with Screenshots & Reproduction Steps",
    desc: [
      "ISSUE ID: WT-001 · TITLE · SEVERITY: Blocker / Major / Minor / Suggestion · URL · ENVIRONMENT · BROWSER + VERSION · DEVICE / VIEWPORT · OS · DATE / TIME · PRECONDITION · STEPS TO REPRODUCE · EXPECTED · ACTUAL · FREQUENCY · SCREENSHOT / VIDEO · USER IMPACT · NOTES / POSSIBLE DUPLICATE.",
      "BLOCKER: the approved critical journey cannot be completed, or continuing could create serious harm — stop and notify the client when necessary.",
      "MAJOR: important function is broken or confusing, but a workaround may exist. MINOR: smaller defect with limited impact. SUGGESTION: potential clarity/usability improvement, not confirmed broken behavior.",
      "Screenshot rules: enough context; simple arrow/box/callout; hide test passwords, tokens, emails, phones, addresses, payment details, customer information, and private URLs; do not capture unrelated tabs or personal notifications; filenames such as WT-001-mobile-menu.png.",
      "Group duplicates. One bug on five pages can be one documented pattern with five affected URLs.",
    ].join("\n"),
  },
  {
    title: "Deliver the Prioritized Report, Retest & Close Out",
    desc: [
      "Client-ready report: Project Summary (domain, environment, date, tester, scope, browsers/devices, limitations) · Results at a Glance (blockers, major, minor, suggestions, passed, unable to test) · Top Priorities · Detailed Findings · Limitations · Retest Status: Fixed | Still Present | Changed | Unable to Retest | New Issue Requiring Approval.",
      "Delivery: “Your Website Tester report for [DOMAIN/ENVIRONMENT] is ready at the private link below. It covers only the approved scope and testing conditions listed in the report. Please review Blocker and Major findings first. One retest of the reported items is included through [DATE], if applicable.”",
      "After delivery: confirm receipt; answer clarification questions within scope; do not diagnose code you did not inspect; retest only approved fixes; do not expand into new pages/flows without approval; remove local credentials and test data on schedule; revoke or ask the client to revoke temporary access; delete/redact private screenshots; record revenue, expenses, and total time; ask for a truthful review without revealing private findings; offer a monthly check only after the first project works.",
      "Project Profit = Project Fee + Add-Ons − Project Expenses. Effective Profit Per Hour = Project Profit ÷ Total Intake/Testing/Reporting/Retest/Admin Hours.",
      "AUTHORIZED SCOPE → REPEATABLE TEST → CLEAR EVIDENCE → PRIORITIZED REPORT → RETEST → REBOOK",
    ].join("\n"),
  },
];

export function websiteTesterToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Written Scope + Current Browsers + One Real Phone + DevTools Device Mode + Keyboard Check + Screenshot Tool + Google Sheets Bug List + Private PDF/Document Delivery + Time/Profit Tracker.",
    "Automated tools find only some problems. A high score does not prove the site is accessible, fast for every user, secure, legally compliant, or free of bugs.",
    "Chrome device mode approximates mobile behavior; it does not reproduce every real device. Clearly label emulated tests.",
    "Do not use security scanners, intercepting proxies, exploit tools, password-testing tools, heavy-traffic automation, or aggressive crawlers in this beginner service.",
  ].join("\n");
}

export function computeWebsiteTesterProfit(input: {
  websiteTesterQuickChecksPerWeek?: number;
  averageQuickCheckFee?: number;
  expandedProjectsPerMonth?: number;
  averageExpandedProjectFee?: number;
  retestRevenuePerMonth?: number;
  recurringPackageRevenue?: number;
  addOnRushRevenue?: number;
  tipsOtherEarnedServiceIncome?: number;
  internetPhone?: number;
  softwareStorage?: number;
  equipment?: number;
  advertisingPortfolio?: number;
  paymentFees?: number;
  registrationInsurance?: number;
  otherExpenses?: number;
  intakeHours?: number;
  testingHours?: number;
  screenshotReportHours?: number;
  retestHours?: number;
  marketingAdminHours?: number;
}): {
  weeklyQuickRevenue: number;
  monthlyQuickRevenue: number;
  expandedProjectRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const weeklyQuickRevenue =
    Math.max(0, Number(input.websiteTesterQuickChecksPerWeek) || 0) *
    Math.max(0, Number(input.averageQuickCheckFee) || 0);
  const monthlyQuickRevenue = weeklyQuickRevenue * 4.33;
  const expandedProjectRevenue =
    Math.max(0, Number(input.expandedProjectsPerMonth) || 0) *
    Math.max(0, Number(input.averageExpandedProjectFee) || 0);
  const grossServiceRevenue =
    monthlyQuickRevenue +
    expandedProjectRevenue +
    Math.max(0, Number(input.retestRevenuePerMonth) || 0) +
    Math.max(0, Number(input.recurringPackageRevenue) || 0) +
    Math.max(0, Number(input.addOnRushRevenue) || 0) +
    Math.max(0, Number(input.tipsOtherEarnedServiceIncome) || 0);
  const totalExpenses =
    Math.max(0, Number(input.internetPhone) || 0) +
    Math.max(0, Number(input.softwareStorage) || 0) +
    Math.max(0, Number(input.equipment) || 0) +
    Math.max(0, Number(input.advertisingPortfolio) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.registrationInsurance) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.intakeHours) || 0) +
    Math.max(0, Number(input.testingHours) || 0) +
    Math.max(0, Number(input.screenshotReportHours) || 0) +
    Math.max(0, Number(input.retestHours) || 0) +
    Math.max(0, Number(input.marketingAdminHours) || 0);
  return {
    weeklyQuickRevenue,
    monthlyQuickRevenue,
    expandedProjectRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
