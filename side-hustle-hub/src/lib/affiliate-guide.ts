/**
 * Affiliate Marketing (`affiliate`, Guide #021).
 * Recommend honestly, create useful content, earn on qualified sales. Elite.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const AFFILIATE_REALITY_CHECK = {
  title: "AFFILIATE MARKETING IS NOT “DROP A LINK AND GET PAID”",
  body: [
    "A successful affiliate system usually requires:",
    "AUDIENCE → TRUST → USEFUL CONTENT → RELEVANT OFFER → CLEAR DISCLOSURE → CLICK → QUALIFYING ACTION → COMMISSION.",
    "",
    "Programs differ in:",
    "- Eligibility",
    "- Commission structure",
    "- Cookie / tracking window",
    "- Attribution rules",
    "- Approved traffic sources",
    "- Content requirements",
    "- Payment threshold",
    "- Return / cancellation adjustments",
    "- Trademark rules",
    "- Email / social rules",
    "",
    "Always check CURRENT program terms. Do not treat any commission rate or cookie window in this guide as current — those numbers change.",
    "",
    "Affiliate marketers generally do NOT set the customer’s product price or commission rate. The merchant / program controls commission terms.",
    "",
    "Your job: choose relevant programs + generate qualified traffic + create useful content + improve conversion.",
    "",
    "A new affiliate marketer may earn $0 while learning and testing.",
    "",
    "Tagline: Recommend Honestly. Create Value. Earn on Qualified Sales.",
  ].join("\n"),
};

export const AFFILIATE_NOTES_WORKSHEET = `MY AFFILIATE MARKETING PLAN

NICHE
Audience: ________
Topic: ________
Content Pillars: ________

I help [AUDIENCE] choose/use [PRODUCT/TOPIC] so they can [RESULT].

PROGRAM TRACKER
Program | Offer | Link | Terms Checked | Commission | Traffic Rules | Payment Notes

CONTENT PLAN
Date | Channel | Topic | Format | Offer | CTA | Disclosure

RESULTS
Views: ____
Clicks: ____
CTR: ____%
Conversions: ____
Gross Commission: $____
Expenses: $____
Net: $____
Earnings per Click: $____
Earnings per 1,000 Views: $____

TOP CONTENT
Title/Topic: ________
Why It Worked: ________
How I Will Reuse It: ________

PROGRAM REVIEW
Best Program: ________
Best Offer: ________
Weakest Offer: ________
Terms Rechecked: ________

NEXT MONTH
Keep: ________
Improve: ________
Test: ________
Stop: ________

GYSH PRO TIP
Don't chase the affiliate program with the biggest advertised commission.

Chase the best MATCH.

RIGHT AUDIENCE
→ USEFUL CONTENT
→ RELEVANT PRODUCT
→ HONEST RECOMMENDATION
→ CLEAR DISCLOSURE
→ QUALIFIED CLICK
→ COMMISSION.

ELITE CHALLENGE
Build your first 30-day affiliate system:
1. Choose one niche
2. Define one audience
3. Choose one main platform
4. Vet 2–4 affiliate programs
5. Create tracking sheet
6. Create disclosure
7. Plan 12 content pieces
8. Make first 5 assets
9. Choose 2 marketing channels
10. Publish consistently for 30 days
11. Track views/clicks/conversions
12. Calculate earnings per click
13. Identify top content
14. Identify top offer
15. Create next-month KEEP / IMPROVE / TEST / STOP plan
`;

export const AFFILIATE_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Earn commissions by recommending products or services through unique affiliate links. Build a focused audience, join appropriate programs, create useful content, disclose affiliate relationships, track clicks/conversions, and improve what actually produces profitable commissions. Tagline: Recommend Honestly. Create Value. Earn on Qualified Sales. Category: Digital Marketing / Content / Online Business. Best for Adults, Seniors/Retirees; Teens only with parent/guardian-managed accounts where required. Beginner–Intermediate · $0 – Low startup · Online · Affiliate Commissions · 3 - 6 weeks to build and test a basic affiliate system · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Clear niche/topic · Target audience · Content platform(s) · Business/contact email · Basic content plan · Affiliate-program research · Disclosure language · Link tracker/spreadsheet · Payment/tax information when required · Parent/guardian management for minors where required.",
  },
  {
    id: "niches",
    label: "Possible niches",
    detail:
      "Home · Beauty · Tech · Books · Travel · Fitness · Pets · Food/kitchen · Fashion · Business tools · Software · Hobbies · Senior lifestyle · Parenting/family. Choose a niche where you can consistently create useful content — not simply whichever category appears to pay the most.",
  },
  {
    id: "programs",
    label: "Programs differ — check current terms",
    detail:
      "Eligibility · Commission structure · Cookie/tracking window · Attribution rules · Approved traffic sources · Content requirements · Payment threshold · Return/cancellation adjustments · Trademark rules · Email/social rules. Always check CURRENT official program terms. Do not hard-code changing rates or cookie windows. Amazon Associates, TikTok Shop, direct brand programs, and software/SaaS partner programs are examples only — availability and eligibility change.",
  },
  {
    id: "minors",
    label: "For minors",
    detail:
      "Parent/guardian-managed accounts where required. Do not create or operate affiliate, payment, or platform accounts that the program or platform restricts by age. Honest product-experience claims still apply.",
  },
];

export const AFFILIATE_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Amazon Associates",
    url: "https://affiliate-program.amazon.com/",
    note: "Example program where eligible — verify current terms",
  },
  {
    label: "TikTok Shop",
    url: "https://www.tiktok.com/shop",
    note: "Example creator / affiliate tools where eligible — verify current terms",
  },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Tracking sheet" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Content plan and disclosure" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Content calendar" },
  { label: "Canva", url: "https://www.canva.com/", note: "Images and simple graphics" },
  { label: "CapCut", url: "https://www.capcut.com/", note: "Video editor example" },
  { label: "YouTube", url: "https://www.youtube.com/", note: "Content platform option" },
  { label: "Google Analytics", url: "https://analytics.google.com/", note: "Analytics where you have a site" },
  { label: "WordPress", url: "https://wordpress.com/", note: "Optional website / blog" },
];

export const AFFILIATE_SUPPLIES = {
  starterKitTotal:
    "About $0–25 to start — software accounts live on the Tools tab. Do not buy expensive equipment, product hauls, or paid traffic before you have a niche, disclosure, and tracking sheet.",
  items: [
    { id: "computer", name: "Computer / phone", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "email", name: "Business / contact email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "platform", name: "Content platform account(s)", qty: "1–2", estCost: "$0", notes: "Essential — pick ONE primary first" },
    { id: "links", name: "Affiliate links / dashboard access", qty: "2–4 programs", estCost: "$0", notes: "Essential — never pay suspicious enrollment fees" },
    { id: "sheet", name: "Spreadsheet / tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "calendar", name: "Content calendar", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "disclosure", name: "Disclosure template", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "media-tools", name: "Basic image / video tools", qty: "1", estCost: "$0", notes: "Essential — see Tools" },
    { id: "analytics", name: "Analytics", qty: "1", estCost: "$0", notes: "Essential — platform stats and/or a tracker" },
    { id: "website", name: "Website / domain", qty: "1", estCost: "$0–20", notes: "Optional", optional: true },
    { id: "mic", name: "Microphone", qty: "1", estCost: "$0–40", notes: "Optional", optional: true },
    { id: "light", name: "Light", qty: "1", estCost: "$10–40", notes: "Optional", optional: true },
    { id: "tripod", name: "Tripod", qty: "1", estCost: "$10–30", notes: "Optional", optional: true },
    {
      id: "samples",
      name: "Product samples purchased or legitimately provided",
      qty: "as needed",
      estCost: "$0+",
      notes: "Optional — do not claim personal use/experience with a product you have not actually used",
      optional: true,
    },
  ],
};

export const AFFILIATE_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "AFFILIATE EARNINGS EXAMPLES — NOT A PRICE LIST",
    "",
    "Displayed earning potential: $100 – $15,000+ / month — examples only, NOT guarantees.",
    "",
    "Affiliate marketers generally do NOT set the customer’s product price or commission rate. The merchant / program controls commission terms.",
    "",
    "YOUR JOB:",
    "Choose relevant programs + generate qualified traffic + create useful content + improve conversion.",
    "",
    "CORE FORMULA:",
    "Audience/Traffic × Link Click Rate × Conversion Rate × Average Commission = Estimated Affiliate Earnings",
    "",
    "EXAMPLE — BEGINNER (math only, not typical income)",
    "2,000 content views × 5% click rate = 100 clicks × 4% conversion = 4 sales × $12 average commission = $48 estimated commission.",
    "",
    "EXAMPLE — GROWING",
    "20,000 views × 6% click rate = 1,200 clicks × 4% conversion = 48 conversions × $20 average commission = $960 estimated commission.",
    "",
    "EXAMPLE — STRONG SYSTEM",
    "100,000 views × 7% click rate = 7,000 clicks × 5% conversion = 350 conversions × $30 average commission = $10,500 estimated commission.",
    "",
    "These are math examples, not typical-income claims. A new affiliate marketer may earn $0 while learning/testing.",
    "",
    "MONTHLY PLANNING SCENARIOS — NOT GUARANTEES",
    "Early Testing: $0 – $100",
    "Early Traction: $100 – $500",
    "Growing Content/Audience: $500 – $2,500",
    "Established Multi-Content System: $2,500 – $7,500",
    "High-Volume/High-Value System: $7,500 – $15,000+",
    "",
    "TRACK NET PROFIT:",
    "Affiliate Commissions − Content/Production Costs − Website/Software − Advertising − Contractor Costs − Other Business Expenses = Estimated Profit Before Taxes.",
    "",
    "Never buy traffic or ads without confirming the affiliate program permits that traffic source and any required restrictions.",
  ].join("\n"),
  raiseTip:
    "Don't chase the biggest advertised commission. Chase the best match: right audience + useful content + relevant product + honest recommendation + clear disclosure. Displayed $100 – $15,000+ / month is examples only — not income guarantees. $0 during testing is normal.",
  items: [
    {
      id: "testing",
      label: "Early testing",
      price: "$0 – $100 / month",
      notes: "Learning, joining programs, publishing first content — $0 is expected",
    },
    {
      id: "traction",
      label: "Early traction",
      price: "$100 – $500 / month",
      notes: "A few converting posts or videos — examples only, not a guarantee",
    },
    {
      id: "growing",
      label: "Growing content / audience",
      price: "$500 – $2,500 / month",
      notes: "Repeatable content + tracked offers",
    },
    {
      id: "established",
      label: "Established multi-content system",
      price: "$2,500 – $7,500 / month",
      notes: "Library of evergreen content plus recurring traffic",
    },
    {
      id: "high-volume",
      label: "High-volume / high-value system",
      price: "$7,500 – $15,000+ / month",
      notes: "Examples only — not typical beginner earnings",
    },
  ],
};

export const AFFILIATE_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "aff_networks",
    name: "Affiliate networks / program dashboards",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Join only programs you have vetted. Availability, eligibility, and terms change — verify current official rules.",
  },
  {
    id: "aff_amazon",
    name: "Amazon Associates",
    freePlanAvailable: true,
    costNote: "Example program where eligible — check current terms, approved content, and traffic rules",
    url: "https://affiliate-program.amazon.com/",
  },
  {
    id: "aff_tiktok",
    name: "TikTok Shop affiliate / creator tools",
    freePlanAvailable: true,
    costNote: "Example creator tools where eligible — verify current shop and disclosure rules",
    url: "https://www.tiktok.com/shop",
    optional: true,
  },
  {
    id: "aff_brands",
    name: "Direct brand affiliate programs",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Example path — apply only to relevant brands; never pay suspicious enrollment fees",
  },
  {
    id: "aff_saas",
    name: "Software / SaaS partner programs",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Example path for business-tool niches — verify current partner terms",
    optional: true,
  },
  {
    id: "aff_sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Program tracker, content calendar, and results log",
    url: "https://sheets.google.com/",
  },
  {
    id: "aff_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Content plan, disclosure template, and CTA copy",
    url: "https://docs.google.com/",
  },
  {
    id: "aff_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Thumbnails, comparison graphics, and simple posts",
    url: "https://www.canva.com/",
  },
  {
    id: "aff_video",
    name: "Video editor",
    freePlanAvailable: true,
    costNote: "CapCut or similar — keep edits honest; no fake demos",
    url: "https://www.capcut.com/",
    optional: true,
  },
  {
    id: "aff_site",
    name: "Website / blog platform",
    freePlanAvailable: true,
    costNote: "Optional — not required on day one",
    url: "https://wordpress.com/",
    optional: true,
  },
  {
    id: "aff_email",
    name: "Email platform",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Use only where affiliate links/content are permitted by both the ESP and the affiliate program",
    optional: true,
  },
  {
    id: "aff_analytics",
    name: "Analytics",
    freePlanAvailable: true,
    costNote: "Platform insights and/or Google Analytics when you have a site",
    url: "https://analytics.google.com/",
  },
  {
    id: "aff_utm",
    name: "UTM / link-tracking tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Use only where the program permits tracking parameters and short links",
    optional: true,
  },
  {
    id: "aff_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "1 Niche + 1 Main Content Platform + 2–4 Relevant Affiliate Programs + Content Calendar + Tracking Sheet",
  },
];

export function affiliateToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: 1 Niche + 1 Main Content Platform + 2–4 Relevant Affiliate Programs + Content Calendar + Tracking Sheet.",
    "",
    "Program availability, eligibility, commissions, tracking, social-platform integrations, and rules change. Verify CURRENT official terms before implementation.",
    "",
    "Amazon Associates, TikTok Shop, direct brand programs, and software/SaaS partner programs are examples only. Do not hard-code changing commission rates or cookie windows.",
    "",
    "Never buy traffic or ads without confirming the affiliate program permits that traffic source.",
  ].join("\n");
}

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ or - only. */
export const AFFILIATE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Niche & Audience",
    desc: [
      "Write:",
      "“I help [AUDIENCE] choose/use [PRODUCT/TOPIC] so they can [RESULT].”",
      "",
      "Choose 3–5 content pillars.",
      "",
      "Example tech niche:",
      "☐ Beginner tutorials",
      "☐ Product comparisons",
      "☐ Setup tips",
      "☐ Budget picks",
      "☐ Troubleshooting",
      "",
      "Possible niches: home, beauty, tech, books, travel, fitness, pets, food/kitchen, fashion, business tools, software, hobbies, senior lifestyle, parenting/family.",
      "",
      "Choose a niche where you can consistently create useful content — not simply whichever category appears to pay the most.",
      "",
      "Do not build a page that is nothing but random affiliate links.",
    ].join("\n"),
  },
  {
    title: "Choose Your Content Platform",
    desc: [
      "Pick ONE primary platform first:",
      "☐ TikTok",
      "☐ YouTube",
      "☐ Facebook",
      "☐ Instagram",
      "☐ Pinterest",
      "☐ Blog / website",
      "☐ Email / newsletter where appropriate",
      "",
      "Then choose at most one secondary channel initially.",
      "",
      "Choose based on where your audience already spends time and what content you can consistently create.",
    ].join("\n"),
  },
  {
    title: "Find & Vet Affiliate Programs",
    desc: [
      "Research:",
      "- Product relevance",
      "- Program reputation",
      "- Eligibility",
      "- Commission structure",
      "- Attribution / tracking rules",
      "- Payment threshold",
      "- Payment timing",
      "- Return / cancellation adjustments",
      "- Approved promotional methods",
      "- Paid-ad restrictions",
      "- Email rules",
      "- Trademark / brand bidding rules",
      "- Social disclosure requirements",
      "",
      "Start with 2–4 strong programs, not 30.",
      "",
      "Amazon Associates, TikTok Shop, direct brand programs, and software/SaaS partner programs are examples only. Check CURRENT official terms — do not hard-code changing rates or cookie windows.",
      "",
      "Never pay suspicious “affiliate enrollment fees” without carefully verifying the company/program.",
    ].join("\n"),
  },
  {
    title: "Set Up Links, Disclosures & Tracking",
    desc: [
      "For every program record:",
      "- Program",
      "- Product / Offer",
      "- Affiliate Link",
      "- Commission Type",
      "- Current Terms Checked Date",
      "- Traffic Rules",
      "- Content Restrictions",
      "- Payment Threshold",
      "- Notes",
      "",
      "Use clear affiliate disclosure close to recommendations/links where people can notice it.",
      "",
      "Example:",
      "“This post contains affiliate links. I may earn a commission if you purchase through them, at no extra cost to you.”",
      "",
      "Adjust wording/placement to current legal and platform requirements.",
      "",
      "Do not hide disclosures at the bottom of unrelated text.",
      "Do not claim personal use/experience with a product you have not actually used.",
    ].join("\n"),
  },
  {
    title: "Create a Content Plan That Helps Before It Sells",
    desc: [
      "Plan content around real questions.",
      "",
      "Useful formats:",
      "☐ How-to",
      "☐ Comparison",
      "☐ Best-for",
      "☐ Review",
      "☐ Tutorial",
      "☐ Problem / solution",
      "☐ Mistakes to avoid",
      "☐ Demonstration",
      "☐ FAQ",
      "☐ Checklist",
      "☐ Before-you-buy guide",
      "",
      "Use as a planning starting point — not a mandatory rule:",
      "- 70–80% useful / educational content",
      "- 20–30% direct promotional content",
      "",
      "Open Google Docs or your tracking sheet from the Tools tab (sign in with Google, or use an account you already have).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "For affiliate marketing, your CONTENT channels are your marketing channels.",
      "",
      "Pick 2–3:",
      "☐ TikTok",
      "☐ YouTube / Shorts",
      "☐ Facebook",
      "☐ Instagram / Reels",
      "☐ Pinterest",
      "☐ Blog / SEO",
      "☐ Email",
      "☐ Community / group participation where promotion is permitted",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write one measurable goal per channel.",
      "",
      "Examples:",
      "- 3 short videos/week",
      "- 1 comparison article/week",
      "- 2 helpful Facebook posts/week",
      "- 1 email/week",
      "",
      "Do not spam links into unrelated groups/comments/messages.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a small affiliate content kit:",
      "☐ 5 hooks",
      "☐ 3 short videos",
      "☐ 2 comparison posts",
      "☐ 1 tutorial",
      "☐ 1 FAQ",
      "☐ 1 “who this is for / not for” post",
      "☐ 1 disclosure template",
      "☐ 1 CTA template",
      "",
      "Sample CTA:",
      "“If this fits what you need, I put the product link in [approved location]. It is an affiliate link, which means I may earn a commission if you buy.”",
      "",
      "Avoid:",
      "- Fake reviews",
      "- Fake testimonials",
      "- False scarcity",
      "- Guaranteed results",
      "- Unsupported health / income claims",
      "- Pretending to own / use products you have not used",
      "- Copying merchant content without permission",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Publish consistently using only your selected channels.",
      "",
      "Track every content piece:",
      "Date | Channel | Topic | Offer | Views | Clicks | Conversions | Commission.",
      "",
      "Respond to genuine questions.",
      "Refresh successful content.",
      "Improve weak hooks.",
      "Test different useful angles.",
      "",
      "Do not spam.",
      "Do not judge affiliate marketing from one post.",
    ].join("\n"),
  },
  {
    title: "Improve Clicks Without Becoming Clickbait",
    desc: [
      "Track:",
      "- Views",
      "- Link Clicks",
      "- Click-Through Rate",
      "- Conversion Rate",
      "- Average Commission",
      "- Earnings per Click where data allows",
      "",
      "Improve:",
      "- Hook",
      "- Audience match",
      "- Product relevance",
      "- CTA",
      "- Placement",
      "- Comparison clarity",
      "- Trust",
      "- Content quality",
      "",
      "A lot of clicks with no conversions can signal poor audience/product fit.",
    ].join("\n"),
  },
  {
    title: "Build a Content Library & Recurring Traffic",
    desc: [
      "Turn one topic into multiple assets.",
      "",
      "Example:",
      "“Best beginner microphone”",
      "- short video",
      "- full comparison",
      "- setup tutorial",
      "- FAQ",
      "- email",
      "- updated annual version",
      "",
      "Prioritize evergreen content that can continue attracting qualified traffic.",
      "",
      "Review old content when products, prices, availability, or recommendations change.",
    ].join("\n"),
  },
  {
    title: "Review Earnings & Scale Winners",
    desc: [
      "Monthly review:",
      "- Content Published",
      "- Views / Traffic",
      "- Clicks",
      "- Conversions",
      "- Commissions",
      "- Reversals / Returns",
      "- Expenses",
      "- Net Profit",
      "- Best Channel",
      "- Best Content",
      "- Best Offer",
      "- Weakest Offer",
      "",
      "Decision:",
      "KEEP · IMPROVE · TEST · STOP",
      "",
      "Scale the combination of:",
      "RIGHT AUDIENCE + RIGHT CONTENT + RIGHT OFFER.",
      "",
      "Do not scale only because a program advertises a high commission.",
      "Subtract content/production, website/software, advertising, contractors, and other expenses — commissions are not profit.",
    ].join("\n"),
  },
];

/** Affiliate Earnings Calculator. Rates are percents (5 = 5%). Examples only — not guaranteed. */
export function computeAffiliateProfit(input: {
  monthlyViews?: number;
  clickRatePercent?: number;
  conversionRatePercent?: number;
  averageCommission?: number;
  websiteHosting?: number;
  software?: number;
  contentProduction?: number;
  advertising?: number;
  contractors?: number;
  otherExpenses?: number;
}): {
  clicks: number;
  conversions: number;
  grossCommissions: number;
  expenses: number;
  netProfit: number;
  earningsPerClick: number | null;
  earningsPerThousandViews: number | null;
} {
  const views = Math.max(0, Number(input.monthlyViews) || 0);
  const clickRate = Math.max(0, Number(input.clickRatePercent) || 0) / 100;
  const conversionRate = Math.max(0, Number(input.conversionRatePercent) || 0) / 100;
  const averageCommission = Math.max(0, Number(input.averageCommission) || 0);
  const clicks = views * clickRate;
  const conversions = clicks * conversionRate;
  const grossCommissions = conversions * averageCommission;
  const expenses =
    Math.max(0, Number(input.websiteHosting) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.contentProduction) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.contractors) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const netProfit = grossCommissions - expenses;
  return {
    clicks,
    conversions,
    grossCommissions,
    expenses,
    netProfit,
    earningsPerClick: clicks > 0 ? grossCommissions / clicks : null,
    earningsPerThousandViews: views > 0 ? (grossCommissions / views) * 1000 : null,
  };
}
